import { requireRole, deny } from "@/lib/guard";
import { listCourse, addCourse, checkCourse, cleanCourse } from "@/lib/course";

export async function GET() {
  try {
    const s = await requireRole(["A", "T", "U"]);
    if (!s) return deny();
    return Response.json(await listCourse());
  } catch (e) {
    console.error("COURSE LIST:", e);
    return Response.json({ error: "Серверийн алдаа: " + e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const s = await requireRole(["A", "T"]);
    if (!s) return deny();
    const b = await req.json();
    const bad = checkCourse(b);
    if (bad) return Response.json({ error: bad }, { status: 400 });
    await addCourse(cleanCourse(b));
    return Response.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("COURSE ADD:", e);
    return Response.json({ error: "Серверийн алдаа: " + e.message }, { status: 500 });
  }
}