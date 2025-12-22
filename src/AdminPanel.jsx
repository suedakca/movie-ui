import { useEffect, useMemo, useState } from "react";
import "./admin.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5211";

export default function AdminPanel({ token, onLogout }) {
    const [view, setView] = useState("movies"); // "movies" | "directors" | "genres"
    const [tab, setTab] = useState("movies");
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
    
    const [directors, setDirectors] = useState([]);
    const [dForm, setDForm] = useState({ id: "", firstName: "", lastName: "", isRetired: false });
    const [genres, setGenres] = useState([]);
    const [gForm, setGForm] = useState({ id: "", name: "" });
    const cleanToken = useMemo(
        () => String(token || "").replace(/^Bearer\s+/i, "").trim(),
        [token]
    );

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

    async function loadDirectors() {
        setLoading(true);
        setErr("");
        try {
            const data = await apiFetch("/api/Directors");
            setDirectors(Array.isArray(data) ? data : []);
        } catch (e) {
            setErr(e?.message || "Failed to load directors");
        } finally {
            setLoading(false);
        }
    }

    async function loadGenres() {
        setLoading(true);
        setErr("");
        try {
            const data = await apiFetch("/api/Genres");
            setGenres(Array.isArray(data) ? data : []);
        } catch (e) {
            setErr(e?.message || "Failed to load genres");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (view === "movies") loadMovies();
        if (view === "directors") loadDirectors();
        if (view === "genres") loadGenres();
    }, [cleanToken, view]);

    function pick(m) {
        setForm({
            id: m?.id ?? "",
            name: m?.name ?? m?.title ?? "",
            releaseDate: toDateInput(m?.releaseDate ?? ""),
            totalRevenue: String(m?.totaRevenue ?? ""),
            director: String(m?.director ?? ""),
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
        if (!form.id) {
            setErr("Select a movie to update.");
            return;
        }
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
        setForm({ id: "", name: "", releaseDate: "", totalRevenue: "", director: "" });
    }

    function pickGenre(g) {
        setGForm({
            id: g?.id ?? "",
            name: g?.name ?? "",
        });
    }

    async function addGenre() {
        try {
            setErr("");
            await apiFetch("/api/Genres", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: gForm.name.trim(),
                }),
            });
            await loadGenres();
            setGForm({ id: "", name: "" });
        } catch (e) {
            setErr(e?.message || "Genre add failed");
        }
    }

    async function updateGenre() {
        if (!gForm.id) {
            setErr("Select a genre to update.");
            return;
        }
        try {
            setErr("");
            await apiFetch("/api/Genres", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: Number(gForm.id),
                    name: gForm.name.trim(),
                }),
            });
            await loadGenres();
            setGForm({ id: "", name: "" });
        } catch (e) {
            setErr(e?.message || "Genre update failed");
        }
    }

    async function deleteGenre(id) {
        try {
            setErr("");
            await apiFetch(`/api/Genres/${id}`, { method: "DELETE" });
            await loadGenres();
            if (String(gForm.id) === String(id)) setGForm({ id: "", name: "" });
        } catch (e) {
            setErr(e?.message || "Genre delete failed");
        }
    }

    return (
        <div className="admin-shell">
            <header className="admin-topbar">
                <div className="admin-brand">
                    <div className="admin-mark">M</div>
                    <div>
                        <div className="admin-title">Admin Panel</div>
                        <div className="admin-sub">
                            {view === "movies" ? "Movies" : view === "directors" ? "Directors" : "Genres"}
                        </div>
                    </div>
                </div>

                <div className="admin-actions">
                    <button
                        className={`ghost ${view === "movies" ? "active" : ""}`}
                        onClick={() => setView("movies")}
                    >
                        Movies
                    </button>
                    
                    <button
                        className={`ghost ${view === "directors" ? "active" : ""}`}
                        onClick={() => setView("directors")}
                    >
                        Director
                    </button>

                    <button
                        className={`ghost ${view === "genres" ? "active" : ""}`}
                        onClick={() => setView("genres")}
                    >
                        Genre
                    </button>

                    <button className="ghost" onClick={onLogout}>
                        Logout
                    </button>
                </div>
            </header>

            <main className="admin-main">
                {/* DIRECTORS VIEW */}
                {view === "directors" && (
                    <div className="admin-grid">
                        <section className="admin-card">
                            <h2>{dForm.id ? "Edit Director" : "Add Director"}</h2>
                            {err && <div className="error">{err}</div>}

                            <label className="field">
                                <span>First Name</span>
                                <input
                                    value={dForm.firstName}
                                    onChange={(e) => setDForm((f) => ({ ...f, firstName: e.target.value }))}
                                    placeholder="First name"
                                />
                            </label>

                            <label className="field">
                                <span>Last Name</span>
                                <input
                                    value={dForm.lastName}
                                    onChange={(e) => setDForm((f) => ({ ...f, lastName: e.target.value }))}
                                    placeholder="Last name"
                                />
                            </label>

                            <label className="field field-inline">
                                <span>Retired</span>
                                <input
                                    type="checkbox"
                                    checked={!!dForm.isRetired}
                                    onChange={(e) => setDForm((f) => ({ ...f, isRetired: e.target.checked }))}
                                />
                            </label>

                            <div className="row">
                                <button
                                    className="btn"
                                    disabled={!dForm.firstName.trim() || !dForm.lastName.trim() || !!dForm.id}
                                    onClick={async () => {
                                        setErr("");
                                        try {
                                            await apiFetch("/api/Directors", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    firstName: dForm.firstName.trim(),
                                                    lastName: dForm.lastName.trim(),
                                                    isRetired: !!dForm.isRetired,
                                                }),
                                            });
                                            await loadDirectors();
                                            setDForm({ id: "", firstName: "", lastName: "", isRetired: false });
                                        } catch (e) {
                                            setErr(e?.message || "Director add failed");
                                        }
                                    }}
                                >
                                    Add
                                </button>

                                <button
                                    className="btn"
                                    disabled={!dForm.id}
                                    onClick={async () => {
                                        setErr("");
                                        try {
                                            await apiFetch("/api/Directors", {
                                                method: "PUT",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    id: Number(dForm.id),
                                                    firstName: dForm.firstName.trim(),
                                                    lastName: dForm.lastName.trim(),
                                                    isRetired: !!dForm.isRetired,
                                                }),
                                            });
                                            await loadDirectors();
                                            setDForm({ id: "", firstName: "", lastName: "", isRetired: false });
                                        } catch (e) {
                                            setErr(e?.message || "Director update failed");
                                        }
                                    }}
                                >
                                    Update
                                </button>

                                <button
                                    className="btn-secondary"
                                    onClick={() => setDForm({ id: "", firstName: "", lastName: "", isRetired: false })}
                                >
                                    Clear
                                </button>
                            </div>
                        </section>

                        <section className="admin-card">
                            <h2>Directors</h2>

                            {loading ? (
                                <div className="state">Loading...</div>
                            ) : (
                                <div className="admin-list">
                                    {directors.map((d) => (
                                        <div className="admin-item" key={d.id}>
                                            <div
                                                className="admin-item-main"
                                                onClick={() =>
                                                    setDForm({
                                                        id: d?.id ?? "",
                                                        firstName: d?.firstName ?? "",
                                                        lastName: d?.lastName ?? "",
                                                        isRetired: !!d?.isRetired,
                                                    })
                                                }
                                            >
                                                <div className="name">
                                                    {(d.firstName || "") + " " + (d.lastName || "")}
                                                </div>
                                                <div className="meta">Retired: {String(!!d.isRetired)}</div>
                                            </div>

                                            <button
                                                className="danger"
                                                onClick={async () => {
                                                    setErr("");
                                                    try {
                                                        await apiFetch(`/api/Directors/${d.id}`, { method: "DELETE" });
                                                        await loadDirectors();
                                                        if (String(dForm.id) === String(d.id)) {
                                                            setDForm({ id: "", firstName: "", lastName: "", isRetired: false });
                                                        }
                                                    } catch (e) {
                                                        setErr(e?.message || "Director delete failed");
                                                    }
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {/* GENRES VIEW */}
                {view === "genres" && (
                    <div className="admin-grid">
                        <section className="admin-card">
                            <h2>{gForm.id ? "Edit Genre" : "Add Genre"}</h2>
                            {err && <div className="error">Genre cannot be deleted</div>}

                            <label className="field">
                                <span>Name</span>
                                <input
                                    value={gForm.name}
                                    onChange={(e) => setGForm((f) => ({ ...f, name: e.target.value }))}
                                    placeholder="Genre name"
                                />
                            </label>

                            <div className="row">
                                <button
                                    className="btn"
                                    onClick={addGenre}
                                    disabled={!gForm.name.trim() || !!gForm.id}
                                >
                                    Add
                                </button>

                                <button className="btn" onClick={updateGenre} disabled={!gForm.id}>
                                    Update
                                </button>

                                <button className="btn-secondary" onClick={() => setGForm({ id: "", name: "" })}>
                                    Clear
                                </button>
                            </div>
                        </section>

                        <section className="admin-card">
                            <h2>Genre List</h2>

                            {loading ? (
                                <div className="state">Loading...</div>
                            ) : (
                                <div className="admin-list">
                                    {genres.map((g) => (
                                        <div className="admin-item" key={g.id}>
                                            <div className="admin-item-main" onClick={() => pickGenre(g)}>
                                                <div className="name">{g.name ?? "Unnamed"}</div>
                                            </div>

                                            <button className="danger" onClick={() => deleteGenre(g.id)}>
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {/* MOVIES VIEW */}
                {view === "movies" && (
                    <div className="admin-grid">
                        <section className="admin-card">
                            <h2>{form.id ? "Edit Movie" : "Add Movie"}</h2>

                            {err && <div className="error">{err}</div>}

                            <label className="field">
                                <span>Name</span>
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                />
                            </label>

                            <label className="field">
                                <span>Release Date</span>
                                <input
                                    type="date"
                                    value={form.releaseDate}
                                    onChange={(e) => setForm((f) => ({ ...f, releaseDate: e.target.value }))}
                                />
                            </label>

                            <label className="field">
                                <span>Total Revenue</span>
                                <input
                                    value={form.totalRevenue}
                                    onChange={(e) => setForm((f) => ({ ...f, totaRevenueF: e.target.value }))}
                                />
                            </label>

                            <label className="field">
                                <span>Director Name</span>
                                <input
                                    value={form.director}
                                    onChange={(e) => setForm((f) => ({ ...f, director: e.target.value }))}
                                />
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
                                                <div className="meta">
                                                    Director Name: {m.director ?? "-"}
                                                </div>
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
                )}
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