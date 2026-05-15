import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "./../hooks/useAuth";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import GestioneUtenti from "./components/GestioneUtenti";
import GestioneSocieta from "./components/GestioneSocieta";
import GestioneDestinatari from "./components/GestioneDestinatari";
import GestioneAttributi from "./components/GestioneAttributi";
import NuovaComunicazione from "./components/NuovaComunicazione";
import StoricoComunicazioni from "./components/StoricoComunicazioni";
import GestioneRuoli from "./components/GestioneRuoli";
import GestioneFunzioni from "./components/GestioneFunzioni";
import GestioneWhatsApp from "./components/GestioneWhatsApp";
import MonitoringDashboard from "./components/MonitoringDashboard";
import GestioneParametri from "./components/GestioneParametri";

import RequireFunzione from "../router/RequireFunzione";
import { AppState } from "../types/app";
import { Monitor } from "lucide-react";

export default function RouterApp() {
  const { user, loading } = useAuth();

  const [appState, setAppState] = useState<AppState>({
    users: [],
    companies: [],
    attributes: [],
    recipients: [],
    communications: [],
  });

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {!user ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Dashboard />} />

            <Route
              path="/utenti"
              element={
                <RequireFunzione slug="users">
                  <GestioneUtenti
                    
                    
                  />
                </RequireFunzione>
              }
            />

            <Route
              path="/societa"
              element={
                <RequireFunzione slug="societa">
                  <GestioneSocieta  />
                </RequireFunzione>
              }
            />
            <Route
              path="/ruoli"
              element={
                <RequireFunzione slug="ruoli">
                  <GestioneRuoli  />
                </RequireFunzione>
              }
            />
            <Route
              path="/funzioni"
              element={
                <RequireFunzione slug="funzioni">
                  <GestioneFunzioni  />
                </RequireFunzione>
              }
            />
            <Route
              path="/whatsapp"
              element={
                <RequireFunzione slug="funzioni">
                  <GestioneWhatsApp  />
                </RequireFunzione>
              }
            />

            <Route
              path="/destinatari"
              element={
                <RequireFunzione slug="destinatari">
                  <GestioneDestinatari  />
                </RequireFunzione>
              }
            />

            <Route
              path="/attributi"
              element={
                <RequireFunzione slug="attributi">
                  <GestioneAttributi  />
                </RequireFunzione>
              }
            />

            <Route
              path="/nuova-comunicazione"
              element={
                <RequireFunzione slug="nuova-comunicazione">
                  <NuovaComunicazione  />
                </RequireFunzione>
              }
            />

            <Route
              path="/storico"
              element={
                <RequireFunzione slug="storico">
                  <StoricoComunicazioni  />
                </RequireFunzione>
              }
            />
            <Route
              path="/monitoring"
              element={
                <RequireFunzione slug="monitor">
                  <MonitoringDashboard  />
                </RequireFunzione>
              }
            />
            <Route
              path="/parametri"
              element={
                <RequireFunzione slug="gestione-parametri">
                  <GestioneParametri  />
                </RequireFunzione>
              }
            />

            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}