import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM aimag");
    // Эхний багана = ID, хоёр дахь багана = нэр (баганын нэр ямар ч байсан ажиллана)
    const list = rows
      .map((r) => {
        const v = Object.values(r);
        return { aimagID: v[0], name: v[1] };
      })
      .sort((a, b) => a.aimagID - b.aimagID);
    return Response.json(list);
  } catch (e) {
    console.error("AIMAG LIST:", e);
    return Response.json({ error: "Серверийн алдаа: " + e.message }, { status: 500 });
  }
}