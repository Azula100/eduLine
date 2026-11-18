export async function api(url, method = "GET", body) {
  try {
    const r = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const t = await r.text();
    let data = {};
    try { data = t ? JSON.parse(t) : {}; } catch {}
    return { ok: r.ok, status: r.status, data };
  } catch (e) {
    return { ok: false, status: 0, data: { error: "Холболтын алдаа: " + e.message } };
  }
}