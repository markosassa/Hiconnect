import Sidebar from "./Sidebar";
import { LayoutDashboard } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function Dashboard() {

  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar currentUser={user} onLogout={logout} />

      <div className="flex-1 bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">

          <div className="flex items-center gap-3 mb-6">
            <LayoutDashboard className="w-8 h-8 text-indigo-600" />

            <h1 className="text-3xl font-semibold text-slate-800">
              Dashboard
            </h1>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8">

            <h2 className="text-xl font-medium text-slate-800 mb-4">
              Benvenuto, {user?.nome}!
            </h2>

            <p className="text-slate-600">
              Utilizza il menu laterale per accedere alle funzionalità del portale.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}