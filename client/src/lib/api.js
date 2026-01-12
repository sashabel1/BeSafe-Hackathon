const API_BASE = (import.meta.env.VITE_SERVER_API_URL || "").replace(/\/$/, "");

function getTokenFromStorage() {
  return localStorage.getItem("auth_token");
}

async function parseJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export async function apiPost(path, body) {
  const token = getTokenFromStorage();

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export async function apiGet(path) {
  const token = getTokenFromStorage();

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}
