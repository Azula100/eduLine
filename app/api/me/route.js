import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const s = await getSession();
    if (!s.userID) return Response.json({ loggedIn: false });
    const [rows] = await db.query(
      "SELECT LName, FName, userStatus FROM users WHERE userID=?", [s.userID]);
    const u = rows[0];
    if (!u) return Response.json({ loggedIn: false });
    return Response.json({
      loggedIn: true,
      name: `${(u.LName || "").charAt(0)}.${u.FName}`,   // А.Болд
      userStatus: u.userStatus,
    });
  } catch {
    return Response.json({ loggedIn: false });
  }
}