"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import s from "./shell.module.css";

const InShell = createContext(false);

// ready:false = хуудас хараахан хийгдээгүй
const MENU = [
  { href: "/#surgalt", label: "Сургалт", roles: ["*"], ready: true },
  { href: "/#classes", label: "Анги", roles: ["*"], ready: true },
  { href: "/#teachers", label: "Багш нар", roles: ["*"], ready: true },
  { href: "/my", label: "Миний сургалтууд", roles: ["U"], ready: false },
  { href: "/requests", label: "Хүсэлтүүд", roles: ["A", "T"], ready: false, green: true },
  { href: "/students", label: "Суралцагч удирдах", roles: ["A", "T"], ready: false, green: true },
  { href: "/announcements", label: "Зарлал удирдах", roles: ["A", "T"], ready: true, green: true },
];

export default function AppShell({ children }) {
  const inside = useContext(InShell);
  return inside ? <>{children}</> : <Shell>{children}</Shell>;
}

function Shell({ children }) {
  const pathname = usePathname();
  const [me, setMe] = useState(null);
  const [stats, setStats] = useState(null);
  const [open, setOpen] = useState(false);
  const [hash, setHash] = useState("");

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then(setMe).catch(() => setMe({ loggedIn: false }));
    fetch("/api/stats").then((r) => r.json()).then((d) => !d.error && setStats(d)).catch(() => {});
    const f = () => setHash(window.location.hash);
    f();
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  const status = me?.loggedIn ? me.userStatus : null;
  const items = MENU.filter((m) => m.roles.includes("*") || (status && m.roles.includes(status)));

  const isActive = (href) =>
    href.startsWith("/#")
      ? pathname === "/" && (hash || "#surgalt") === href.slice(1)
      : pathname === href;

  return (
    <InShell.Provider value={true}>
      <div className={s.wrap}>
        <div className={s.logo}><Link href="/#surgalt">EDULINE</Link></div>

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
                  <Link href="/profile" onClick={() => setOpen(false)}>Profile</Link>
                  <Link href="/profile#password" onClick={() => setOpen(false)}>Нууц үг солих</Link>
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
            {items.map((m) => {
              const cls = `${s.menuItem} ${m.green ? s.menuGreen : ""} ${isActive(m.href) ? s.menuActive : ""}`;
              if (!m.ready)
                return (
                  <span key={m.href} className={`${s.menuItem} ${s.menuOff}`}>
                    {m.label}<span className={s.soon}>удахгүй</span>
                  </span>
                );
              // Нүүр хуудсан дээр #холбоос: хуудас шилжихгүй, зөвхөн баруун тал солигдоно
              if (m.href.startsWith("/#") && pathname === "/")
                return <a key={m.href} href={m.href.slice(1)} className={cls}>{m.label}</a>;
              return <Link key={m.href} href={m.href} className={cls}>{m.label}</Link>;
            })}
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
    </InShell.Provider>
  );
}