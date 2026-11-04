import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
export const getSession = async () =>
  getIronSession(await cookies(), {
    password: process.env.SESSION_SECRET, cookieName: "eduline_session",
  });