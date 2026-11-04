"use client";
import { useState } from "react";

export default function Login() {
  const [f, setF] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const text = await r.text();
      const d = text ? JSON.parse(text) : {};
      if (r.ok) window.location.href = d.redirect;
      else setErr(d.error || `Серверийн алдаа (${r.status})`);
    } catch (e) {
      setErr("Холболтын алдаа: " + e.message);
    }
  }

  return (
    <form onSubmit={submit} className="container mt-5" style={{ maxWidth: 400 }}>
      <h3>Нэвтрэх</h3>
      {err && <div className="alert alert-danger">{err}</div>}
      <input className="form-control mb-2" placeholder="Имэйл"
             onChange={(e) => setF({ ...f, email: e.target.value })} />
      <input className="form-control mb-2" type="password" placeholder="Нууц үг"
             onChange={(e) => setF({ ...f, password: e.target.value })} />
      <button className="btn btn-primary w-100">Нэвтрэх</button>
    </form>
  );
}