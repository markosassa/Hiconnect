import { createContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import { User, Role, Funzione } from "../types/auth";


type AuthContextType = {
  user: User | null;
  roles: Role[];
  funzioni: Funzione[];
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasFunzione: (slug: string) => boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [funzioni, setFunzioni] = useState<Funzione[]>([]);
  const [loading, setLoading] = useState(true);

  axios.defaults.baseURL = "http://localhost:8000";
  axios.defaults.withCredentials = true;

  // 🔹 recupero sessione al refresh
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axios.get("/api/me");
        setUser(res.data.user);
        setRoles(res.data.roles);
        setFunzioni(res.data.funzioni);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  // 🔹 login
  const login = async (email: string, password: string) => {
    try {
      await axios.get("/sanctum/csrf-cookie");

      const res = await axios.post("/login", { email, password });

      setUser(res.data.user);
      setRoles(res.data.roles);
      setFunzioni(res.data.funzioni);

      return true;
    } catch {
      return false;
    }
  };

  // 🔹 logout
  const logout = async () => {
    await axios.post("/logout");
    setUser(null);
    setRoles([]);
    setFunzioni([]);
    
  };

  // 🔹 check permessi
  const hasFunzione = (slug: string) => {
    return funzioni.some(f => f.slug === slug);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        funzioni,
        loading,
        login,
        logout,
        hasFunzione
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}