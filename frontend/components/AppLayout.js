import Link from "next/link";
import { useRouter } from "next/router";
import { clearToken } from "../lib/api";

const links = [
  ["/dashboard", "ภาพรวม", "◫"],
  ["/goals", "เป้าหมาย", "◎"],
  ["/advice", "AI Advisor", "✳"],
];

export default function AppLayout({ children, title, subtitle, action }) {
  const router = useRouter();
  function logout() {
    clearToken();
    router.push("/login");
  }
  return <div className="app-frame">
    <aside className="sidebar">
      <Link href="/dashboard" className="brand"><span className="brand-symbol">m</span><span>moneymind<small>PERSONAL FINANCE</small></span></Link>
      <div className="side-label">WORKSPACE</div>
      <nav className="side-nav">{links.map(([href,label,icon]) => <Link key={href} href={href} className={router.pathname===href?"selected":""}><span className="nav-icon">{icon}</span>{label}{router.pathname===href&&<i/>}</Link>)}</nav>
      <div className="sidebar-bottom">
        <div className="help-card"><span className="help-spark">✳</span><b>Make money<br/>feel simple.</b><p>Small steps today,<br/>stronger future tomorrow.</p><Link href="/advice">คุยกับ AI Advisor ↗</Link></div>
        <button className="logout-button" onClick={logout}><span>↪</span> ออกจากระบบ</button>
      </div>
    </aside>
    <main className="main-area">
      <header className="mobile-header"><Link href="/dashboard" className="brand"><span className="brand-symbol">m</span>moneymind</Link><nav className="mobile-nav">{links.map(([href,label])=><Link key={href} href={href} className={router.pathname===href?"selected":""}>{label}</Link>)}</nav><button className="mobile-logout" onClick={logout}>ออกจากระบบ</button></header>
      <div className="page-heading"><div><div className="breadcrumb">MONEYMIND <span>/</span> {title}</div><h1>{title}</h1><p>{subtitle}</p></div>{action&&<div className="heading-action">{action}</div>}</div>
      {children}
      <footer className="app-footer">MoneyMind <span>·</span> วางแผนวันนี้ เพื่ออนาคตที่มั่นคงกว่า</footer>
    </main>
  </div>;
}
