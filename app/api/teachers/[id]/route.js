import { requireRole, deny } from "@/lib/guard";
import { editTeacher, setTeacherActive, delTeacher, checkTeacher } from "@/lib/teachers";

export async function PUT(req, { params }) {
  try {
    if (!(await requireRole(["A"]))) return deny();
    const { id } = await params;
    const b = await req.json();
    const bad = checkTeacher(b, false);
    if (bad) return Response.json({ error: bad }, { status: 400 });
    const n = await editTeacher(id, b);
    return n ? Response.json({ ok: true }) : Response.json({ error: "Багш олдсонгүй" }, { status: 404 });
  } catch (e) {
    return Response.json({ error: "Серверийн алдаа: " + e.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    if (!(await requireRole(["A"]))) return deny();
    const { id } = await params;
    const { status } = await req.json();
    await setTeacherActive(id, status);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: "Серверийн алдаа: " + e.message }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    if (!(await requireRole(["A"]))) return deny();
    const { id } = await params;
    await delTeacher(id);
    return Response.json({ ok: true });
  } catch (e) {
    const fk = e.code === "ER_ROW_IS_REFERENCED_2";
    return Response.json(
      { error: fk ? "Энэ багшид бүртгэл холбогдсон тул устгах боломжгүй. Идэвхгүй болгоно уу"
                  : "Серверийн алдаа: " + e.message },
      { status: fk ? 409 : 500 });
  }
}