"use client";

export default function Admin() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Админ самбар</h3>
        <button className="btn btn-outline-danger" onClick={logout}>Гарах</button>
      </div>

      <div className="list-group">
        <a href="/admin/surgalt" className="list-group-item list-group-item-action">
          Сургалт удирдах
        </a>
      </div>
    </div>
  );
}