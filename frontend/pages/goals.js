import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { api, getToken } from "../lib/api";

export default function Goals() {
  const router = useRouter();
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    loadGoals();
  }, []);

  async function loadGoals() {
    try {
      setGoals(await api.listGoals());
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    try {
      await api.createGoal({
        title,
        target_amount: parseFloat(targetAmount),
        current_amount: parseFloat(currentAmount || 0),
        deadline: deadline || null,
      });
      setTitle("");
      setTargetAmount("");
      setCurrentAmount("0");
      setDeadline("");
      loadGoals();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    await api.deleteGoal(id);
    loadGoals();
  }

  return (
    <div className="container">
      <nav>
        <Link href="/dashboard">รายรับ-รายจ่าย</Link>
        <Link href="/goals">เป้าหมาย</Link>
        <Link href="/advice">คำแนะนำ AI</Link>
      </nav>

      <div className="card">
        <h3>ตั้งเป้าหมายใหม่</h3>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="ชื่อเป้าหมาย (เช่น ซื้อบ้าน, กองทุนฉุกเฉิน)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="เป้าหมาย (บาท)"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="เก็บได้แล้ว (บาท)"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
          />
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <button type="submit">บันทึกเป้าหมาย</button>
        </form>
      </div>

      <div className="card">
        <h3>เป้าหมายทั้งหมด</h3>
        {goals.length === 0 && <p>ยังไม่มีเป้าหมาย</p>}
        {goals.map((g) => {
          const percent = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));
          return (
            <div key={g.id} style={{ marginBottom: 16 }}>
              <div className="row">
                <b>{g.title}</b>
                <a href="#" onClick={(e) => { e.preventDefault(); handleDelete(g.id); }}>
                  ลบ
                </a>
              </div>
              <p style={{ fontSize: 13, color: "#666", margin: "4px 0" }}>
                {g.current_amount.toLocaleString()} / {g.target_amount.toLocaleString()} บาท ({percent}%)
                {g.deadline ? ` · เป้าหมายวันที่ ${g.deadline}` : ""}
              </p>
              <div style={{ background: "#eee", borderRadius: 8, height: 8 }}>
                <div
                  style={{
                    width: `${percent}%`,
                    background: "#14b8a6",
                    height: 8,
                    borderRadius: 8,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
