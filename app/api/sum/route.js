import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM sumduureg");
    // sumID-аас бусад эхний текст баганыг нэр болгон авна
    const list = rows.map((r) => {
      const nameKey = Object.keys(r).find(
        (k) => k !== "sumID" && typeof r[k] === "string"
      );
      return { sumID: r.sumID, name: nameKey ? r[nameKey] : `Сум #${r.sumID}` };
    });
    return Response.json(list);
  } catch (e) {
    console.error("SUM LIST:", e);
    return Response.json({ error: "Серверийн алдаа: " + e.message }, { status: 500 });
  }
}