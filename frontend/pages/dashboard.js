import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { api, getToken, clearToken } from "../lib/api";

export default function Dashboard() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("expense");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await api.listTransactions();
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    try {
      await api.createTransaction({
        amount: parseFloat(amount),
        category,
        type,
        date,
      });
      setAmount("");
      setCategory("");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    await api.deleteTransaction(id);
    loadData();
  }

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="container">
      <nav>
        <Link href="/dashboard">รายรับ-รายจ่าย</Link>
        <Link href="/goals">เป้าหมาย</Link>
        <Link href="/advice">คำแนะนำ AI</Link>
        <button className="secondary" style={{ width: "auto" }} onClick={handleLogout}>
          ออกจากระบบ
        </button>
      </nav>

      <div className="card">
        <h3>สรุปยอด</h3>
        <p className="income">รายรับรวม: {totalIncome.toLocaleString()} บาท</p>
        <p className="expense">รายจ่ายรวม: {totalExpense.toLocaleString()} บาท</p>
        <p><b>คงเหลือ: {(totalIncome - totalExpense).toLocaleString()} บาท</b></p>
      </div>

      <div className="card">
        <h3>เพิ่มรายการ</h3>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleAdd}>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="expense">รายจ่าย</option>
            <option value="income">รายรับ</option>
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="จำนวนเงิน"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="หมวดหมู่ (เช่น อาหาร, เงินเดือน)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <button type="submit">บันทึก</button>
        </form>
      </div>

      <div className="card">
        <h3>รายการทั้งหมด</h3>
        {transactions.length === 0 && <p>ยังไม่มีรายการ</p>}
        {transactions.map((t) => (
          <div key={t.id} className="row">
            <span>
              {t.date} · {t.category}
            </span>
            <span className={t.type}>
              {t.type === "income" ? "+" : "-"}
              {t.amount.toLocaleString()}{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); handleDelete(t.id); }}>
                ลบ
              </a>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
