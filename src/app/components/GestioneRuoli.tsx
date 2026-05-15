import { useState, useEffect } from "react";
import PageLayout from "./PageLayout";
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import {
  Company,
  Role,
  Funzione,
} from "../../types/auth";

type RolesResponse = {
  success: boolean;
  data: Role[];
};

type FunzioniResponse = {
  success: boolean;
  data: Funzione[];
};

export default function GestioneRuoli() {

  const { hasFunzione } = useAuth();

  const [roles, setRoles] = useState<Role[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [funzioni, setFunzioni] = useState<Funzione[]>([]);

  const [showForm, setShowForm] = useState(false);

  const [editingRole, setEditingRole] =
    useState<Role | null>(null);

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    codsoc: "",
    namerole: "",
    slug: "",
    funzioni: [] as number[],
  });

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

  const fetchRoles = async () => {

    try {

      const res = await axios.get<RolesResponse>(
        "/api/roles"
      );

      setRoles(res.data.data);

    } catch (err) {

      setAlert({
        type: "error",
        message: getErrorMessage(err),
      });

      setRoles([]);
    }
  };

  const fetchCompanies = async () => {

    try {

      const res = await axios.get(
        "/api/companies"
      );

      setCompanies(res.data.data);

    } catch (err) {

      setAlert({
        type: "error",
        message: getErrorMessage(err),
      });

      setCompanies([]);
    }
  };

  const fetchFunzioni = async () => {

    try {

      const res = await axios.get<FunzioniResponse>(
        "/api/funzioni"
      );

      setFunzioni(res.data.data);

    } catch (err) {

      setAlert({
        type: "error",
        message: getErrorMessage(err),
      });

      setFunzioni([]);
    }
  };

  useEffect(() => {

    if (hasFunzione("ruoli")) {

      fetchRoles();
      fetchCompanies();
      fetchFunzioni();
    }

  }, []);

  useEffect(() => {

    if (!alert) return;

    const timer = setTimeout(() => {
      setAlert(null);
    }, 4000);

    return () => clearTimeout(timer);

  }, [alert]);

  const handleFunzioneChange = (
    idfunzione: number
  ) => {

    setFormData(prev => {

      const exists = prev.funzioni.includes(
        idfunzione
      );

      return {
        ...prev,

        funzioni: exists
          ? prev.funzioni.filter(
              f => f !== idfunzione
            )
          : [...prev.funzioni, idfunzione],
      };
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      if (editingRole) {

        await axios.patch(
          `/api/roles/${editingRole.codsoc}/${editingRole.idrole}`,
          formData
        );

      } else {

        await axios.post(
          "/api/roles",
          formData
        );
      }

      setAlert({
        type: "success",
        message: editingRole
          ? "Ruolo modificato correttamente"
          : "Ruolo creato correttamente",
      });

      await fetchRoles();

      resetForm();

    } catch (err) {

      setAlert({
        type: "error",
        message: getErrorMessage(err),
      });
    }
  };

  const handleEdit = async (role: Role) => {

    try {

      const res = await axios.get(
        `/api/roles/${role.codsoc}/${role.idrole}`
      );

      const data = res.data.data;

      setEditingRole(data);

      setFormData({
        codsoc: data.codsoc?.toString() || "",
        namerole: data.namerole || "",
        slug: data.slug || "",

        funzioni:
          data.funzioni?.map(
            (f: Funzione) => f.idfunzione
          ) || [],
      });

      setShowForm(true);

    } catch (err) {

      setAlert({
        type: "error",
        message: getErrorMessage(err),
      });
    }
  };

  const handleDelete = async (
    codsoc: number,
    idrole: number
  ) => {

    if (
      !confirm(
        "Sei sicuro di voler eliminare questo ruolo?"
      )
    ) {
      return;
    }

    try {

      await axios.delete(
        `/api/roles/${codsoc}/${idrole}`
      );

      setRoles(prev =>
        prev.filter(
          r =>
            !(
              r.codsoc === codsoc &&
              r.idrole === idrole
            )
        )
      );

      setAlert({
        type: "success",
        message:
          "Ruolo eliminato correttamente",
      });

    } catch (err) {

      setAlert({
        type: "error",
        message: getErrorMessage(err),
      });
    }
  };

  const resetForm = () => {

    setFormData({
      codsoc: "",
      namerole: "",
      slug: "",
      funzioni: [],
    });

    setEditingRole(null);

    setShowForm(false);
  };

  if (!hasFunzione("ruoli")) {
    return (
      <div className="p-6 text-red-600">
        Accesso negato
      </div>
    );
  }

  return (
    <PageLayout>
    

      

      <div className="bg-slate-50 p-4 md:p-8">

          <div className="max-w-6xl mx-auto">

            <div className="flex items-center justify-between mb-6">

              <div className="flex items-center gap-3">

                <Shield className="w-8 h-8 text-emerald-600" />

                <h1 className="text-3xl font-semibold text-slate-800">
                  Gestione Ruoli
                </h1>
              </div>

              <button
                onClick={() =>
                  setShowForm(!showForm)
                }
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg"
              >
                <Plus className="w-5 h-5" />
                Nuovo Ruolo
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

            {showForm && (

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md p-6 mb-6"
              >

                <h2 className="text-xl font-medium mb-4">
                  {editingRole
                    ? "Modifica Ruolo"
                    : "Nuovo Ruolo"}
                </h2>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >

                  <select
                    value={formData.codsoc}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        codsoc: e.target.value,
                      })
                    }
                    className="w-full border p-2 rounded"
                    required
                  >
                    <option value="">
                      Seleziona società
                    </option>

                    {companies.map((c) => (
                      <option
                        key={c.codsoc}
                        value={c.codsoc}
                      >
                        {c.ragionesociale}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Nome ruolo"
                    value={formData.namerole}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        namerole: e.target.value,
                      })
                    }
                    className="w-full border p-2 rounded"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slug: e.target.value,
                      })
                    }
                    className="w-full border p-2 rounded"
                    required
                  />

                  <div>

                    <h3 className="text-sm font-medium text-slate-700 mb-3">
                      Funzioni associate
                    </h3>

                    <div className="grid grid-cols-2 gap-2 border rounded-lg p-4">

                      {funzioni.map((f) => (

                        <label
                          key={f.idfunzione}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={formData.funzioni.includes(
                              f.idfunzione
                            )}
                            onChange={() =>
                              handleFunzioneChange(
                                f.idfunzione
                              )
                            }
                          />

                          <span>
                            {f.slug}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">

                    <button
                      className="bg-emerald-600 text-white px-6 py-2 rounded-lg"
                    >
                      {editingRole
                        ? "Salva Modifiche"
                        : "Crea Ruolo"}
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


              

          </div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">

              {
              roles.length === 0 ? (

                  <div className="p-8 text-center text-slate-500">
                    Nessun ruolo presente
                  </div>

                ) : (

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-full table-auto">

                      <thead className="bg-slate-50">
                        <tr>

                          <th className="px-6 py-3 text-left">
                            Società
                          </th>

                          <th className="px-6 py-3 text-left">
                            Nome Ruolo
                          </th>

                          <th className="px-6 py-3 text-left">
                            Slug
                          </th>

                          <th className="px-6 py-3 text-left">
                            Azioni
                          </th>

                        </tr>
                      </thead>

                      <tbody>

                        {roles.map((role) => (

                          <tr
                            key={`${role.codsoc}-${role.idrole}`}
                            className="border-t"
                          >

                            <td className="px-6 py-4">
                              {role.codsoc}
                            </td>

                            <td className="px-6 py-4">
                              {role.namerole}
                            </td>

                            <td className="px-6 py-4">
                              {role.slug}
                            </td>

                            <td className="px-6 py-4">

                              <div className="flex gap-2">

                                <button
                                  onClick={() =>
                                    handleEdit(role)
                                  }
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() =>
                                    handleDelete(
                                      role.codsoc,
                                      role.idrole
                                    )
                                  }
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
                )
              }
        </div>
        </div>
    </PageLayout>
  );
}

