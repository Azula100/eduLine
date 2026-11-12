import { requireRole, deny } from "@/lib/guard";
import { listCourse, addCourse } from "@/lib/course";

function check(b) {
  if (!b.surgaltID) return "Сургалтаа сонгоно уу";
  if (!b.startDate) return "Эхлэх огноог оруулна уу";
  if (!b.schedule?.trim()) return "Хуваарийг оруулна уу";
  if (!Number.isInteger(Number(b.capacity)) || Number(b.capacity) < 1)
    return "Багтаамж 1-ээс их бүхэл тоо байх ёстой";
  return null;
}

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
    const bad = check(b);
    if (bad) return Response.json({ error: bad }, { status: 400 });
    await addCourse({ ...b, schedule: b.schedule.trim(), capacity: Number(b.capacity) });
    return Response.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("COURSE ADD:", e);
    return Response.json({ error: "Серверийн алдаа: " + e.message }, { status: 500 });
  }
}