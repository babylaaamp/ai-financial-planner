import os
import requests
from datetime import date
from typing import List

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import Base, engine, get_db
import models
import schemas
from auth_utils import hash_password, verify_password, create_access_token, get_current_user

# สร้างตารางทั้งหมดอัตโนมัติตอนเริ่มแอป (ถ้ายังไม่มี)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Financial Planner API")

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "https://ai-financial-planner-three.vercel.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-financial-planner-three.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


@app.get("/")
def root():
    return {"status": "ok", "message": "AI Financial Planner API กำลังทำงาน"}


# ---------------- AUTH ----------------
@app.post("/auth/register", response_model=schemas.UserOut)
def register(payload: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="อีเมลนี้ถูกใช้สมัครแล้ว")

    user = models.User(email=payload.email, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/auth/login", response_model=schemas.TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # form_data.username คือช่องอีเมล (มาตรฐาน OAuth2PasswordRequestForm ใช้ชื่อ username)
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="อีเมลหรือรหัสผ่านไม่ถูกต้อง")

    token = create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer"}


@app.get("/auth/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


# ---------------- TRANSACTIONS ----------------
@app.get("/transactions", response_model=List[schemas.TransactionOut])
def list_transactions(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Transaction)
        .filter(models.Transaction.user_id == current_user.id)
        .order_by(models.Transaction.date.desc())
        .all()
    )


@app.post("/transactions", response_model=schemas.TransactionOut)
def create_transaction(
    payload: schemas.TransactionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tx = models.Transaction(user_id=current_user.id, **payload.model_dump())
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


@app.delete("/transactions/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tx = (
        db.query(models.Transaction)
        .filter(models.Transaction.id == transaction_id, models.Transaction.user_id == current_user.id)
        .first()
    )
    if not tx:
        raise HTTPException(status_code=404, detail="ไม่พบรายการนี้")
    db.delete(tx)
    db.commit()
    return {"deleted": True}


# ---------------- GOALS ----------------
@app.get("/goals", response_model=List[schemas.GoalOut])
def list_goals(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(models.Goal).filter(models.Goal.user_id == current_user.id).all()


@app.post("/goals", response_model=schemas.GoalOut)
def create_goal(
    payload: schemas.GoalCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goal = models.Goal(user_id=current_user.id, **payload.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@app.delete("/goals/{goal_id}")
def delete_goal(
    goal_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goal = (
        db.query(models.Goal)
        .filter(models.Goal.id == goal_id, models.Goal.user_id == current_user.id)
        .first()
    )
    if not goal:
        raise HTTPException(status_code=404, detail="ไม่พบเป้าหมายนี้")
    db.delete(goal)
    db.commit()
    return {"deleted": True}


# ---------------- AI ADVICE ----------------
@app.post("/advice", response_model=schemas.AdviceOut)
def get_advice(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="ยังไม่ได้ตั้งค่า GROQ_API_KEY บนเซิร์ฟเวอร์")

    transactions = (
        db.query(models.Transaction)
        .filter(models.Transaction.user_id == current_user.id)
        .all()
    )
    goals = db.query(models.Goal).filter(models.Goal.user_id == current_user.id).all()

    total_income = sum(t.amount for t in transactions if t.type == models.TransactionType.income)
    total_expense = sum(t.amount for t in transactions if t.type == models.TransactionType.expense)

    goals_summary = "\n".join(
        f"- {g.title}: เก็บได้ {g.current_amount} จากเป้าหมาย {g.target_amount}" for g in goals
    ) or "ยังไม่มีเป้าหมายที่ตั้งไว้"

    prompt = f"""คุณเป็นที่ปรึกษาการเงินส่วนบุคคล ช่วยวิเคราะห์และแนะนำเป็นภาษาไทย กระชับ อ่านง่าย ไม่เกิน 200 คำ

ข้อมูลผู้ใช้:
รายรับรวม: {total_income} บาท
รายจ่ายรวม: {total_expense} บาท
คงเหลือ: {total_income - total_expense} บาท

เป้าหมายการเงิน:
{goals_summary}

ช่วยวิเคราะห์สถานะการเงินปัจจุบัน และให้คำแนะนำที่เป็นรูปธรรมเพื่อไปถึงเป้าหมาย"""

    response = requests.post(
        GROQ_URL,
        headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
        json={
            "model": "openai/gpt-oss-20b",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.5,
        },
        timeout=30,
    )

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail=f"เรียก AI ไม่สำเร็จ: {response.text}")

    advice_text = response.json()["choices"][0]["message"]["content"]

    log = models.AIAdviceLog(user_id=current_user.id, advice_text=advice_text)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@app.get("/advice/history", response_model=List[schemas.AdviceOut])
def advice_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.AIAdviceLog)
        .filter(models.AIAdviceLog.user_id == current_user.id)
        .order_by(models.AIAdviceLog.created_at.desc())
        .all()
    )
