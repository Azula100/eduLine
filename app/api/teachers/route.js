import { getSession } from "@/lib/session";
import { requireRole, deny } from "@/lib/guard";
import { listTeachers, addTeacher, checkTeacher } from "@/lib/teachers";

export async function GET() {
  try {
    const s = await getSession();
    return Response.json(await listTeachers({ onlyActive: s.userStatus !== "A" }));
  } catch (e) {
    console.error("TEACHERS LIST:", e);
    return Response.json({ error: "Серверийн алдаа: " + e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const s = await requireRole(["A"]);
    if (!s) return deny();
    const b = await req.json();
    const bad = checkTeacher(b, true);
    if (bad) return Response.json({ error: bad }, { status: 400 });
    const msg = await addTeacher(b, s.userID);
    return msg === "OK" ? Response.json({ ok: true }, { status: 201 })
                        : Response.json({ error: msg }, { status: 400 });
  } catch (e) {
    console.error("TEACHER ADD:", e);
    return Response.json({ error: "Серверийн алдаа: " + e.message }, { status: 500 });
  }
}