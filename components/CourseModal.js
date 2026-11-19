"use client";
import { useState } from "react";
import Modal from "./Modal";
import { api } from "./http";

const DAYS = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];
const lbl = { fontSize: 12, fontWeight: 700, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: 0.5 };

// 150000 -> "150.000" (тоо бичихэд автоматаар цэгээр таслагдана)
const fmtMoney = (v) => String(v ?? "").replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// Талбарын аль ч хэсэг дээр дарахад календарь нээгдэнэ (зөвхөн icon биш)
function DateField({ value, onChange, min }) {
  return (
    <input type="date" className="form-control" value={value} min={min} required
           onChange={onChange} style={{ cursor: "pointer" }}
           onClick={(e) => { try { e.currentTarget.showPicker?.(); } catch {} }} />
  );
}

// 24 цагийн систем (AM/PM байхгүй): 09 : 00, 15 : 30, 21 : 00
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINS = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));
function TimeField({ value, onChange }) {
  const [h, m] = (value || "00:00").split(":");
  const mins = MINS.includes(m) ? MINS : [...MINS, m].sort();
  return (
    <div className="d-flex align-items-center gap-1" style={{ flex: 1 }}>
      <select className="form-select" value={h} onChange={(e) => onChange(`${e.target.value}:${m}`)}>
        {HOURS.map((x) => <option key={x} value={x}>{x}</option>)}
      </select>
      <b>:</b>
      <select className="form-select" value={m} onChange={(e) => onChange(`${h}:${e.target.value}`)}>
        {mins.map((x) => <option key={x} value={x}>{x}</option>)}
      </select>
    </div>
  );
}

// "Да, Лх, Ба · 18:00–20:00" <-> { days, from, to }
function parseHuvaari(s) {
  const out = { days: [], from: "18:00", to: "20:00" };
  if (!s) return out;
  out.days = DAYS.filter((d) => s.split("·")[0].includes(d));
  const m = s.match(/(\d{2}:\d{2})\s*[–-]\s*(\d{2}:\d{2})/);
  if (m) { out.from = m[1]; out.to = m[2]; }
  return out;
}
const buildHuvaari = (f) => `${DAYS.filter((d) => f.days.includes(d)).join(", ")} · ${f.from}–${f.to}`;

export const emptyForm = () => ({
  id: null, surgaltID: "", courseName: "", courseDetails: "", status: 1,
  startDate: "", finishDate: "", days: [], from: "18:00", to: "20:00",
  price: "", suudalToo: "", hugatsaa: "", approved: 0,
});

export const toForm = (c) => ({
  id: c.courseID, surgaltID: c.surgaltID, courseName: c.courseName || "",
  courseDetails: c.courseDetails || "", status: c.status === undefined ? 1 : Number(c.status),
  startDate: c.startDate || "", finishDate: c.finishDate || "", ...parseHuvaari(c.huvaari),
  price: c.price ?? "", suudalToo: c.suudalToo ?? "", hugatsaa: c.hugatsaa ?? "",
  approved: Number(c.approvedCount || 0),
});

