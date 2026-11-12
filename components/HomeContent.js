"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const COLORS = ["#2f6fe4", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4"];
const card = { background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 6px 20px rgba(13,75,181,.08)", height: "100%" };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 };
const h = { fontSize: 18, fontWeight: 800, textTransform: "uppercase", color: "#0d3a8c", margin: "0 0 14px" };

function Avatar({ text, i, round }) {
  return (
    <div style={{ width: 48, height: 48, borderRadius: round ? "50%" : 14, background: COLORS[i % COLORS.length],
      color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 20, marginBottom: 12 }}>
      {(text || "?").charAt(0)}
    </div>
  );
}

export default function HomeContent() {
  const [d, setD] = useState({ surgalt: [], classes: [], teachers: [] });
  const [me, setMe] = useState({ loggedIn: false });
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then(setMe).catch(() => {});
    fetch("/api/home").then((r) => r.json()).then((x) => (x.error ? setErr(x.error) : setD(x)))
      .catch((e) => setErr("Холболтын алдаа: " + e.message));
  }, []);

  const manage = me.loggedIn && ["A", "T"].includes(me.userStatus);
  const fmt = (v) => (v ? String(v).slice(0, 10) : "");

  return (
    <div style={{ display: "grid", gap: 34 }}>
      {err && <div className="alert alert-danger">{err}</div>}

      <section id="surgalt">
        <div className="d-flex justify-content-between align-items-center">
          <h2 style={h}>Сургалтуудын мэдээлэл</h2>
          {manage && <Link href="/admin/surgalt" className="btn btn-sm btn-outline-primary">Сургалт удирдах</Link>}
        </div>
        <div style={grid}>
          {d.surgalt.map((x, i) => (
            <div key={x.surgaltID} style={card}>
              <Avatar text={x.surgaltNer} i={i} />
              <h5 style={{ fontWeight: 700 }}>{x.surgaltNer}</h5>
              <p className="text-muted" style={{ fontSize: 14 }}>{x.surgaltDelgerengui}</p>
            </div>
          ))}
          {d.surgalt.length === 0 && <p className="text-muted">Сургалт бүртгэгдээгүй байна</p>}
        </div>
      </section>

      <section id="classes">
        <div className="d-flex justify-content-between align-items-center">
          <h2 style={h}>Зарлагдсан ангиуд (идэвхтэй)</h2>
          {manage && <Link href="/admin/course" className="btn btn-sm btn-outline-primary">Анги удирдах</Link>}
        </div>
        <div style={grid}>
          {d.classes.map((c, i) => (
            <div key={c.courseID} style={card}>
              <Avatar text={c.surgaltNer} i={i} />
              <h5 style={{ fontWeight: 700 }}>{c.surgaltNer}</h5>
              <div style={{ fontSize: 14, lineHeight: 1.8 }}>
                <div>Хугацаа: {fmt(c.startDate)}</div>
                <div>Хуваарь: {c.schedule}</div>
                <div>Суудлын тоо: {c.capacity}</div>
              </div>
              <div className="mt-3">
                {!me.loggedIn && <Link href="/login" className="btn btn-sm btn-primary">Нэвтэрч хүсэлт илгээх</Link>}
                {me.loggedIn && me.userStatus === "U" && (
                  <button className="btn btn-sm btn-primary" disabled title="2-р шатанд хийгдэнэ">Хүсэлт илгээх</button>
                )}
              </div>
            </div>
          ))}
          {d.classes.length === 0 && <p className="text-muted">Зарлагдсан анги байхгүй байна</p>}
        </div>
      </section>

      <section id="teachers">
        <h2 style={h}>Багш нарын танилцуулга</h2>
        <div style={grid}>
          {d.teachers.map((t, i) => (
            <div key={t.userID} style={{ ...card, textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center" }}><Avatar text={t.FName} i={i} round /></div>
              <h5 style={{ fontWeight: 700 }}>{(t.LName || "").charAt(0)}.{t.FName}</h5>
              {t.utas && <div className="text-muted" style={{ fontSize: 14 }}>Утас: {t.utas}</div>}
            </div>
          ))}
          {d.teachers.length === 0 && <p className="text-muted">Багш бүртгэгдээгүй байна</p>}
        </div>
      </section>
    </div>
  );
}