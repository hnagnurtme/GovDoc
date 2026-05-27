from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db import models
from app.db.session import get_db
from app.services import auth_service

router = APIRouter(tags=["auth"])


class UserAuth(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6, max_length=100)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    username: str


class UserResponse(BaseModel):
    id: int
    username: str


@router.post("/auth/register", response_model=TokenResponse)
def register(payload: UserAuth, db: Session = Depends(get_db)) -> TokenResponse:
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.username == payload.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # Create new user
    hashed_pwd = auth_service.get_password_hash(payload.password)
    new_user = models.User(username=payload.username, password_hash=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate token
    token = auth_service.create_access_token(data={"sub": new_user.username})
    return TokenResponse(access_token=token, token_type="bearer", username=new_user.username)


@router.post("/auth/login", response_model=TokenResponse)
def login(payload: UserAuth, db: Session = Depends(get_db)) -> TokenResponse:
    # Fetch user
    user = db.query(models.User).filter(models.User.username == payload.username).first()
    if not user or not auth_service.verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    # Generate token
    token = auth_service.create_access_token(data={"sub": user.username})
    return TokenResponse(access_token=token, token_type="bearer", username=user.username)


@router.get("/auth/me", response_model=UserResponse)
def get_me(current_user: models.User = Depends(auth_service.get_current_user)) -> UserResponse:
    return UserResponse(id=current_user.id, username=current_user.username)