// Ангийн мэдээлэл нэмэх / засах / устгах (admin, teacher)
export default function CourseModal({ init, surgalts, onClose, onDone }) {
  const [f, setF] = useState(init);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const toggleDay = (d) =>
    setF({ ...f, days: f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d] });

  // Баталгаажуулах
  async function save(e) {
    e.preventDefault(); setErr("");
    if (!f.surgaltID) return setErr("Сургалтаа сонгоно уу");
    if (!f.days.length) return setErr("Хичээллэх гараг (хуваарь)-аа сонгоно уу");
    if (f.to <= f.from) return setErr("Дуусах цаг эхлэх цагаас хойш байх ёстой");
    if (f.approved && Number(f.suudalToo) < f.approved)
      return setErr(`Баталгаажсан ${f.approved} суралцагч байгаа тул суудал ${f.approved}-аас багагүй байх ёстой`);
    setBusy(true);
    const r = await api(f.id ? `/api/course/${f.id}` : "/api/course", f.id ? "PUT" : "POST",
      { surgaltID: f.surgaltID, courseName: f.courseName, courseDetails: f.courseDetails,
        status: f.status, startDate: f.startDate, finishDate: f.finishDate,
        huvaari: buildHuvaari(f), price: f.price, suudalToo: f.suudalToo, hugatsaa: f.hugatsaa });
    setBusy(false);
    if (!r.ok) return setErr(r.data.error || `Алдаа (${r.status})`);
    onDone(f.id ? "Анги амжилттай засагдлаа" : "Анги амжилттай нэмэгдлээ");
  }

  async function del() {
    if (!confirm(`"${f.courseName}" ангийг устгах уу?`)) return;
    setErr(""); setBusy(true);
    const r = await api(`/api/course/${f.id}`, "DELETE");
    setBusy(false);
    if (!r.ok) return setErr(r.data.error || `Алдаа (${r.status})`);
    onDone("Анги амжилттай устгагдлаа");
  }

  return (
    <Modal title={f.id ? "Анги удирдах" : "Анги нэмэх"} onClose={onClose}>
      <form onSubmit={save} className="d-grid gap-3">
        {err && <div className="alert alert-danger py-2 mb-0">{err}</div>}

        <div>
          <div style={lbl}>Сургалт</div>
          <select className="form-select" value={f.surgaltID} onChange={set("surgaltID")} required>
            <option value="">Сургалт сонгох</option>
            {surgalts.map((s) => <option key={s.surgaltID} value={s.surgaltID}>{s.surgaltNer}</option>)}
          </select>
        </div>

        <div>
          <div style={lbl}>Ангийн нэр</div>
          <input className="form-control" maxLength={45} value={f.courseName} onChange={set("courseName")} required />
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <div style={lbl}>Төлөв</div>
          <div className="form-check form-switch m-0">
            <input className="form-check-input" type="checkbox" role="switch" id="st" checked={!!f.status}
                   onChange={(e) => setF({ ...f, status: e.target.checked ? 1 : 0 })} />
            <label className="form-check-label" htmlFor="st">{f.status ? "Идэвхтэй" : "Идэвхгүй"}</label>
          </div>
        </div>

        <div className="row g-2">
          <div className="col-6">
            <div style={lbl}>Эхлэх огноо</div>
            <DateField value={f.startDate} onChange={set("startDate")} />
          </div>
          <div className="col-6">
            <div style={lbl}>Дуусах огноо</div>
            <DateField value={f.finishDate} min={f.startDate} onChange={set("finishDate")} />
          </div>
        </div>

        <div>
          <div style={lbl}>Хуваарь</div>
          <div className="d-flex gap-1 flex-wrap my-1">
            {DAYS.map((d) => (
              <button type="button" key={d} onClick={() => toggleDay(d)}
                className={`btn btn-sm ${f.days.includes(d) ? "btn-primary" : "btn-outline-secondary"}`}
                style={{ minWidth: 44 }}>{d}</button>
            ))}
          </div>
          <div className="d-flex gap-2 align-items-center">
            <TimeField value={f.from} onChange={(v) => setF({ ...f, from: v })} />
            <span>–</span>
            <TimeField value={f.to} onChange={(v) => setF({ ...f, to: v })} />
          </div>
        </div>

        <div className="row g-2">
          <div className="col-6">
            <div style={lbl}>Төлбөр (₮)</div>
            <div className="input-group">
              <input inputMode="numeric" className="form-control" placeholder="150.000" required
                     value={fmtMoney(f.price)}
                     onChange={(e) => setF({ ...f, price: e.target.value.replace(/\D/g, "") })} />
              <span className="input-group-text">₮</span>
            </div>
          </div>
          <div className="col-6">
            <div style={lbl}>Суудлын тоо</div>
            <input type="number" min={Math.max(1, f.approved)} step="1" className="form-control"
                   value={f.suudalToo} onChange={set("suudalToo")} required />
            {f.approved > 0 && <div className="small text-muted">Баталгаажсан: {f.approved}</div>}
          </div>
        </div>

        <div>
          <div style={lbl}>Дэлгэрэнгүй</div>
          <textarea className="form-control" rows={3} value={f.courseDetails} onChange={set("courseDetails")} />
        </div>

        <div className="d-grid gap-2 mt-1">
          <button className="btn btn-success" disabled={busy}>{busy ? "Хадгалж байна..." : "Баталгаажуулах"}</button>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Болих</button>
          {f.id && (
            <button type="button" className="btn btn-link text-danger" disabled={busy} onClick={del}>Ангийг устгах</button>
          )}
        </div>
      </form>
    </Modal>
  );
}