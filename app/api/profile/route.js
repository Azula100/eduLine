import { requireRole, deny } from "@/lib/guard";
import { db } from "@/lib/db";
import { editProfile, changePass } from "@/lib/auth";

const ALL = ["A", "T", "U"];

export async function GET() {
  try {
    const s = await requireRole(ALL);
    if (!s) return deny();
    const [rows] = await db.query(
      "SELECT userID, LName, FName, RD, userMail, utas, sumID, userStatus FROM users WHERE userID=?",
      [s.userID]);
    return Response.json(rows[0] || {});
  } catch (e) {
    console.error("PROFILE GET:", e);
    return Response.json({ error: "Серверийн алдаа: " + e.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const s = await requireRole(ALL);
    if (!s) return deny();
    const b = await req.json();

    if (b.oldPass !== undefined) {                      // нууц үг солих
      if (!b.newPass || b.newPass.length < 6)
        return Response.json({ error: "Шинэ нууц үг хамгийн багадаа 6 тэмдэгт" }, { status: 400 });
      const ok = await changePass(b.oldPass, b.newPass);
      return ok ? Response.json({ ok: true })
                : Response.json({ error: "Хуучин нууц үг буруу байна" }, { status: 400 });
    }

    if (!b.lname?.trim() || !b.fname?.trim())           // профайл солих
      return Response.json({ error: "Овог, нэрээ оруулна уу" }, { status: 400 });
    if (b.utas && !/^\d{8}$/.test(b.utas))
      return Response.json({ error: "Утас 8 оронтой тоо байх ёстой" }, { status: 400 });
    if (!b.sumID)
      return Response.json({ error: "Сумаа сонгоно уу" }, { status: 400 });

    await editProfile(b.lname, b.fname, b.utas, b.sumID);
    return Response.json({ ok: true });
  } catch (e) {
    console.error("PROFILE PUT:", e);
    return Response.json({ error: "Серверийн алдаа: " + e.message }, { status: 500 });
  }
}