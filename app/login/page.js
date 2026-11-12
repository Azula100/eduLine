"use client";
import { useState } from "react";
import Link from "next/link";
import s from "../theme.module.css";

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
      const t = await r.text();
      const d = t ? JSON.parse(t) : {};
      if (r.ok) window.location.href = d.redirect;   // нүүр хуудас руу
      else setErr(d.error || `Серверийн алдаа (${r.status})`);
    } catch (e) {
      setErr("Холболтын алдаа: " + e.message);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center",
                   background: "#f4f8fe", padding: 20 }}>
      <form onSubmit={submit} className={s.card}>
        <h2>Нэвтрэх</h2>
        {err && <div className={s.error}>{err}</div>}
        <input className={s.input} type="email" placeholder="Имэйл" required
               onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input className={s.input} type="password" placeholder="Нууц үг" required
               onChange={(e) => setF({ ...f, password: e.target.value })} />
        <button className={`${s.btn} ${s.full}`}>Нэвтрэх</button>
        <p className={s.small}>Бүртгэлгүй юу? <Link href="/register">Бүртгүүлэх</Link></p>
      </form>
    </main>
  );
}