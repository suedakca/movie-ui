import { useEffect, useState } from "react";
import LoginPage from "./LoginPage";
import MoviesPage from "./MoviesPage";
import AdminPanel from "./AdminPanel";
import RegisterPage from "./RegisterPage";
export default function App() {
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [role, setRole] = useState("");
    const [mode, setMode] = useState("login");
    useEffect(() => {
        if (!token) { setRole(""); return; }
        const r = getRoleFromToken(token);
        setRole(r);
    }, [token]);

    function handleAuthed(t) {
        const clean = String(t).replace(/^Bearer\s+/i, "").trim();
        localStorage.setItem("token", clean);
        setToken(clean);
    }

    function logout() {
        localStorage.removeItem("token");
        setToken("");
        setRole("");
    }

    if (!token) {
        if (mode === "register") {
            return <RegisterPage onBack={() => setMode("login")} />;
        }
        return <LoginPage onAuthed={handleAuthed} onGoRegister={() => setMode("register")}  />;
    }
    if (role === "Admin") {
        return <AdminPanel token={token} onLogout={logout} />;
    }
    return <MoviesPage token={token} onLogout={logout} />;
}
function getRoleFromToken(rawToken) {
    try {
        const token = String(rawToken).replace(/^Bearer\s+/i, "").trim();
        const payload = token.split(".")[1];
        const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));

        // claim bazen: "role" veya ".../claims/role"
        const role =
            json.role ||
            json["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
            "";

        return role;
    } catch {
        return "";
    }
}