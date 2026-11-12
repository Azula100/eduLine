"use client";
import { useEffect, useState } from "react";

const EMPTY = { id: null, surgaltID: "", startDate: "", schedule: "", capacity: "" };
const STATUS_LABEL = { OPEN: "Бүртгэл нээлттэй", ACTIVE: "Идэвхтэй", CLOSED: "Хаагдсан" };
const STATUS_COLOR = { OPEN: "success", ACTIVE: "primary", CLOSED: "secondary" };

export default function AdminCourse() {
  const [list, setList] = useState([]);
  const [surgalts, setSurgalts] = useState([]);
  const [f, setF] = useState(EMPTY);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function readJson(r) {
    const t = await r.text();
    try { return t ? JSON.parse(t) : {}; } catch { return {}; }
  }

  async function load() {
    try {
      const [a, b] = await Promise.all([fetch("/api/course"), fetch("/api/surgalt")]);
      const da = await readJson(a), db = await readJson(b);
      if (!a.ok) setErr(da.error || `Алдаа (${a.status})`); else setList(da);
      if (b.ok) setSurgalts(db);
    } catch (e) { setErr("Холболтын алдаа: " + e.message); }
  }
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function save(e) {
    e.preventDefault(); setErr(""); setMsg("");
    const editing = f.id !== null;
    const r = await fetch(editing ? `/api/course/${f.id}` : "/api/course", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    const d = await readJson(r);
    if (!r.ok) return setErr(d.error || `Алдаа (${r.status})`);
    setMsg(editing ? "Амжилттай засагдлаа" : "Анги амжилттай нэмэгдлээ");
    setF(EMPTY); load();
  }

  async function changeStatus(c, status) {
    setErr(""); setMsg("");
    const r = await fetch(`/api/course/${c.courseID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const d = await readJson(r);
    if (!r.ok) return setErr(d.error || `Алдаа (${r.status})`);
    setMsg("Төлөв өөрчлөгдлөө"); load();
  }

  async function del(c) {
    if (!confirm(`#${c.courseID} ангийг устгах уу?`)) return;
    setErr(""); setMsg("");
    const r = await fetch(`/api/course/${c.courseID}`, { method: "DELETE" });
    const d = await readJson(r);
    if (!r.ok) return setErr(d.error || `Алдаа (${r.status})`);
    setMsg("Амжилттай устгагдлаа"); load();
  }

  const fmt = (d) => (d ? String(d).slice(0, 10) : "");

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Анги удирдах</h3>
        <a href="/admin" className="btn btn-outline-secondary btn-sm">← Админ самбар</a>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      <form onSubmit={save} className="card card-body mb-4">
        <h6 className="mb-3">{f.id !== null ? `Анги засах (#${f.id})` : "Шинэ анги нэмэх"}</h6>
        <div className="row g-2">
          <div className="col-md-3">
            <select className="form-select" value={f.surgaltID} onChange={set("surgaltID")} required>
              <option value="">Сургалт сонгох</option>
              {surgalts.map((s) => (
                <option key={s.surgaltID} value={s.surgaltID}>{s.surgaltNer}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <input type="date" className="form-control" value={f.startDate}
                   onChange={set("startDate")} required />
          </div>
          <div className="col-md-3">
            <input className="form-control" placeholder="Хуваарь (Даваа, Лхагва 18:00)"
                   value={f.schedule} onChange={set("schedule")} required />
          </div>
          <div className="col-md-2">
            <input type="number" min="1" className="form-control" placeholder="Багтаамж"
                   value={f.capacity} onChange={set("capacity")} required />
          </div>
          <div className="col-md-2 d-flex gap-1">
            <button className="btn btn-success w-100">{f.id !== null ? "Хадгалах" : "Нэмэх"}</button>
            {f.id !== null && (
              <button type="button" className="btn btn-secondary" onClick={() => setF(EMPTY)}>Болих</button>
            )}
          </div>
        </div>
      </form>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr><th>#</th><th>Сургалт</th><th>Эхлэх</th><th>Хуваарь</th><th>Багтаамж</th><th>Төлөв</th><th></th></tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.courseID}>
                <td>{c.courseID}</td>
                <td>{c.surgaltNer}</td>
                <td>{fmt(c.startDate)}</td>
                <td>{c.schedule}</td>
                <td>{c.capacity}</td>
                <td>
                  <select className={`form-select form-select-sm border-${STATUS_COLOR[c.status] || "secondary"}`}
                          style={{ minWidth: 150 }} value={c.status}
                          onChange={(e) => changeStatus(c, e.target.value)}>
                    {Object.entries(STATUS_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </td>
                <td className="text-end text-nowrap">
                  <button className="btn btn-sm btn-warning me-1"
                    onClick={() => { setErr(""); setMsg("");
                      setF({ id: c.courseID, surgaltID: c.surgaltID, startDate: fmt(c.startDate),
                             schedule: c.schedule || "", capacity: c.capacity }); }}>
                    Засах
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => del(c)}>Устгах</button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan="7" className="text-center text-muted">Анги байхгүй байна</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}