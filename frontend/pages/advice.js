import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { api, getToken } from "../lib/api";

export default function Advice() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setHistory(await api.adviceHistory());
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAskAdvice() {
    setLoading(true);
    setError("");
    try {
      await api.getAdvice();
      loadHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <nav>
        <Link href="/dashboard">รายรับ-รายจ่าย</Link>
        <Link href="/goals">เป้าหมาย</Link>
        <Link href="/advice">คำแนะนำ AI</Link>
      </nav>

      <div className="card">
        <h3>ขอคำแนะนำจาก AI</h3>
        <p style={{ fontSize: 14, color: "#666" }}>
          AI จะวิเคราะห์รายรับ-รายจ่าย และเป้าหมายที่บันทึกไว้ทั้งหมด แล้วให้คำแนะนำ
        </p>
        {error && <p className="error">{error}</p>}
        <button onClick={handleAskAdvice} disabled={loading}>
          {loading ? "กำลังวิเคราะห์..." : "ขอคำแนะนำตอนนี้"}
        </button>
      </div>

      <div className="card">
        <h3>ประวัติคำแนะนำ</h3>
        {history.length === 0 && <p>ยังไม่เคยขอคำแนะนำ</p>}
        {history.map((h) => (
          <div key={h.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #eee" }}>
            <p style={{ fontSize: 12, color: "#999" }}>
              {new Date(h.created_at).toLocaleString("th-TH")}
            </p>
            <p style={{ whiteSpace: "pre-wrap" }}>{h.advice_text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
