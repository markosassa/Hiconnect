import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import GestioneUtenti from "./components/GestioneUtenti";
import GestioneSocieta from "./components/GestioneSocieta";
import GestioneDestinatari from "./components/GestioneDestinatari";
import GestioneAttributi from "./components/GestioneAttributi";
import NuovaComunicazione from "./components/NuovaComunicazione";
import StoricoComunicazioni from "./components/StoricoComunicazioni";

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: "admin" | "user";
  companyId: string | null;
}

export interface Company {
  id: string;
  nome: string;
  pIva: string;
  indirizzo: string;
}

export interface Attribute {
  id: string;
  nome: string;
  tipo: "text" | "number" | "boolean";
  companyId: string | null;
}

export interface Recipient {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  attributi: Record<string, any>;
  companyId: string | null;
}

export interface Communication {
  id: string;
  data: string;
  destinatari: string[];
  tipoDestinatari: "tutti" | "singolo" | "attributo";
  filtroAttributo?: { attributoId: string; valore: any };
  oggetto: string;
  contenuto: string;
  links: string[];
  allegati: string[];
  canaliInvio: ("email" | "whatsapp")[];
}

export interface AppState {
  users: User[];
  companies: Company[];
  attributes: Attribute[];
  recipients: Recipient[];
  communications: Communication[];
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appState, setAppState] = useState<AppState>({
    users: [],
    companies: [],
    attributes: [],
    recipients: [],
    communications: [],
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    const storedState = localStorage.getItem("appState");
    if (storedState) {
      const parsedState = JSON.parse(storedState);

      // Migrazione dati: aggiungi password e companyId se mancano
      const migratedUsers = parsedState.users.map((u: any) => ({
        ...u,
        password: u.password || (u.username === "admin" ? "admin123" : "password"),
        companyId: u.companyId !== undefined ? u.companyId : null,
      }));

      const migratedRecipients = parsedState.recipients?.map((r: any) => ({
        ...r,
        companyId: r.companyId !== undefined ? r.companyId : null,
      })) || [];

      const migratedAttributes = parsedState.attributes?.map((a: any) => ({
        ...a,
        companyId: a.companyId !== undefined ? a.companyId : null,
      })) || [];

      const migratedState = {
        ...parsedState,
        users: migratedUsers,
        recipients: migratedRecipients,
        attributes: migratedAttributes,
      };

      setAppState(migratedState);
      localStorage.setItem("appState", JSON.stringify(migratedState));
    } else {
      const defaultAdmin: User = {
        id: "1",
        username: "admin",
        email: "admin@portale.it",
        password: "admin123",
        role: "admin",
        companyId: null,
      };
      const initialState: AppState = {
        users: [defaultAdmin],
        companies: [],
        attributes: [],
        recipients: [],
        communications: [],
      };
      setAppState(initialState);
      localStorage.setItem("appState", JSON.stringify(initialState));
    }
  }, []);

  useEffect(() => {
    if (appState.users.length > 0) {
      localStorage.setItem("appState", JSON.stringify(appState));
    }
  }, [appState]);

  const handleLogin = (username: string, password: string) => {
    const user = appState.users.find((u) => u.username === username);
    if (user && user.password === password) {
      setCurrentUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/utenti"
          element={
            <GestioneUtenti
              currentUser={currentUser}
              onLogout={handleLogout}
              appState={appState}
              setAppState={setAppState}
            />
          }
        />
        <Route
          path="/societa"
          element={
            <GestioneSocieta
              currentUser={currentUser}
              onLogout={handleLogout}
              appState={appState}
              setAppState={setAppState}
            />
          }
        />
        <Route
          path="/destinatari"
          element={
            <GestioneDestinatari
              currentUser={currentUser}
              onLogout={handleLogout}
              appState={appState}
              setAppState={setAppState}
            />
          }
        />
        <Route
          path="/attributi"
          element={
            <GestioneAttributi
              currentUser={currentUser}
              onLogout={handleLogout}
              appState={appState}
              setAppState={setAppState}
            />
          }
        />
        <Route
          path="/nuova-comunicazione"
          element={
            <NuovaComunicazione
              currentUser={currentUser}
              onLogout={handleLogout}
              appState={appState}
              setAppState={setAppState}
            />
          }
        />
        <Route
          path="/storico"
          element={
            <StoricoComunicazioni
              currentUser={currentUser}
              onLogout={handleLogout}
              appState={appState}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
