import { useMemo, useState } from "react";
import { login } from "./api";
import "./login.css";

export default function LoginPage({ onAuthed, onGoRegister }) {
    const [username, setUsername] = useState("suedaakca");
    const [password, setPassword] = useState("12345");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const canSubmit = useMemo(() => {
        return username.length > 3 && password.trim().length >= 4 && !loading;
    }, [username, password, loading]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!canSubmit) return;

        setErr("");
        setLoading(true);
        try {
            const data = await login(username, password);
            console.log("Returning value: ", data);
            const token = data.token;

            const cleanToken = token.startsWith("Bearer ")
                ? token.replace("Bearer ", "")
                : token;

            localStorage.setItem("token", cleanToken);
            onAuthed?.(cleanToken);
        } catch (e2) {
            setErr(e2?.message || "Login failed.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-shell">
            <div className="auth-bg" />
            <main className="auth-card">
                <header className="auth-header">
                    <div className="brand">
                        <div className="brand-mark" aria-hidden="true">M</div>
                        <div className="brand-text">
                            <div className="brand-name">MovieSystem</div>
                        </div>
                    </div>
                </header>

                <section className="auth-body">
                    <h1 className="title">Sign in</h1>

                    <form onSubmit={handleSubmit} className="form">
                        <label className="field">
                            <span className="label">Username</span>
                            <input
                                className="input"
                                value={username}
                                onChange={(u) => setUsername(u.target.value)}
                                placeholder="Username"
                            />
                        </label>

                        <label className="field">
                            <span className="label">Password</span>
                            <div className="pw-wrap">
                                <input
                                    className="input pw"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    type={showPw ? "text" : "password"}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="pw-toggle"
                                    onClick={() => setShowPw((s) => !s)}
                                    aria-label={showPw ? "Hide password" : "Show password"}
                                >
                                    {showPw ? "Hide" : "Show"}
                                </button>
                            </div>
                        </label>

                        {err && (
                            <div className="alert" role="alert">
                                {err}
                            </div>
                        )}
                        
                        <div className="actions">
                            <button className="btn" disabled={!canSubmit} type="submit">
                                {loading ? "Signing in..." : "Login"}
                            </button>

                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={onGoRegister}
                            >
                                Create account
                            </button>
                        </div>
                    </form>
                </section>

                <footer className="auth-footer">
                    <span className="foot-muted">© {new Date().getFullYear()} MovieSystem</span>
                </footer>
            </main>
        </div>
    );
}