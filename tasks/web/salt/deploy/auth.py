import hashlib
import jwt
from datetime import datetime, timedelta

SECRET_KEY = "88CjcOrUKlC2c8V0Xc72jSU523sTSKh9"  # Replace with a secure key in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440
SALT = "takuya"

def hash_password(password: str) -> str:
    salted_password = password + SALT
    return hashlib.sha1(salted_password.encode('utf-8')).hexdigest()

def create_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None