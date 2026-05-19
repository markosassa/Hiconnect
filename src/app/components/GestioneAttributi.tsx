import { useState, useEffect } from "react";
import PageLayout from "./PageLayout";
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import axios from "axios";

import { useAuth } from "../../hooks/useAuth";

type Attributo = {
  codsoc: number;
  idattributo: number;
  nomeattributo: string;
  tipoattributo: number;
  opzioni?: string[];
};

type AttributesResponse = {
  success: boolean;
  data: Attributo[];
};

export default function GestioneAttributi() {

  const {
    user,
    hasFunzione,
  } = useAuth();

  const [attributes, setAttributes] =
    useState<Attributo[]>([]);

  const [showForm, setShowForm] =
    useState(false);

  const [editingAttribute,
    setEditingAttribute] =
      useState<Attributo | null>(null);

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [formData, setFormData] =
    useState({
      nomeattributo: "",
      tipoattributo: 1,
      codsoc: user?.codsoc || 0,
      opzioni: [] as string[],
      nuovoValore: "",
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

  const fetchAttributes =
    async () => {

      try {

        const res =
          await axios.get<AttributesResponse>(
            "/api/attributes",
            {
              params: {
                codsoc:
                  user?.codsoc,
              },
            }
          );

        setAttributes(
          res.data.data
        );

      } catch (err) {

        setAlert({
          type: "error",
          message:
            getErrorMessage(err),
        });

        setAttributes([]);
      }
    };

  useEffect(() => {

    if (
      hasFunzione(
        "attributi"
      )
    ) {

      fetchAttributes();
    }

  }, []);

  useEffect(() => {

    if (!alert) return;

    const timer =
      setTimeout(() => {

        setAlert(null);

      }, 4000);

    return () =>
      clearTimeout(timer);

  }, [alert]);
  useEffect(() => {
  if (formData.tipoattributo !== 4) {
    setFormData((prev) => ({
      ...prev,
      opzioni: [],
      nuovoValore: "",
    }));
  }
}, [formData.tipoattributo]);
  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      if (
        editingAttribute
      ) {

        await axios.patch(
          `/api/attributes/${editingAttribute.codsoc}/${editingAttribute.idattributo}`,
          formData
        );

      } else {

        await axios.post(
          "/api/attributes",
          formData
        );
      }

      setAlert({
        type: "success",

        message:
          editingAttribute
            ? "Attributo modificato correttamente"
            : "Attributo creato correttamente",
      });

      await fetchAttributes();

      resetForm();

    } catch (err) {

      setAlert({
        type: "error",
        message:
          getErrorMessage(err),
      });
    }
  };

  const handleEdit = (
    attribute: Attributo
  ) => {

    setEditingAttribute(
      attribute
    );
    
    setFormData({
      nomeattributo:
        attribute.nomeattributo || "",

      tipoattributo:
        attribute.tipoattributo || 1,

      codsoc:
        attribute.codsoc || 0,
        opzioni: parseOpzioni(attribute.opzioni),


      nuovoValore: "",
    });

    setShowForm(true);
  };

  const handleDelete = async (
    codsoc: number,
    idattributo: number
  ) => {

    if (
      !confirm(
        "Sei sicuro di voler eliminare questo attributo?"
      )
    ) {
      return;
    }

    try {

      await axios.delete(
        `/api/attributes/${codsoc}/${idattributo}`
      );

      setAttributes(prev =>
        prev.filter(
          a =>
            !(
              a.codsoc === codsoc &&
              a.idattributo === idattributo
            )
        )
      );

      setAlert({
        type: "success",
        message:
          "Attributo eliminato correttamente",
      });

    } catch (err) {

      setAlert({
        type: "error",
        message:
          getErrorMessage(err),
      });
    }
  };
  const parseOpzioni = (opzioni?: any[]) => {
  if (!opzioni) return [];
  return opzioni.map(o => typeof o === "string" ? o : o.valore);
};
  const resetForm = () => {

    setFormData({
      nomeattributo: "",
      tipoattributo: 1,
      codsoc:
        user?.codsoc || 0,
      opzioni: [],
      nuovoValore: "",
    });

    setEditingAttribute(null);

    setShowForm(false);
  };

  const getTipoLabel = (
    tipo: number
  ) => {

    switch (tipo) {

      case 1:
        return "Testo";

      case 2:
        return "Numero";

      case 3:
        return "Booleano";
      case 4:
        return "Select";

      default:
        return "Sconosciuto";
    }
  };

  if (
    !hasFunzione(
      "attributi"
    )
  ) {

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

              <Tags className="w-8 h-8 text-emerald-600" />

              <h1 className="text-3xl font-semibold text-slate-800">
                Gestione Attributi
              </h1>
            </div>

            <button
              onClick={() =>
                setShowForm(
                  !showForm
                )
              }
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg"
            >
              <Plus className="w-5 h-5" />

              Nuovo Attributo
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
              initial={{
                opacity: 0,
                y: -20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="bg-white rounded-xl shadow-md p-6 mb-6"
            >

              <h2 className="text-xl font-medium mb-4">

                {editingAttribute
                  ? "Modifica Attributo"
                  : "Nuovo Attributo"}
              </h2>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                <div className="grid grid-cols-2 gap-4">

                  <input
                    type="text"
                    placeholder="Nome attributo"
                    value={formData.nomeattributo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nomeattributo:
                          e.target.value,
                      })
                    }
                    className="border p-2 rounded"
                    required
                  />

                  <select
                    value={formData.tipoattributo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipoattributo:
                          Number(
                            e.target.value
                          ),
                      })
                    }
                    className="border p-2 rounded"
                  >
                    <option value={1}>
                      Testo
                    </option>

                    <option value={2}>
                      Numero
                    </option>

                    <option value={3}>
                      Booleano
                    </option>

                    <option value={4}>
                      Select
                    </option>
                  </select>
                  {formData.tipoattributo === 4 && (

                    <div className="col-span-2 border rounded-lg p-4 bg-slate-50">

                      <label className="block text-sm font-medium mb-2">
                        Valori menu a tendina
                      </label>
                      {/* 👇 QUI */}
                      {formData.opzioni.length > 0 && (

                        <div className="text-xs text-slate-500 mb-3">
                          Valori attuali: {formData.opzioni.join(", ")}
                        </div>
                      )}
                      <div className="flex gap-2 mb-3">

                        <input
                          type="text"
                          placeholder="Nuovo valore"
                          value={formData.nuovoValore}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nuovoValore: e.target.value,
                            })
                          }
                          className="border p-2 rounded w-full"
                        />

                        <button
                          type="button"
                          onClick={() => {

                            if (!formData.nuovoValore.trim()) return;

                            setFormData({
                              ...formData,
                              opzioni: [
                                ...formData.opzioni,
                                formData.nuovoValore,
                              ],
                              nuovoValore: "",
                            });
                          }}
                          className="bg-emerald-600 text-white px-4 rounded"
                        >
                          Aggiungi
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
  {formData.opzioni.map((v, i) => (
    <span
      key={i}
      className="px-2 py-1 bg-white border rounded-full text-xs"
    >
      {v}
    </span>
  ))}
