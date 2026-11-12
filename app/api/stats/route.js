import { db } from "@/lib/db";

export async function GET() {
  try {
    const n = async (sql) => (await db.query(sql))[0][0].n;
    return Response.json({
      surgalt: await n("SELECT COUNT(*) AS n FROM surgalt"),
      course: await n("SELECT COUNT(*) AS n FROM course"),
      teachers: await n("SELECT COUNT(*) AS n FROM users WHERE userStatus='T'"),
      students: await n("SELECT COUNT(*) AS n FROM users WHERE userStatus='U'"),
    });
  } catch (e) {
    console.error("STATS:", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}