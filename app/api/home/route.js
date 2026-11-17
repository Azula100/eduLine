import { db } from "@/lib/db";
import { listSurgalt } from "@/lib/surgalt";
import { listCourse } from "@/lib/course";

export async function GET() {
  const out = { surgalt: [], classes: [], teachers: [] };

  try { out.surgalt = await listSurgalt(); }
  catch (e) { console.error("HOME surgalt:", e); out.surgaltError = e.message; }

  try { out.classes = await listCourse({ onlyActive: true }); }
  catch (e) { console.error("HOME course:", e); out.classesError = e.message; }

  try {
    const [t] = await db.query("SELECT userID, LName, FName, utas FROM users WHERE userStatus='T'");
    out.teachers = t;
  } catch (e) { console.error("HOME teachers:", e); out.teachersError = e.message; }

  return Response.json(out);
}