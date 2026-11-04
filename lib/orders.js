import { db } from "./db";

const ALLOWED = {                       // зөвшөөрөгдсөн шилжилтүүд
  PENDING:  ["APPROVED", "REJECTED"],
  APPROVED: ["REJECTED"],
  REJECTED: ["APPROVED"],
};

export async function changeOrderStatus(orderid, newStatus) {          // 16
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(
      "SELECT status FROM orders WHERE orderID=? FOR UPDATE", [orderid]);
    if (!rows[0]) throw new Error("Хүсэлт олдсонгүй");
    if (!ALLOWED[rows[0].status]?.includes(newStatus))
      throw new Error(`${rows[0].status} → ${newStatus} шилжилт хориотой`);
    // Энд APPROVED болгохоос өмнө ангийн багтаамжийг шалгана (TC-07)
    await conn.query(
      "UPDATE orders SET status=?, resolvedDate=NOW() WHERE orderID=?", [newStatus, orderid]);
    await conn.commit();
  } catch (e) { await conn.rollback(); throw e; }
  finally { conn.release(); }
}

export async function deleteOrder(orderid) {                           // 17
  const [r] = await db.query(
    "DELETE FROM orders WHERE orderID=? AND status='REJECTED'", [orderid]);
  if (r.affectedRows === 0) throw new Error("Зөвхөн REJECTED төлөвтэй хүсэлтийг устгана");
}