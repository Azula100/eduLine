"use client";
import Link from "next/link";

export default function PageHead({ title, onAdd }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 15 }}>
        <Link href="/" style={{ color: "#0d2a6b" }}>Нүүр хуудас</Link>
        <span style={{ margin: "0 8px" }}>→</span>
        <span>{title}</span>
      </div>
      {onAdd && (
        <div style={{ textAlign: "right" }}>
          <button onClick={onAdd} style={{ background: "none", border: 0, color: "#16a34a",
            fontWeight: 700, letterSpacing: 1, cursor: "pointer" }}>НЭМЭХ</button>
        </div>
      )}
    </div>
  );
}