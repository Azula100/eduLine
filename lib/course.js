import { db } from "./db";

export const ACTIVE = "Y";
export const INACTIVE = "N";

const SELECT = `
  SELECT c.courseID, c.surgaltID, s.surgaltNer,
         c.courseName, c.courseDetails, c.price,
         c.regOpen,
         DATE_FORMAT(c.startDate,  '%Y-%m-%d') AS startDate,
         DATE_FORMAT(c.finishDate, '%Y-%m-%d') AS finishDate,
         c.huvaari, c.hugatsaa, c.suudalToo,
         (c.isStatus = 'Y') AS status,
         (SELECT COUNT(*) FROM orders o
           WHERE o.courseID = c.courseID AND o.orderStatus = 'approved') AS approvedCount
  FROM course c LEFT JOIN surgalt s ON s.surgaltID = c.surgaltID`;

export async function listCourse({ onlyActive = false, surgaltID = null } = {}) {
  const where = [], args = [];
  if (onlyActive) where.push("c.isStatus = 'Y'");
  if (surgaltID) { where.push("c.surgaltID = ?"); args.push(Number(surgaltID)); }
  const [rows] = await db.query(
    `${SELECT} ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY c.courseID DESC`, args);
  return rows;
}

export async function getCourse(id) {
  const [rows] = await db.query(`${SELECT} WHERE c.courseID = ?`, [id]);
  return rows[0] || null;
}

export async function addCourse(b) {
  await db.query(
    `INSERT INTO course
       (surgaltID, courseName, courseDetails, price, regOpen, startDate, finishDate,
        huvaari, hugatsaa, suudalToo, isStatus)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [b.surgaltID, b.courseName, b.courseDetails, b.price, b.regOpen, b.startDate, b.finishDate,
     b.huvaari, b.hugatsaa, b.suudalToo, b.isStatus]);
}

export async function editCourse(id, b) {
  const [r] = await db.query(
    `UPDATE course SET surgaltID=?, courseName=?, courseDetails=?, price=?, regOpen=?,
            startDate=?, finishDate=?, huvaari=?, hugatsaa=?, suudalToo=?, isStatus=?
     WHERE courseID=?`,
    [b.surgaltID, b.courseName, b.courseDetails, b.price, b.regOpen, b.startDate, b.finishDate,
     b.huvaari, b.hugatsaa, b.suudalToo, b.isStatus, id]);
  return r.affectedRows;
}

export async function setCourseStatus(id, status) {
  if (![0, 1].includes(Number(status))) throw new Error("Төлөв буруу байна");
  const [r] = await db.query("UPDATE course SET isStatus=? WHERE courseID=?",
    [Number(status) ? ACTIVE : INACTIVE, id]);
  return r.affectedRows;
}

export async function delCourse(id) {
  await db.query("DELETE FROM course WHERE courseID=?", [id]);
}

export async function seatError(id, suudalToo) {
  const [rows] = await db.query(
    "SELECT COUNT(*) AS n FROM orders WHERE courseID=? AND orderStatus='approved'", [id]);
  const n = Number(rows[0].n);
  return Number(suudalToo) < n
    ? `Энэ ангид ${n} суралцагч баталгаажсан тул суудлын тоо ${n}-аас бага байж болохгүй`
    : null;
}

export function checkCourse(b) {
  if (!b.surgaltID) return "Сургалтаа сонгоно уу";
  if (!b.courseName?.trim()) return "Ангийн нэрийг оруулна уу";
  if (b.courseName.trim().length > 45) return "Ангийн нэр 45 тэмдэгтээс хэтрэхгүй байх ёстой";
  if (!b.startDate || !b.finishDate) return "Эхлэх, дуусах огноог оруулна уу";
  if (b.finishDate < b.startDate) return "Дуусах огноо эхлэхээс өмнө байж болохгүй";
  if (b.price === "" || b.price == null || !Number.isInteger(Number(b.price)) || Number(b.price) < 0)
    return "Төлбөр буруу байна";
  if (!Number.isInteger(Number(b.suudalToo)) || Number(b.suudalToo) < 1)
    return "Суудлын тоо 1-ээс их бүхэл тоо байх ёстой";
  if ((b.huvaari || "").length > 100) return "Хуваарь 100 тэмдэгтээс хэтрэхгүй байх ёстой";
  if (b.hugatsaa !== "" && b.hugatsaa != null &&
      (!Number.isInteger(Number(b.hugatsaa)) || Number(b.hugatsaa) < 0))
    return "Нийт оролт бүхэл тоо байх ёстой";
  return null;
}

export function cleanCourse(b) {
  const hasH = b.hugatsaa !== "" && b.hugatsaa != null;
  return {
    surgaltID: Number(b.surgaltID),
    courseName: b.courseName.trim(),
    courseDetails: (b.courseDetails || "").trim(),
    price: Number(b.price),
    regOpen: b.regOpen === "N" ? "N" : "Y",
    startDate: b.startDate,
    finishDate: b.finishDate,
    huvaari: (b.huvaari || "").trim() || null,
    hugatsaa: hasH ? Number(b.hugatsaa) : null,
    suudalToo: Number(b.suudalToo),
    isStatus: b.status === undefined || Number(b.status) ? ACTIVE : INACTIVE,
  };
}

export async function listActiveCourses(surgaltID = null) {
  const [result] = await db.query("CALL sp_active_courses(?)", [surgaltID]);
  return result[0];
}