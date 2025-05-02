from fastapi import FastAPI, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import User
from auth import hash_password, create_token, verify_token
from pydantic import BaseModel
import random
import traceback
from fastapi.responses import PlainTextResponse
from contextlib import contextmanager
from fastapi.middleware.cors import CORSMiddleware

flag = "vrnctf{s0l_vs3my_g0l0v4}"

Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS settings
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session - context manager version for startup
@contextmanager
def get_db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def startup_event():
    with get_db_session() as db:
        db_user = db.query(User).filter(User.email == "vasya@gov.re").first()
        if not db_user:
            hashed_password = hash_password("aquarium")
            new_user = User(email="vasya@gov.re", password_hash=hashed_password)
            db.add(new_user)
            db.commit()
            print("User vasya@gov.re created.")
        else:
            print("User vasya@gov.re already exists.")

security = HTTPBearer()

# Serve static pages
@app.get("/")
def read_root():
    return FileResponse("static/index.html")

@app.get("/register")
def read_register():
    return FileResponse("static/register.html")

@app.get("/login")
def read_login():
    return FileResponse("static/login.html")

@app.get("/cabinet")
def read_cabinet():
    return FileResponse("static/cabinet.html")

@app.get("/about")
def read_about():
    return FileResponse("static/about.html")

@app.get("/static/kontora.webp")
def read_about():
    return FileResponse("static/kontora.webp")

# Pydantic models for request bodies
class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Sign-up endpoint
@app.post("/sign_up")
def sign_up(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = hash_password(user.password)
    new_user = User(email=user.email, password_hash=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    token = create_token({"sub": new_user.email})
    return {"message": "User created successfully", "token": token}

# Login endpoint
def cmp(tmp: int, expected: str, actual: str):
    if tmp == 0:
        # тут и бросаем ошибку с текстом ожиданий
        assert False, f"Hash mismatch:\n  expected = {expected}\n  actual   = {actual}"
    return cmp(tmp - 1, expected, actual)

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    actual_hash = hash_password(user.password)

    if not db_user:
        # остальное поведение без стека
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if db_user.password_hash != actual_hash:
        # генерируем «запутанный» стек и возвращаем его в теле ответа
        try:
            cmp(20, db_user.password_hash, actual_hash)
        except AssertionError:
            tb = traceback.format_exc()
            return PlainTextResponse(tb, status_code=500)

    # если хеши совпали — выдаём токен
    token = create_token({"sub": db_user.email})
    return {"token": token}

# Get salt endpoint (protected with JWT)
@app.get("/get_salt")
def get_salt(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    email = payload["sub"]
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    salt = 0

    if (db_user.email == "vasya@gov.re"):
        salt = flag

    return {"salt": salt}