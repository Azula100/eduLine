import { db } from "./db";

// ENUM-ын утгууд (SHOW COLUMNS-ын үр дүнтэй таарах ёстой)
export const TARGETS = ["ALL", "USERS", "COURSE"];

export async function listZarlal() {
  const [rows] = await db.query(
    `SELECT n.notificationID AS zarlalID, n.title, n.content,
            DATE_FORMAT(n.createdDate, '%Y-%m-%d') AS zarlalDate,
            n.targetType AS audience, n.courseID, c.courseName,
            n.isActive AS status
     FROM notification n
     LEFT JOIN course c ON c.courseID = n.courseID
     ORDER BY n.notificationID DESC`);
  return rows;
}

export function checkZarlal(b) {
  if (!b.title?.trim()) return "Гарчгийг оруулна уу";
  if (b.title.trim().length > 150) return "Гарчиг 150 тэмдэгтээс хэтрэхгүй байх ёстой";
  if ((b.content || "").length > 2000) return "Агуулга 2000 тэмдэгтээс хэтрэхгүй байх ёстой";
  if (!TARGETS.includes(b.audience)) return "Хэнд харагдахыг сонгоно уу";
  if (b.audience === "COURSE" && !b.courseID) return "Ангиа сонгоно уу";
  return null;
}

const courseOf = (b) => (b.audience === "COURSE" ? Number(b.courseID) : null);

export async function addZarlal(b, uid) {
  await db.query(
    `INSERT INTO notification (title, content, targetType, courseID, createdBy, isActive)
     VALUES (?,?,?,?,?,1)`,
    [b.title.trim(), (b.content || "").trim(), b.audience, courseOf(b), uid]);
}

export async function editZarlal(id, b) {
  const [r] = await db.query(
    `UPDATE notification SET title=?, content=?, targetType=?, courseID=?
     WHERE notificationID=?`,
    [b.title.trim(), (b.content || "").trim(), b.audience, courseOf(b), id]);
  return r.affectedRows;
}

export async function setZarlalStatus(id, v) {
  await db.query("UPDATE notification SET isActive=? WHERE notificationID=?",
    [Number(v) ? 1 : 0, id]);
}

export async function delZarlal(id) {
  await db.query("DELETE FROM notification WHERE notificationID=?", [id]);
}