import { useState } from "react";
import LoginPage from "./LoginPage";

export default function App() {
    const [token, setToken] = useState(localStorage.getItem("token") || "");

    if (!token) return <LoginPage onAuthed={setToken} />;

    return (
        <div style={{ padding: 24, fontFamily: "system-ui" }}>
            <h2>Logged in ✅</h2>
            <p>Token localStorage’a kaydedildi.</p>
            <button
                onClick={() => {
                    localStorage.removeItem("token");
                    setToken("");
                }}
            >
                Logout
            </button>
        </div>
    );
}