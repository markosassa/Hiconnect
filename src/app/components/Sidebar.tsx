import { Link, useLocation } from "react-router";
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
import { User } from "../App";

interface SidebarProps {
  currentUser: User;
  onLogout: () => void;
}

export default function Sidebar({ currentUser, onLogout }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    ...(currentUser.role === "admin"
      ? [
          { path: "/utenti", icon: Users, label: "Gestione Utenti" },
          { path: "/societa", icon: Building2, label: "Gestione Società" },
        ]
      : []),
    { path: "/destinatari", icon: UserCheck, label: "Gestione Destinatari" },
    { path: "/attributi", icon: Tags, label: "Gestione Attributi" },
    { path: "/nuova-comunicazione", icon: Send, label: "Nuova Comunicazione" },
    { path: "/storico", icon: History, label: "Storico" },
  ];

  return (
    <div className="w-64 bg-slate-800 min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-white text-lg font-semibold">Portale</h2>
        <p className="text-slate-400 text-sm mt-1">{currentUser.email}</p>
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
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Esci</span>
        </button>
      </div>
    </div>
  );
}
