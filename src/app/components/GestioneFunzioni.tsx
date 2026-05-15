import { useState, useEffect } from "react";
import PageLayout from "./PageLayout";
import {
  Blocks,
  Plus,
  Edit2,
  Trash2,
  BadgeCheck,
} from "lucide-react";
import { motion } from "motion/react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { Funzione } from "../../types/auth";

type FunzioniResponse = {
  success: boolean;
  data: Funzione[];
};

const PROTECTED_FUNCTIONS = [1, 2, 3, 4];

export default function GestioneFunzioni() {

  const { hasFunzione } = useAuth();

  const [funzioni, setFunzioni] = useState<Funzione[]>([]);

  const [showForm, setShowForm] = useState(false);

  const [editingFunzione, setEditingFunzione] =
    useState<Funzione | null>(null);

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    slug: "",
  });

  const getErrorMessage = (
    err: unknown
  ): string => {

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

    if (hasFunzione("funzioni")) {
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

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      if (editingFunzione) {

        await axios.patch(
          `/api/funzioni/${editingFunzione.idfunzione}`,
          formData
        );

      } else {

        await axios.post(
          "/api/funzioni",
          formData
        );
      }

      setAlert({
        type: "success",
        message: editingFunzione
          ? "Funzione modificata correttamente"
          : "Funzione creata correttamente",
      });

      await fetchFunzioni();

      resetForm();

    } catch (err) {

      setAlert({
        type: "error",
        message: getErrorMessage(err),
      });
    }
  };

  const handleEdit = (
    funzione: Funzione
  ) => {

    if (
      PROTECTED_FUNCTIONS.includes(
        funzione.idfunzione
      )
    ) {

      setAlert({
        type: "error",
        message:
          "Questa funzione non può essere modificata",
      });

      return;
    }

    setEditingFunzione(funzione);

    setFormData({
      slug: funzione.slug || "",
    });

    setShowForm(true);
  };

  const handleDelete = async (
    idfunzione: number
  ) => {

    if (
      PROTECTED_FUNCTIONS.includes(
        idfunzione
      )
    ) {

      setAlert({
        type: "error",
        message:
          "Questa funzione non può essere eliminata",
      });

      return;
    }

    if (
      !confirm(
        "Sei sicuro di voler eliminare questa funzione?"
      )
    ) {
      return;
    }

    try {

      await axios.delete(
        `/api/funzioni/${idfunzione}`
      );

      setFunzioni(prev =>
        prev.filter(
          f => f.idfunzione !== idfunzione
        )
      );

      setAlert({
        type: "success",
        message:
          "Funzione eliminata correttamente",
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
      slug: "",
    });

    setEditingFunzione(null);

    setShowForm(false);
  };

  if (!hasFunzione("funzioni")) {

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

          {/* HEADER */}

          <div className="flex items-center justify-between mb-6">

            <div className="flex items-center gap-3">

              <BadgeCheck className="w-8 h-8 text-emerald-600" />
    
              <h1 className="text-3xl font-semibold text-slate-800">
                Gestione Funzioni
              </h1>
            </div>

            <button
              onClick={() =>
                setShowForm(!showForm)
              }
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg"
            >
              <Plus className="w-5 h-5" />
              Nuova Funzione
            </button>
          </div>

          {/* ALERT */}

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

                {editingFunzione
                  ? "Modifica Funzione"
                  : "Nuova Funzione"}

              </h2>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                <input
                  type="text"
                  placeholder="Slug funzione"
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

                <div className="flex gap-2">

                  <button
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg"
                  >
                    {editingFunzione
                      ? "Salva Modifiche"
                      : "Crea Funzione"}
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

            {funzioni.length === 0 ? (

              <div className="p-8 text-center text-slate-500">
                Nessuna funzione presente
              </div>

            ) : (

              <div className="overflow-x-auto">
                <table className="w-full min-w-full table-auto">

                  <thead className="bg-slate-50">
                    <tr>

                      <th className="px-6 py-3 text-left">
                        ID
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

                    {funzioni.map((funzione) => {

                      const isProtected =
                        PROTECTED_FUNCTIONS.includes(
                          funzione.idfunzione
                        );

                      return (

                        <tr
                          key={funzione.idfunzione}
                          className="border-t"
                        >

                          <td className="px-6 py-4">
                            {funzione.idfunzione}
                          </td>

                          <td className="px-6 py-4">
                            {funzione.slug}
                          </td>

                          <td className="px-6 py-4">

                            <div className="flex gap-2">

                              <button
                                onClick={() =>
                                  handleEdit(funzione)
                                }
                                disabled={isProtected}
                                className={
                                  isProtected
                                    ? "opacity-40 cursor-not-allowed"
                                    : ""
                                }
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    funzione.idfunzione
                                  )
                                }
                                disabled={isProtected}
                                className={
                                  isProtected
                                    ? "opacity-40 cursor-not-allowed"
                                    : ""
                                }
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>

                            </div>
                          </td>
                        </tr>
                      );
                    })}
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