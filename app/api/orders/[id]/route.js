import { requireRole, deny } from "@/lib/guard";
import { cancelOrder } from "@/lib/orders";

// Сурагч: өөрийн хүлээгдэж буй хүсэлтийг цуцлах
export async function DELETE(_req, { params }) {
  try {
    const s = await requireRole(["U"]);
    if (!s) return deny();
    const { id } = await params;
    await cancelOrder(Number(id), s.userID);
    return Response.json({ ok: true });
  } catch (e) {
    console.error("ORDER CANCEL:", e);
    return Response.json({ error: e.status ? e.message : "Серверийн алдаа: " + e.message },
                         { status: e.status || 500 });
  }
}