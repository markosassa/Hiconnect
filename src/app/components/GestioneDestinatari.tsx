import { useState } from "react";
import Sidebar from "./Sidebar";
import { User, AppState, Recipient } from "../App";
import { UserCheck, Plus, Edit2, Trash2 } from "lucide-react";
import { motion } from "motion/react";

interface GestioneDestinatariProps {
  currentUser: User;
  onLogout: () => void;
  appState: AppState;
  setAppState: (state: AppState) => void;
}

export default function GestioneDestinatari({
  currentUser,
  onLogout,
  appState,
  setAppState,
}: GestioneDestinatariProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: "",
    telefono: "",
    attributi: {} as Record<string, any>,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecipient) {
      setAppState({
        ...appState,
        recipients: appState.recipients.map((r) =>
          r.id === editingRecipient.id ? { ...editingRecipient, ...formData } : r
        ),
      });
    } else {
      const newRecipient: Recipient = {
        id: Date.now().toString(),
        ...formData,
      };
      setAppState({
        ...appState,
        recipients: [...appState.recipients, newRecipient],
      });
    }
    resetForm();
  };

  const handleEdit = (recipient: Recipient) => {
    setEditingRecipient(recipient);
    setFormData({
      nome: recipient.nome,
      cognome: recipient.cognome,
      email: recipient.email,
      telefono: recipient.telefono,
      attributi: recipient.attributi,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questo destinatario?")) {
      setAppState({
        ...appState,
        recipients: appState.recipients.filter((r) => r.id !== id),
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      cognome: "",
      email: "",
      telefono: "",
      attributi: {},
    });
    setEditingRecipient(null);
    setShowForm(false);
  };

  const handleAttributeChange = (attributeId: string, value: any) => {
    setFormData({
      ...formData,
      attributi: {
        ...formData.attributi,
        [attributeId]: value,
      },
    });
  };

  return (
    <div className="flex">
      <Sidebar currentUser={currentUser} onLogout={onLogout} />
      <div className="flex-1 bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-semibold text-slate-800">
                Gestione Destinatari
              </h1>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuovo Destinatario
            </button>
          </div>

          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6 mb-6"
            >
              <h2 className="text-xl font-medium text-slate-800 mb-4">
                {editingRecipient ? "Modifica Destinatario" : "Nuovo Destinatario"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Cognome
                    </label>
                    <input
                      type="text"
                      value={formData.cognome}
                      onChange={(e) =>
                        setFormData({ ...formData, cognome: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Telefono
                    </label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) =>
                        setFormData({ ...formData, telefono: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                {appState.attributes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Attributi</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {appState.attributes.map((attr) => (
                        <div key={attr.id}>
                          <label className="block text-sm text-slate-600 mb-2">
                            {attr.nome}
                          </label>
                          {attr.tipo === "text" && (
                            <input
                              type="text"
                              value={formData.attributi[attr.id] || ""}
                              onChange={(e) =>
                                handleAttributeChange(attr.id, e.target.value)
                              }
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          )}
                          {attr.tipo === "number" && (
                            <input
                              type="number"
                              value={formData.attributi[attr.id] || ""}
                              onChange={(e) =>
                                handleAttributeChange(attr.id, e.target.value)
                              }
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          )}
                          {attr.tipo === "boolean" && (
                            <select
                              value={formData.attributi[attr.id] || ""}
                              onChange={(e) =>
                                handleAttributeChange(
                                  attr.id,
                                  e.target.value === "true"
                                )
                              }
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="">Seleziona</option>
                              <option value="true">Si</option>
                              <option value="false">No</option>
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {editingRecipient ? "Salva Modifiche" : "Crea Destinatario"}
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
            {appState.recipients.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                Nessun destinatario presente. Clicca su "Nuovo Destinatario" per
                aggiungerne uno.
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                      Cognome
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                      Telefono
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {appState.recipients.map((recipient) => (
                    <tr key={recipient.id} className="border-t border-slate-200">
                      <td className="px-6 py-4 text-slate-800">{recipient.nome}</td>
                      <td className="px-6 py-4 text-slate-800">{recipient.cognome}</td>
                      <td className="px-6 py-4 text-slate-600">{recipient.email}</td>
                      <td className="px-6 py-4 text-slate-600">{recipient.telefono}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(recipient)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(recipient.id)}
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
