import { Component } from "react";

// Catches render errors so a bug shows a readable message instead of a blank "Application error" page.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("UI error:", error, info && info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const message = String((this.state.error && this.state.error.message) || this.state.error);
    return (
      <div translate="no" style={{ maxWidth: 560, margin: "80px auto", padding: 24, fontFamily: "sans-serif" }}>
        <h2>หน้านี้เกิดข้อผิดพลาด</h2>
        <p>กดลองใหม่หรือรีเฟรชหน้า ถ้ายังเป็นอีก ให้ส่งข้อความด้านล่างนี้ให้ผู้พัฒนา</p>
        <pre style={{ whiteSpace: "pre-wrap", background: "#f3f4f6", padding: 12, borderRadius: 8, fontSize: 13 }}>{message}</pre>
        <button onClick={() => this.setState({ error: null })}>ลองใหม่</button>{" "}
        <button onClick={() => window.location.reload()}>รีเฟรชหน้า</button>
      </div>
    );
  }
}
