from fastapi import FastAPI, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.responses import JSONResponse, HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base, User
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
import pyotp
from fastapi.staticfiles import StaticFiles
import ctypes
import json

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

Base.metadata.create_all(bind=engine)

# Constants
SECRET_KEY = "bmnicWWgOk4SGw0rHwbDqeYLSSu1u0DP"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
lib = ctypes.CDLL('./sign.so')
lib.generate_pass_c.argtypes = [ctypes.c_char_p]
lib.generate_pass_c.restype = ctypes.c_char_p
lib.generate_otp_c.argtypes = [ctypes.c_char_p, ctypes.c_char_p]
lib.generate_otp_c.restype = ctypes.c_char_p

# Startup event to create admin user
@app.on_event("startup")
def create_admin_user_on_startup():
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            secret_key = generate_otp('{"username":"admin"}')
            hashed_password = pwd_context.hash("cntrW4o1oCPZObOO98il0B8HpnTj282X")
            new_admin = User(username="admin", hashed_password=hashed_password, secret_key=secret_key)
            db.add(new_admin)
            db.commit()
            print("Admin user created.")
        else:
            print("Admin user already exists.")
    finally:
        db.close()

def generate_sign(name: str) -> str:
    pass_result = lib.generate_pass_c(name.encode('utf-8'))

    res = pass_result.decode('utf-8');

    return res;


def generate_otp(name: str) -> str:
    sign = generate_sign(name)
    otp_result = lib.generate_otp_c(name.encode('utf-8'), sign.encode('utf-8'))

    res = otp_result.decode('utf-8');

    return res;

class CustomJSONResponse(JSONResponse):
    def __init__(self, content, **kwargs):
        json_str = json.dumps(content, separators=(',', ':'), ensure_ascii=False)
        sign = generate_sign(json_str)

        headers = kwargs.pop('headers', {}) or {}
        headers['sign'] = sign

        super().__init__(content, headers=headers, **kwargs)

# Dependencies
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_token_from_cookie(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token

def get_current_username(token: str = Depends(get_token_from_cookie)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    return username

def get_current_user(username: str = Depends(get_current_username), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Dependency to check if the current user is admin
def get_current_admin_user(current_username: str = Depends(get_current_username)):
    if current_username != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )
    return current_username

# Token creation
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Models
class ChangePassword(BaseModel):
    current_password: str
    new_password: str

class LoginOTP(BaseModel):
    username: str
    otp: str

class SignUp(BaseModel):
    username: str
    password: str

# Endpoints
@app.get("/me")
async def read_users_me(current_username: str = Depends(get_current_username)):
    content = {"username": current_username}
    return CustomJSONResponse(content=content)

@app.post("/change_password")
async def change_password(change_password: ChangePassword, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not pwd_context.verify(change_password.current_password, current_user.hashed_password):
        return CustomJSONResponse(content={"message": "Incorrect current password"})
    current_user.hashed_password = pwd_context.hash(change_password.new_password)
    db.commit()
    return CustomJSONResponse(content={"message": "Password changed successfully"})

@app.post("/login")
async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username})
    response = JSONResponse(content={"message": "Login successful"})
    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite='lax', path='/')
    return response

@app.post("/login_otp")
async def login_otp(response: Response, login_otp: LoginOTP, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_otp.username).first()
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username")
    totp = pyotp.TOTP(user.secret_key)
    if not totp.verify(login_otp.otp):
        raise HTTPException(status_code=400, detail="Incorrect OTP")
    access_token = create_access_token(data={"sub": user.username})
    response = JSONResponse(content={"message": "OTP login successful"})
    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite='lax', path='/')
    return response

@app.post("/sign_up")
async def sign_up(response: Response, sign_up: SignUp, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == sign_up.username).first()
    if user:
        return JSONResponse(status_code=400, content={"error": "Имя пользователя уже занято"})

    secret_key = generate_otp(f'{{"username":"{sign_up.username}"}}')

    hashed_password = pwd_context.hash(sign_up.password)
    new_user = User(username=sign_up.username, hashed_password=hashed_password, secret_key=secret_key)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    access_token = create_access_token(data={"sub": new_user.username})
    response = JSONResponse(content={"message": "Signup successful"})
    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite='lax', path='/')
    return response

@app.post("/logout")
async def logout(response: Response):
    response = JSONResponse(content={"message": "Logout successful"})
    response.delete_cookie(key="access_token", path='/')
    return response

# Protected files list
protected_files = [
    "home.html",
    "account.html",
    "calculate-distance.html",
    "calculate-speed.html",
    "vershok-arshin.html",
    "versta-sazhen.html"
]

# Define protected routes (excluding admin)
for file_name in protected_files:
    @app.get(f"/{file_name}")
    async def serve_protected_file(current_username: str = Depends(get_current_username), file_name=file_name):
        return FileResponse(f"static/{file_name}")

# Specific route for admin.html with admin check
@app.get("/admin.html")
async def serve_admin_file(current_admin: str = Depends(get_current_admin_user)):
    return FileResponse("static/admin.html")

# Serve static files
app.mount("/", StaticFiles(directory="static", html=True), name="static")