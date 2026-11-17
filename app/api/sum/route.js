import { db } from "@/lib/db";

export async function GET(req) {
  try {
    const aimagID = new URL(req.url).searchParams.get("aimagID");

    if (aimagID) {
      const [rows] = await db.query(
        "SELECT sumID, sumNer FROM sumduureg WHERE aimagID=? ORDER BY sumNer", [aimagID]);
      return Response.json(rows.map((r) => ({ sumID: r.sumID, name: r.sumNer })));
    }
    // Бүгд (аймгийн нэрээр угтсан)
    const [aimags] = await db.query("SELECT * FROM aimag");
    const nameOf = {};
    aimags.forEach((a) => { const v = Object.values(a); nameOf[v[0]] = v[1]; });
    const [rows] = await db.query("SELECT sumID, sumNer, aimagID FROM sumduureg ORDER BY aimagID, sumNer");
    return Response.json(rows.map((r) => ({
      sumID: r.sumID,
      aimagID: r.aimagID,
      name: `${nameOf[r.aimagID] || ""} - ${r.sumNer}`,
    })));
  } catch (e) {
    console.error("SUM LIST:", e);
    return Response.json({ error: "Серверийн алдаа: " + e.message }, { status: 500 });
  }
}