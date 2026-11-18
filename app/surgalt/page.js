"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHead from "@/components/PageHead";
import Modal from "@/components/Modal";
import { SurgaltIcon } from "@/components/icons";
import useMe from "@/components/useMe";
import { api } from "@/components/http";

const EMPTY = { id: null, ner: "", delgerengui: "" };
const act = { background: "none", border: 0, padding: 0, fontWeight: 700, cursor: "pointer", fontSize: 13 };

export default function SurgaltPage() {
  const me = useMe();
  const isAdmin = me?.userStatus === "A";
  const [list, setList] = useState([]);
  const [f, setF] = useState(null);          // null = modal хаалттай
  const [err, setErr] = useState("");
  const [mErr, setMErr] = useState("");

  async function load() {
    const r = await api("/api/surgalt");
    if (r.ok) setList(r.data); else setErr(r.data.error || `Алдаа (${r.status})`);
  }
  useEffect(() => { load(); }, []);

  async function save(e) {
    e.preventDefault(); setMErr("");
    const r = await api(f.id ? `/api/surgalt/${f.id}` : "/api/surgalt", f.id ? "PUT" : "POST",
      { ner: f.ner, delgerengui: f.delgerengui });
    if (!r.ok) return setMErr(r.data.error || `Алдаа (${r.status})`);
    setF(null); load();
  }
  async function toggle(x) {
    setErr("");
    const r = await api(`/api/surgalt/${x.surgaltID}`, "PATCH", { status: Number(x.status) ? 0 : 1 });
    if (!r.ok) setErr(r.data.error); else load();
  }
  async function del(x) {
    if (!confirm(`"${x.surgaltNer}" сургалтыг устгах уу?`)) return;
    setErr("");
    const r = await api(`/api/surgalt/${x.surgaltID}`, "DELETE");
    if (!r.ok) setErr(r.data.error); else load();
  }

  return (
    <AppShell>
      <PageHead title="Сургалт" onAdd={isAdmin ? () => { setMErr(""); setF(EMPTY); } : null} />
      {err && <div className="alert alert-danger">{err}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 36 }}>
        {list.map((x) => {
          const on = Number(x.status) === 1;
          return (
            <div key={x.surgaltID} style={{ opacity: on ? 1 : 0.55 }}>
              <div style={{ color: "#111", marginBottom: 10 }}><SurgaltIcon name={x.surgaltNer} /></div>
              <div style={{ fontWeight: 800, textTransform: "uppercase" }}>{x.surgaltNer}</div>
              <div style={{ fontStyle: "italic", color: "#333", margin: "4px 0 8px" }}>{x.surgaltDelgerengui}</div>
              {isAdmin && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button style={{ ...act, color: "#111" }} onClick={() => toggle(x)}>
                    [{on ? "ИДЭВХТЭЙ" : "ИДЭВХГҮЙ"}]
                  </button>
                  <button style={{ ...act, color: "#16a34a" }}
                    onClick={() => { setMErr(""); setF({ id: x.surgaltID, ner: x.surgaltNer, delgerengui: x.surgaltDelgerengui || "" }); }}>
                    [ЗАСАХ]
                  </button>
                  <button style={{ ...act, color: "#dc2626" }} onClick={() => del(x)}>[УСТГАХ]</button>
                </div>
              )}
            </div>
          );
        })}
        {list.length === 0 && !err && <p className="text-muted">Сургалт бүртгэгдээгүй байна</p>}
      </div>

      {f && (
        <Modal title={f.id ? "Сургалт засах" : "Сургалт нэмэх"} onClose={() => setF(null)}>
          <form onSubmit={save} className="d-grid gap-2">
            {mErr && <div className="alert alert-danger py-2 mb-1">{mErr}</div>}
            <input className="form-control" placeholder="Сургалтын нэр" value={f.ner} required
                   onChange={(e) => setF({ ...f, ner: e.target.value })} />
            <textarea className="form-control" rows={4} placeholder="Дэлгэрэнгүй" value={f.delgerengui}
                   onChange={(e) => setF({ ...f, delgerengui: e.target.value })} />
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