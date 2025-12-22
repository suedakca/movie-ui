import { useEffect, useMemo, useState } from "react";
import "./admin.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5211";

export default function AdminPanel({ token, onLogout }) {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const [form, setForm] = useState({
        id: "",
        name: "",
        releaseDate: "",
        totalRevenue: "",
        directorId: "",
    });

    const cleanToken = useMemo(() => String(token || "").replace(/^Bearer\s+/i, "").trim(), [token]);

    async function apiFetch(path, init = {}) {
        const res = await fetch(`${BASE_URL}${path}`, {
            ...init,
            headers: {
                Accept: "application/json",
                ...(init.headers || {}),
                Authorization: `Bearer ${cleanToken}`,
            },
        });
        const text = await res.text();
        if (!res.ok) throw new Error(text || `Failed (${res.status})`);
        return text ? JSON.parse(text) : null;
    }

    async function loadMovies() {
        setLoading(true);
        setErr("");
        try {
            const data = await apiFetch("/api/Movies");
            setMovies(Array.isArray(data) ? data : []);
        } catch (e) {
            setErr(e?.message || "Failed to load movies");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadMovies(); }, [cleanToken]);

    function pick(m) {
        setForm({
            id: m?.id ?? "",
            name: m?.name ?? m?.title ?? "",
            releaseDate: toDateInput(m?.releaseDate ?? m?.release_date ?? m?.date),
            totalRevenue: String(m?.totalRevenue ?? m?.revenue ?? ""),
            directorId: String(m?.directorId ?? ""),
        });
    }

    async function addMovie() {
        try {
            await apiFetch("/api/Movies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    releaseDate: form.releaseDate || null,
                    totalRevenue: Number(form.totalRevenue || 0),
                    directorId: Number(form.directorId || 0),
                }),
            });
            await loadMovies();
            resetForm();
        } catch (e) {
            setErr(e?.message || "Add failed");
        }
    }

    async function updateMovie() {
        if (!form.id) { setErr("Select a movie to update."); return; }
        try {
            await apiFetch("/api/Movies", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: Number(form.id),
                    name: form.name,
                    releaseDate: form.releaseDate || null,
                    totalRevenue: Number(form.totalRevenue || 0),
                    directorId: Number(form.directorId || 0),
                }),
            });
            await loadMovies();
            resetForm();
        } catch (e) {
            setErr(e?.message || "Update failed");
        }
    }

    async function deleteMovie(id) {
        try {
            await apiFetch(`/api/Movies/${id}`, { method: "DELETE" });
            await loadMovies();
            if (String(form.id) === String(id)) resetForm();
        } catch (e) {
            setErr(e?.message || "Delete failed");
        }
    }

    function resetForm() {
        setForm({ id: "", name: "", releaseDate: "", totalRevenue: "", directorId: "" });
    }

    return (
        <div className="admin-shell">
            <header className="admin-topbar">
                <div className="admin-brand">
                    <div className="admin-mark">M</div>
                    <div>
                        <div className="admin-title">Admin Panel</div>
                        <div className="admin-sub">Movies CRUD</div>
                    </div>
                </div>

                <div className="admin-actions">
                    <button className="ghost" onClick={onLogout}>Logout</button>
                </div>
            </header>

            <main className="admin-main">
                <div className="admin-grid">
                    <section className="admin-card">
                        <h2>{form.id ? "Edit Movie" : "Add Movie"}</h2>

                        {err && <div className="error">{err}</div>}

                        <label className="field">
                            <span>Name</span>
                            <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
                        </label>

                        <label className="field">
                            <span>Release Date</span>
                            <input type="date" value={form.releaseDate} onChange={(e) => setForm(f => ({ ...f, releaseDate: e.target.value }))} />
                        </label>

                        <label className="field">
                            <span>Total Revenue</span>
                            <input value={form.totalRevenue} onChange={(e) => setForm(f => ({ ...f, totalRevenue: e.target.value }))} />
                        </label>

                        <label className="field">
                            <span>Director ID</span>
                            <input value={form.directorId} onChange={(e) => setForm(f => ({ ...f, directorId: e.target.value }))} />
                        </label>

                        <div className="row">
                            <button className="btn" onClick={addMovie} disabled={!form.name || !!form.id}>
                                Add
                            </button>
                            <button className="btn" onClick={updateMovie} disabled={!form.id}>
                                Update
                            </button>
                            <button className="btn-secondary" onClick={resetForm}>
                                Clear
                            </button>
                        </div>
                    </section>

                    <section className="admin-card">
                        <h2>Movies</h2>

                        {loading ? (
                            <div className="state">Loading...</div>
                        ) : (
                            <div className="admin-list">
                                {movies.map((m) => (
                                    <div className="admin-item" key={m.id}>
                                        <div className="admin-item-main" onClick={() => pick(m)}>
                                            <div className="name">{m.name ?? m.title ?? "Untitled"}</div>
                                            <div className="meta">ID: {m.id} • DirectorId: {m.directorId ?? "-"}</div>
                                        </div>
                                        <button className="danger" onClick={() => deleteMovie(m.id)}>
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}

function toDateInput(v) {
    if (!v) return "";
    const d = new Date(v);
    if (isNaN(d)) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}