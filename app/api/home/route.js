import { db } from "@/lib/db";
import { listSurgalt } from "@/lib/surgalt";
import { listCourse } from "@/lib/course";

export async function GET() {
  try {
    const surgalt = await listSurgalt();
    const classes = (await listCourse()).filter((c) => c.status !== "CLOSED");
    const [teachers] = await db.query(
      "SELECT userID, LName, FName, utas FROM users WHERE userStatus='T'");
    return Response.json({ surgalt, classes, teachers });
  } catch (e) {
    console.error("HOME:", e);
    return Response.json({ error: "Серверийн алдаа: " + e.message }, { status: 500 });
  }
}