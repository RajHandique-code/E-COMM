import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api.js";

const AuthContext = createContext(null);

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

  const saveSession = useCallback(({ token, user }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    api
      .get("/auth/me")
      .then((res) => {
        localStorage.setItem("user", JSON.stringify(res.data));
        setUser(res.data);
      })
      .catch((err) => {
        if (err.response?.status === 401) logout();
      });
  }, [logout]);

  return <AuthContext.Provider value={{ user, saveSession, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