</div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">

                  <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg">

                    {editingAttribute
                      ? "Salva Modifiche"
                      : "Crea Attributo"}
                  </button>

                  <button
                    type="button"
                    onClick={
                      resetForm
                    }
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

            {attributes.length === 0 ? (

              <div className="p-8 text-center text-slate-500">
                Nessun attributo presente
              </div>

            ) : (

              <div className="overflow-x-auto">
                <table className="w-full min-w-full table-auto">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-6 py-3 text-left">
                      Nome
                    </th>

                    <th className="px-6 py-3 text-left">
                      Tipo
                    </th>

                    <th className="px-6 py-3 text-left">
                      Azioni
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {attributes.map(
                    (attribute) => (
                      <tr
                        key={`${attribute.codsoc}-${attribute.idattributo}`}
                        className="border-t"
                      >

                        <td className="px-6 py-4">
                          {
                            attribute.nomeattributo
                          }
                        </td>

                        <td className="px-6 py-4">

                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">

                            {getTipoLabel(
                              attribute.tipoattributo
                            )}
                          </span>
                        </td>

                        <td className="px-6 py-4">

                          <div className="flex gap-2">

                            <button
                              onClick={() =>
                                handleEdit(
                                  attribute
                                )
                              }
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  attribute.codsoc,
                                  attribute.idattributo
                                )
                              }
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
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