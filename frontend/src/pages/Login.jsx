import { useState } from "react";
import api, { errorMessage } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { saveSession } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res =
        mode === "login"
          ? await api.post("/auth/login", { email, password })
          : await api.post("/auth/register", { name, email, password });
      saveSession(res.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <form className="form" onSubmit={submit}>
        <h1>{mode === "login" ? "Sign in" : "Create account"}</h1>
        {mode === "signup" && (
          <label>Name<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required /></label>
        )}
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="primary" disabled={busy}>
          {busy ? "Please wait" : mode === "login" ? "Sign in" : "Create account"}
        </button>
        <button
          type="button"
          className="link"
          onClick={() => {
            setError("");
            setMode(mode === "login" ? "signup" : "login");
          }}
        >
          {mode === "login" ? "New here? Create an account" : "Have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
