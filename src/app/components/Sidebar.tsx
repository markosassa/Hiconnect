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
  MessageCircle,
  Settings,
  Shield,
  BadgeCheck,
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
    ...(hasFunzione("ruoli")
    ? [{ path: "/ruoli", icon: Shield, label: "Gestione Ruoli" }]
    : []),
    ...(hasFunzione("funzioni")
    ? [{ path: "/funzioni", icon: BadgeCheck, label: "Gestione Funzioni" }]
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
    ...(hasFunzione("whatsapp-admin")
      ? [{ path: "/whatsapp", icon: MessageCircle, label: "Gestione WhatsApp" }]
      : []),
    ...(hasFunzione("gestione-parametri")
      ? [{ path: "/parametri", icon: Settings, label: "Parametri" }]
      : []),
    ...(hasFunzione("monitor")
      ? [{ path: "/monitoring", icon: Settings, label: "Monitor" }]
      : []),
  ];

  return (
    <div className="w-full md:w-64 bg-emerald-900 min-h-screen flex flex-col">

      <div className="p-6 border-b border-emerald-700">

        <div className="flex items-center gap-3">

      <img
        src="/logo2.png"
        alt="Logo"
        className="w-12 h-12 rounded-xl object-contain bg-white p-2 shadow"
      />

      <div>
        

        <p className="text-white text-sm mt-1">
          {user.nome ?? user.email}
        </p>
      </div>

    </div>
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
                  ? "bg-emerald-600 text-white"
                  : "text-white hover:bg-emerald-700"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-emerald-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-emerald-700 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Esci</span>
        </button>
      </div>
    </div>
  );
}