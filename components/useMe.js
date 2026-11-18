"use client";
import { useEffect, useState } from "react";

export default function useMe() {
  const [me, setMe] = useState(null);
  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then(setMe).catch(() => setMe({ loggedIn: false }));
  }, []);
  return me;
}