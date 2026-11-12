import { db } from "./db";

// ↓↓↓ DESCRIBE course-ийн дагуу бодит нэрээр тааруулна ↓↓↓
const T = "course";
const ID = "courseID";
const SURGALT = "surgaltID";
const START = "startDate";
const SCHEDULE = "schedule";
const CAP = "capacity";
const STATUS = "status";
// ↑↑↑

// Төлөвийн зөвшөөрөгдсөн утгууд (баганын утгатай таарах ёстой)
export const STATUSES = ["OPEN", "ACTIVE", "CLOSED"];
// OPEN = бүртгэл нээлттэй, ACTIVE = идэвхтэй (хичээл явагдаж байна), CLOSED = хаагдсан

export async function listCourse() {
  const [rows] = await db.query(
    `SELECT c.\`${ID}\` AS courseID, c.\`${SURGALT}\` AS surgaltID, s.surgaltNer,
            c.\`${START}\` AS startDate, c.\`${SCHEDULE}\` AS schedule,
            c.\`${CAP}\` AS capacity, c.\`${STATUS}\` AS status
     FROM \`${T}\` c LEFT JOIN surgalt s ON s.surgaltID = c.\`${SURGALT}\`
     ORDER BY c.\`${ID}\` DESC`);
  return rows;
}

export async function addCourse({ surgaltID, startDate, schedule, capacity }) {
  await db.query(
    `INSERT INTO \`${T}\` (\`${SURGALT}\`, \`${START}\`, \`${SCHEDULE}\`, \`${CAP}\`, \`${STATUS}\`)
     VALUES (?,?,?,?, 'OPEN')`,                     // шинэ анги: бүртгэл нээлттэй
    [surgaltID, startDate, schedule, capacity]);
}

export async function editCourse(id, { surgaltID, startDate, schedule, capacity }) {
  const [r] = await db.query(
    `UPDATE \`${T}\` SET \`${SURGALT}\`=?, \`${START}\`=?, \`${SCHEDULE}\`=?, \`${CAP}\`=?
     WHERE \`${ID}\`=?`,
    [surgaltID, startDate, schedule, capacity, id]);
  return r.affectedRows;
}

export async function setCourseStatus(id, status) {
  if (!STATUSES.includes(status)) throw new Error("Төлөв буруу байна");
  const [r] = await db.query(
    `UPDATE \`${T}\` SET \`${STATUS}\`=? WHERE \`${ID}\`=?`, [status, id]);
  return r.affectedRows;
}

export async function delCourse(id) {
  await db.query(`DELETE FROM \`${T}\` WHERE \`${ID}\`=?`, [id]);
}