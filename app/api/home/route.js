import { listSurgalt } from "@/lib/surgalt";
import { listActiveCourses } from "@/lib/course";
import { listTeachers } from "@/lib/teachers";

export async function GET() {
  const out = { surgalt: [], classes: [], teachers: [] };

  try { out.surgalt = await listSurgalt({ onlyActive: true }); }
  catch (e) { console.error("HOME surgalt:", e); out.surgaltError = e.message; }

  try { out.classes = await listActiveCourses(); }
  catch (e) { console.error("HOME course:", e); out.classesError = e.message; }

  try { out.teachers = await listTeachers({ onlyActive: true }); }
  catch (e) { console.error("HOME teachers:", e); out.teachersError = e.message; }

  return Response.json(out);
}