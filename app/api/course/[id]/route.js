import { requireRole, deny } from "@/lib/guard";
import { editCourse, setCourseStatus, delCourse, checkCourse, cleanCourse } from "@/lib/course";

export async function PUT(req, { params }) {
  try {
    const s = await requireRole(["A", "T"]);
    if (!s) return deny();
    const { id } = await params;
    const b = await req.json();
    const bad = checkCourse(b);
    if (bad) return Response.json({ error: bad }, { status: 400 });
    const n = await editCourse(id, cleanCourse(b));
    return n ? Response.json({ ok: true })
             : Response.json({ error: "Анги олдсонгүй" }, { status: 404 });
  } catch (e) {
    console.error("COURSE EDIT:", e);
    return Response.json({ error: "Серверийн алдаа: " + e.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {          // төлөв өөрчлөх
  try {
    const s = await requireRole(["A", "T"]);
    if (!s) return deny();
    const { id } = await params;
    const { status } = await req.json();
    const n = await setCourseStatus(id, status);
    return n ? Response.json({ ok: true })
             : Response.json({ error: "Анги олдсонгүй" }, { status: 404 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const s = await requireRole(["A", "T"]);
    if (!s) return deny();
    const { id } = await params;
    await delCourse(id);
    return Response.json({ ok: true });
  } catch (e) {
    const fk = e.code === "ER_ROW_IS_REFERENCED_2";
    return Response.json(
      { error: fk ? "Энэ ангид хүсэлт холбогдсон тул устгах боломжгүй. Төлвийг идэвхгүй болгоно уу"
                  : "Серверийн алдаа: " + e.message },
      { status: fk ? 409 : 500 });
  }
}