const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5211";

function cleanToken(token) {
    const raw = token || localStorage.getItem("token") || "";
    return String(raw).replace(/^Bearer\s+/i, "").trim();
}

async function apiFetch(token, path, init = {}) {
    const t = cleanToken(token);
    const res = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers: {
            Accept: "application/json",
            ...(init.headers || {}),
            ...(t ? { Authorization: `Bearer ${t}` } : {}),
        },
    });

    const text = await res.text();
    if (!res.ok) throw new Error(text || `Failed (${res.status})`);
    return text ? JSON.parse(text) : null;
}

// AUTH
export async function login(userName, password) {
    const res = await fetch(`${BASE_URL}/api/Token`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ userName, password }),
    });

    const text = await res.text();
    if (!res.ok) throw new Error(text || `Login failed (${res.status})`);
    return text ? JSON.parse(text) : {};
}

// DIRECTORS
export const getDirectors = (token) => apiFetch(token, "/api/Directors");

export const getDirectorById = (token, id) =>
    apiFetch(token, `/api/Directors/${id}`);

export const createDirector = (token, dto) =>
    apiFetch(token, "/api/Directors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });

export const updateDirector = (token, dto) =>
    apiFetch(token, "/api/Directors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });

export const deleteDirector = (token, id) =>
    apiFetch(token, `/api/Directors/${id}`, { method: "DELETE" });

// GENRES
export const getGenres = (token) => apiFetch(token, "/api/Genres");

export const createGenre = (token, dto) =>
    apiFetch(token, "/api/Genres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });

export const updateGenre = (token, dto) =>
    apiFetch(token, "/api/Genres", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });

export const deleteGenre = (token, id) =>
    apiFetch(token, `/api/Genres/${id}`, { method: "DELETE" });