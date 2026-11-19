import { db } from "./db";

const T = "surgalt";
const ID = "surgaltID";
const NAME = "surgaltNer";
const DESC = "surgaltDetails";

// surgaltDetails ба surgaltDelgerengui хоёр нэрээр хоёуланг нь буцаана (хуудсууд аль нэгийг нь уншдаг)
export async function listSurgalt({ onlyActive = false } = {}) {
  const [rows] = await db.query(
    `SELECT \`${ID}\` AS surgaltID, \`${NAME}\` AS surgaltNer,
            \`${DESC}\` AS surgaltDetails, \`${DESC}\` AS surgaltDelgerengui,
            \`isStatus\` AS status
     FROM \`${T}\` ${onlyActive ? "WHERE `isStatus` = 1" : ""} ORDER BY \`${ID}\` DESC`);
  return rows;
}

// 1. addSurgalt(p2, p3): ID автоматаар үүснэ (surgaltDetails NOT NULL тул хоосон бол "")
export async function addSurgalt(p2, p3) {
  await db.query(`INSERT INTO \`${T}\` (\`${NAME}\`, \`${DESC}\`) VALUES (?, ?)`,
    [(p2 || "").trim(), (p3 || "").trim()]);
}

// 2. editSurgalt(p1, p2, p3): засагдсан мөрийн тоог буцаана
export async function editSurgalt(p1, p2, p3) {
  const [r] = await db.query(
    `UPDATE \`${T}\` SET \`${NAME}\`=?, \`${DESC}\`=? WHERE \`${ID}\`=?`,
    [(p2 || "").trim(), (p3 || "").trim(), p1]);
  return r.affectedRows;
}

// 3. delSurgalt(p1): анги холбогдсон бол FK алдаа өгнө (API 409 болгоно)
export async function delSurgalt(p1) {
  await db.query(`DELETE FROM \`${T}\` WHERE \`${ID}\`=?`, [p1]);
}