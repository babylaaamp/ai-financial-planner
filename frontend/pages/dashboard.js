import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { api, getToken } from "../lib/api";
import AppLayout from "../components/AppLayout";

const money = n => Number(n || 0).toLocaleString("th-TH",{minimumFractionDigits:0,maximumFractionDigits:2});
const today = () => new Date().toLocaleDateString("en-CA");
const categories = ["อาหารและเครื่องดื่ม","เดินทาง","ช้อปปิ้ง","ที่พัก","บิลและสาธารณูปโภค","สุขภาพ","ความบันเทิง","เงินเดือน","ฟรีแลนซ์","อื่น ๆ"];

export default function Dashboard() {
  const router=useRouter();
  const [transactions,setTransactions]=useState([]);
  const [amount,setAmount]=useState("");
  const [category,setCategory]=useState("อาหารและเครื่องดื่ม");
  const [type,setType]=useState("expense");
  const [date,setDate]=useState(today());
  const [note,setNote]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  useEffect(()=>{if(!getToken()){router.replace("/login");return;}loadData();},[]);
  async function loadData(){try{setTransactions(await api.listTransactions());}catch(e){setError(e.message);}}
  async function handleAdd(e){e.preventDefault();setBusy(true);setError("");try{await api.createTransaction({amount:parseFloat(amount),category,type,date,note:note||null});setAmount("");setNote("");await loadData();}catch(e){setError(e.message);}finally{setBusy(false);}}
  async function handleDelete(id){if(!confirm("ลบรายการนี้ใช่ไหม?"))return;try{await api.deleteTransaction(id);loadData();}catch(e){setError(e.message);}}
  const totals=useMemo(()=>{
    const month=today().slice(0,7);
    const current=transactions.filter(t=>String(t.date).slice(0,7)===month);
    const income=current.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
    const expense=current.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);
    return {income,expense,balance:income-expense,count:current.length,allIncome:transactions.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0),allExpense:transactions.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0)};
  },[transactions]);
  const recent=transactions.slice(0,7);
  const max=Math.max(totals.income,totals.expense,1);
  const monthLabel=new Date().toLocaleDateString("th-TH",{month:"long",year:"numeric"});
  return <AppLayout title="ภาพรวมการเงิน" subtitle={`สวัสดี! นี่คือภาพรวมการเงินของคุณในเดือน${monthLabel}`}>
    <section className="welcome-banner"><div><span className="banner-kicker">YOUR MONEY, IN A BETTER PLACE</span><h2>ทุกเป้าหมายเริ่มต้น<br/><em>จากก้าวเล็ก ๆ วันนี้</em></h2><p>ติดตามเงินของคุณให้ชัด แล้ววางแผนอนาคตได้อย่างมั่นใจ</p><Link href="/advice" className="banner-link">วางแผนกับ AI Advisor <span>↗</span></Link></div><div className="banner-art"><div className="art-ring ring-one"/><div className="art-ring ring-two"/><div className="art-coin">฿</div><span className="art-star star-a">✳</span><span className="art-star star-b">✦</span></div></section>
    <div className="section-title"><div><span className="section-eyebrow">MONTHLY SNAPSHOT</span><h2>สรุปการเงิน <span>{monthLabel}</span></h2></div><span className="live-pill"><i/> อัปเดตจากรายการของคุณ</span></div>
    <section className="stats-grid">
      <article className="stat-card balance-card"><div className="stat-top"><span>เงินสุทธิเฉพาะเดือนนี้</span><span className="stat-icon">◈</span></div><strong>฿{money(totals.balance)}</strong><small>รายรับลบรายจ่ายของเดือนนี้</small><div className="mini-bars"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></article>
      <article className="stat-card"><div className="stat-top"><span>รายรับเดือนนี้</span><span className="stat-icon green">↙</span></div><strong>฿{money(totals.income)}</strong><small className="positive">เงินที่ไหลเข้าทั้งหมด</small><div className="stat-foot"><span className="dot green-dot"/> รายรับสะสม ฿{money(totals.allIncome)}</div></article>
      <article className="stat-card"><div className="stat-top"><span>รายจ่ายเดือนนี้</span><span className="stat-icon coral">↗</span></div><strong>฿{money(totals.expense)}</strong><small>เงินที่ใช้จ่ายทั้งหมด</small><div className="stat-foot"><span className="dot coral-dot"/> รายจ่ายสะสม ฿{money(totals.allExpense)}</div></article>
    </section>
    <section className="dashboard-grid">
      <div className="panel transactions-panel"><div className="panel-heading"><div><span className="section-eyebrow">ACTIVITY</span><h3>รายการล่าสุด</h3></div><span className="count-chip">{transactions.length} รายการ</span></div>
        {recent.length===0?<div className="empty-state"><span>↗</span><b>ยังไม่มีรายการ</b><p>เริ่มบันทึกรายรับหรือรายจ่ายรายการแรกของคุณ</p></div>:<div className="transaction-list">{recent.map(t=><div className="transaction-item" key={t.id}><div className={`transaction-icon ${t.type}`}>{t.type==="income"?"↙":"↗"}</div><div className="transaction-info"><b>{t.category}</b><small>{t.note|| (t.type==="income"?"รายรับ":"รายจ่าย")} · {new Date(`${t.date}T00:00:00`).toLocaleDateString("th-TH",{day:"numeric",month:"short",year:"numeric"})}</small></div><strong className={t.type}>{t.type==="income"?"+":"−"}฿{money(t.amount)}</strong><button className="icon-button" title="ลบรายการ" onClick={()=>handleDelete(t.id)}>×</button></div>)}</div>}
        {transactions.length>7&&<p className="list-footnote">แสดง 7 รายการล่าสุด จากทั้งหมด {transactions.length} รายการ</p>}
      </div>
      <div className="panel add-panel"><div className="panel-heading"><div><span className="section-eyebrow">QUICK ADD</span><h3>เพิ่มรายการใหม่</h3></div><span className="add-symbol">＋</span></div>
        <div className="type-switch"><button type="button" className={type==="expense"?"active expense-tab":""} onClick={()=>setType("expense")}>รายจ่าย</button><button type="button" className={type==="income"?"active income-tab":""} onClick={()=>setType("income")}>รายรับ</button></div>
        {error&&<p className="form-error">{error}</p>}
        <form onSubmit={handleAdd} className="quick-form"><label>จำนวนเงิน <div className="amount-input"><span>฿</span><input type="number" min="0.01" step="0.01" placeholder="0.00" value={amount} onChange={e=>setAmount(e.target.value)} required/></div></label><label>หมวดหมู่<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>วันที่<input type="date" value={date} onChange={e=>setDate(e.target.value)} required/></label><label>บันทึกเพิ่มเติม <input placeholder="เช่น มื้อกลางวัน..." value={note} onChange={e=>setNote(e.target.value)}/></label><button className="primary-button" disabled={busy}>{busy?"กำลังบันทึก...":"บันทึกรายการ"} <span>↗</span></button></form>
      </div>
    </section>
    <section className="panel cashflow-panel"><div className="panel-heading"><div><span className="section-eyebrow">CASH FLOW</span><h3>รายรับเทียบรายจ่าย</h3></div><span className="muted-caption">เดือนปัจจุบัน</span></div><div className="flow-bars"><div className="flow-row"><span>รายรับ</span><div className="flow-track"><i className="income-bar" style={{width:`${totals.income/max*100}%`}}/></div><b>฿{money(totals.income)}</b></div><div className="flow-row"><span>รายจ่าย</span><div className="flow-track"><i className="expense-bar" style={{width:`${totals.expense/max*100}%`}}/></div><b>฿{money(totals.expense)}</b></div></div></section>
  </AppLayout>;
}
