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

/**
 * Wrapper fetch ke backend — otomatis nyisipin header Authorization: Bearer
 * kalau ada token tersimpan, dan otomatis json-encode/decode body.
 * Melempar ApiError kalau response.success === false atau HTTP gagal.
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
  } catch (err) {
    throw new ApiError('Tidak bisa terhubung ke server. Periksa koneksi/backend menyala atau tidak.', 0, null);
  }

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

/**
 * Cek cepat apakah backend bisa dijangkau — dipakai ConnectionContext untuk
 * fitur "No Connection/Lost Signal" (task #18). Sengaja tidak lewat
 * apiFetch supaya tidak ikut nyisipin header Authorization dan tidak
 * melempar ApiError, cukup balikin true/false.
 */
export async function checkHealth(timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, { signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
