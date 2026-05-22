import { useState, useEffect } from "react";
import axios from "axios";
import PageLayout from "./PageLayout";
import { Loader2 } from "lucide-react";

import {
  Send,
  Users,
  User as UserIcon,
  Filter,
  Mail,
  MessageCircle,
  Link2,
  Paperclip,
  Type,
  Bold,
  Italic,
  Underline,
  Search,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { motion } from "framer-motion";

import * as Dialog from "@radix-ui/react-dialog";

import { useAuth } from "../../hooks/useAuth";

/**
 * TYPES
 */

type RecipientAttribute = {
  idattributo: number;
  iddestinatario: number;
  nomeattributo: string;
  valore: string | number | boolean;
};

type Recipient = {
  codsoc: number;
  iddestinatario: number;
  nome: string;
  cognome: string;
  email: string | null;
  telefono: string | null;
  attributi: RecipientAttribute[];
};

type AttributoOpzione = {
  codsoc: number;
  idattributo: number;
  idopzione: number;
  valore: string;
};
  type FiltroAttributo = {
  idattributo: number;
  valore: string;
};
type Attributo = {
  codsoc: number;
  idattributo: number;
  nomeattributo: string;
  tipoattributo: number;
  opzioni?: AttributoOpzione[];
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

export default function NuovaComunicazione() {
  const { user, hasFunzione } = useAuth();

  /**
   * STATES
   */

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [attributes, setAttributes] = useState<Attributo[]>([]);

  const [tipoDestinatari, setTipoDestinatari] = useState<
    "tutti" | "singolo" | "attributo"
  >("tutti");

  const [destinatariSelezionati, setDestinatariSelezionati] = useState<number[]>([]);

  const [attributoFiltro, setAttributoFiltro] =
    useState<number | null>(null);

  const [valoreFiltro, setValoreFiltro] = useState("");

  const [oggetto, setOggetto] = useState("");
  const [contenuto, setContenuto] = useState("");
  const [matchMode, setMatchMode] =
  useState<"AND" | "OR">("AND");

  const [links, setLinks] = useState<string[]>([]);
  const [allegati, setAllegati] = useState<File[]>([]);

  const [canaliInvio, setCanaliInvio] = useState<
    ("email" | "whatsapp")[]
  >(["email"]);

  const [showDestinatarioDialog, setShowDestinatarioDialog] =
    useState(false);

  const [showAttributoDialog, setShowAttributoDialog] =
    useState(false);

  const [searchDestinatario, setSearchDestinatario] =
    useState("");

  const [searchAttributo, setSearchAttributo] =
    useState("");

  const [loading, setLoading] = useState(false);

  const [feedback, setFeedback] =
    useState<Feedback | null>(null);


const [filtriAttributi, setFiltriAttributi] =
  useState<FiltroAttributo[]>([]);
  /**
   * FEEDBACK AUTO HIDE
   */

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 3000);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  /**
   * FETCH
   */

  const fetchRecipients = async () => {
    try {
      const res = await axios.get(
        `/api/recipients/${user?.codsoc}`
      );

      setRecipients(res.data.data || []);
    } catch (err) {
      console.error(err);
      setRecipients([]);
    }
  };

  const fetchAttributes = async () => {
    try {
      const res = await axios.get("/api/attributes", {
        params: {
          codsoc: user?.codsoc,
        },
      });

      setAttributes(res.data.data || []);
    } catch (err) {
      console.error(err);
      setAttributes([]);
    }
  };
const handleSelectDestinatario = (recipientId: number) => {
  setTipoDestinatari("singolo");
  setDestinatariSelezionati((prev) => {
    if (prev.includes(recipientId)) {
      return prev.filter((id) => id !== recipientId);
    }
    return [...prev, recipientId];
  });
};

const handleSelectAttributo = (
  attributeId: number
) => {
  setAttributoFiltro(attributeId);

  setValoreFiltro("");

  setTipoDestinatari("attributo");

  setShowAttributoDialog(false);

  setSearchAttributo("");
};

  useEffect(() => {
    if (
      user &&
      hasFunzione("nuova-comunicazione")
    ) {
      fetchRecipients();
      fetchAttributes();
    }
  }, [user]);

  /**
   * FILTERS
   */

  const filteredRecipients = recipients.filter(
    (r) =>
      r.nome
        .toLowerCase()
        .includes(
          searchDestinatario.toLowerCase()
        ) ||
      r.cognome
        .toLowerCase()
        .includes(
          searchDestinatario.toLowerCase()
        ) ||
      (r.email || "")
        .toLowerCase()
        .includes(
          searchDestinatario.toLowerCase()
        )
  );

  const filteredAttributes = attributes.filter(
    (a) =>
      a.nomeattributo
        .toLowerCase()
        .includes(
          searchAttributo.toLowerCase()
        )
  );

  /**
   * SELECTED
   */

  const selectedRecipients = recipients.filter((r) =>
  destinatariSelezionati.includes(r.iddestinatario)
);

  const selectedAttribute = attributes.find(
    (a) =>
      a.idattributo === attributoFiltro
  );

  /**
   * HELPERS
   */

  const normalizeBooleanValue = (
    value: any
  ) => {
    if (
      value === true ||
      value === "true" ||
      value === 1 ||
      value === "1"
    ) {
      return "1";
    }

    return "0";
  };

  const getDestinatariCount = () => {
  if (tipoDestinatari === "tutti") {
    return recipients.length;
  }

  if (tipoDestinatari === "singolo") {
    return destinatariSelezionati.length;
  }

  if (
    tipoDestinatari === "attributo"
  ) {
    if (
      filtriAttributi.length === 0
    ) {
      return 0;
    }

    return recipients.filter((r) => {
      const results =
        filtriAttributi.map(
          (filtro) => {
            const attr =
              r.attributi.find(
                (a) =>
                  a.idattributo ===
                  filtro.idattributo
              );

            if (!attr)
              return false;

            const attribute =
              attributes.find(
                (a) =>
                  a.idattributo ===
                  filtro.idattributo
              );

            if (!attribute)
              return false;

            if (
              attribute.tipoattributo ===
              3
            ) {
              return (
                normalizeBooleanValue(
                  attr.valore
                ) ===
                filtro.valore
              );
            }

            return (
              String(
                attr.valore
              ) ===
              String(
                filtro.valore
              )
            );
          }
        );

      return matchMode === "AND"
        ? results.every(Boolean)
        : results.some(Boolean);
    }).length;
  }

  return 0;
};

  /**
   * FORMATTER
   */

  const applyFormatting = (tag: string) => {
    const textarea = document.getElementById(
      "content-editor"
    ) as HTMLTextAreaElement;

    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const selectedText =
      contenuto.substring(start, end);

    if (!selectedText) return;

    const before = contenuto.substring(
      0,
      start
    );

    const after = contenuto.substring(end);

    setContenuto(
      before +
        `<${tag}>${selectedText}</${tag}>` +
        after
    );
  };

  /**
   * LINKS
   */

  const addLink = (link: string) => {
    if (
      links.length < 3 &&
      link.trim()
    ) {
      setLinks([
        ...links,
        link.trim(),
      ]);
    }
  };

  const removeLink = (index: number) => {
    setLinks(
      links.filter((_, i) => i !== index)
    );
  };

  /**
   * ALLEGATI
   */

  const addAllegato = (file: File) => {
    if (allegati.length < 3) {
      setAllegati([
        ...allegati,
        file,
      ]);
    }
  };

  const removeAllegato = (
    index: number
  ) => {
    setAllegati(
      allegati.filter(
        (_, i) => i !== index
      )
    );
  };

  /**
   * CANALI
   */

  const toggleCanale = (
    canale: "email" | "whatsapp"
  ) => {
    if (
      canaliInvio.includes(canale)
    ) {
      setCanaliInvio(
        canaliInvio.filter(
          (c) => c !== canale
        )
      );
    } else {
      setCanaliInvio([
        ...canaliInvio,
        canale,
      ]);
    }
  };

  /**
   * INVIO
   */

  const handleInvia = async () => {
  try {
    setLoading(true);

    setFeedback(null);

    let destinatari: number[] = [];

    if (tipoDestinatari === "tutti") {
      destinatari = recipients.map(
        (r) => r.iddestinatario
      );
    }

    if (tipoDestinatari === "singolo") {
      destinatari = destinatariSelezionati;
    }

    if (tipoDestinatari === "attributo") {
      destinatari = recipients.filter((r) => {
    const results = filtriAttributi.map((filtro) => {
      const attr = r.attributi.find(
        (a) => a.idattributo === filtro.idattributo
      );
      if (!attr) return false;
      const attribute = attributes.find(
        (a) => a.idattributo === filtro.idattributo
      );
      if (!attribute) return false;
      if (attribute.tipoattributo === 3) {
        return normalizeBooleanValue(attr.valore) === filtro.valore;
      }
      return String(attr.valore) === String(filtro.valore);
    });
    return matchMode === "AND"
      ? results.every(Boolean)
      : results.some(Boolean);
  }).map((r) => r.iddestinatario);
}
    console.log("Destinatari:", destinatari);
    if (destinatari.length === 0) {
      setFeedback({
        type: "error",
        message:
          "Nessun destinatario selezionato",
      });

      return;
    }

    const formData =
      new FormData();

    formData.append(
      "codsoc",
      String(user?.codsoc)
    );

    formData.append(
      "oggetto",
      oggetto
    );

    formData.append(
      "contenuto",
      contenuto
    );

    formData.append(
      "tipoDestinatari",
      tipoDestinatari
    );

    destinatari.forEach(
      (
        iddestinatario,
        index
      ) => {
        formData.append(
          `destinatari[${index}]`,
          String(
            iddestinatario
          )
        );
      }
    );

    links.forEach(
      (link, index) => {
        formData.append(
          `links[${index}]`,
          link
        );
      }
    );

    canaliInvio.forEach(
      (canale, index) => {
        formData.append(
          `canali[${index}]`,
          canale
        );
      }
    );

    allegati.forEach(
      (file, index) => {
        formData.append(
          `allegati[${index}]`,
          file
        );
      }
    );

    await axios.post(
      "/api/comunicazioni",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    setFeedback({
      type: "success",
      message:
        "Comunicazione inviata con successo",
    });

    /**
     * RESET
     */

    setOggetto("");

    setContenuto("");

    setLinks([]);

    setAllegati([]);

    setValoreFiltro("");

    setAttributoFiltro(null);

    setDestinatariSelezionati([]);

    setTipoDestinatari("tutti");

    setCanaliInvio(["email"]);

  } catch (err: any) {
    console.error(err);

    setFeedback({
      type: "error",
      message:
        err?.response?.data
          ?.message ||
        "Errore durante l'invio",
    });
  } finally {
    setLoading(false);
  }
  };

  /**
   * VALIDATION
   */

  const isValid =
    oggetto.trim().length > 0 &&
    contenuto.trim().length > 0 &&
    canaliInvio.length > 0 &&
    getDestinatariCount() > 0;

  /**
   * ACL
   */

  if (
    !hasFunzione(
      "nuova-comunicazione"
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
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Send className="w-8 h-8 text-indigo-600" />

            <h1 className="text-3xl font-semibold text-slate-800">
              Nuova Comunicazione
            </h1>
          </div>

          {feedback && (
            <motion.div
              initial={{
                opacity: 0,
                y: -20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
              }}
              className={`
                mb-6
                rounded-xl
                border
                px-5
                py-4
                text-sm
                font-medium
                shadow-sm
                ${
                  feedback.type === "success"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }
              `}
            >
              <div className="flex items-center gap-3">
                {feedback.type === "success" ? (
                  <CheckCircle className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0" />
                )}

                <span>{feedback.message}</span>
              </div>
            </motion.div>
          )}

          <div className="space-y-6">
            {/* Canali di Invio */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-medium text-slate-800 mb-4">Canali di Invio</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => toggleCanale("email")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
                    canaliInvio.includes("email")
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Mail className="w-5 h-5" />
                  <span className="font-medium">Email</span>
                </button>
                <button
                  onClick={() => toggleCanale("whatsapp")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
                    canaliInvio.includes("whatsapp")
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Destinatari */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-medium text-slate-800 mb-4">Destinatari</h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <button
                  onClick={() => {
                    setTipoDestinatari("tutti");
                    setDestinatariSelezionati([]);
                    setAttributoFiltro(null);
                    setValoreFiltro("");
                  }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    tipoDestinatari === "tutti"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span>Tutti</span>
                </button>
                <button
                  onClick={() => setShowDestinatarioDialog(true)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    tipoDestinatari === "singolo"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <UserIcon className="w-5 h-5" />
                  <span>Singolo</span>
                </button>
                <button
                  onClick={() => setShowAttributoDialog(true)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    tipoDestinatari === "attributo"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Filter className="w-5 h-5" />
                  <span>Per Attributo</span>
                </button>
              </div>

              {/* Destinatario Selezionato */}
              {tipoDestinatari === "singolo" && selectedRecipients.length > 0 && (
                <div className="space-y-2">
                  {selectedRecipients.length > 0 && (
                   <div className="border rounded-lg overflow-hidden">
                    {selectedRecipients.map((r) => (
                      <div
                        key={r.iddestinatario}
                        className="flex items-center justify-between px-4 py-2 border-b last:border-b-0"
                      >
                        <div className="text-sm font-medium">
                          {r.nome} {r.cognome}
                        </div>

                        <div className="text-xs text-slate-500 ">
                          {r.email } - { r.telefono}
                        </div>

                        <button
                          onClick={() =>
                            setDestinatariSelezionati((prev) =>
                              prev.filter((id) => id !== r.iddestinatario)
                            )
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  )}
                </div>
              )}

             {/* Filtri Attributi */}
{tipoDestinatari === "attributo" && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-4"
  >
    {/* HEADER */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h3 className="font-medium text-slate-800">
          Filtri Attributi
        </h3>

        <select
          value={matchMode}
          onChange={(e) =>
            setMatchMode(
              e.target.value as
                | "AND"
                | "OR"
            )
          }
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
        >
          <option value="AND">
            AND
          </option>

          <option value="OR">
            OR
          </option>
        </select>
      </div>

      <button
        onClick={() =>
          setShowAttributoDialog(true)
        }
        className="
          px-4
          py-2
          bg-indigo-600
          text-white
          rounded-lg
          hover:bg-indigo-700
          text-sm
        "
      >
        + Aggiungi Filtro
      </button>
    </div>

    {/* LISTA FILTRI */}
    {filtriAttributi.length === 0 && (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-500">
        Nessun filtro aggiunto
      </div>
    )}

    <div className="space-y-4">
      {filtriAttributi.map(
        (filtro, index) => {
          const attribute =
            attributes.find(
              (a) =>
                a.idattributo ===
                filtro.idattributo
            );

          if (!attribute)
            return null;

          return (
            <div
              key={index}
              className="
                bg-slate-50
                border
                border-slate-200
                rounded-xl
                p-4
              "
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-medium text-slate-800">
                    {
                      attribute.nomeattributo
                    }
                  </div>

                  <div className="text-xs text-slate-500">
                    Filtro #
                    {index + 1}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setFiltriAttributi(
                      filtriAttributi.filter(
                        (
                          _,
                          i
                        ) =>
                          i !== index
                      )
                    );
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* BOOLEAN */}
              {attribute.tipoattributo ===
              3 ? (
                <select
                  value={
                    filtro.valore
                  }
                  onChange={(e) => {
                    const updated =
                      [
                        ...filtriAttributi,
                      ];

                    updated[
                      index
                    ].valore =
                      e.target.value;

                    setFiltriAttributi(
                      updated
                    );
                  }}
                  className="
                    w-full
                    px-4
                    py-2
                    border
                    border-slate-300
                    rounded-lg
                  "
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
              ) : attribute.tipoattributo ===
                4 ? (
                <select
                  value={
                    filtro.valore
                  }
                  onChange={(e) => {
                    const updated =
                      [
                        ...filtriAttributi,
                      ];

                    updated[
                      index
                    ].valore =
                      e.target.value;

                    setFiltriAttributi(
                      updated
                    );
                  }}
                  className="
                    w-full
                    px-4
                    py-2
                    border
                    border-slate-300
                    rounded-lg
                  "
                >
                  <option value="">
                    Seleziona
                  </option>

                  {attribute.opzioni?.map(
                    (
                      opzione
                    ) => (
                      <option
                        key={
                          opzione.idopzione
                        }
                        value={
                          opzione.valore
                        }
                      >
                        {
                          opzione.valore
                        }
                      </option>
                    )
                  )}
                </select>
              ) : attribute.tipoattributo ===
                2 ? (
                <input
                  type="number"
                  value={
                    filtro.valore
                  }
                  onChange={(e) => {
                    const updated =
                      [
                        ...filtriAttributi,
                      ];

                    updated[
                      index
                    ].valore =
                      e.target.value;

                    setFiltriAttributi(
                      updated
                    );
                  }}
                  placeholder="Inserisci valore"
                  className="
                    w-full
                    px-4
                    py-2
                    border
                    border-slate-300
                    rounded-lg
                  "
                />
              ) : (
                <input
                  type="text"
                  value={
                    filtro.valore
                  }
                  onChange={(e) => {
                    const updated =
                      [
                        ...filtriAttributi,
                      ];

                    updated[
                      index
                    ].valore =
                      e.target.value;

                    setFiltriAttributi(
                      updated
                    );
                  }}
                  placeholder="Inserisci valore"
                  className="
                    w-full
                    px-4
                    py-2
                    border
                    border-slate-300
                    rounded-lg
                  "
                />
              )}
            </div>
          );
        }
      )}
    </div>
  </motion.div>
)}
              

              {tipoDestinatari === "tutti" && recipients.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
                  Nessun destinatario presente. Aggiungi destinatari nella sezione Gestione
                  Destinatari.
                </div>
              )}

              <div className="bg-slate-50 rounded-lg p-4 mt-4">
                <div className="text-sm text-slate-600">
                  Destinatari selezionati:{" "}
                  <span className="font-semibold text-slate-800">
                    {getDestinatariCount()}
                  </span>
                </div>
              </div>
            </div>

            {/* Oggetto */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Oggetto
              </label>
              <input
                type="text"
                value={oggetto}
                onChange={(e) => setOggetto(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Inserisci l'oggetto della comunicazione"
              />
            </div>

            {/* Contenuto con Formattazione */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Type className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-medium text-slate-800">Contenuto</h2>
                </div>

                {/* Toolbar Formattazione */}
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => applyFormatting("b")}
                    className="p-2 rounded hover:bg-white transition-colors group"
                    title="Grassetto"
                  >
                    <Bold className="w-4 h-4 text-slate-600 group-hover:text-slate-800" />
                  </button>
                  <button
                    onClick={() => applyFormatting("i")}
                    className="p-2 rounded hover:bg-white transition-colors group"
                    title="Corsivo"
                  >
                    <Italic className="w-4 h-4 text-slate-600 group-hover:text-slate-800" />
                  </button>
                  <button
                    onClick={() => applyFormatting("u")}
                    className="p-2 rounded hover:bg-white transition-colors group"
                    title="Sottolineato"
                  >
                    <Underline className="w-4 h-4 text-slate-600 group-hover:text-slate-800" />
                  </button>
                </div>
              </div>

              <textarea
                id="content-editor"
                value={contenuto}
                onChange={(e) => setContenuto(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[200px]"
                placeholder="Scrivi il contenuto della comunicazione"
              />
            </div>

            {/* Links */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Link2 className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-medium text-slate-800">
                  Link <span className="text-sm text-slate-500">({links.length}/3)</span>
                </h2>
              </div>

              <div className="space-y-2 mb-4">
                {links.map((link, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <span className="flex-1 text-sm text-slate-700 truncate">{link}</span>
                    <button
                      onClick={() => removeLink(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {links.length < 3 && (
                <div className="flex gap-2">
                  <input
                    type="url"
                    id="new-link"
                    placeholder="https://esempio.com"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const input = e.target as HTMLInputElement;
                        addLink(input.value);
                        input.value = "";
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById("new-link") as HTMLInputElement;
                      addLink(input.value);
                      input.value = "";
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Aggiungi
                  </button>
                </div>
              )}
            </div>

            {/* Allegati */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Paperclip className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-medium text-slate-800">
                  Allegati <span className="text-sm text-slate-500">({allegati.length}/3)</span>
                </h2>
              </div>

              <div className="space-y-2 mb-4">
                {allegati.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <Paperclip className="w-4 h-4 text-slate-500" />
                    <span className="flex-1 text-sm text-slate-700">{file.name}</span>
                    <span className="text-xs text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      onClick={() => removeAllegato(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {allegati.length < 3 && (
                <label className="block w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-center text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        addAllegato(file);
                        e.target.value = "";
                      }
                    }}
                  />
                  <span className="font-medium">Carica Allegato</span>
                </label>
              )}
            </div>

            {/* Invio */}
            <div className="flex justify-end">
              <button
                onClick={handleInvia}
                disabled={!isValid || loading}
                className="
                  flex items-center justify-center gap-3
                  min-w-[260px]
                  bg-indigo-600
                  text-white
                  px-8
                  py-3
                  rounded-lg
                  hover:bg-indigo-700
                  transition-all
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  shadow-lg
                "
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />

                    <span>Invio comunicazione...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />

                    <span>Invia Comunicazione</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog Selezione Destinatario */}
      <Dialog.Root open={showDestinatarioDialog} onOpenChange={setShowDestinatarioDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-[90vw] max-w-3xl max-h-[80vh] overflow-hidden z-50">
            <div className="p-6 border-b border-slate-200">
              <Dialog.Title className="text-2xl font-semibold text-slate-800 mb-2">
                Seleziona Destinatario
              </Dialog.Title>
              <Dialog.Description className="text-sm text-slate-600 mb-4">
                Scegli un destinatario dalla lista
              </Dialog.Description>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cerca per nome, cognome o email..."
                  value={searchDestinatario}
                  onChange={(e) => setSearchDestinatario(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="overflow-auto max-h-[400px]">
              {filteredRecipients.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  Nessun destinatario trovato
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredRecipients.map((recipient) => (
                    <button
                      key={recipient.iddestinatario}
                      onClick={() => handleSelectDestinatario(recipient.iddestinatario)}
                      className={`w-full px-6 py-4 text-left transition-colors flex justify-between ${
                        destinatariSelezionati.includes(recipient.iddestinatario)
                          ? "bg-indigo-50"
                          : "hover:bg-indigo-50"
                      }`}
                    >
                      <div className="font-medium text-slate-800">
                        {recipient.nome} {recipient.cognome}
                      </div>
                      <div className="text-sm text-slate-600">{recipient.email}</div>
                      <div className="text-sm text-slate-500">{recipient.telefono}</div>
                      {destinatariSelezionati.includes(recipient.iddestinatario) && (
              <CheckCircle className="w-5 h-5 text-indigo-600" />
            )}
                    </button>
                  ))}
                </div>
              )}
            </div>

           <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <Dialog.Close asChild>
                <button className="px-6 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors">
                  Annulla
                </button>
              </Dialog.Close>

              <button
                onClick={() => {
                  if (destinatariSelezionati.length === 0) return;

                  setTipoDestinatari("singolo");
                  setShowDestinatarioDialog(false);
                }}
                disabled={destinatariSelezionati.length === 0}
                className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Conferma ({destinatariSelezionati.length})
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Dialog Selezione Attributo */}
      <Dialog.Root open={showAttributoDialog} onOpenChange={setShowAttributoDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-[90vw] max-w-2xl max-h-[80vh] overflow-hidden z-50">
            <div className="p-6 border-b border-slate-200">
              <Dialog.Title className="text-2xl font-semibold text-slate-800 mb-2">
                Seleziona Attributo
              </Dialog.Title>
              <Dialog.Description className="text-sm text-slate-600 mb-4">
                Scegli un attributo per filtrare i destinatari
              </Dialog.Description>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cerca attributo..."
                  value={searchAttributo}
                  onChange={(e) => setSearchAttributo(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="overflow-auto max-h-[400px] p-6">
              {filteredAttributes.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  Nessun attributo trovato
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAttributes.map((attribute) => (
                    <button
                      key={attribute.idattributo}
                      onClick={() => {
                        setFiltriAttributi([
                          ...filtriAttributi,
                          {
                            idattributo:
                              attribute.idattributo,
                            valore: "",
                          },
                        ]);

                        setTipoDestinatari(
                          "attributo"
                        );

                        setShowAttributoDialog(false);
                      }}
                      className="w-full p-4 border-2 border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
                    >
                      <div className="font-medium text-slate-800">{attribute.nomeattributo}</div>
                      <div className="text-sm text-slate-500 mt-1">
                        Tipo: {
                        attribute.tipoattributo === 1
                          ? "Testo"
                          : attribute.tipoattributo === 2
                          ? "Numero"
                          : attribute.tipoattributo === 3
                          ? "Si/No"
                          : attribute.tipoattributo === 4
                          ? "Menu a Tendina"
                          : "Sconosciuto"
                      }
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <Dialog.Close asChild>
                <button className="px-6 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors">
                  Annulla
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    
    </PageLayout>
  );
}
