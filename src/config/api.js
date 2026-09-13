// Konfigurasi koneksi ke backend PHP EduPKL.
// Default cocok untuk XAMPP standar (htdocs/EDUPKL/backend). Override via
// file .env (VITE_API_BASE_URL=...) kalau lokasi/domain backend beda.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/EDUPKL/backend';

const TOKEN_KEY = 'edupkl_token_v1';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // localStorage tidak tersedia, abaikan.
  }
}

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

// Pub-sub sederhana ke ConnectionContext (src/context/ConnectionContext.jsx) —
// dipisah dari React supaya apiFetch (plain function, dipanggil dari mana saja
// termasuk luar komponen) bisa memberi tahu status koneksi tanpa perlu hook.
let connectionHandlers = { onOffline: () => {}, onOnline: () => {} };
export function setConnectionHandlers(handlers) {
  connectionHandlers = handlers;
}

/**
 * Wrapper fetch ke backend — otomatis nyisipin header Authorization: Bearer
 * kalau ada token tersimpan, dan otomatis json-encode/decode body.
 * Melempar ApiError kalau response.success === false atau HTTP gagal.
 * Kegagalan JARINGAN (server tak terjangkau) beda dari respons error biasa —
 * memicu ConnectionContext supaya UI bisa nampilin state "Lost Signal".
 */
export async function apiFetch(path, { method = 'GET', body, skipAuth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token && !skipAuth) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    connectionHandlers.onOffline();
    throw new ApiError('Tidak bisa terhubung ke server. Periksa koneksi/backend menyala atau tidak.', 0, null);
  }

  // Response (apapun status HTTP-nya) berarti server terjangkau — bukan
  // masalah koneksi, jadi bersihkan status offline kalau sebelumnya aktif.
  connectionHandlers.onOnline();

  let json = null;
  try {
    json = await res.json();
  } catch {
    // Response bukan JSON (mis. 204 No Content) — biarkan json = null.
  }

  if (!res.ok || (json && json.success === false)) {
    const message = json?.message || `Permintaan gagal (HTTP ${res.status}).`;
    throw new ApiError(message, res.status, json?.errors);
  }

  return json?.data ?? null;
}

/** Test konektivitas ke backend tanpa perlu login — dipakai tombol "Coba Lagi". */
export async function pingBackend() {
  try {
    await apiFetch('/api/auth/me');
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 0) return true; // server menjawab (walau 401/dst) = online
    return false;
  }
  return true;
}
