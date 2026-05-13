import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import {
  UserCheck,
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
};

type RecipientAttribute = {
  idattributo: number;
  nomeattributo?: string;
  valore: string;
};

type Recipient = {
  codsoc: number;
  iddestinatario: number;
  nome: string;
  cognome: string;
  telefono: string;
  email: string;
  attributi: RecipientAttribute[];
};

type RecipientsResponse = {
  success: boolean;
  data: Recipient[];
};

type AttributesResponse = {
  success: boolean;
  data: Attributo[];
};

export default function GestioneDestinatari() {

  const {
    user,
    hasFunzione,
  } = useAuth();

  const [recipients, setRecipients] =
    useState<Recipient[]>([]);

  const [attributes, setAttributes] =
    useState<Attributo[]>([]);

  const [showForm, setShowForm] =
    useState(false);

  const [editingRecipient,
    setEditingRecipient] =
      useState<Recipient | null>(null);

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [formData, setFormData] =
    useState({
      nome: "",
      cognome: "",
      email: "",
      telefono: "",
      codsoc:
        user?.codsoc || 0,

      attributi:
        [] as RecipientAttribute[],
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

  const fetchRecipients =
    async () => {

      try {

        const res =
          await axios.get<RecipientsResponse>(
            `/api/recipients/${user?.codsoc}`,
            
          );

        setRecipients(
          res.data.data
        );

      } catch (err) {

        setAlert({
          type: "error",
          message:
            getErrorMessage(err),
        });

        setRecipients([]);
      }
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

        console.error(err);

        setAttributes([]);
      }
    };

  useEffect(() => {

    if (
      hasFunzione(
        "destinatari"
      )
    ) {

      fetchRecipients();
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

  const handleAttributeChange = (
    idattributo: number,
    valore: string
  ) => {

    const updated =
      [...formData.attributi];

    const index =
      updated.findIndex(
        a =>
          a.idattributo ===
          idattributo
      );

    if (index >= 0) {

      updated[index].valore =
        valore;

    } else {

      updated.push({
        idattributo,
        valore,
      });
    }

    setFormData({
      ...formData,
      attributi: updated,
    });
  };

  const getAttributeValue = (
    idattributo: number
  ) => {

    const attr =
      formData.attributi.find(
        a =>
          a.idattributo ===
          idattributo
      );

    return attr?.valore || "";
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      if (
        editingRecipient
      ) {

        await axios.patch(
          `/api/recipients/${editingRecipient.codsoc}/${editingRecipient.iddestinatario}`,
          formData
        );

      } else {

        await axios.post(
          "/api/recipients",
          formData
        );
      }

      setAlert({
        type: "success",

        message:
          editingRecipient
            ? "Destinatario modificato correttamente"
            : "Destinatario creato correttamente",
      });

      await fetchRecipients();

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
    recipient: Recipient
  ) => {

    setEditingRecipient(
      recipient
    );

    setFormData({
      nome:
        recipient.nome || "",

      cognome:
        recipient.cognome || "",

      email:
        recipient.email || "",

      telefono:
        recipient.telefono || "",

      codsoc:
        recipient.codsoc || 0,

      attributi:
        recipient.attributi || [],
    });

    setShowForm(true);
  };

  const handleDelete = async (
    codsoc: number,
    iddestinatario: number
  ) => {

    if (
      !confirm(
        "Sei sicuro di voler eliminare questo destinatario?"
      )
    ) {
      return;
    }

    try {

      await axios.delete(
        `/api/recipients/${codsoc}/${iddestinatario}`
      );

      setRecipients(prev =>
        prev.filter(
          r =>
            !(
              r.codsoc === codsoc &&
              r.iddestinatario ===
                iddestinatario
            )
        )
      );

      setAlert({
        type: "success",
        message:
          "Destinatario eliminato correttamente",
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

    setFormData({
      nome: "",
      cognome: "",
      email: "",
      telefono: "",
      codsoc:
        user?.codsoc || 0,
      attributi: [],
    });

    setEditingRecipient(
      null
    );

    setShowForm(false);
  };

  if (
    !hasFunzione(
      "destinatari"
    )
  ) {

    return (
      <div className="p-6 text-red-600">
        Accesso negato
      </div>
    );
  }

  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-slate-50 p-8">

        <div className="max-w-6xl mx-auto">

          {/* HEADER */}

          <div className="flex items-center justify-between mb-6">

            <div className="flex items-center gap-3">

              <UserCheck className="w-8 h-8 text-emerald-600" />

              <h1 className="text-3xl font-semibold text-slate-800">
                Gestione Destinatari
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

              Nuovo Destinatario
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

                {editingRecipient
                  ? "Modifica Destinatario"
                  : "Nuovo Destinatario"}
              </h2>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                <div className="grid grid-cols-2 gap-4">

                  <input
                    type="text"
                    placeholder="Nome"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nome:
                          e.target.value,
                      })
                    }
                    className="border p-2 rounded"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Cognome"
                    value={formData.cognome}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cognome:
                          e.target.value,
                      })
                    }
                    className="border p-2 rounded"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">

                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email:
                          e.target.value,
                      })
                    }
                    className="border p-2 rounded"
                  />

                  <input
                    type="text"
                    placeholder="Telefono"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        telefono:
                          e.target.value,
                      })
                    }
                    className="border p-2 rounded"
                  />
                </div>

                {/* ATTRIBUTI */}

                {attributes.length > 0 && (

                  <div>

                    <h3 className="text-lg font-medium text-slate-800 mb-4">
                      Attributi
                    </h3>

                    <div className="grid grid-cols-2 gap-4">

                      {attributes.map(
                        (
                          attribute
                        ) => (

                          <div
                            key={
                              attribute.idattributo
                            }
                          >

                            <label className="block text-sm font-medium text-slate-700 mb-2">

                              {
                                attribute.nomeattributo
                              }
                            </label>

                            {/* TESTO */}

                            {attribute.tipoattributo === 1 && (

                              <input
                                type="text"
                                value={getAttributeValue(
                                  attribute.idattributo
                                )}
                                onChange={(e) =>
                                  handleAttributeChange(
                                    attribute.idattributo,
                                    e.target.value
                                  )
                                }
                                className="w-full border p-2 rounded"
                              />
                            )}

                            {/* NUMERO */}

                            {attribute.tipoattributo === 2 && (

                              <input
                                type="number"
                                value={getAttributeValue(
                                  attribute.idattributo
                                )}
                                onChange={(e) =>
                                  handleAttributeChange(
                                    attribute.idattributo,
                                    e.target.value
                                  )
                                }
                                className="w-full border p-2 rounded"
                              />
                            )}

                            {/* BOOLEAN */}

                            {attribute.tipoattributo === 3 && (

                              <select
                                value={getAttributeValue(
                                  attribute.idattributo
                                )}
                                onChange={(e) =>
                                  handleAttributeChange(
                                    attribute.idattributo,
                                    e.target.value
                                  )
                                }
                                className="w-full border p-2 rounded"
                              >

                                <option value="">
                                  Seleziona
                                </option>

                                <option value="1">
                                  Si
                                </option>

                                <option value="0">
                                  No
                                </option>
                              </select>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">

                  <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg">

                    {editingRecipient
                      ? "Salva Modifiche"
                      : "Crea Destinatario"}
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

            {recipients.length === 0 ? (

              <div className="p-8 text-center text-slate-500">
                Nessun destinatario presente
              </div>

            ) : (

              <table className="w-full">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-6 py-3 text-left">
                      Nome
                    </th>

                    <th className="px-6 py-3 text-left">
                      Cognome
                    </th>

                    <th className="px-6 py-3 text-left">
                      Email
                    </th>

                    <th className="px-6 py-3 text-left">
                      Telefono
                    </th>

                    <th className="px-6 py-3 text-left">
                      Azioni
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {recipients.map(
                    (
                      recipient
                    ) => (
                      <tr
                        key={`${recipient.codsoc}-${recipient.iddestinatario}`}
                        className="border-t"
                      >

                        <td className="px-6 py-4">
                          {
                            recipient.nome
                          }
                        </td>

                        <td className="px-6 py-4">
                          {
                            recipient.cognome
                          }
                        </td>

                        <td className="px-6 py-4">
                          {
                            recipient.email
                          }
                        </td>

                        <td className="px-6 py-4">
                          {
                            recipient.telefono
                          }
                        </td>

                        <td className="px-6 py-4">

                          <div className="flex gap-2">

                            <button
                              onClick={() =>
                                handleEdit(
                                  recipient
                                )
                              }
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  recipient.codsoc,
                                  recipient.iddestinatario
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}