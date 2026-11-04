import { exit } from "@/lib/auth";
export async function POST() {
  await exit();
  return Response.json({ ok: true });
}