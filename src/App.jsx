import { useState } from "react";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import MoviesPage from "./MoviesPage";

export default function App() {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [page, setPage] = useState("login"); // login | register

    if (!token && page === "login")
        return <LoginPage onAuthed={setToken} onGoRegister={() => setPage("register")} />;

    if (!token && page === "register")
        return <RegisterPage onBack={() => setPage("login")} />;

    return (
        <MoviesPage
            token={token}
            onLogout={() => {
                localStorage.removeItem("token");
                setToken(null);
                setPage("login");
            }}
        />
    );
}