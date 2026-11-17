"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const COLORS = ["#2f6fe4", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4"];
const card = { background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 6px 20px rgba(13,75,181,.08)", height: "100%" };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 };
const h = { fontSize: 18, fontWeight: 800, textTransform: "uppercase", color: "#0d3a8c", margin: 0 };

function Avatar({ text, i, round, size = 48 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: round ? "50%" : 14, background: COLORS[i % COLORS.length],
      color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: size * 0.42, flex: "none" }}>
      {(text || "?").charAt(0)}
    </div>
  );
}

// Хуудас шилжихгүй, зөвхөн #hash-аар хэсэг солино
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

const money = (v) => Number(v || 0).toLocaleString("en-US") + "₮";

export default function HomeContent() {
  const hash = useHash();
  const section = hash.startsWith("#classes") ? "classes" : hash.startsWith("#teachers") ? "teachers" : "surgalt";

  const [d, setD] = useState({ surgalt: [], classes: [], teachers: [] });
  const [me, setMe] = useState({ loggedIn: false });
  const [sel, setSel] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then(setMe).catch(() => {});

    (async () => {
      try {
        const r = await fetch("/api/home");
        const t = await r.text();                 // хоосон хариунд унахгүй
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
  }, []);

  const manage = me.loggedIn && ["A", "T"].includes(me.userStatus);
  const selected = d.surgalt.find((x) => x.surgaltID === sel) || d.surgalt[0];
  const selClasses = selected ? d.classes.filter((c) => c.surgaltID === selected.surgaltID) : [];

  function ClassCard({ c, i }) {
    return (
      <div style={card}>
        <Avatar text={c.surgaltNer || c.courseName} i={i} />
        <h5 style={{ fontWeight: 700, marginTop: 12 }}>{c.courseName}</h5>
        <p className="text-muted" style={{ fontSize: 14 }}>{c.courseDetails}</p>
        <div style={{ fontSize: 14, lineHeight: 1.8 }}>
          <div>Хугацаа: {c.startDate} - {c.finishDate}</div>
          {c.hugatsaa ? <div>Үргэлжлэх: {c.hugatsaa}</div> : null}
          <div>Суудлын тоо: {c.suudalToo}</div>
          <div>Төлбөр: {money(c.price)}</div>
        </div>
        <div className="mt-3">
          {!me.loggedIn && <Link href="/login" className="btn btn-sm btn-primary">Нэвтэрч хүсэлт илгээх</Link>}
          {me.loggedIn && me.userStatus === "U" && (
            <button className="btn btn-sm btn-primary" disabled title="Дараагийн шатанд хийгдэнэ">Хүсэлт илгээх</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {err && <div className="alert alert-danger">{err}</div>}

      {/* ===== СУРГАЛТ: зүүн талд жагсаалт, хажууд нь мэдээлэл ===== */}
      {section === "surgalt" && (
        <section>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 style={h}>Сургалтуудын мэдээлэл</h2>
            {manage && <Link href="/admin/surgalt" className="btn btn-sm btn-outline-primary">Сургалт удирдах</Link>}
          </div>

          {d.surgalt.length === 0 ? (
            <p className="text-muted">Сургалт бүртгэгдээгүй байна</p>
          ) : (
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
              {/* Зүүн: жагсаалт */}
              <div style={{ flex: "0 0 280px", display: "grid", gap: 8 }}>
                {d.surgalt.map((x, i) => {
                  const active = selected && x.surgaltID === selected.surgaltID;
                  return (
                    <button key={x.surgaltID} onClick={() => setSel(x.surgaltID)}
                      style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                        border: active ? "2px solid #0d4bb5" : "2px solid transparent",
                        background: active ? "#eaf2ff" : "#fff", borderRadius: 14, padding: "10px 12px",
                        cursor: "pointer", boxShadow: "0 4px 14px rgba(13,75,181,.06)" }}>
                      <Avatar text={x.surgaltNer} i={i} size={38} />
                      <span style={{ fontWeight: 700, color: "#0d2a6b" }}>{x.surgaltNer}</span>
                    </button>
                  );
                })}
              </div>

              {/* Баруун: сонгосон сургалтын мэдээлэл */}
              {selected && (
                <div style={{ flex: "1 1 340px", minWidth: 0 }}>
                  <div style={{ ...card, height: "auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                      <Avatar text={selected.surgaltNer} i={d.surgalt.indexOf(selected)} size={56} />
                      <h3 style={{ margin: 0, fontWeight: 800, color: "#0d3a8c" }}>{selected.surgaltNer}</h3>
                    </div>
                    <p style={{ whiteSpace: "pre-line", color: "#4a5d85" }}>
                      {selected.surgaltDelgerengui || "Дэлгэрэнгүй мэдээлэл оруулаагүй байна."}
                    </p>

                    <h6 style={{ fontWeight: 800, color: "#0d3a8c", marginTop: 20 }}>
                      Зарлагдсан ангиуд ({selClasses.length})
                    </h6>
                    {selClasses.length === 0 ? (
                      <p className="text-muted" style={{ fontSize: 14 }}>Одоогоор зарлагдсан анги байхгүй байна</p>
                    ) : (
                      <div style={{ display: "grid", gap: 10 }}>
                        {selClasses.map((c) => (
                          <div key={c.courseID} style={{ background: "#f4f8fe", borderRadius: 12, padding: 14,
                                  display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                            <div>
                              <div style={{ fontWeight: 700 }}>{c.courseName}</div>
                              <div style={{ fontSize: 13, color: "#6b7fa3" }}>
                                {c.startDate} - {c.finishDate} · {c.suudalToo} суудал
                              </div>
                            </div>
                            <div style={{ fontWeight: 800, color: "#0d4bb5" }}>{money(c.price)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ===== АНГИ ===== */}
      {section === "classes" && (
        <section>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 style={h}>Зарлагдсан ангиуд (идэвхтэй)</h2>
            {manage && <Link href="/admin/course" className="btn btn-sm btn-outline-primary">Анги удирдах</Link>}
          </div>
          <div style={grid}>
            {d.classes.map((c, i) => <ClassCard key={c.courseID} c={c} i={i} />)}
            {d.classes.length === 0 && <p className="text-muted">Зарлагдсан анги байхгүй байна</p>}
          </div>
        </section>
      )}

      {/* ===== БАГШ НАР ===== */}
      {section === "teachers" && (
        <section>
          <h2 style={{ ...h, marginBottom: 16 }}>Багш нарын танилцуулга</h2>
          <div style={grid}>
            {d.teachers.map((t, i) => (
              <div key={t.userID} style={{ ...card, textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                  <Avatar text={t.FName} i={i} round />
                </div>
                <h5 style={{ fontWeight: 700 }}>{(t.LName || "").charAt(0)}.{t.FName}</h5>
                {t.utas && <div className="text-muted" style={{ fontSize: 14 }}>Утас: {t.utas}</div>}
              </div>
            ))}
            {d.teachers.length === 0 && <p className="text-muted">Багш бүртгэгдээгүй байна</p>}
          </div>
        </section>
      )}
    </div>
  );
}