import {useEffect,useRef,useState} from "react";
import {useRouter} from "next/router";
import {api,getToken} from "../lib/api";
import AppLayout from "../components/AppLayout";
function FormattedAnswer({content}){
 const lines=String(content||"").split(/\n+/);
 return <div className="formatted-answer">{lines.map((line,i)=>{const v=line.trim();if(!v)return <div className="answer-space" key={i}/>;if(/^#{1,3}\s/.test(v))return <h4 key={i}>{v.replace(/^#{1,3}\s/,"")}</h4>;if(/^[-*•]\s/.test(v))return <div className="answer-bullet" key={i}><span>•</span><p>{v.replace(/^[-*•]\s/,"").replace(/\*\*(.*?)\*\*/g,"$1")}</p></div>;if(/^\d+[.)]\s/.test(v))return <div className="answer-bullet" key={i}><span>{v.match(/^\d+/)[0]}.</span><p>{v.replace(/^\d+[.)]\s/,"").replace(/\*\*(.*?)\*\*/g,"$1")}</p></div>;return <p key={i}>{v.replace(/\*\*(.*?)\*\*/g,"$1")}</p>;})}</div>;
}
export default function Advice(){
 const router=useRouter();const [messages,setMessages]=useState([]);const [input,setInput]=useState("");const [loading,setLoading]=useState(false);const [error,setError]=useState("");const bottom=useRef(null);
 useEffect(()=>{if(!getToken())router.replace("/login");},[]);
 useEffect(()=>bottom.current?.scrollIntoView({behavior:"smooth"}),[messages,loading]);
 async function send(text=input){const q=text.trim();if(!q||loading)return;const prior=messages;setMessages([...prior,{role:"user",content:q}]);setInput("");setError("");setLoading(true);try{const r=await api.chatAdvice(q,prior.slice(-12));setMessages([...prior,{role:"user",content:q},{role:"assistant",content:r.reply}]);}catch(e){setError(e.message);setMessages(prior);setInput(q);}finally{setLoading(false);}}
 const prompts=["ช่วยวิเคราะห์ภาพรวมการเงินของฉัน","ค่าใช้จ่ายส่วนไหนควรลดก่อน?","ช่วยวางแผนออมเงิน 6 เดือน","ถ้าอยากมีเงินสำรอง 50,000 บาท ต้องทำอย่างไร?"];
 return <AppLayout title="AI Financial Advisor" subtitle="คู่คิดเรื่องเงินที่เข้าใจข้อมูลและเป้าหมายของคุณ">
  <section className="advisor-banner"><div><span className="banner-kicker">YOUR PERSONAL MONEY COMPANION</span><h2>คุยเรื่องเงิน<br/><em>ให้เป็นเรื่องง่าย</em></h2><p>ถามได้ทุกเรื่องการเงิน ฉันจะช่วยวิเคราะห์จากรายรับ รายจ่าย และเป้าหมายที่คุณบันทึกไว้</p></div><div className="advisor-orbit"><span>AI</span><i>✳</i><b>฿</b></div></section>
  <section className="advisor-workspace"><div className="chat-panel"><div className="chat-heading"><div className="ai-avatar">✳</div><div><strong>MoneyMind Advisor</strong><small><i/> พร้อมช่วยวางแผนการเงิน</small></div><button className="text-button" onClick={()=>{setMessages([]);setError("");}}>เริ่มบทสนทนาใหม่ ↻</button></div>
   <div className="chat-body">{messages.length===0&&<div className="welcome-message"><div className="welcome-icon">✳</div><h2>วันนี้อยากวางแผนเรื่องอะไร?</h2><p>เลือกคำถามด้านล่าง หรือพิมพ์สิ่งที่อยากรู้ได้เลย</p><div className="suggestion-grid">{prompts.map(p=><button key={p} onClick={()=>send(p)}>{p}<span>↗</span></button>)}</div></div>}
   {messages.map((m,i)=><div className={`message ${m.role}`} key={i}><div className="message-avatar">{m.role==="assistant"?"AI":"คุณ"}</div><div className="message-content">{m.role==="assistant"?<FormattedAnswer content={m.content}/>:<p>{m.content}</p>}</div></div>)}
   {loading&&<div className="message assistant"><div className="message-avatar">AI</div><div className="typing"><i/><i/><i/></div></div>}<div ref={bottom}/></div>
   {error&&<p className="form-error chat-error">{error}</p>}<form className="chat-composer" onSubmit={e=>{e.preventDefault();send();}}><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="ถามเรื่องการเงินของคุณ... (กด Enter เพื่อส่ง)" rows={2}/><button disabled={!input.trim()||loading}>ส่งคำถาม <span>↑</span></button></form><p className="chat-disclaimer">AI ให้ข้อมูลเพื่อประกอบการตัดสินใจ ไม่ใช่คำแนะนำการลงทุนเฉพาะบุคคล</p>
  </div><aside className="advisor-side"><div className="panel advisor-context"><span className="section-eyebrow">HOW I CAN HELP</span><h3>วางแผนได้มากกว่าแค่ประหยัด</h3>{[["◫","วิเคราะห์กระแสเงินสด","ดูรายรับ รายจ่าย และเงินคงเหลือ"],["◎","วางแผนเป้าหมาย","คำนวณเงินที่ควรเก็บต่อเดือน"],["↗","ปรับพฤติกรรมใช้เงิน","หาโอกาสลดรายจ่ายอย่างเหมาะสม"]].map(([ic,t,d])=><div className="help-row" key={t}><span>{ic}</span><div><b>{t}</b><small>{d}</small></div></div>)}</div><div className="advisor-note"><span>✳</span><b>คำตอบที่ดี เริ่มจากข้อมูลที่ครบ</b><p>บันทึกรายรับ รายจ่าย และเป้าหมายให้สม่ำเสมอ เพื่อให้ AI วิเคราะห์ได้แม่นยำขึ้น</p></div></aside></section>
 </AppLayout>;
}
