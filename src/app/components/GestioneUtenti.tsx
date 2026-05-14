import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Users, Plus, Edit2, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { Company, Role, User } from "../../types/auth";

type UsersResponse = {
  success: boolean;
  data: User[];
};
const getErrorMessage = (err: unknown): string => {

  if (axios.isAxiosError(err)) {
    return (
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      "Errore imprevisto"
    );
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "Errore imprevisto";
};

export default function GestioneUtenti() {
  const { user, hasFunzione } = useAuth();
  axios.defaults.withCredentials = true;
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
    codsoc: "",
    role: 0,
  });

  const fetchUsers = async () => {
    try {
      const res = await axios.get<UsersResponse>("/api/users", {
          params: { codsoc: user?.codsoc }
      });
      setUsers(res.data.data);
    } catch (err) {
      setAlert({
        type: "error",
        message:getErrorMessage(err),
      });
      setUsers([]);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await axios.get("/api/companies");  
      setCompanies(res.data.data);
    } catch (err) {
        setAlert({
        type: "error",
        message:getErrorMessage(err),
      });
      setCompanies([]);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get("/api/roles");
      setRoles(res.data.data);
    } catch (err) {
      setAlert({
        type: "error",
        message:getErrorMessage(err), 
          
      });
      setRoles([]);
    }
  };
  const handleCompanyChange = async (
  codsoc: string,
  resetRole = true
) => {

  setFormData(prev => ({
    ...prev,
    codsoc,
    role: resetRole ? 0 : prev.role,
  }));

  try {
    const res = await axios.get("/api/roles", {
      params: { codsoc },
    });

    setRoles(res.data.data ?? []);
  } catch (err) {
    setAlert({
      type: "error",
      message:
        getErrorMessage(err),
    });
    setRoles([]);
  }
};
  useEffect(() => {
    if (hasFunzione("users")) {
      fetchRoles();
      fetchUsers();
      fetchCompanies();
    }

    if (!alert) return;

    const timer = setTimeout(() => {
      setAlert(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [alert]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let result: any;
      if (editingUser) {
        result = await axios.patch(`/api/users/${editingUser.codsoc}/${editingUser.user_id}`, formData);
      } else {
        console.log(formData);
        result = await axios.post("/api/new-user", formData);
        console.log(result);
        
        
      }
      
            setAlert({
              type: "success",
              message: editingUser
                ? "Utente modificato correttamente"
                : "Utente creato correttamente",
            });
        
      await fetchUsers();
      resetForm();
    } catch (err) {

      if (axios.isAxiosError(err)) {

        console.log("STATUS:", err.response?.status);
        console.log("DATA:", err.response?.data);
        console.log("FULL:", err);

        setAlert({
          type: "error",
          message:getErrorMessage(err),
        });
      }
    }
  };

  const handleEdit = async (id: number, codsoc: string) => {
    try {
      const res = await axios.get(`/api/users/${codsoc}/${id}`);

      const u = res.data.data;

      setEditingUser(u);

      await handleCompanyChange(
        u.codsoc.toString(),
        false
      );

      setFormData({
        nome: u.nome ?? "",
        email: u.email,
        password: "",
        codsoc: u.codsoc?.toString() || "",
        role: u.role?.idrole || 0,
      });

      setShowForm(true);

    } catch (err) {
      setAlert({
        type: "error",
        message:
          getErrorMessage(err),
      });
    }
  };

  const handleDelete = async (id: number, codsoc: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo utente?")) return;

    try {
      const res =await axios.delete(`/api/users/${codsoc}/${id}`);
      setUsers((prev) => prev.filter((u) => u.user_id !== id));
      setAlert({
        type: "success",
        message: res.data.message || "Utente eliminato correttamente",
      });
    } catch (err) {
      setAlert({
        type: "error",
        message:
          getErrorMessage(err),
      });
    }
  };

  const resetForm = () => {
    setFormData({ nome: "", email: "", password: "", codsoc: "", role: 0 });
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
              <Users className="w-8 h-8 text-emerald-600" />
              <h1 className="text-3xl font-semibold text-slate-800">
                Gestione Utenti
              </h1>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg"
            >
              <Plus className="w-5 h-5" />
              Nuovo Utente
            </button>
          </div>
          {alert && (
            <div
              className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${
                alert.type === "success"
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
              }`}
            >
              {alert.message}
            </div>
          )}
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
                    setFormData({ ...formData, role: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value={0}>Seleziona ruolo</option>
                  {roles.map((r: any) => (
                    <option key={r.idrole} value={r.idrole}>
                      {r.namerole}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg">
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
                  
                  <tr key={u.user_id} className="border-t">
                    <td className="px-6 py-4">{u.nome ?? "-"}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">{u.societa?.ragionesociale ?? "-"}</td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(u.user_id, u.codsoc?.toString() || "")}>
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(u.user_id, u.codsoc?.toString() || "")}
                          disabled={u.user_id === user?.user_id}
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