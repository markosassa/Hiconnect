import { useState, useEffect } from "react";
import PageLayout from "./PageLayout";
import { Building2, Plus, Edit2, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { Company } from "../../types/auth";

type CompaniesResponse = {
  success: boolean;
  data: Company[];
};

export default function GestioneSocieta() {
  const { hasFunzione } = useAuth();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    ragionesociale: "",
    piva: "",
    indirizzo: "",
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

  const fetchCompanies = async () => {
    try {
      const res = await axios.get<CompaniesResponse>("/api/companies");
      setCompanies(res.data.data);
    } catch (err) {
      setAlert({
        type: "error",
        message: getErrorMessage(err),
      });

      setCompanies([]);
    }
  };

  useEffect(() => {
    if (hasFunzione("societa")) {
      fetchCompanies();
    }
  }, []);

  useEffect(() => {
    if (!alert) return;

    const timer = setTimeout(() => {
      setAlert(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [alert]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCompany) {
        await axios.patch(
          `/api/companies/${editingCompany.codsoc}`,
          formData
        );
      } else {
        await axios.post("/api/companies", formData);
      }

      setAlert({
        type: "success",
        message: editingCompany
          ? "Società modificata correttamente"
          : "Società creata correttamente",
      });

      await fetchCompanies();
      resetForm();

    } catch (err) {
      setAlert({
        type: "error",
        message: getErrorMessage(err),
      });
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);

    setFormData({
      ragionesociale: company.ragionesociale || "",
      piva: company.piva || "",
      indirizzo: company.indirizzo || "",
    });

    setShowForm(true);
  };

  const handleDelete = async (codsoc: number) => {
    if (!confirm("Sei sicuro di voler eliminare questa società?")) {
      return;
    }

    try {
      await axios.delete(`/api/companies/${codsoc}`);

      setCompanies(prev =>
        prev.filter(c => parseInt(c.codsoc) !== codsoc)
      );

      setAlert({
        type: "success",
        message: "Società eliminata correttamente",
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
      ragionesociale: "",
      piva: "",
      indirizzo: "",
    });

    setEditingCompany(null);
    setShowForm(false);
  };

  if (!hasFunzione("societa")) {
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
              <Building2 className="w-8 h-8 text-emerald-600" />

              <h1 className="text-3xl font-semibold text-slate-800">
                Gestione Società
              </h1>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg"
            >
              <Plus className="w-5 h-5" />
              Nuova Società
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
                {editingCompany
                  ? "Modifica Società"
                  : "Nuova Società"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">

                <input
                  type="text"
                  placeholder="Ragione sociale"
                  value={formData.ragionesociale}
                   maxLength={50}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ragionesociale: e.target.value,
                    })
                  }
                  className="w-full border p-2 rounded"
                  required
                />

                <div className="grid grid-cols-2 gap-4">

                  <input
                    type="text"
                    placeholder="Partita IVA"
                    value={formData.piva}
                    maxLength={11}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        piva: e.target.value,
                      })
                    }
                    className="border p-2 rounded"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Indirizzo"
                    value={formData.indirizzo}
                    maxLength={100}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        indirizzo: e.target.value,
                      })
                    }
                    className="border p-2 rounded"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg">
                    {editingCompany
                      ? "Salva Modifiche"
                      : "Crea Società"}
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

          <div className="bg-white rounded-xl shadow-md overflow-hidden">

            {companies.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                Nessuna società presente
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-full table-auto">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        Ragione Sociale
                      </th>

                      <th className="px-6 py-3 text-left">
                        Partita IVA
                      </th>

                      <th className="px-6 py-3 text-left">
                        Indirizzo
                      </th>

                      <th className="px-6 py-3 text-left">
                        Azioni
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {companies.map((company) => (
                      <tr
                        key={company.codsoc}
                        className="border-t"
                      >
                        <td className="px-6 py-4">
                          {company.ragionesociale}
                        </td>

                        <td className="px-6 py-4">
                          {company.piva}
                        </td>

                        <td className="px-6 py-4">
                          {company.indirizzo}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex gap-2">

                            <button
                              onClick={() => handleEdit(company)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(parseInt(company.codsoc))
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
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}



