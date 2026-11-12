"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import s from "./shell.module.css";

// ready:false = хуудас хараахан хийгдээгүй (хийсний дараа true болгоно)
const MENU = [
  { href: "/#surgalt", label: "Сургалт", roles: ["*"], ready: true },
  { href: "/#classes", label: "Анги", roles: ["*"], ready: true },
  { href: "/#teachers", label: "Багш нар", roles: ["*"], ready: true },
  { href: "/my", label: "Миний сургалтууд", roles: ["U"], ready: false },
  { href: "/requests", label: "Хүсэлтүүд", roles: ["A", "T"], ready: false },
  { href: "/students", label: "Суралцагч удирдах", roles: ["A", "T"], ready: false },
  { href: "/announcements", label: "Зарлал удирдах", roles: ["A", "T"], ready: false },
  { href: "/admin/surgalt", label: "Сургалт удирдах", roles: ["A", "T"], ready: true },
  { href: "/admin/course", label: "Анги удирдах", roles: ["A", "T"], ready: true },
];

export default function AppShell({ children }) {
  const [me, setMe] = useState(null);
  const [stats, setStats] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then(setMe).catch(() => setMe({ loggedIn: false }));
    fetch("/api/stats").then((r) => r.json()).then((d) => !d.error && setStats(d)).catch(() => {});
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  const status = me?.loggedIn ? me.userStatus : null;
  const items = MENU.filter((m) => m.roles.includes("*") || (status && m.roles.includes(status)));

  return (
    <div className={s.wrap}>
      <div className={s.logo}><Link href="/">EDULINE</Link></div>

      <header className={s.head}>
        {me?.loggedIn ? (
          <>
            <button className={s.iconBtn} title="Мэдэгдэл" aria-label="Мэдэгдэл">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" />
              </svg>
            </button>
            <button className={s.userBtn} onClick={() => setOpen(!open)}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0d4bb5" strokeWidth="2">
                <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
              </svg>
              {me.name}
            </button>
            {open && (
              <div className={s.drop} onMouseLeave={() => setOpen(false)}>
                <Link href="/profile">Profile</Link>
                <Link href="/profile#password">Нууц үг солих</Link>
                <button onClick={logout}>Гарах</button>
              </div>
            )}
          </>
        ) : (
          <>
            <Link href="/login" className={s.linkBtn}>Нэвтрэх</Link>
            <Link href="/register" className={`${s.linkBtn} ${s.pill}`}>Бүртгүүлэх</Link>
          </>
        )}
      </header>

      <aside className={s.side}>
        <nav className={s.menu}>
          {items.map((m) =>
            m.ready ? (
              <Link key={m.href} href={m.href} className={s.menuItem}>{m.label}</Link>
            ) : (
              <span key={m.href} className={`${s.menuItem} ${s.menuOff}`}>
                {m.label}<span className={s.soon}>удахгүй</span>
              </span>
            )
          )}
        </nav>
      </aside>

      <main className={s.main}>{children}</main>

      <footer className={s.foot}>
        <div className={s.stats}>
          <div className={s.statTitle}>Статистик</div>
          <div className={s.stat}><b>{stats?.surgalt ?? "–"}</b><span>Сургалт</span></div>
          <div className={s.stat}><b>{stats?.course ?? "–"}</b><span>Анги</span></div>
          <div className={s.stat}><b>{stats?.teachers ?? "–"}</b><span>Багш</span></div>
          <div className={s.stat}><b>{stats?.students ?? "–"}</b><span>Суралцагч</span></div>
        </div>
      </footer>
    </div>
  );
}