import { register } from "@/lib/auth";

export async function POST(req) {
  const msg = await register(await req.json());
  return Response.json(msg === "OK" ? { ok: true } : { error: msg },
                       { status: msg === "OK" ? 201 : 400 });
}