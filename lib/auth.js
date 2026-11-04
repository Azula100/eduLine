import bcrypt from "bcryptjs";
import { db } from "./db";
import { getSession } from "./session";

// 14. Нэвтрэлтийн лог
export async function addLog(uid) {
  await db.query("INSERT INTO userLog (userID, loginDate) VALUES (?, NOW())", [uid]);
}

// 10. Нэвтрэх
export async function login(umail, upass) {
  const [rows] = await db.query("SELECT * FROM users WHERE userMail=?", [umail]);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(upass, u.userPsw)))
    return "Имэйл эсвэл нууц үг буруу байна";
  const s = await getSession();
  s.userID = u.userID;
  s.userStatus = u.userStatus;
  await s.save();
  await addLog(u.userID);
  return "OK";
}

// 11. Гарах
export async function exit() {
  (await getSession()).destroy();
}

// 12. Профайл солих
export async function editProfile(lname, fname, utas) {
  const s = await getSession();
  await db.query("UPDATE users SET LName=?, FName=?, utas=? WHERE userID=?",
                 [lname, fname, utas, s.userID]);
}

// 13. Нууц үг солих
export async function changePass(oldPass, newPass) {
  const s = await getSession();
  const [rows] = await db.query("SELECT userPsw FROM users WHERE userID=?", [s.userID]);
  if (!rows[0] || !(await bcrypt.compare(oldPass, rows[0].userPsw))) return 0;
  const hash = await bcrypt.hash(newPass, 10);
  const [r] = await db.query("UPDATE users SET userPsw=? WHERE userID=?", [hash, s.userID]);
  return r.affectedRows;
}

// 15. Суралцагчдын жагсаалт
export async function viewSuraltsagch() {
  const s = await getSession();
  if (!["A", "T"].includes(s.userStatus)) throw new Error("Эрх хүрэхгүй");
  const [rows] = await db.query(
    "SELECT userID, LName, FName, userMail, utas FROM users WHERE userStatus='U'");
  return rows;
}

// Бүртгүүлэх
export async function register({ lname, fname, rd, email, password, utas, sumID }) {
  if (!email?.includes("@")) return "Имэйл буруу байна";
  if (!password || password.length < 6) return "Нууц үг хамгийн багадаа 6 тэмдэгт";
  if (!lname?.trim() || !fname?.trim()) return "Овог, нэрээ оруулна уу";

  const [dup] = await db.query("SELECT 1 FROM users WHERE userMail=?", [email]);
  if (dup.length) return "Энэ имэйл бүртгэлтэй байна";

  const hash = await bcrypt.hash(password, 10);
  await db.query(
    `INSERT INTO users (LName, FName, RD, userMail, userPsw, sumID, utas, regDate, tokenCode, userStatus)
     VALUES (?,?,?,?,?,?,?, NOW(), '0', 'U')`,
    [lname, fname, rd, email, hash, sumID, utas || null]);
  return "OK";
}