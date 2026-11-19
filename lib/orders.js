import { db } from "./db";

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