"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import s from "../theme.module.css";

const EMPTY = { lname: "", fname: "", rd: "", utas: "", email: "", password: "", password2: "" };

export default function Register() {
  const [f, setF] = useState(EMPTY);
  const [aimags, setAimags] = useState([]);
  const [sums, setSums] = useState([]);
  const [aimagID, setAimagID] = useState("");
  const [sumID, setSumID] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  // Аймгийн жагсаалт
  useEffect(() => {
    fetch("/api/aimag").then((r) => r.json())
      .then((d) => Array.isArray(d) && setAimags(d))
      .catch(() => setErr("Аймгийн жагсаалт татаж чадсангүй"));
  }, []);

  // Аймаг солигдоход тэр аймгийн сумууд
  async function pickAimag(id) {
    setAimagID(id);
    setSumID("");
    setSums([]);
    if (!id) return;
    try {
      const r = await fetch(`/api/sum?aimagID=${id}`);
      const d = await r.json();
      if (Array.isArray(d)) setSums(d);
    } catch {
      setErr("Сумын жагсаалт татаж чадсангүй");
    }
  }

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (!aimagID) return setErr("Аймгаа сонгоно уу");
    if (!sumID) return setErr("Сумаа сонгоно уу");
    if (f.password !== f.password2) return setErr("Нууц үг таарахгүй байна");
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lname: f.lname, fname: f.fname, rd: f.rd, utas: f.utas,
          email: f.email, password: f.password, sumID,
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
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center",
                   background: "#f4f8fe", padding: "30px 20px" }}>
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

        <select className={s.input} value={aimagID} onChange={(e) => pickAimag(e.target.value)} required>
          <option value="">Аймаг, хот сонгох</option>
          {aimags.map((a) => (
            <option key={a.aimagID} value={a.aimagID}>{a.name}</option>
          ))}
        </select>

        <select className={s.input} value={sumID} onChange={(e) => setSumID(e.target.value)}
                disabled={!aimagID} required>
          <option value="">{aimagID ? "Сум, дүүрэг сонгох" : "Эхлээд аймгаа сонгоно уу"}</option>
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
    </main>
  );
}