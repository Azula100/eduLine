import { getSession } from "./session";

// Нэвтэрсэн ба эрх таарвал session буцаана, үгүй бол null
export async function requireRole(roles) {
  const s = await getSession();
  if (!s.userID || !roles.includes(s.userStatus)) return null;
  return s;
}

export const deny = () =>
  Response.json({ error: "Эрх хүрэхгүй байна" }, { status: 403 });