from datetime import date, datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr


# ---------- Auth ----------
class UserRegister(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True


# ---------- Transaction ----------
class TransactionCreate(BaseModel):
    amount: float
    category: str
    type: str
    date: date
    note: Optional[str] = None


class TransactionOut(TransactionCreate):
    id: int

    class Config:
        from_attributes = True


# ---------- Goal ----------
class GoalCreate(BaseModel):
    title: str
    target_amount: float
    current_amount: float = 0
    deadline: Optional[date] = None


class GoalOut(GoalCreate):
    id: int

    class Config:
        from_attributes = True


# ---------- Advice ----------
class AdviceOut(BaseModel):
    id: int
    advice_text: str
    created_at: datetime

    class Config:
        from_attributes = True
