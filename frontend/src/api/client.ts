const API = "/api";

function cookie(name: string) {
  return document.cookie.split("; ").find(value => value.startsWith(`${name}=`))?.split("=").slice(1).join("=");
}

export async function api<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (options.method && !["GET", "HEAD"].includes(options.method)) {
    const csrf = cookie("sirdas_csrf");
    if (csrf) headers.set("x-csrf-token", decodeURIComponent(csrf));
  }
  const response = await fetch(`${API}${path}`, { ...options, headers, credentials: "include" });
  if (response.status === 401 && retry && !path.includes("/auth/refresh")) {
    const refreshed = await fetch(`${API}/auth/refresh`, { method: "POST", credentials: "include" });
    if (refreshed.ok) return api<T>(path, options, false);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "İşlem tamamlanamadı." }));
    throw new Error(body.error ?? "İşlem tamamlanamadı.");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function download(path: string, filename: string, retry = true): Promise<void> {
  const response = await fetch(`${API}${path}`, { credentials: "include", headers: { "x-csrf-token": decodeURIComponent(cookie("sirdas_csrf") ?? "") } });
  if (response.status === 401 && retry) {
    const refreshed = await fetch(`${API}/auth/refresh`, { method: "POST", credentials: "include" });
    if (refreshed.ok) return download(path, filename, false);
  }
  if (!response.ok) throw new Error("Dosya hazırlanamadı.");
  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
