"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import CourseModal, { emptyForm, toForm } from "./CourseModal";
import { api } from "./http";

const COLORS = ["#2f6fe4", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4"];
const card = { background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 6px 20px rgba(13,75,181,.08)", height: "100%" };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 };
const h = { fontSize: 18, fontWeight: 800, textTransform: "uppercase", color: "#0d3a8c", margin: 0 };

const money = (v) => Number(v || 0).toLocaleString("de-DE") + "₮";   // 150.000₮
const approved = (c) => Number(c.approvedCount ?? 0);
const total = (c) => Number(c.suudalToo ?? 0);
const isFull = (c) => total(c) > 0 && approved(c) >= total(c);
const seatsText = (c) => `${approved(c)}/${total(c)}`;

function Avatar({ text, i, round, size = 48 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: round ? "50%" : 14, background: COLORS[i % COLORS.length],
      color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: size * 0.42, flex: "none" }}>
      {(text || "?").charAt(0)}
    </div>
  );
}

function useHash() {
  const [hash, setHash] = useState("");
  useEffect(() => {
    const f = () => setHash(window.location.hash);
    f();
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  return hash;
}

function Seats({ c }) {
  return (
    <span style={{ fontWeight: 800, color: isFull(c) ? "#dc2626" : "#0d4bb5" }}>
      {seatsText(c)}{isFull(c) ? " · Дүүрсэн" : ""}
    </span>
  );
}

export default function HomeContent() {
  const hash = useHash();
  const section = hash.startsWith("#classes") ? "classes" : hash.startsWith("#teachers") ? "teachers" : "surgalt";

  const [d, setD] = useState({ surgalt: [], classes: [], teachers: [] });
  const [me, setMe] = useState({ loggedIn: false });
  const [sel, setSel] = useState(null);
  const [err, setErr] = useState("");
  const [mgr, setMgr] = useState(null);     // admin/teacher: бүх анги (идэвхгүй ч орно)
  const [edit, setEdit] = useState(null);    // null = цонх хаалттай
  const [msg, setMsg] = useState("");
  const [tick, setTick] = useState(0);       // дахин ачаалах

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then(setMe).catch(() => {});
    (async () => {
      try {
        const r = await fetch("/api/home");
        const t = await r.text();
        let x = {};
        try { x = t ? JSON.parse(t) : {}; } catch {}
        if (!t) return setErr(`Сервер хоосон хариу өгөв (${r.status}). VS Code terminal-ийн алдааг шалгана уу`);
        setD({ surgalt: x.surgalt || [], classes: x.classes || [], teachers: x.teachers || [] });
        const e = [x.surgaltError && "Сургалт: " + x.surgaltError,
                   x.classesError && "Анги: " + x.classesError,
                   x.teachersError && "Багш: " + x.teachersError].filter(Boolean);
        if (e.length) setErr(e.join(" | "));
      } catch (e) {
        setErr("Холболтын алдаа: " + e.message);
      }
    })();
  }, [tick]);

  const isMgr = me.loggedIn && ["A", "T"].includes(me.userStatus);
  const isAdmin = me.loggedIn && me.userStatus === "A";

  useEffect(() => {
    if (!isMgr) return;
    api("/api/course").then((r) => r.ok && Array.isArray(r.data) && setMgr(r.data));
  }, [isMgr, tick]);
  const classList = isMgr && mgr ? mgr : d.classes;
  const selected = d.surgalt.find((x) => x.surgaltID === sel) || d.surgalt[0];
  const selClasses = selected ? d.classes.filter((c) => c.surgaltID === selected.surgaltID) : [];

  function RequestBtn({ c }) {
    if (!me.loggedIn) return <Link href="/login" className="btn btn-sm btn-primary">Нэвтэрч хүсэлт илгээх</Link>;
    if (me.userStatus === "U")
      return <button className="btn btn-sm btn-primary" disabled={isFull(c)}
                     title="Дараагийн шатанд хийгдэнэ">{isFull(c) ? "Суудал дүүрсэн" : "Хүсэлт илгээх"}</button>;
    return null;
  }

  return (
    <div>
      {err && <div className="alert alert-danger">{err}</div>}

            {/* ===== СУРГАЛТ: хүснэгт ===== */}
      {section === "surgalt" && (
        <section>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 style={h}>Сургалтуудын мэдээлэл</h2>
            {isAdmin && <Link href="/surgalt" className="btn btn-sm btn-outline-primary">Сургалт удирдах</Link>}
          </div>

          <div className="table-responsive"
               style={{ background: "#fff", borderRadius: 16, padding: 8, boxShadow: "0 6px 20px rgba(13,75,181,.08)" }}>
            <table className="table align-middle mb-0">
              <thead>
                <tr style={{ textTransform: "uppercase", fontSize: 12, color: "#0d3a8c" }}>
                  <th style={{ width: 50 }}>#</th>
                  <th>Сургалт</th>
                  <th>Дэлгэрэнгүй</th>
                  <th>Идэвхтэй анги</th>
                  <th>Хугацаа</th>
                  <th>Суудал</th>
                  <th>Төлбөр</th>
                  {!isMgr && <th></th>}
                </tr>
              </thead>
              <tbody>
                {d.surgalt.flatMap((x, i) => {
                  const cl = d.classes.filter((c) => c.surgaltID === x.surgaltID);
                  const rows = cl.length ? cl : [null];
                  return rows.map((c, j) => (
                    <tr key={`${x.surgaltID}-${c ? c.courseID : "none"}`}
                        style={{ borderTop: j === 0 ? "2px solid #e3ecf8" : undefined }}>
                      {j === 0 && <td rowSpan={rows.length}>{i + 1}</td>}
                      {j === 0 && <td rowSpan={rows.length} style={{ fontWeight: 700 }}>{x.surgaltNer}</td>}
                      {j === 0 && (
                        <td rowSpan={rows.length} style={{ maxWidth: 280, color: "#4a5d85", whiteSpace: "pre-line" }}>
                          {x.surgaltDelgerengui || "—"}
                        </td>
                      )}

                      {c ? (
                        <>
                          <td>{c.courseName}</td>
                          <td className="text-nowrap">
                            {c.startDate} - {c.finishDate}
                            {c.hugatsaa ? <div className="text-muted small">Үргэлжлэх: {c.hugatsaa}</div> : null}
                          </td>
                          <td className="text-nowrap"><Seats c={c} /></td>
                          <td className="text-nowrap" style={{ fontWeight: 700 }}>{money(c.price)}</td>
                          {!isMgr && <td className="text-end"><RequestBtn c={c} /></td>}
                        </>
                      ) : (
                        <td colSpan={isMgr ? 4 : 5} className="text-muted">Зарлагдсан анги байхгүй</td>
                      )}
                    </tr>
                  ));
                })}

                {d.surgalt.length === 0 && (
                  <tr><td colSpan={isMgr ? 7 : 8} className="text-center text-muted">Сургалт бүртгэгдээгүй байна</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {/* ===== АНГИ ===== */}
      {section === "classes" && (
        <section>
          <div className="mb-3">
            <h2 style={h}>{isMgr ? "Ангиуд" : "Зарлагдсан ангиуд (идэвхтэй)"}</h2>
          </div>
          {msg && <div className="alert alert-success">{msg}</div>}
          <div style={grid}>
            {isMgr && (
              <div onClick={() => { setMsg(""); setEdit(emptyForm()); }}
                   style={{ ...card, cursor: "pointer", border: "2px dashed #9fb0cc", boxShadow: "none",
                            display: "grid", placeItems: "center", minHeight: 180, color: "#0d4bb5", fontWeight: 800 }}>
                + Анги нэмэх
              </div>
            )}
            {classList.map((c, i) => {
              const on = c.status === undefined || Number(c.status) === 1;
              return (
                <div key={c.courseID}
                     style={{ ...card, cursor: isMgr ? "pointer" : "default", opacity: on ? 1 : 0.6 }}
                     onClick={isMgr ? () => { setMsg(""); setEdit(toForm(c)); } : undefined}>
                  <div className="d-flex justify-content-between align-items-start">
                    <Avatar text={c.surgaltNer || c.courseName} i={i} />
                    {isMgr && (
                      <span className="badge" style={{ background: on ? "#16a34a" : "#9fb0cc" }}>
                        {on ? "Идэвхтэй" : "Идэвхгүй"}
                      </span>
                    )}
                  </div>
                  <h5 style={{ fontWeight: 700, marginTop: 12 }}>{c.courseName}</h5>
                  <div className="text-muted" style={{ fontSize: 13 }}>{c.surgaltNer}</div>
                  <p className="text-muted" style={{ fontSize: 14, marginTop: 8 }}>{c.courseDetails}</p>
                  <div style={{ fontSize: 14, lineHeight: 1.8 }}>
                    <div>Хугацаа: {c.startDate} - {c.finishDate}</div>
                    {c.huvaari ? <div>Хуваарь: {c.huvaari}</div> : null}
                    {c.hugatsaa ? <div>Үргэлжлэх: {c.hugatsaa}</div> : null}
                    <div>Суудлын тоо: <Seats c={c} /></div>
                    <div>Төлбөр: {money(c.price)}</div>
                  </div>
                  {isMgr
                    ? <div className="mt-3" style={{ color: "#16a34a", fontWeight: 700, fontSize: 13 }}>[УДИРДАХ]</div>
                    : <div className="mt-3"><RequestBtn c={c} /></div>}
                </div>
              );
            })}
            {classList.length === 0 && !isMgr && <p className="text-muted">Зарлагдсан анги байхгүй байна</p>}
          </div>
        </section>
      )}

      {/* ===== БАГШ НАР ===== */}
      {section === "teachers" && (
        <section>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 style={h}>Багш нарын танилцуулга</h2>
            {isAdmin && <Link href="/teachers" className="btn btn-sm btn-outline-primary">Багш удирдах</Link>}
          </div>
          <div style={grid}>
            {d.teachers.map((t, i) => (
              <div key={t.userID} style={{ ...card, textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                  <Avatar text={t.FName} i={i} round />
                </div>
                <h5 style={{ fontWeight: 700 }}>{(t.LName || "").charAt(0)}.{t.FName}</h5>
                {t.subject && <div style={{ fontStyle: "italic" }}>{t.subject}</div>}
                {t.utas && <div className="text-muted" style={{ fontSize: 14 }}>Утас: {t.utas}</div>}
              </div>
            ))}
            {d.teachers.length === 0 && <p className="text-muted">Багш бүртгэгдээгүй байна</p>}
          </div>
        </section>
      )}

      {edit && isMgr && (
        <CourseModal init={edit} surgalts={d.surgalt}
          onClose={() => setEdit(null)}
          onDone={(m) => { setEdit(null); setMsg(m); setTick((x) => x + 1); }} />
      )}
    </div>
  );
}