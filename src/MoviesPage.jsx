import { useEffect, useMemo, useState } from "react";
import "./movies.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5211";

export default function MoviesPage({ token, onLogout }) {
    const [movies, setMovies] = useState([]);
    const [selected, setSelected] = useState(null); // details ekranı için
    const [q, setQ] = useState("");
    const [sort, setSort] = useState("name-asc");
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [rating, setRating] = useState(0);
    const [ratingLoading, setRatingLoading] = useState(false);
    const [ratingMsg, setRatingMsg] = useState("");
    // token normalize (token bazen "Bearer eyJ..." gelebiliyor)
    const cleanToken = useMemo(() => {
        const raw = token || localStorage.getItem("token") || "";
        return raw.replace(/^Bearer\s+/i, "").trim();
    }, [token]);

    async function apiFetch(path, init = {}) {
        if (!cleanToken) throw new Error("Token yok. Lütfen tekrar login ol.");

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
    async function submitRating() {
        if (!selected?.id) return;

        setRatingMsg("");
        setRatingLoading(true);
        try {
            await apiFetch("/api/Users/rate-movie", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    movieId: Number(selected.id),
                    rating: Number(rating),
                }),
            });
            setRatingMsg("Rating saved.");
        } catch (e) {
            setRatingMsg(e?.message || "Rating failed.");
        } finally {
            setRatingLoading(false);
        }
    }

    useEffect(() => {
        let cancelled = false;

        async function loadList() {
            setLoading(true);
            setErr("");
            try {
                const data = await apiFetch("/api/Movies");
                console.log(data);
                const list = Array.isArray(data) ? data : data?.items || data?.data || [];
                if (!cancelled) setMovies(Array.isArray(list) ? list : []);
            } catch (e) {
                if (!cancelled) setErr(e?.message || "Failed to load movies");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadList();
        return () => {
            cancelled = true;
        };
    }, [cleanToken]);

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        let arr = (movies || []).filter(Boolean); // null item varsa temizle

        if (term) {
            arr = arr.filter((m) =>
                String(m?.name ?? m?.title ?? "").toLowerCase().includes(term)
            );
        }

        const getDate = (m) => {
            const v = m?.releaseDate ?? m?.release_date ?? m?.date ?? null;
            const d = v ? new Date(v) : null;
            return d && !isNaN(d) ? d.getTime() : 0;
        };

        arr.sort((a, b) => {
            const an = String(a?.name ?? a?.title ?? "").toLowerCase();
            const bn = String(b?.name ?? b?.title ?? "").toLowerCase();
            if (sort === "name-asc") return an.localeCompare(bn);
            if (sort === "name-desc") return bn.localeCompare(an);
            if (sort === "date-desc") return getDate(b) - getDate(a);
            if (sort === "date-asc") return getDate(a) - getDate(b);
            return 0;
        });

        return arr;
    }, [movies, q, sort]);

    // =========================
    // DETAILS VIEW
    // =========================
    if (selected && typeof selected === "object") {
        return (
            <div className="movies-shell">
                <header className="movies-topbar">
                    <div className="movies-brand">
                        <div className="movies-mark">M</div>
                        <div>
                            <div className="movies-title">MovieSystem</div>
                            <div className="movies-sub">Movie Details</div>
                        </div>
                    </div>

                    <div className="movies-actions">
                        <button className="ghost" onClick={() => setSelected(null)}>
                            Back
                        </button>
                        <button className="ghost" onClick={onLogout}>
                            Logout
                        </button>
                    </div>
                </header>

                <main className="movies-main">
                    <div className="panel panel-detail">
                        <div className="detail-hero">
                            <div className="detail-hero-left">
                                <div className="detail-title">
                                    {selected.name ?? selected.title ?? "Untitled"}
                                </div>
                                <div className="detail-subtitle">
                                    {prettyDate(selected.releaseDate ?? selected.release_date ?? selected.date)}
                                </div>
                            </div>

                            <div className="detail-badges">
                                <span className="badge soft"> Genre: {selected?.genres?.length ? selected.genres.join(", ") : "-"}</span>
                                <span className="badge soft">ID: {selected.id ?? "-"}</span>
                                <span className="badge soft">
                  Director: {selected.director ?? "-"}
                </span>
                            </div>
                        </div>

                        <div className="detail-grid">
                            <div className="stat">
                                <div className="stat-k">Total Revenue</div>
                                <div className="stat-v">
                                    {formatMoney(selected.totalRevenue ?? selected.totaRevenue ?? selected.revenue)}
                                </div>
                            </div>

                            <div className="stat">
                                <div className="stat-k">Release</div>
                                <div className="stat-v">
                                    {prettyDate(selected.releaseDate ?? selected.release_date ?? selected.date)}
                                </div>
                            </div>

                            <div className="stat">
                                <div className="stat-k">Director</div>
                                <div className="stat-v">{selected.director ?? "—"}</div>
                            </div>

                            <div className="stat">
                                <div className="stat-k">Status</div>
                                <div className="stat-v">
                                    <span className="pill-ok">Active</span>
                                </div>
                            </div>
                        </div>
                        <div className="detail-section">
                            <div className="section-title">Rate this movie</div>

                            <div className="rate-box">
                                <div className="stars">
                                    {[1,2,3,4,5].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            className={`star ${rating >= s ? "on" : ""}`}
                                            onClick={() => setRating(s)}
                                            aria-label={`Rate ${s} stars`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>

                                <div className="rate-actions">
                                    <button
                                        className="btn-mini"
                                        disabled={ratingLoading || rating === 0}
                                        onClick={submitRating}
                                    >
                                        {ratingLoading ? "Saving..." : "Submit"}
                                    </button>

                                    {ratingMsg && <div className="rate-msg">{ratingMsg}</div>}
                                </div>
                            </div>
                        </div>
                        {(selected.description || selected.genre) && (
                            <div className="detail-section">
                                <div className="section-title">More</div>

                                <div className="kv">
                                    {selected.genre && (
                                        <div className="kv-row">
                                            <div className="kv-k">Genre</div>
                                            <div className="kv-v">{selected.genre}</div>
                                        </div>
                                    )}

                                    {selected.description && (
                                        <div className="kv-row kv-row-block">
                                            <div className="kv-k">Description</div>
                                            <div className="kv-v">{selected.description}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        );
    }

    // =========================
    // LIST VIEW
    // =========================
    return (
        <div className="movies-shell">
            <header className="movies-topbar">
                <div className="movies-brand">
                    <div className="movies-mark">M</div>
                    <div>
                        <div className="movies-title">MovieSystem</div>
                        <div className="movies-sub">Movies</div>
                    </div>
                </div>

                <div className="movies-actions">
                    <button className="ghost" onClick={onLogout}>
                        Logout
                    </button>
                </div>
            </header>

            <main className="movies-main">
                <div className="panel">
                    <div className="panel-head">
                        <div>
                            <h1>Movie List</h1>
                        </div>

                        <div className="toolbar">
                            <input
                                className="search"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search movie..."
                            />
                            <select
                                className="select"
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                            >
                                <option value="name-asc">Name (A-Z)</option>
                                <option value="name-desc">Name (Z-A)</option>
                                <option value="date-desc">Date (newest)</option>
                                <option value="date-asc">Date (oldest)</option>
                            </select>
                        </div>
                    </div>

                    {loading && <div className="state">Loading...</div>}
                    {err && <div className="error">{err}</div>}

                    {!loading && !err && (
                        <div className="grid">
                            {filtered.length === 0 ? (
                                <div className="state">No movies found.</div>
                            ) : (
                                filtered.map((m, idx) => (
                                    <div className="card" key={m?.id ?? idx}>
                                        <div className="card-row">
                                            <div className="name">{m?.name ?? m?.title ?? "Untitled"}</div>
                                            <div className="pill">
                                                {formatRelease(m?.releaseDate ?? m?.release_date ?? m?.date)}
                                            </div>
                                        </div>

                                        <div className="meta">
                                             <span className="meta-item">
                                                <span className="meta-k">Director:</span>{" "}
                                                  <span className="meta-v">
                                                    {m?.director ?? "-"}
                                                  </span>
                                                </span>
                                            <span className="meta-item">
                        <span className="meta-k">TotalRevenue:</span>{" "}
                                                <span className="meta-v">
                          {formatMoney(m?.totalRevenue ?? m?.totaRevenue ?? m?.revenue)}
                        </span>
                      </span>
                                        </div>

                                        <div className="card-actions">
                                            <button className="btn-mini" onClick={() => m && setSelected(m)}>
                                                Details
                                            </button>
                                            {/* Delete yok */}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function prettyDate(v) {
    if (!v) return "—";
    const d = new Date(v);
    if (isNaN(d)) return String(v);
    return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function formatRelease(v) {
    if (!v) return "Release: —";
    const d = new Date(v);
    if (isNaN(d)) return `Release: ${String(v)}`;
    return `Release: ${d.toLocaleDateString()}`;
}

function formatMoney(v) {
    if (v === null || v === undefined || v === "") return "—";
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}