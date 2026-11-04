import { db } from "./db";

export const addAimag = (aner) =>                                    // 4
  db.query("INSERT INTO aimag (aimagNer) VALUES (?)", [aner]);

export async function editAimag(p1, aner) {                          // 5
  const [r] = await db.query("UPDATE aimag SET aimagNer=? WHERE aimagID=?", [aner, p1]);
  return r.affectedRows;
}

export const deleteAimag = (p1) =>                                   // 6
  db.query("DELETE FROM aimag WHERE aimagID=?", [p1]);

export const addSum = (sner, aid) =>                                 // 7
  db.query("INSERT INTO sum (sumNer, aimagID) VALUES (?, ?)", [sner, aid]);

export async function editSum(p1, sner, aid) {                       // 8
  const [r] = await db.query(
    "UPDATE sum SET sumNer=?, aimagID=? WHERE sumID=?", [sner, aid, p1]);
  return r.affectedRows;
}

export const deleteSum = (p1) =>                                     // 9
  db.query("DELETE FROM sum WHERE sumID=?", [p1]);