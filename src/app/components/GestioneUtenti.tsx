import { useState } from "react";
import Sidebar from "./Sidebar";
import { User, AppState } from "../App";
import { Users, Plus, Edit2, Trash2 } from "lucide-react";
import { motion } from "motion/react";

interface GestioneUtentiProps {
  currentUser: User;
  onLogout: () => void;
  appState: AppState;
  setAppState: (state: AppState) => void;
}

export default function GestioneUtenti({
  currentUser,
  onLogout,
  appState,
  setAppState,
}: GestioneUtentiProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user" as "admin" | "user",
    companyId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      companyId: formData.companyId || null,
    };

    if (editingUser) {
      setAppState({
        ...appState,
        users: appState.users.map((u) =>
          u.id === editingUser.id ? { ...editingUser, ...userData } : u
        ),
      });
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        ...userData,
      };
      setAppState({
        ...appState,
        users: [...appState.users, newUser],
      });
    }
    resetForm();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role,
      companyId: user.companyId || "",
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questo utente?")) {
      setAppState({
        ...appState,
        users: appState.users.filter((u) => u.id !== id),
      });
    }
  };

  const resetForm = () => {
    setFormData({ username: "", email: "", password: "", role: "user", companyId: "" });
    setEditingUser(null);
    setShowForm(false);
  };

  // Filtra utenti in base al ruolo
  const visibleUsers = currentUser.role === "admin"
    ? appState.users
    : appState.users.filter(u => u.companyId === currentUser.companyId);

  return (
    <div className="flex">
      <Sidebar currentUser={currentUser} onLogout={onLogout} />
      <div className="flex-1 bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-semibold text-slate-800">Gestione Utenti</h1>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuovo Utente
            </button>
          </div>

          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6 mb-6"
            >
              <h2 className="text-xl font-medium text-slate-800 mb-4">
                {editingUser ? "Modifica Utente" : "Nuovo Utente"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required={!editingUser}
                      placeholder={editingUser ? "Lascia vuoto per non modificare" : ""}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Ruolo
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value as "admin" | "user",
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="user">Utente</option>
                      <option value="admin">Amministratore</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Società
                  </label>
                  <select
                    value={formData.companyId}
                    onChange={(e) =>
                      setFormData({ ...formData, companyId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Nessuna società (Solo Admin)</option>
                    {appState.companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {editingUser ? "Salva Modifiche" : "Crea Utente"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Annulla
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                    Società
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                    Ruolo
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((user) => {
                  const company = user.companyId
                    ? appState.companies.find(c => c.id === user.companyId)
                    : null;

                  return (
                    <tr key={user.id} className="border-t border-slate-200">
                      <td className="px-6 py-4 text-slate-800">{user.username}</td>
                      <td className="px-6 py-4 text-slate-600">{user.email}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {company ? company.nome : <span className="text-slate-400 italic">Nessuna</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.role === "admin" ? "Amministratore" : "Utente"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={user.id === currentUser.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
