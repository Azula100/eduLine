"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHead from "@/components/PageHead";
import Modal from "@/components/Modal";
import { api } from "@/components/http";

const EMPTY = { id: null, title: "", content: "", audience: "ALL", courseID: "" };
const AUD = { ALL: "Нийтэд", USERS: "Бүртгэлтэй хэрэглэгчдэд", COURSE: "Тухайн ангийн суралцагчдад" };
const act = { background: "none", border: 0, padding: 0, fontWeight: 700, cursor: "pointer", fontSize: 14 };

export default function AnnouncementsPage() {
  const [list, setList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [f, setF] = useState(null);
  const [err, setErr] = useState("");
  const [mErr, setMErr] = useState("");

  async function load() {
    const r = await api("/api/zarlal");
    if (r.ok) setList(r.data);
    else setErr(r.status === 403 ? "Энэ хуудсыг зөвхөн Багш, Админ харна" : r.data.error || `Алдаа (${r.status})`);
    const c = await api("/api/course");
    if (c.ok && Array.isArray(c.data)) setCourses(c.data);
  }
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function save(e) {
    e.preventDefault(); setMErr("");
    const r = await api(f.id ? `/api/zarlal/${f.id}` : "/api/zarlal", f.id ? "PUT" : "POST", f);
    if (!r.ok) return setMErr(r.data.error || `Алдаа (${r.status})`);
    setF(null); load();
  }
  async function toggle(z) {
    const r = await api(`/api/zarlal/${z.zarlalID}`, "PATCH", { status: Number(z.status) ? 0 : 1 });
    if (!r.ok) setErr(r.data.error); else load();
  }
  async function del(z) {
    if (!confirm("Энэ зарлалыг устгах уу?")) return;
    const r = await api(`/api/zarlal/${z.zarlalID}`, "DELETE");
    if (!r.ok) setErr(r.data.error); else load();
  }

  return (
    <AppShell>
      <PageHead title="Зарлал удирдах" onAdd={() => { setMErr(""); setF({ ...EMPTY }); }} />
      {err && <div className="alert alert-danger">{err}</div>}

      <div className="table-responsive">
        <table className="table align-middle" style={{ background: "#fff" }}>
          <thead>
            <tr style={{ textTransform: "uppercase", fontSize: 13 }}>
              <th style={{ width: 50 }}>#</th><th>Гарчиг</th><th>Огноо</th>
              <th>Хэн</th><th>Идэвхтэй</th><th>Үйлдэх</th>
            </tr>
          </thead>
          <tbody>
            {list.map((z, i) => {
              const on = Number(z.status) === 1;
              return (
                <tr key={z.zarlalID} style={{ background: i % 2 === 0 ? "#f1f1f1" : "#fff" }}>
                  <td><b>{z.zarlalID}</b></td>
                  <td style={{ maxWidth: 340 }}>
                    {z.title}
                    {z.content ? <div className="text-muted small">{z.content.slice(0, 90)}{z.content.length > 90 ? "…" : ""}</div> : null}
                  </td>
                  <td className="text-nowrap">{z.zarlalDate}</td>
                  <td>
                    {AUD[z.audience] || z.audience}
                    {z.audience === "COURSE" && z.courseName ? <div className="text-muted small">{z.courseName}</div> : null}
                  </td>
                  <td>
                    <button style={{ ...act, color: on ? "#111" : "#888", fontWeight: 400 }} onClick={() => toggle(z)}>
                      {on ? "Идэвхтэй" : "Идэвхгүй"}
                    </button>
                  </td>
                  <td>
                    <button style={{ ...act, color: "#16a34a", display: "block" }}
                      onClick={() => { setMErr(""); setF({ id: z.zarlalID, title: z.title, content: z.content || "",
                        audience: z.audience, courseID: z.courseID || "" }); }}>Засах</button>
                    <button style={{ ...act, color: "#dc2626", display: "block" }} onClick={() => del(z)}>Устгах</button>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && !err && (
              <tr><td colSpan="6" className="text-center text-muted">Зарлал байхгүй байна</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {f && (
        <Modal title={f.id ? "Зарлал засах" : "Зарлал нэмэх"} onClose={() => setF(null)}>
          <form onSubmit={save} className="d-grid gap-2">
            {mErr && <div className="alert alert-danger py-2 mb-1">{mErr}</div>}
            <input className="form-control" placeholder="Гарчиг" maxLength={150}
                   value={f.title} onChange={set("title")} required />
            <textarea className="form-control" rows={4} maxLength={2000} placeholder="Дэлгэрэнгүй"
                      value={f.content} onChange={set("content")} />
            <select className="form-select" value={f.audience}
                    onChange={(e) => setF({ ...f, audience: e.target.value, courseID: "" })}>
              {Object.entries(AUD).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            {f.audience === "COURSE" && (
              <select className="form-select" value={f.courseID} onChange={set("courseID")} required>
                <option value="">Анги сонгох</option>
                {courses.map((c) => (
                  <option key={c.courseID} value={c.courseID}>{c.courseName}</option>
                ))}
              </select>
            )}
            <div className="d-flex gap-2 justify-content-end mt-2">
              <button type="button" className="btn btn-secondary" onClick={() => setF(null)}>Болих</button>
              <button className="btn btn-success">Хадгалах</button>
            </div>
          </form>
        </Modal>
      )}
    </AppShell>
  );
}