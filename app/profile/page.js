"use client";
import { useEffect, useState } from "react";

export default function Profile() {
  const [p, setP] = useState({ LName: "", FName: "", RD: "", userMail: "", utas: "", sumID: "", userStatus: "U" });
  const [sums, setSums] = useState([]);
  const [pw, setPw] = useState({ oldPass: "", newPass: "", newPass2: "" });
  const [pErr, setPErr] = useState(""); const [pMsg, setPMsg] = useState("");
  const [wErr, setWErr] = useState(""); const [wMsg, setWMsg] = useState("");

  async function readJson(r) {
    const t = await r.text();
    try { return t ? JSON.parse(t) : {}; } catch { return {}; }
  }

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/profile");
      const d = await readJson(r);
      if (r.ok) setP({ ...d, utas: d.utas || "" }); else setPErr(d.error || `Алдаа (${r.status})`);
      const s = await fetch("/api/sum");
      const ds = await readJson(s);
      if (s.ok && Array.isArray(ds)) setSums(ds);
    })();
  }, []);

  async function saveProfile(e) {
    e.preventDefault(); setPErr(""); setPMsg("");
    const r = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lname: p.LName, fname: p.FName, utas: p.utas, sumID: p.sumID }),
    });
    const d = await readJson(r);
    r.ok ? setPMsg("Профайл амжилттай хадгалагдлаа") : setPErr(d.error || `Алдаа (${r.status})`);
  }

  async function savePass(e) {
    e.preventDefault(); setWErr(""); setWMsg("");
    if (pw.newPass !== pw.newPass2) return setWErr("Шинэ нууц үг таарахгүй байна");
    const r = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPass: pw.oldPass, newPass: pw.newPass }),
    });
    const d = await readJson(r);
    if (!r.ok) return setWErr(d.error || `Алдаа (${r.status})`);
    setWMsg("Нууц үг амжилттай солигдлоо");
    setPw({ oldPass: "", newPass: "", newPass2: "" });
  }

  const back = p.userStatus === "U" ? "/student" : "/admin";
  const role = { A: "Админ", T: "Багш", U: "Суралцагч" }[p.userStatus];

  return (
    <div className="container mt-4" style={{ maxWidth: 760 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Миний профайл</h3>
        <a href={back} className="btn btn-outline-secondary btn-sm">← Буцах</a>
      </div>

      <form onSubmit={saveProfile} className="card card-body mb-4">
        <h6 className="mb-3">Хувийн мэдээлэл <span className="badge bg-primary ms-2">{role}</span></h6>
        {pErr && <div className="alert alert-danger">{pErr}</div>}
        {pMsg && <div className="alert alert-success">{pMsg}</div>}
        <div className="row g-2">
          <div className="col-md-6">
            <label className="form-label small text-muted">Овог</label>
            <input className="form-control" value={p.LName} required
                   onChange={(e) => setP({ ...p, LName: e.target.value })} />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Нэр</label>
            <input className="form-control" value={p.FName} required
                   onChange={(e) => setP({ ...p, FName: e.target.value })} />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Имэйл (өөрчлөх боломжгүй)</label>
            <input className="form-control" value={p.userMail} disabled />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Регистр (өөрчлөх боломжгүй)</label>
            <input className="form-control" value={p.RD} disabled />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Утас</label>
            <input className="form-control" inputMode="numeric" maxLength={8} value={p.utas}
                   onChange={(e) => setP({ ...p, utas: e.target.value })} />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Сум, дүүрэг</label>
            <select className="form-select" value={p.sumID} required
                    onChange={(e) => setP({ ...p, sumID: e.target.value })}>
              <option value="">Сонгох</option>
              {sums.map((x) => <option key={x.sumID} value={x.sumID}>{x.name}</option>)}
            </select>
          </div>
        </div>
        <button className="btn btn-success mt-3 align-self-start">Хадгалах</button>
      </form>

      <form onSubmit={savePass} className="card card-body">
        <h6 className="mb-3">Нууц үг солих</h6>
        {wErr && <div className="alert alert-danger">{wErr}</div>}
        {wMsg && <div className="alert alert-success">{wMsg}</div>}
        <div className="row g-2">
          <div className="col-md-4">
            <input type="password" className="form-control" placeholder="Хуучин нууц үг"
                   value={pw.oldPass} required onChange={(e) => setPw({ ...pw, oldPass: e.target.value })} />
          </div>
          <div className="col-md-4">
            <input type="password" className="form-control" placeholder="Шинэ нууц үг (6+)"
                   value={pw.newPass} required onChange={(e) => setPw({ ...pw, newPass: e.target.value })} />
          </div>
          <div className="col-md-4">
            <input type="password" className="form-control" placeholder="Шинэ нууц үг давтах"
                   value={pw.newPass2} required onChange={(e) => setPw({ ...pw, newPass2: e.target.value })} />
          </div>
        </div>
        <button className="btn btn-primary mt-3 align-self-start">Нууц үг солих</button>
      </form>
    </div>
  );
}