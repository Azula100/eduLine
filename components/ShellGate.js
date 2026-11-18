"use client";
import { usePathname } from "next/navigation";
import AppShell from "./AppShell";

const BARE = ["/login", "/register"];     // цэсгүй хуудсууд

export default function ShellGate({ children }) {
  const pathname = usePathname();
  if (BARE.includes(pathname)) return children;
  return <AppShell>{children}</AppShell>;
}