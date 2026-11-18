import { db } from "./db";

// isStatus баганын утга. Таны баганад таарахгүй бол энд солино.
export const ACTIVE = 1;
export const INACTIVE = 0;

const SELECT = `
  SELECT c.courseID, c.surgaltID, s.surgaltNer,
         c.courseName, c.courseDetails, c.price,
         DATE_FORMAT(c.startDate,  '%Y-%m-%d') AS startDate,
         DATE_FORMAT(c.finishDate, '%Y-%m-%d') AS finishDate,
         c.hugatsaa, c.suudalToo, c.isStatus AS status
  FROM course c LEFT JOIN surgalt s ON s.surgaltID = c.surgaltID`;

export async function listCourse({ onlyActive = false } = {}) {
  const [rows] = await db.query(
    `${SELECT} ${onlyActive ? "WHERE c.isStatus = ?" : ""} ORDER BY c.courseID DESC`,
    onlyActive ? [ACTIVE] : []);
  return rows;
}

export async function addCourse(b) {
  await db.query(
    `INSERT INTO course
       (surgaltID, courseName, courseDetails, price, startDate, finishDate, hugatsaa, suudalToo, isStatus)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [b.surgaltID, b.courseName, b.courseDetails, b.price, b.startDate,
     b.finishDate, b.hugatsaa, b.suudalToo, ACTIVE]);
}

export async function editCourse(id, b) {
  const [r] = await db.query(
    `UPDATE course SET surgaltID=?, courseName=?, courseDetails=?, price=?,
            startDate=?, finishDate=?, hugatsaa=?, suudalToo=?
     WHERE courseID=?`,
    [b.surgaltID, b.courseName, b.courseDetails, b.price, b.startDate,
     b.finishDate, b.hugatsaa, b.suudalToo, id]);
  return r.affectedRows;
}

export async function setCourseStatus(id, status) {
  if (![ACTIVE, INACTIVE].includes(Number(status))) throw new Error("Төлөв буруу байна");
  const [r] = await db.query("UPDATE course SET isStatus=? WHERE courseID=?", [Number(status), id]);
  return r.affectedRows;
}

export async function delCourse(id) {
  await db.query("DELETE FROM course WHERE courseID=?", [id]);
}

// Нийтлэг шалгалт: алдаа байвал текст, үгүй бол null
export function checkCourse(b) {
  if (!b.surgaltID) return "Сургалтаа сонгоно уу";
  if (!b.courseName?.trim()) return "Ангийн нэрийг оруулна уу";
  if (!b.startDate || !b.finishDate) return "Эхлэх, дуусах огноог оруулна уу";
  if (b.finishDate < b.startDate) return "Дуусах огноо эхлэхээс өмнө байж болохгүй";
  if (!(Number(b.price) >= 0) || b.price === "") return "Төлбөр буруу байна";
  if (!Number.isInteger(Number(b.suudalToo)) || Number(b.suudalToo) < 1)
    return "Суудлын тоо 1-ээс их бүхэл тоо байх ёстой";
  return null;
}

export function cleanCourse(b) {
  return {
    surgaltID: Number(b.surgaltID),
    courseName: b.courseName.trim(),
    courseDetails: (b.courseDetails || "").trim(),
    price: Number(b.price),
    startDate: b.startDate,
    finishDate: b.finishDate,
    hugatsaa: (b.hugatsaa ?? "").toString().trim(),
    suudalToo: Number(b.suudalToo),
  };
}
// Идэвхтэй ангиуд + баталгаажсан хүсэлтийн тоо (stored procedure)
export async function listActiveCourses(surgaltID = null) {
  const [result] = await db.query("CALL sp_active_courses(?)", [surgaltID]);
  return result[0];            // CALL-ийн эхний result set
}