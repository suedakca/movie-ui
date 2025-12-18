import { useState } from "react";
import "./login.css";
export default function RegisterPage({ onBack }) {
    const [form, setForm] = useState({
        userName: "",
        password: "",
        firstName: "",
        lastName: "",
        birthDate: "",
        gender: 0,
        address: "",
    });

    const [err, setErr] = useState("");
    const [ok, setOk] = useState("");
    function set(key, val) {
        setForm((f) => ({ ...f, [key]: val }));
    }
    async function handleRegister(e) {
        e.preventDefault();
        setErr("");
        setOk("");

        try {
            const res = await fetch("http://localhost:5211/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(form),
            });

            const text = await res.text();
            if (!res.ok) throw new Error(text || "Register failed");

            setOk("Account created successfully. You can login now.");
        } catch (e) {
            setErr(e.message);
        }
    }

    return (
        <div className="auth-shell">
            <div className="auth-bg" />
            <main className="auth-card">
                <header className="auth-header">
                    <div className="brand">
                        <div className="brand-mark">M</div>
                        <div>
                            <div className="brand-name">MovieSystem</div>
                            <div className="brand-sub">Create new account</div>
                        </div>
                    </div>
                </header>
                <section className="auth-body">
                    <h1 className="title">Register</h1>
                    <form className="form" onSubmit={handleRegister}>
                        <input className="input" placeholder="Username"
                               onChange={(e) => set("userName", e.target.value)} />
                        <input className="input" type="password" placeholder="Password"
                               onChange={(e) => set("password", e.target.value)} />
                        <input className="input" placeholder="First name"
                               onChange={(e) => set("firstName", e.target.value)} />
                        <input className="input" placeholder="Last name"
                               onChange={(e) => set("lastName", e.target.value)} />
                        <input className="input" type="date"
                               onChange={(e) => set("birthDate", e.target.value)} />
                        <input className="input" placeholder="Address"
                               onChange={(e) => set("address", e.target.value)} />
                        {err && <div className="alert">{err}</div>}
                        {ok && <div className="alert" style={{ borderColor: "green", color: "green" }}>{ok}</div>}
                        <button className="btn">Create account</button>
                        <button
                            type="button"
                            className="link-btn"
                            onClick={onBack}
                        >
                            ← Back to login
                        </button>
                    </form>
                </section>
            </main>
        </div>
    );
}