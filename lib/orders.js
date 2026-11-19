import { db } from "./db";

// status-тай алдаа: API энэ status-аар хариулна
export class AppError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

// ===== Сурагч (U): хүсэлт илгээх / цуцлах =====
export async function listMyOrders(userID) {
  const [rows] = await db.query(
    `SELECT orderID, courseID, orderStatus,
            DATE_FORMAT(orderDate, '%Y-%m-%d %H:%i') AS orderDate
     FROM orders WHERE orderUserID = ? ORDER BY orderID DESC`, [userID]);
  return rows;
}

export async function createOrder(userID, courseID) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[c]] = await conn.query(
      "SELECT isStatus, regOpen, suudalToo FROM course WHERE courseID=? FOR UPDATE", [courseID]);
    if (!c || c.isStatus !== "Y") throw new AppError("Анги олдсонгүй", 404);
    if (c.regOpen !== "Y") throw new AppError("Энэ ангийн бүртгэл хаагдсан байна", 409);

    const [[{ n }]] = await conn.query(
      "SELECT COUNT(*) AS n FROM orders WHERE courseID=? AND orderStatus='approved'", [courseID]);
    if (Number(n) >= Number(c.suudalToo)) throw new AppError("Ангийн суудал дүүрсэн байна", 409);

    const [dup] = await conn.query(
      "SELECT orderStatus FROM orders WHERE orderUserID=? AND courseID=? AND orderStatus IN ('pending','approved') LIMIT 1",
      [userID, courseID]);
    if (dup[0])
      throw new AppError(dup[0].orderStatus === "pending"
        ? "Та энэ ангид хүсэлт илгээсэн байна" : "Та энэ ангид бүртгэгдсэн байна", 409);

    await conn.query(
      "INSERT INTO orders (orderUserID, courseID, orderDate, orderStatus) VALUES (?, ?, NOW(), 'pending')",
      [userID, courseID]);
    await conn.commit();
  } catch (e) { await conn.rollback(); throw e; }
  finally { conn.release(); }
}

// Зөвхөн өөрийн, хүлээгдэж буй (pending) хүсэлтийг цуцална
export async function cancelOrder(orderID, userID) {
  const [[o]] = await db.query(
    "SELECT orderStatus FROM orders WHERE orderID=? AND orderUserID=?", [orderID, userID]);
  if (!o) throw new AppError("Хүсэлт олдсонгүй", 404);
  if (o.orderStatus !== "pending")
    throw new AppError("Зөвхөн хүлээгдэж буй хүсэлтийг цуцлах боломжтой. Баталгаажсан хүсэлтийн хувьд админтай холбогдоно уу", 409);
  const [r] = await db.query(
    "DELETE FROM orders WHERE orderID=? AND orderUserID=? AND orderStatus='pending'", [orderID, userID]);
  if (!r.affectedRows) throw new AppError("Хүсэлт аль хэдийн шийдэгдсэн байна", 409);
}

// ===== Админ, багш: хүсэлтийн төлөв өөрчлөх =====

// DB: orders.orderStatus = ENUM('pending','approved','rejected'), огноо = actionDate, шийдсэн админ = adminID
const ALLOWED = {                       // зөвшөөрөгдсөн шилжилтүүд
  pending:  ["approved", "rejected"],
  approved: ["rejected"],
  rejected: ["approved"],
};

export async function changeOrderStatus(orderid, newStatus, adminId = null) {   // 16
  newStatus = String(newStatus).toLowerCase();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(
      "SELECT orderStatus, courseID FROM orders WHERE orderID=? FOR UPDATE", [orderid]);
    if (!rows[0]) throw new Error("Хүсэлт олдсонгүй");
    const cur = rows[0].orderStatus;
    if (!ALLOWED[cur]?.includes(newStatus))
      throw new Error(`${cur} → ${newStatus} шилжилт хориотой`);

    // Баталгаажуулахаас өмнө ангийн суудал дүүрсэн эсэхийг шалгана (TC-07)
    if (newStatus === "approved") {
      const [[c]] = await conn.query(
        "SELECT suudalToo FROM course WHERE courseID=? FOR UPDATE", [rows[0].courseID]);
      const [[{ n }]] = await conn.query(
        "SELECT COUNT(*) AS n FROM orders WHERE courseID=? AND orderStatus='approved'", [rows[0].courseID]);
      if (c && Number(n) >= Number(c.suudalToo)) throw new Error("Ангийн суудал дүүрсэн байна");
    }

    await conn.query(
      "UPDATE orders SET orderStatus=?, actionDate=NOW(), adminID=? WHERE orderID=?",
      [newStatus, adminId, orderid]);
    await conn.commit();
  } catch (e) { await conn.rollback(); throw e; }
  finally { conn.release(); }
}

export async function deleteOrder(orderid) {                           // 17
  const [r] = await db.query(
    "DELETE FROM orders WHERE orderID=? AND orderStatus='rejected'", [orderid]);
  if (r.affectedRows === 0) throw new Error("Зөвхөн rejected төлөвтэй хүсэлтийг устгана");
}