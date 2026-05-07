import { createContext, useEffect, useState, ReactNode } from "react";
import axios from "../lib/axios";
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

  

  // 🔹 recupero sessione al refresh
  useEffect(() => {

  const fetchMe = async () => {

    try {

      const res = await axios.get("/api/me");

      setUser(res.data.user);
      setRoles(res.data.roles);
      setFunzioni(res.data.funzioni);

    } catch (err) {

      console.error(err);

      setUser(null);
      setRoles([]);
      setFunzioni([]);

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
      const me = await axios.get("/api/me");

      setUser(me.data.user);
      setRoles(me.data.roles);
      setFunzioni(me.data.funzioni);
      

      return true;
    } catch {
      setUser(null);
      setRoles([]);
      setFunzioni([]);

      return false;
    }
  };

  // 🔹 logout
  const logout = async () => {
  try {

    await axios.post("/api/logout");

  } catch (err) {

    console.error(err);

  } finally {

    setUser(null);
    setRoles([]);
    setFunzioni([]);

    window.location.href = "/login";
  }
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