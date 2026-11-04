import { requireRole, deny } from "@/lib/guard";
import { editSurgalt, delSurgalt } from "@/lib/surgalt";

export async function PUT(req, { params }) {
  const s = await requireRole(["A", "T"]); if (!s) return deny();
  const { id } = await params;
  const { ner, delgerengui } = await req.json();
  const n = await editSurgalt(id, ner, delgerengui);
  return n ? Response.json({ ok: true })
           : Response.json({ error: "Олдсонгүй" }, { status: 404 });
}

export async function DELETE(_req, { params }) {
  const s = await requireRole(["A", "T"]); if (!s) return deny();
  const { id } = await params;
  try { await delSurgalt(id); return Response.json({ ok: true }); }
  catch { return Response.json(
    { error: "Энэ сургалтад анги холбогдсон тул устгах боломжгүй" }, { status: 409 }); }
}