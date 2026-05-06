import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Users, Plus, Edit2, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { User } from "../../types/auth";

type UsersResponse = {
  success: boolean;
  data: User[];
};

export default function GestioneUtenti() {
  const { user, hasFunzione } = useAuth();
  axios.defaults.withCredentials = true;
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState([]);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
    codsoc: "",
    role: "",
  });

  const fetchUsers = async () => {
    try {
      const res = await axios.get<UsersResponse>("/api/users", {
          params: { codsoc: user?.codsoc }
      });
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await axios.get("/api/companies");  
      setCompanies(res.data.data);
    } catch (err) {
      console.error(err);
      setCompanies([]);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get("/api/roles");
      setRoles(res.data.data);
    } catch (err) {
      console.error(err);
      setRoles([]);
    }
  };
  const handleCompanyChange = async (codsoc: string) => {
    setFormData({
      ...formData,
      codsoc,
      role: "", // reset ruolo
    });

    try {
      const res = await axios.get("/api/roles", {
        params: { codsoc },
      });

      const rolesData = res.data.data ??  [];

      setRoles(rolesData);
    } catch (err) {
      console.error(err);
      setRoles([]);
    }
  };
  useEffect(() => {
    if (hasFunzione("users")) {
      fetchUsers();
      fetchCompanies();
      fetchRoles();
    }
  }, []);

  // 🔹 SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        await axios.put(`/api/users/${editingUser.id}`, formData);
      } else {
        console.log(formData);
        await axios.post("/api/new-user",formData);
      }

      await fetchUsers();
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 EDIT
  const handleEdit = (u: User) => {
    setEditingUser(u);
    setFormData({
      nome: u.nome ?? "",
      email: u.email,
      password: "",
    });
    setShowForm(true);
  };

  // 🔹 DELETE
  const handleDelete = async (id: number) => {
    if (!confirm("Sei sicuro di voler eliminare questo utente?")) return;

    try {
      await axios.delete(`/api/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({ nome: "", email: "", password: "" });
    setEditingUser(null);
    setShowForm(false);
  };

  // 🔒 PERMESSO
  if (!hasFunzione("users")) {
    return <div className="p-6 text-red-600">Accesso negato</div>;
  }

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-semibold text-slate-800">
                Gestione Utenti
              </h1>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg"
            >
              <Plus className="w-5 h-5" />
              Nuovo Utente
            </button>
          </div>

          {/* FORM */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6 mb-6"
            >
              <h2 className="text-xl font-medium mb-4">
                {editingUser ? "Modifica Utente" : "Nuovo Utente"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">

                  <input
                    type="text"
                    placeholder="Nome"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    className="border p-2 rounded"
                    required
                  />

                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="border p-2 rounded"
                    required
                  />
                </div>

                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                />
                <select
                  value={formData.codsoc}
                  onChange={(e) =>{
                    handleCompanyChange(e.target.value);
                    setFormData({ ...formData, codsoc: e.target.value })

                  }
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Seleziona società</option>
                  {companies.map((c: any) => (
                    <option key={c.codsoc} value={c.codsoc}>
                      {c.ragionesociale}
                    </option>
                  ))}
                </select>
                  <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Seleziona ruolo</option>
                  {roles.map((r: any) => (
                    <option key={r.idrole} value={r.idrole}>
                      {r.namerole}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg">
                    {editingUser ? "Salva Modifiche" : "Crea Utente"}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-slate-200 px-6 py-2 rounded-lg"
                  >
                    Annulla
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left">Nome</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Società</th>
                  <th className="px-6 py-3 text-left">Azioni</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-6 py-4">{u.nome ?? "-"}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">{u.codsoc}</td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(u)}>
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={u.id === user?.id}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        </div>
      </div>
    </div>
  );
}