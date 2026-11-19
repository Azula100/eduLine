import { requireRole, deny } from "@/lib/guard";
import { listMyOrders, createOrder } from "@/lib/orders";

const fail = (e) =>
  Response.json({ error: e.status ? e.message : "Серверийн алдаа: " + e.message },
                { status: e.status || 500 });

// Сурагч: өөрийн хүсэлтүүд
export async function GET() {
  try {
    const s = await requireRole(["U"]);
    if (!s) return deny();
    return Response.json(await listMyOrders(s.userID));
  } catch (e) { console.error("ORDERS LIST:", e); return fail(e); }
}

// Сурагч: ангид хүсэлт илгээх  { courseID }
export async function POST(req) {
  try {
    const s = await requireRole(["U"]);
    if (!s) return deny();
    const { courseID } = await req.json();
    if (!Number.isInteger(Number(courseID)))
      return Response.json({ error: "Анги буруу байна" }, { status: 400 });
    await createOrder(s.userID, Number(courseID));
    return Response.json({ ok: true }, { status: 201 });
  } catch (e) { console.error("ORDER ADD:", e); return fail(e); }
}