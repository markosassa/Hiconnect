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

import RequireFunzione from "../router/RequireFunzione";
import { AppState } from "../types/app";

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
                    appState={appState}
                    setAppState={setAppState}
                  />
                </RequireFunzione>
              }
            />

            <Route
              path="/societa"
              element={
                <RequireFunzione slug="societa">
                  <GestioneSocieta appState={appState} />
                </RequireFunzione>
              }
            />

            <Route
              path="/destinatari"
              element={
                <RequireFunzione slug="destinatari">
                  <GestioneDestinatari appState={appState} />
                </RequireFunzione>
              }
            />

            <Route
              path="/attributi"
              element={
                <RequireFunzione slug="attributi">
                  <GestioneAttributi appState={appState} />
                </RequireFunzione>
              }
            />

            <Route
              path="/nuova-comunicazione"
              element={
                <RequireFunzione slug="nuova-comunicazione">
                  <NuovaComunicazione appState={appState} />
                </RequireFunzione>
              }
            />

            <Route
              path="/storico"
              element={
                <RequireFunzione slug="storico">
                  <StoricoComunicazioni appState={appState} />
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