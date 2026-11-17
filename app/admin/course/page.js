"use client";
import { useEffect, useState } from "react";

const EMPTY = { id: null, surgaltID: "", courseName: "", courseDetails: "", price: "",
                startDate: "", finishDate: "", hugatsaa: "", suudalToo: "" };

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

  async function toggle(c) {
    setErr(""); setMsg("");
    const next = Number(c.status) === 1 ? 0 : 1;
    const r = await fetch(`/api/course/${c.courseID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    const d = await readJson(r);
    if (!r.ok) return setErr(d.error || `Алдаа (${r.status})`);
    setMsg(next === 1 ? "Анги идэвхжлээ" : "Анги идэвхгүй боллоо"); load();
  }

  async function del(c) {
    if (!confirm(`"${c.courseName}" ангийг устгах уу?`)) return;
    setErr(""); setMsg("");
    const r = await fetch(`/api/course/${c.courseID}`, { method: "DELETE" });
    const d = await readJson(r);
    if (!r.ok) return setErr(d.error || `Алдаа (${r.status})`);
    setMsg("Амжилттай устгагдлаа"); load();
  }

  const money = (v) => Number(v || 0).toLocaleString("en-US") + "₮";

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Анги удирдах</h3>
        <a href="/" className="btn btn-outline-secondary btn-sm">← Нүүр хуудас</a>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      <form onSubmit={save} className="card card-body mb-4">
        <h6 className="mb-3">{f.id !== null ? `Анги засах (#${f.id})` : "Шинэ анги нэмэх"}</h6>
        <div className="row g-2">
          <div className="col-md-3">
            <select className="form-select" value={f.surgaltID} onChange={set("surgaltID")} required>
              <option value="">Сургалт сонгох</option>
              {surgalts.map((s) => <option key={s.surgaltID} value={s.surgaltID}>{s.surgaltNer}</option>)}
            </select>
          </div>
          <div className="col-md-5">
            <input className="form-control" placeholder="Ангийн нэр" value={f.courseName}
                   onChange={set("courseName")} required />
          </div>
          <div className="col-md-4">
            <input type="number" min="0" className="form-control" placeholder="Төлбөр (₮)"
                   value={f.price} onChange={set("price")} required />
          </div>
          <div className="col-12">
            <input className="form-control" placeholder="Дэлгэрэнгүй" value={f.courseDetails}
                   onChange={set("courseDetails")} />
          </div>
          <div className="col-md-3">
            <label className="form-label small text-muted mb-0">Эхлэх огноо</label>
            <input type="date" className="form-control" value={f.startDate}
                   onChange={set("startDate")} required />
          </div>
          <div className="col-md-3">
            <label className="form-label small text-muted mb-0">Дуусах огноо</label>
            <input type="date" className="form-control" value={f.finishDate}
                   onChange={set("finishDate")} required />
          </div>
          <div className="col-md-3">
            <label className="form-label small text-muted mb-0">Хугацаа</label>
            <input className="form-control" placeholder="Жишээ: 1 сар" value={f.hugatsaa}
                   onChange={set("hugatsaa")} />
          </div>
          <div className="col-md-3">
            <label className="form-label small text-muted mb-0">Суудлын тоо</label>
            <input type="number" min="1" className="form-control" value={f.suudalToo}
                   onChange={set("suudalToo")} required />
          </div>
          <div className="col-12 d-flex gap-2">
            <button className="btn btn-success">{f.id !== null ? "Хадгалах" : "Нэмэх"}</button>
            {f.id !== null && (
              <button type="button" className="btn btn-secondary" onClick={() => setF(EMPTY)}>Болих</button>
            )}
          </div>
        </div>
      </form>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr><th>#</th><th>Сургалт</th><th>Ангийн нэр</th><th>Хугацаа</th>
                <th>Төлбөр</th><th>Суудал</th><th>Төлөв</th><th></th></tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.courseID}>
                <td>{c.courseID}</td>
                <td>{c.surgaltNer}</td>
                <td>{c.courseName}<div className="text-muted small">{c.courseDetails}</div></td>
                <td className="text-nowrap">{c.startDate} → {c.finishDate}
                  {c.hugatsaa ? <div className="text-muted small">{c.hugatsaa}</div> : null}</td>
                <td className="text-nowrap">{money(c.price)}</td>
                <td>{c.suudalToo}</td>
                <td>
                  <button onClick={() => toggle(c)}
                    className={`btn btn-sm ${Number(c.status) === 1 ? "btn-success" : "btn-secondary"}`}>
                    {Number(c.status) === 1 ? "Идэвхтэй" : "Идэвхгүй"}
                  </button>
                </td>
                <td className="text-end text-nowrap">
                  <button className="btn btn-sm btn-warning me-1"
                    onClick={() => { setErr(""); setMsg("");
                      setF({ id: c.courseID, surgaltID: c.surgaltID, courseName: c.courseName || "",
                             courseDetails: c.courseDetails || "", price: c.price,
                             startDate: c.startDate || "", finishDate: c.finishDate || "",
                             hugatsaa: c.hugatsaa ?? "", suudalToo: c.suudalToo }); }}>
                    Засах
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => del(c)}>Устгах</button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan="8" className="text-center text-muted">Анги байхгүй байна</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}