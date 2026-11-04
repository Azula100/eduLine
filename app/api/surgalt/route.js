import { requireRole, deny } from "@/lib/guard";
import { listSurgalt, addSurgalt } from "@/lib/surgalt";

export async function GET() {
  const s = await requireRole(["A", "T", "U"]); if (!s) return deny();
  return Response.json(await listSurgalt());
}

export async function POST(req) {
  const s = await requireRole(["A", "T"]); if (!s) return deny();
  const { ner, delgerengui } = await req.json();
  if (!ner?.trim()) return Response.json({ error: "Нэр хоосон" }, { status: 400 });
  await addSurgalt(ner, delgerengui);
  return Response.json({ ok: true }, { status: 201 });
}