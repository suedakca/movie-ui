import { useEffect, useMemo, useState } from "react";
import "./movies.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5211";

export default function MoviesPage({ token, onLogout }) {
    const [movies, setMovies] = useState([]);
    const [q, setQ] = useState("");
    const [sort, setSort] = useState("name-asc"); // name-asc | name-desc | date-desc | date-asc
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setErr("");
            try {
                const res = await fetch(`${BASE_URL}/Movies`, {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                const text = await res.text();
                if (!res.ok) throw new Error(text || `Failed (${res.status})`);

                const data = JSON.parse(text);
                // backend bazen { items: [...] } döndürür
                const list = Array.isArray(data) ? data : (data.items || data.data || []);
                if (!cancelled) setMovies(list);
            } catch (e) {
                if (!cancelled) setErr(e.message || "Failed to load movies");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [token]);

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        let arr = [...movies];

        if (term) {
            arr = arr.filter((m) =>
                String(m.name ?? m.title ?? "")
                    .toLowerCase()
                    .includes(term)
            );
        }

        const getDate = (m) => {
            const v = m.releaseDate ?? m.release_date ?? m.date ?? null;
            const d = v ? new Date(v) : null;
            return d && !isNaN(d) ? d.getTime() : 0;
        };

        arr.sort((a, b) => {
            const an = String(a.name ?? a.title ?? "").toLowerCase();
            const bn = String(b.name ?? b.title ?? "").toLowerCase();
            if (sort === "name-asc") return an.localeCompare(bn);
            if (sort === "name-desc") return bn.localeCompare(an);
            if (sort === "date-desc") return getDate(b) - getDate(a);
            if (sort === "date-asc") return getDate(a) - getDate(b);
            return 0;
        });

        return arr;
    }, [movies, q, sort]);

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
                    <button className="ghost" onClick={onLogout}>Logout</button>
                </div>
            </header>

            <main className="movies-main">
                <div className="panel">
                    <div className="panel-head">
                        <div>
                            <h1>Movie List</h1>
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
                                    <div className="card" key={m.id ?? idx}>
                                        <div className="card-row">
                                            <div className="name">{m.name ?? m.title ?? "Untitled"}</div>
                                            <div className="pill">
                                                {formatRelease(m.releaseDate ?? m.release_date ?? m.date)}
                                            </div>
                                        </div>

                                        <div className="meta">
                      <span className="meta-item">
                        <span className="meta-k">DirectorId:</span>{" "}
                          <span className="meta-v">{m.directorId ?? "-"}</span>
                      </span>
                                            <span className="meta-item">
                        <span className="meta-k">TotalRevenue:</span>{" "}
                                                <span className="meta-v">{formatMoney(m.totalRevenue ?? m.totaRevenue ?? m.revenue)}</span>
                      </span>
                                        </div>

                                        {/* resim yok, ama aksiyon alanı profesyonel dursun */}
                                        <div className="card-actions">
                                            <button className="btn-mini">Details</button>
                                            <button className="btn-mini danger">Delete</button>
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