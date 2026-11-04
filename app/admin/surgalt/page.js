"use client";
import { useEffect, useState } from "react";

const EMPTY = { id: null, ner: "", delgerengui: "" };

export default function AdminSurgalt() {
  const [list, setList] = useState([]);
  const [f, setF] = useState(EMPTY);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // JSON-ыг аюулгүй задлах (хоосон хариуд унахгүй)
  async function readJson(r) {
    const t = await r.text();
    try { return t ? JSON.parse(t) : {}; } catch { return {}; }
  }

  async function load() {
    try {
      const r = await fetch("/api/surgalt");
      const d = await readJson(r);
      if (!r.ok) setErr(d.error || `Алдаа (${r.status})`);
      else setList(d);
    } catch (e) {
      setErr("Холболтын алдаа: " + e.message);
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save(e) {
    e.preventDefault();
    setErr(""); setMsg("");
    if (!f.ner.trim()) return setErr("Сургалтын нэрийг оруулна уу");
    try {
      const editing = f.id !== null;
      const r = await fetch(editing ? `/api/surgalt/${f.id}` : "/api/surgalt", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ner: f.ner, delgerengui: f.delgerengui }),
      });
      const d = await readJson(r);
      if (!r.ok) return setErr(d.error || `Алдаа (${r.status})`);
      setMsg(editing ? "Амжилттай засагдлаа" : "Амжилттай нэмэгдлээ");
      setF(EMPTY);
      load();
    } catch (e) {
      setErr("Холболтын алдаа: " + e.message);
    }
  }

  async function del(s) {
    if (!confirm(`"${s.surgaltNer}" сургалтыг устгах уу?`)) return;
    setErr(""); setMsg("");
    try {
      const r = await fetch(`/api/surgalt/${s.surgaltID}`, { method: "DELETE" });
      const d = await readJson(r);
      if (!r.ok) return setErr(d.error || `Алдаа (${r.status})`);
      setMsg("Амжилттай устгагдлаа");
      if (f.id === s.surgaltID) setF(EMPTY);
      load();
    } catch (e) {
      setErr("Холболтын алдаа: " + e.message);
    }
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Сургалт удирдах</h3>
        <a href="/admin" className="btn btn-outline-secondary btn-sm">← Админ самбар</a>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      <form onSubmit={save} className="card card-body mb-4">
        <h6 className="mb-3">{f.id !== null ? `Сургалт засах (#${f.id})` : "Шинэ сургалт нэмэх"}</h6>
        <div className="row g-2">
          <div className="col-md-4">
            <input className="form-control" placeholder="Сургалтын нэр" value={f.ner}
                   onChange={(e) => setF({ ...f, ner: e.target.value })} />
          </div>
          <div className="col-md-5">
            <input className="form-control" placeholder="Дэлгэрэнгүй" value={f.delgerengui}
                   onChange={(e) => setF({ ...f, delgerengui: e.target.value })} />
          </div>
          <div className="col-md-3 d-flex gap-1">
            <button className="btn btn-success w-100">
              {f.id !== null ? "Хадгалах" : "Нэмэх"}
            </button>
            {f.id !== null && (
              <button type="button" className="btn btn-secondary" onClick={() => setF(EMPTY)}>
                Болих
              </button>
            )}
          </div>
        </div>
      </form>

      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr><th style={{ width: 60 }}>#</th><th>Нэр</th><th>Дэлгэрэнгүй</th><th style={{ width: 170 }}></th></tr>
        </thead>
        <tbody>
          {list.map((s) => (
            <tr key={s.surgaltID}>
              <td>{s.surgaltID}</td>
              <td>{s.surgaltNer}</td>
              <td>{s.surgaltDetails}</td>
              <td className="text-end">
                <button className="btn btn-sm btn-warning me-1"
                  onClick={() => {
                    setErr(""); setMsg("");
                    setF({ id: s.surgaltID, ner: s.surgaltNer, delgerengui: s.surgaltDetails || "" });
                  }}>
                  Засах
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => del(s)}>Устгах</button>
              </td>
            </tr>
          ))}
          {loading && (
            <tr><td colSpan="4" className="text-center text-muted">Ачаалж байна...</td></tr>
          )}
          {!loading && list.length === 0 && (
            <tr><td colSpan="4" className="text-center text-muted">Сургалт байхгүй байна</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}