"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import s from "../theme.module.css";
import Illustration from "@/components/illustration";

const EMPTY = { lname: "", fname: "", rd: "", utas: "", email: "", password: "", password2: "", sumID: "" };

export default function Register() {
  const [f, setF] = useState(EMPTY);
  const [sums, setSums] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    fetch("/api/sum")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setSums(d))
      .catch(() => {});
  }, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (f.password !== f.password2) return setErr("Нууц үг таарахгүй байна");
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lname: f.lname, fname: f.fname, rd: f.rd, utas: f.utas,
          email: f.email, password: f.password, sumID: f.sumID,
        }),
      });
      const t = await r.text();
      const d = t ? JSON.parse(t) : {};
      if (!r.ok) return setErr(d.error || `Серверийн алдаа (${r.status})`);
      setOk(true);
      setTimeout(() => (window.location.href = "/login"), 1500);
    } catch (e) {
      setErr("Холболтын алдаа: " + e.message);
    }
  }

  return (
    <main className={s.page}>
      <div className={s.blobTL} />
      <div className={s.blobTR} />
      <div className={s.blobBottom} />

      <nav className={s.nav}>
        <Link href="/" className={s.logo}>EDULINE</Link>
        <Link href="/" className={s.navLink}>Нүүр</Link>
        <span className={s.spacer} />
        <Link href="/login" className={s.navLink}>Нэвтрэх</Link>
      </nav>

      <section className={s.authWrap}>
        <form onSubmit={submit} className={s.card}>
          <h2>Бүртгүүлэх</h2>

          {err && <div className={s.error}>{err}</div>}
          {ok && (
            <div className={s.error} style={{ background: "#e6f7ee", color: "#067647" }}>
              Амжилттай бүртгэгдлээ. Нэвтрэх хуудас руу шилжиж байна...
            </div>
          )}

          <input className={s.input} placeholder="Овог" value={f.lname} onChange={set("lname")} required />
          <input className={s.input} placeholder="Нэр" value={f.fname} onChange={set("fname")} required />
          <input className={s.input} placeholder="Регистр (жишээ: АА12345678)" maxLength={10}
                 value={f.rd} onChange={set("rd")} required />
          <input className={s.input} placeholder="Утас" inputMode="numeric" maxLength={8}
                 value={f.utas} onChange={set("utas")} />
          <select className={s.input} value={f.sumID} onChange={set("sumID")} required>
            <option value="">Сум, дүүрэг сонгох</option>
            {sums.map((x) => (
              <option key={x.sumID} value={x.sumID}>{x.name}</option>
            ))}
          </select>
          <input className={s.input} type="email" placeholder="Имэйл" value={f.email}
                 onChange={set("email")} required />
          <input className={s.input} type="password" placeholder="Нууц үг (6+ тэмдэгт)"
                 value={f.password} onChange={set("password")} required />
          <input className={s.input} type="password" placeholder="Нууц үг давтах"
                 value={f.password2} onChange={set("password2")} required />

          <button className={`${s.btn} ${s.full}`} disabled={ok}>Бүртгүүлэх</button>
          <p className={s.small}>Бүртгэлтэй юу? <Link href="/login">Нэвтрэх</Link></p>
        </form>
        <div className={s.art}><Illustration /></div>
      </section>
    </main>
  );
}