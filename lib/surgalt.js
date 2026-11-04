import { db } from "./db";

// ↓↓↓ Workbench дээрх бодит нэрээр тааруулна (DESCRIBE surgalt) ↓↓↓
const T = "surgalt";
const ID = "surgaltID";
const NAME = "surgaltNer";
const DESC = "surgaltDetails";
// ↑↑↑

export async function listSurgalt() {
  const [rows] = await db.query(
    `SELECT \`${ID}\` AS surgaltID, \`${NAME}\` AS surgaltNer, \`${DESC}\` AS surgaltDetails
     FROM \`${T}\` ORDER BY \`${ID}\` DESC`);
  return rows;
}

// 1. addSurgalt(p2, p3): ID автоматаар үүснэ
export async function addSurgalt(p2, p3) {
  await db.query(`INSERT INTO \`${T}\` (\`${NAME}\`, \`${DESC}\`) VALUES (?, ?)`, [p2, p3]);
}

// 2. editSurgalt(p1, p2, p3): засагдсан мөрийн тоог буцаана
export async function editSurgalt(p1, p2, p3) {
  const [r] = await db.query(
    `UPDATE \`${T}\` SET \`${NAME}\`=?, \`${DESC}\`=? WHERE \`${ID}\`=?`, [p2, p3, p1]);
  return r.affectedRows;
}

// 3. delSurgalt(p1)
export async function delSurgalt(p1) {
  await db.query(`DELETE FROM \`${T}\` WHERE \`${ID}\`=?`, [p1]);
}