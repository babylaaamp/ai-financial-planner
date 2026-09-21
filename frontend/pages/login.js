import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { api, saveToken } from "../lib/api";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.login(email, password);
      saveToken(res.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>เข้าสู่ระบบ</h2>
        {error && <p className="error">{error}</p>}
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
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">เข้าสู่ระบบ</button>
        </form>
        <p style={{ marginTop: 12, fontSize: 14 }}>
          ยังไม่มีบัญชี? <Link href="/register">สมัครสมาชิก</Link>
        </p>
      </div>
    </div>
  );
}
