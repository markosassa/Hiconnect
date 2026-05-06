import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCheck,
  Tags,
  Send,
  History,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function Sidebar() {
  const location = useLocation();
  const { user, logout, hasFunzione } = useAuth();

  if (!user) return null;

  const menuItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },

    ...(hasFunzione("users")
      ? [{ path: "/utenti", icon: Users, label: "Gestione Utenti" }]
      : []),

    ...(hasFunzione("societa")
      ? [{ path: "/societa", icon: Building2, label: "Gestione Società" }]
      : []),

    ...(hasFunzione("destinatari")
      ? [{ path: "/destinatari", icon: UserCheck, label: "Gestione Destinatari" }]
      : []),

    ...(hasFunzione("attributi")
      ? [{ path: "/attributi", icon: Tags, label: "Gestione Attributi" }]
      : []),

    ...(hasFunzione("nuova-comunicazione")
      ? [{ path: "/nuova-comunicazione", icon: Send, label: "Nuova Comunicazione" }]
      : []),

    ...(hasFunzione("storico")
      ? [{ path: "/storico", icon: History, label: "Storico" }]
      : []),
  ];

  return (
    <div className="w-64 bg-slate-800 min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-white text-lg font-semibold">Portale</h2>
        <p className="text-slate-400 text-sm mt-1">
          {user.nome ?? user.email}
        </p>
      </div>

      <nav className="flex-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Esci</span>
        </button>
      </div>
    </div>
  );
}