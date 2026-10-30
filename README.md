# MoneyMind — AI Financial Planner

เว็บวางแผนการเงินส่วนบุคคล พัฒนาด้วย Next.js, FastAPI, SQLAlchemy, PostgreSQL และ Groq API

## Rework รอบนี้

- ปรับ UI ใหม่ทุกหน้าหลัก: Dashboard, Goals, AI Advisor, Login และ Register
- เพิ่ม sidebar navigation พร้อม mobile navigation
- Dashboard แสดงรายรับ รายจ่าย และเงินสุทธิของเดือนปัจจุบัน พร้อม cash-flow comparison
- เพิ่มฟอร์มบันทึกรายการแบบ quick add พร้อมหมวดหมู่และหมายเหตุ
- หน้าเป้าหมายแสดง progress และภาพรวมเงินออม
- ปรับ AI Advisor ให้เป็นพื้นที่สนทนา พร้อม prompt แนะนำและ loading state
- ปรับ typography, spacing, cards, states, responsive layout และ micro-interactions
- คง API และ database schema เดิม ไม่ต้อง migrate ฐานข้อมูลสำหรับ UI rework นี้

## Design system

| Token | Hex | ใช้สำหรับ |
|---|---|---|
| Sage | `#8FA28A` | สีหลัก / ปุ่ม / accent |
| Sage light | `#C7D3C0` | พื้นหลังรอง / progress |
| Cream | `#F7F4ED` | พื้นหลังหลัก |
| Muted gold | `#C8A96B` | accent / highlight |

## Run locally

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

ตั้งค่า environment variables ตามที่ backend ใช้ เช่น `DATABASE_URL`, `JWT_SECRET`, `GROQ_API_KEY` และ `GROQ_MODEL`

### Frontend

```bash
cd frontend
npm install
```

สร้าง `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

รัน:

```bash
npm run dev
```

เปิด `http://localhost:3000`

## Notes

- UI rework ใช้ dependency เดิม ไม่เพิ่ม component library
- ข้อมูลการเงินยังโหลดและบันทึกผ่าน API เดิม
- คำตอบ AI เป็นข้อมูลประกอบการตัดสินใจ ไม่ใช่คำแนะนำการลงทุนเฉพาะบุคคล
- ก่อน deploy ให้ตั้งค่า CORS origin ให้ตรงกับ frontend domain และเก็บ secrets ใน environment variables เท่านั้น
