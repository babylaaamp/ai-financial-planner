# AI Financial Planner

เว็บแอปบันทึกรายรับ-รายจ่าย ตั้งเป้าหมายการเงิน และขอคำแนะนำจาก AI (Groq ฟรี)
Stack: Next.js (frontend) + FastAPI (backend) + PostgreSQL (Neon) + JWT login

## โครงสร้างโปรเจกต์

```
finance_planner/
  backend/     -> FastAPI (Python)
  frontend/    -> Next.js (React)
```

---

## ส่วนที่ 1: เตรียมของฟรีที่ต้องสมัคร (ทำก่อนเริ่ม)

1. **GitHub** — สร้าง repo ใหม่ อัปโหลดโฟลเดอร์นี้ทั้งหมดขึ้นไป
2. **Neon** (https://neon.tech) — สมัครฟรี สร้าง project ใหม่ → คัดลอก "Connection string" (หน้า Dashboard) เก็บไว้
3. **Groq** (https://console.groq.com) — สมัครฟรี → ไปที่ API Keys → สร้างคีย์ใหม่ คัดลอกเก็บไว้
4. **Render** (https://render.com) — สมัครฟรี ใช้ deploy backend
5. **Vercel** (https://vercel.com) — สมัครฟรี ใช้ deploy frontend

---

## ส่วนที่ 2: รันทดสอบบนเครื่องตัวเองก่อน (ไม่บังคับ แต่แนะนำ)

### Backend
```
cd backend
pip install -r requirements.txt
cp .env.example .env
```
แก้ไฟล์ `.env` ใส่ค่า `DATABASE_URL` (จาก Neon), `JWT_SECRET` (ตั้งเองอะไรก็ได้), `GROQ_API_KEY` (จาก Groq)

รัน:
```
uvicorn main:app --reload
```
เปิด http://localhost:8000 เห็นข้อความ "AI Financial Planner API กำลังทำงาน" แปลว่าใช้ได้

### Frontend
```
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```
เปิด http://localhost:3000

---

## ส่วนที่ 3: Deploy จริง ได้ลิงก์ให้คนอื่นเข้าใช้

### 3.1 Deploy backend ขึ้น Render

1. เข้า Render → New → Web Service
2. เชื่อมกับ GitHub repo ที่อัปโหลดไว้
3. ตั้งค่า:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. ไปที่ Environment → เพิ่มตัวแปร:
   - `DATABASE_URL` = connection string จาก Neon
   - `JWT_SECRET` = ข้อความสุ่มยาวๆ
   - `GROQ_API_KEY` = คีย์จาก Groq
   - `FRONTEND_ORIGIN` = ใส่ชั่วคราวเป็น `http://localhost:3000` ก่อน (จะย้อนมาแก้เป็นลิงก์ Vercel จริงหลังขั้นต่อไป)
5. กด Deploy รอสักครู่ จะได้ลิงก์ เช่น `https://finance-planner-api.onrender.com`

### 3.2 Deploy frontend ขึ้น Vercel

1. เข้า Vercel → Add New → Project
2. เลือก repo เดียวกัน ตั้งค่า **Root Directory** เป็น `frontend`
3. ไปที่ Environment Variables เพิ่ม:
   - `NEXT_PUBLIC_API_URL` = ลิงก์ backend จาก Render ขั้นก่อนหน้า (เช่น `https://finance-planner-api.onrender.com`)
4. กด Deploy รอสักครู่ จะได้ลิงก์เว็บจริง เช่น `https://finance-planner.vercel.app`

### 3.3 กลับไปแก้ CORS ที่ Render

1. กลับไปที่ Render → Environment
2. แก้ `FRONTEND_ORIGIN` เป็นลิงก์ Vercel จริงที่เพิ่งได้ (เช่น `https://finance-planner.vercel.app`)
3. Save จะ redeploy อัตโนมัติ

**เสร็จแล้ว** — เปิดลิงก์ Vercel ส่งให้ใครก็ได้เข้าใช้ สมัครสมาชิก บันทึกรายรับ-รายจ่าย ตั้งเป้าหมาย ขอคำแนะนำ AI ได้จริงทุกคน

---

## หมายเหตุสำคัญ

- **Render free tier** จะ sleep หลังไม่มีคนใช้ 15 นาที คนแรกที่เปิดจะรอหน้าเว็บโหลดช้า ~30-50 วินาที (ปกติของ free tier)
- **Groq free tier** มี rate limit (จำนวนครั้งต่อนาที) ถ้าเรียกถี่เกินไปจะขึ้น error ชั่วคราว รอสักครู่แล้วลองใหม่ได้
- ทุกครั้งที่ push โค้ดใหม่ขึ้น GitHub ทั้ง Render และ Vercel จะ deploy เวอร์ชันใหม่ให้อัตโนมัติ
- ห้ามอัปโหลดไฟล์ `.env` หรือ `.env.local` ตัวจริงขึ้น GitHub (มีความลับอยู่ข้างใน) ใช้แค่ `.env.example` เป็นตัวอย่าง
