import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { api } from "../lib/api";

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.register(email, password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1200);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>สมัครสมาชิก</h2>
        {error && <p className="error">{error}</p>}
        {success && <p style={{ color: "#16a34a" }}>สมัครสำเร็จ กำลังพาไปหน้าเข้าสู่ระบบ...</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="อีเมล"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="รหัสผ่าน (อย่างน้อย 6 ตัว)"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">สมัครสมาชิก</button>
        </form>
        <p style={{ marginTop: 12, fontSize: 14 }}>
          มีบัญชีอยู่แล้ว? <Link href="/login">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  );
}
