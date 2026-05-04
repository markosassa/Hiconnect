import { useState } from "react";
import Sidebar from "./Sidebar";
import { User, AppState } from "../App";
import { Tags, Plus, Edit2, Trash2 } from "lucide-react";
import { motion } from "motion/react";

interface GestioneAttributiProps {
  currentUser: User;
  onLogout: () => void;
  appState: AppState;
  setAppState: (state: AppState) => void;
}

export default function GestioneAttributi({
  currentUser,
  onLogout,
  appState,
  setAppState,
}: GestioneAttributiProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "text" as "text" | "number" | "boolean",
    companyId: currentUser.companyId || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const attributeData = {
      ...formData,
      companyId: currentUser.role === "admin" ? (formData.companyId || null) : currentUser.companyId,
    };

    if (editingAttribute) {
      setAppState({
        ...appState,
        attributes: appState.attributes.map((a) =>
          a.id === editingAttribute.id ? { ...editingAttribute, ...attributeData } : a
        ),
      });
    } else {
      const newAttribute = {
        id: Date.now().toString(),
        ...attributeData,
      };
      setAppState({
        ...appState,
        attributes: [...appState.attributes, newAttribute],
      });
    }
    resetForm();
  };

  const handleEdit = (attribute: any) => {
    setEditingAttribute(attribute);
    setFormData({
      nome: attribute.nome,
      tipo: attribute.tipo,
      companyId: attribute.companyId || "",
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questo attributo?")) {
      setAppState({
        ...appState,
        attributes: appState.attributes.filter((a) => a.id !== id),
      });
    }
  };

  const resetForm = () => {
    setFormData({ nome: "", tipo: "text", companyId: currentUser.companyId || "" });
    setEditingAttribute(null);
    setShowForm(false);
  };

  // Filtra attributi in base al ruolo
  const visibleAttributes = currentUser.role === "admin"
    ? appState.attributes
    : appState.attributes.filter(a => a.companyId === currentUser.companyId);

  return (
    <div className="flex">
      <Sidebar currentUser={currentUser} onLogout={onLogout} />
      <div className="flex-1 bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Tags className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-semibold text-slate-800">Gestione Attributi</h1>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuovo Attributo
            </button>
          </div>

          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6 mb-6"
            >
              <h2 className="text-xl font-medium text-slate-800 mb-4">
                {editingAttribute ? "Modifica Attributo" : "Nuovo Attributo"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nome Attributo
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="es. Reparto, Livello, Sede"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tipo
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tipo: e.target.value as "text" | "number" | "boolean",
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="text">Testo</option>
                      <option value="number">Numero</option>
                      <option value="boolean">Si/No</option>
                    </select>
                  </div>
                </div>

                {currentUser.role === "admin" && (
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
                      <option value="">Nessuna società</option>
                      {appState.companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {editingAttribute ? "Salva Modifiche" : "Crea Attributo"}
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
            {visibleAttributes.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                Nessun attributo presente. Clicca su "Nuovo Attributo" per aggiungerne uno.
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleAttributes.map((attribute) => (
                    <tr key={attribute.id} className="border-t border-slate-200">
                      <td className="px-6 py-4 text-slate-800">{attribute.nome}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {attribute.tipo === "text"
                            ? "Testo"
                            : attribute.tipo === "number"
                            ? "Numero"
                            : "Si/No"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(attribute)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(attribute.id)}
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
