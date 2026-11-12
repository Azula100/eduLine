import { register } from "@/lib/auth";

export async function POST(req) {
  try {
    const msg = await register(await req.json());
    return msg === "OK"
      ? Response.json({ ok: true }, { status: 201 })
      : Response.json({ error: msg }, { status: 400 });
  } catch (e) {
    console.error("REGISTER ERROR:", e);
    return Response.json({ error: "Серверийн алдаа: " + e.message }, { status: 500 });
  }
}