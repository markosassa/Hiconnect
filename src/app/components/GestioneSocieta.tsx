import { useState } from "react";
import Sidebar from "./Sidebar";
import { User, AppState } from "../App";
import { Building2, Plus, Edit2, Trash2 } from "lucide-react";
import { motion } from "motion/react";

interface GestioneSocietaProps {
  currentUser: User;
  onLogout: () => void;
  appState: AppState;
  setAppState: (state: AppState) => void;
}

export default function GestioneSocieta({
  currentUser,
  onLogout,
  appState,
  setAppState,
}: GestioneSocietaProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: "",
    pIva: "",
    indirizzo: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCompany) {
      setAppState({
        ...appState,
        companies: appState.companies.map((c) =>
          c.id === editingCompany.id ? { ...editingCompany, ...formData } : c
        ),
      });
    } else {
      const newCompany = {
        id: Date.now().toString(),
        ...formData,
      };
      setAppState({
        ...appState,
        companies: [...appState.companies, newCompany],
      });
    }
    resetForm();
  };

  const handleEdit = (company: any) => {
    setEditingCompany(company);
    setFormData({
      nome: company.nome,
      pIva: company.pIva,
      indirizzo: company.indirizzo,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questa società?")) {
      setAppState({
        ...appState,
        companies: appState.companies.filter((c) => c.id !== id),
      });
    }
  };

  const resetForm = () => {
    setFormData({ nome: "", pIva: "", indirizzo: "" });
    setEditingCompany(null);
    setShowForm(false);
  };

  return (
    <div className="flex">
      <Sidebar currentUser={currentUser} onLogout={onLogout} />
      <div className="flex-1 bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-semibold text-slate-800">Gestione Società</h1>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuova Società
            </button>
          </div>

          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6 mb-6"
            >
              <h2 className="text-xl font-medium text-slate-800 mb-4">
                {editingCompany ? "Modifica Società" : "Nuova Società"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nome Società
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Partita IVA
                    </label>
                    <input
                      type="text"
                      value={formData.pIva}
                      onChange={(e) => setFormData({ ...formData, pIva: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Indirizzo
                    </label>
                    <input
                      type="text"
                      value={formData.indirizzo}
                      onChange={(e) =>
                        setFormData({ ...formData, indirizzo: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {editingCompany ? "Salva Modifiche" : "Crea Società"}
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
            {appState.companies.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                Nessuna società presente. Clicca su "Nuova Società" per aggiungerne una.
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                      Partita IVA
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                      Indirizzo
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {appState.companies.map((company) => (
                    <tr key={company.id} className="border-t border-slate-200">
                      <td className="px-6 py-4 text-slate-800">{company.nome}</td>
                      <td className="px-6 py-4 text-slate-600">{company.pIva}</td>
                      <td className="px-6 py-4 text-slate-600">{company.indirizzo}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(company)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(company.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
