import bcrypt from "bcryptjs";
import { db } from "./db";

export async function listTeachers({ onlyActive = false } = {}) {
  const [rows] = await db.query(
    `SELECT userID, LName, FName, utas, userMail, subject, isActive AS status
     FROM users WHERE userStatus='T' ${onlyActive ? "AND isActive=1" : ""}
     ORDER BY LName, FName`);
  return rows;
}

export function checkTeacher(b, isNew) {
  if (!b.lname?.trim() || !b.fname?.trim()) return "Овог, нэрийг оруулна уу";
  if (b.utas && !/^\d{8}$/.test(b.utas)) return "Утас 8 оронтой тоо байх ёстой";
  if (isNew) {
    if (!/^[А-ЯӨҮЁа-яөүё]{2}\d{8}$/.test(b.rd || "")) return "Регистр буруу (жишээ: АА12345678)";
    if (!b.email?.includes("@")) return "Имэйл буруу байна";
    if (!b.password || b.password.length < 6) return "Нууц үг хамгийн багадаа 6 тэмдэгт";
  }
  return null;
}

// Багшийг үүсгэхдээ сумыг админы сумаас авна (users.sumID NOT NULL, FK)
export async function addTeacher(b, adminID) {
  const [dup] = await db.query("SELECT 1 FROM users WHERE userMail=?", [b.email]);
  if (dup.length) return "Энэ имэйл бүртгэлтэй байна";
  const hash = await bcrypt.hash(b.password, 10);
  await db.query(
    `INSERT INTO users (LName, FName, RD, userMail, userPsw, sumID, utas, regDate, tokenCode, userStatus, subject, isActive)
     SELECT ?, ?, ?, ?, ?, sumID, ?, NOW(), '0', 'T', ?, 1 FROM users WHERE userID = ?`,
    [b.lname.trim(), b.fname.trim(), b.rd.toUpperCase(), b.email.trim(), hash,
     b.utas || null, (b.subject || "").trim(), adminID]);
  return "OK";
}

export async function editTeacher(id, b) {
  const [r] = await db.query(
    "UPDATE users SET LName=?, FName=?, utas=?, subject=? WHERE userID=? AND userStatus='T'",
    [b.lname.trim(), b.fname.trim(), b.utas || null, (b.subject || "").trim(), id]);
  return r.affectedRows;
}

export async function setTeacherActive(id, v) {
  const [r] = await db.query("UPDATE users SET isActive=? WHERE userID=? AND userStatus='T'",
    [Number(v) ? 1 : 0, id]);
  return r.affectedRows;
}

export async function delTeacher(id) {
  await db.query("DELETE FROM users WHERE userID=? AND userStatus='T'", [id]);
}