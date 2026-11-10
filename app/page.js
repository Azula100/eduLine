import Link from "next/link";
import s from "./theme.module.css";
import Illustration from "@/components/illustration";
export const metadata = { title: "EduLine | Онлайн сургалт" };

export default function Home() {
  return (
    <main className={s.page}>
      <div className={s.blobTL} />
      <div className={s.blobTR} />
      <div className={s.blobBottom} />

      <nav className={s.nav}>
        <Link href="/" className={s.logo}>EDULINE</Link>
        <Link href="/" className={s.navLink}>Нүүр</Link>
        <Link href="/student/surgalt" className={s.navLink}>Сургалт</Link>
        <span className={s.spacer} />
        <form className={s.search} action="/student/surgalt">
          <input placeholder="Сургалт хайх..." />
          <button className={s.searchBtn} aria-label="Хайх">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
              <circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" />
            </svg>
          </button>
        </form>
        <Link href="/login" className={s.navLink}>Нэвтрэх</Link>
        <button className={s.burger} aria-label="Цэс"><span /><span /><span /></button>
      </nav>

      <section className={s.hero}>
        <div>
          <h1 className={s.title}>Онлайн<br />сургалт</h1>
          <p className={s.lead}>
            Сургалтаа сонгож, хүсэлтээ илгээгээд хаанаас ч суралцаарай. Багш нар
            хүсэлтийг шийдвэрлэж, анги бүрийг нэг дор удирдана.
          </p>
          <Link href="/login" className={s.btn}>Эхлэх</Link>
          <Link href="/register" className={`${s.btn} ${s.btnGhost}`}>Бүртгүүлэх</Link>
        </div>
        <div className={s.art}><Illustration /></div>
      </section>
    </main>
  );
}