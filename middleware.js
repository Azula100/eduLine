import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";

export async function middleware(req) {
  const res = NextResponse.next();
  const s = await getIronSession(req, res, {
    password: process.env.SESSION_SECRET, cookieName: "eduline_session",
  });
  const path = req.nextUrl.pathname;

  if (!s.userID) return NextResponse.redirect(new URL("/login", req.url));
  if (path.startsWith("/admin") && !["A", "T"].includes(s.userStatus))
    return NextResponse.redirect(new URL("/student", req.url));
  return res;
}
export const config = { matcher: ["/admin/:path*", "/student/:path*"] };