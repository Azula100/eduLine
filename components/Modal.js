"use client";

export default function Modal({ title, onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(13,42,107,.45)",
      display: "grid", placeItems: "center", zIndex: 50, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 24,
        width: "100%", maxWidth: 520, maxHeight: "90vh", overflow: "auto" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0" style={{ fontWeight: 800, color: "#0d3a8c" }}>{title}</h5>
          <button className="btn-close" onClick={onClose} aria-label="Хаах" />
        </div>
        {children}
      </div>
    </div>
  );
}