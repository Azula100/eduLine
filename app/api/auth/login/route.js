import { login } from "@/lib/auth";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const msg = await login(email, password);
    if (msg !== "OK") return Response.json({ error: msg }, { status: 401 });
    return Response.json({ ok: true, redirect: "/" });
  } catch (e) {
    console.error("LOGIN ERROR:", e);
    return Response.json({ error: "Серверийн алдаа: " + e.message }, { status: 500 });
  }
}