import { requireRole, deny } from "@/lib/guard";
import { editCourse, setCourseStatus, delCourse } from "@/lib/course";

export async function PUT(req, { params }) {          // засах
  try {
    const s = await requireRole(["A", "T"]);
    if (!s) return deny();
    const { id } = await params;
    const b = await req.json();
    if (!b.surgaltID || !b.startDate || !b.schedule?.trim() || !(Number(b.capacity) >= 1))
      return Response.json({ error: "Бүх талбарыг зөв бөглөнө үү" }, { status: 400 });
    const n = await editCourse(id, { ...b, capacity: Number(b.capacity) });
    return n ? Response.json({ ok: true })
             : Response.json({ error: "Анги олдсонгүй" }, { status: 404 });
  } catch (e) {
    console.error("COURSE EDIT:", e);
    return Response.json({ error: "Серверийн алдаа: " + e.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {        // төлөв өөрчлөх
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

export async function DELETE(_req, { params }) {      // устгах
  try {
    const s = await requireRole(["A", "T"]);
    if (!s) return deny();
    const { id } = await params;
    await delCourse(id);
    return Response.json({ ok: true });
  } catch (e) {
    const fk = e.code === "ER_ROW_IS_REFERENCED_2";
    return Response.json(
      { error: fk ? "Энэ ангид хүсэлт холбогдсон тул устгах боломжгүй. Төлвийг CLOSED болгоно уу"
                  : "Серверийн алдаа: " + e.message },
      { status: fk ? 409 : 500 });
  }
}