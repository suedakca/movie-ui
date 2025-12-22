const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5211";

export async function login(userName, password) {
    const res = await fetch(`${BASE_URL}/api/Token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ userName, password }),
    });

    const text = await res.text();
    if (!res.ok) throw new Error(text || `Login failed (${res.status})`);
    try {
        return JSON.parse(text);
    } catch {
        return {};
    }
}