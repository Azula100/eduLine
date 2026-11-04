import { requireRole, deny } from "@/lib/guard";
import { db } from "@/lib/db";
import { editProfile, changePass } from "@/lib/auth";

const ALL = ["A", "T", "U"];

export async function GET() {                      // миний мэдээлэл
  const s = await requireRole(ALL); if (!s) return deny();
  const [rows] = await db.query(
    "SELECT userID, email, ner, utas, userStatus FROM users WHERE userID=?", [s.userID]);
  return Response.json(rows[0]);
}

export async function PUT(req) {                   // профайл / нууц үг солих
  const s = await requireRole(ALL); if (!s) return deny();
  const b = await req.json();

  if (b.oldPass) {                                 // нууц үг солих
    if (!b.newPass || b.newPass.length < 6)
      return Response.json({ error: "Шинэ нууц үг 6+ тэмдэгт" }, { status: 400 });
    const ok = await changePass(b.oldPass, b.newPass);
    return ok ? Response.json({ ok: true })
              : Response.json({ error: "Хуучин нууц үг буруу" }, { status: 400 });
  }
  await editProfile(b.ner, b.utas);                // зөвхөн өөрийнхөө мөр (session-ийн userID)
  return Response.json({ ok: true });
}