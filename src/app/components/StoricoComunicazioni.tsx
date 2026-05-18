import { useEffect, useState, useMemo } from "react";
import PageLayout from "./PageLayout";
import {
  History,
  Calendar,
  Users,
  Mail,
  MessageCircle,
  Link2,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
} from "lucide-react";
import { format } from "date-fns";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";

/**
 * TYPES
 */
type Allegato = {
  idallegato: number;
  nomefile: string;
  path: string;
};
type Ordinamento = {
  campo:
    | "datainserimento"
    | "messaggio"
    | "num_destinatari"
    | "canali"
    | "fstato";

  direzione: "asc" | "desc";
};
type Link = {
  idlink: number;
  url: string;
};
type Comunicazione = {
  codsoc: number;
  idcomunicazione: number;
  messaggio: string;
  fstato: number;
  datainserimento: string;
  datainvio: string | null;
  num_destinatari: number;
  canali?: string[];
  links?: Link[];
  allegati?: Allegato[];
};
type Destinatario = {
  iddestinatario: number;
  nome: string;
  cognome: string;
  email?: string;
  telefono?: string;
};
type Filtri = {
  dataFrom: string;
  dataTo: string;
  stato: "" | "0" | "1" | "-1";
  canale: "" | "email" | "whatsapp";
};

const FILTRI_DEFAULT: Filtri = {
  dataFrom: "",
  dataTo: "",
  stato: "",
  canale: "",
};

/**
 * BADGE STATO
 */
function StatoBadge({ fstato }: { fstato: number }) {
  if (fstato === 1)
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        Inviata
      </span>
    );
  if (fstato === -1)
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
        Errore
      </span>
    );
  return (
    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
      In coda
    </span>
  );
}

/**
 * RIGA ESPANDIBILE
 */
function RigaComunicazione({
  comm,
  onOpenDestinatari,
}: {
  comm: Comunicazione;
  onOpenDestinatari: (comm: Comunicazione) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const hasDetails =
    (comm.links && comm.links.length > 0) ||
    (comm.allegati && comm.allegati.length > 0);

  return (
    <>
      <tr
        className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
          expanded ? "bg-slate-50" : "bg-white"
        }`}
      >
        {/* DATA */}
        <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            {format(new Date(comm.datainserimento), "HH:mm dd/MM/yyyy ")}
          </div>
        </td>

        {/* MESSAGGIO */}
        <td className="px-4 py-3 text-sm text-slate-700 max-w-xs">
          <p className="truncate">{comm.messaggio}</p>
        </td>

        {/* DESTINATARI */}
        <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
          <button
            onClick={() => onOpenDestinatari(comm)}
            className="flex items-center gap-1 hover:text-indigo-600 transition-colors group"
            aria-label="Vedi destinatari"
          >
            <Users className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            <span className="group-hover:underline">
              {comm.num_destinatari}
            </span>
          </button>
        </td>

        {/* CANALI */}
        <td className="px-4 py-3">
          <div className="flex gap-1 flex-wrap">
            {comm.canali?.map((canale) => (
              <span
                key={canale}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  canale === "email"
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {canale === "email" ? (
                  <Mail className="w-3 h-3" />
                ) : (
                  <MessageCircle className="w-3 h-3" />
                )}
                {canale === "email" ? "Email" : "WhatsApp"}
              </span>
            ))}
          </div>
        </td>

        {/* STATO */}
        <td className="px-4 py-3 whitespace-nowrap">
          <StatoBadge fstato={comm.fstato} />
        </td>

        {/* ESPANDI */}
        <td className="px-4 py-3 text-center">
          {hasDetails && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={expanded ? "Chiudi dettagli" : "Apri dettagli"}
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </td>
      </tr>

      {/* RIGA DETTAGLIO ESPANSA */}
      {expanded && (
        <tr className="bg-slate-50 border-b border-slate-100">
          <td colSpan={6} className="px-6 py-4">
            <div className="space-y-3">
              {/* MESSAGGIO COMPLETO */}
              <div className="bg-white rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap border border-slate-100">
                {comm.messaggio}
              </div>

              {/* LINKS */}
              {comm.links && comm.links.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <Link2 className="w-3 h-3" />
                    Links
                  </div>
                  <div className="space-y-1">
                    {comm.links.map((link, idx) => (
                      <a
                        key={link.idlink}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-indigo-600 hover:underline truncate"
                      >
                        {link.url}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* ALLEGATI */}
              {comm.allegati && comm.allegati.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <Paperclip className="w-3 h-3" />
                    Allegati
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {comm.allegati.map((allegato) => (
                      <a
                        key={allegato.idallegato}
                        href={`/${allegato.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100"
                      >
                        {allegato.nomefile}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
function PopupDestinatari({
  comm,
  onClose,
}: {
  comm: Comunicazione;
  onClose: () => void;
}) {
  const { user } = useAuth();

  const [destinatari, setDestinatari] = useState<Destinatario[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestinatari = async () => {
      try {
        const res = await axios.get(
          `/api/comunicazioni/${user?.codsoc}/${comm.idcomunicazione}/destinatari`
        );

        setDestinatari(res.data.data || []);
      } catch {
        setDestinatari([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinatari();
  }, [comm.idcomunicazione, user?.codsoc]);

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 overflow-hidden">
        <div className="px-5 py-4 border-b flex justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />

            <span>Destinatari</span>

            <span className="bg-slate-100 px-2 rounded-full text-xs">
              {comm.num_destinatari}
            </span>
          </div>

          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[500px] overflow-auto">
          {loading ? (
            <div className="p-6 text-center">Caricamento...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">Nome</th>

                  <th className="px-4 py-3 text-left">Email</th>

                  <th className="px-4 py-3 text-left">WhatsApp</th>
                </tr>
              </thead>

              <tbody>
                {destinatari.map((d) => (
                  <tr
                    key={d.iddestinatario}
                    className="border-b hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      {d.nome} {d.cognome}
                    </td>

                    <td className="px-4 py-3">{d.email || "-"}</td>

                    <td className="px-4 py-3">{d.telefono || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
/**
 * PANNELLO FILTRI
 */
function PanelloFiltri({
  filtri,
  onChange,
  onReset,
  totale,
  filtrati,
}: {
  filtri: Filtri;
  onChange: (f: Partial<Filtri>) => void;
  onReset: () => void;
  totale: number;
  filtrati: number;
}) {
  const attivi = Object.values(filtri).filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Filter className="w-4 h-4 text-slate-400" />
          Filtri
          {attivi > 0 && (
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
              {attivi} {attivi === 1 ? "attivo" : "attivi"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            {filtrati} di {totale} comunicazioni
          </span>
          {attivi > 0 && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
              Azzera
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* DATA DAL */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Dal</label>
          <input
            type="date"
            value={filtri.dataFrom}
            onChange={(e) => onChange({ dataFrom: e.target.value })}
            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* DATA AL */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Al</label>
          <input
            type="date"
            value={filtri.dataTo}
            min={filtri.dataFrom || undefined}
            onChange={(e) => onChange({ dataTo: e.target.value })}
            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* STATO */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Stato</label>
          <select
            value={filtri.stato}
            onChange={(e) =>
              onChange({ stato: e.target.value as Filtri["stato"] })
            }
            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Tutti</option>
            <option value="1">Inviata</option>
            <option value="0">In coda</option>
            <option value="-1">Errore</option>
          </select>
        </div>

        {/* CANALE */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Canale</label>
          <select
            value={filtri.canale}
            onChange={(e) =>
              onChange({ canale: e.target.value as Filtri["canale"] })
            }
            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Tutti</option>
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
      </div>
    </div>
  );
}

/**
 * STORICO COMUNICAZIONI
 */
export default function StoricoComunicazioni() {
  const { user, hasFunzione } = useAuth();
  const [ordinamento, setOrdinamento] = useState<Ordinamento>({
    campo: "datainserimento",
    direzione: "desc",
  });
  const [communications, setCommunications] = useState<Comunicazione[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtri, setFiltri] = useState<Filtri>(FILTRI_DEFAULT);
  const [commSelezionata, setCommSelezionata] = useState<Comunicazione | null>(
    null
  );
  const [paginaCorrente, setPaginaCorrente] = useState(1);

  const elementiPerPagina = 10;
  const fetchCommunications = async () => {
    try {
      const res = await axios.get(`/api/comunicazioni/${user?.codsoc}`);
      setCommunications(res.data.data || []);
    } catch (err) {
      console.error(err);
      setCommunications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && hasFunzione("storico")) {
      fetchCommunications();
    }
  }, [user]);

  useEffect(() => {
    setPaginaCorrente(1);
  }, [filtri]);

  const iconaOrdinamento = (campo: Ordinamento["campo"]) => {
    if (ordinamento.campo !== campo) {
      return null;
    }

    return ordinamento.direzione === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };
  /**
   * FILTRO IN MEMORIA — nessuna chiamata API extra al cambio filtro
   */
  const comunicazioniFiltrate = useMemo(() => {
    return communications.filter((comm) => {
      if (filtri.dataFrom) {
        const from = new Date(filtri.dataFrom);
        from.setHours(0, 0, 0, 0);
        if (new Date(comm.datainserimento) < from) return false;
      }

      if (filtri.dataTo) {
        const to = new Date(filtri.dataTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(comm.datainserimento) > to) return false;
      }

      if (filtri.stato !== "" && comm.fstato !== Number(filtri.stato))
        return false;

      if (filtri.canale && !comm.canali?.includes(filtri.canale)) return false;

      return true;
    });
  }, [communications, filtri]);
  const totalePagine = Math.ceil(
    comunicazioniFiltrate.length / elementiPerPagina
  );
  const cambiaOrdinamento = (campo: Ordinamento["campo"]) => {
    setOrdinamento((prev) => {
      if (prev.campo === campo) {
        return {
          campo,
          direzione: prev.direzione === "asc" ? "desc" : "asc",
        };
      }

      return {
        campo,
        direzione: "asc",
      };
    });
  };
  const comunicazioniOrdinate = useMemo(() => {
    const dati = [...comunicazioniFiltrate];

    dati.sort((a, b) => {
      let valoreA: any = a[ordinamento.campo];

      let valoreB: any = b[ordinamento.campo];

      if (ordinamento.campo === "datainserimento") {
        valoreA = new Date(valoreA).getTime();

        valoreB = new Date(valoreB).getTime();
      }

      if (ordinamento.campo === "messaggio") {
        valoreA = valoreA.toLowerCase();

        valoreB = valoreB.toLowerCase();
      }

      if (valoreA < valoreB) {
        return ordinamento.direzione === "asc" ? -1 : 1;
      }

      if (valoreA > valoreB) {
        return ordinamento.direzione === "asc" ? 1 : -1;
      }

      return 0;
    });

    return dati;
  }, [comunicazioniFiltrate, ordinamento]);

  const comunicazioniPaginate = useMemo(() => {
    const start = (paginaCorrente - 1) * elementiPerPagina;

    return comunicazioniOrdinate.slice(start, start + elementiPerPagina);
  }, [comunicazioniOrdinate, paginaCorrente]);
  if (!hasFunzione("storico")) {
    return <div className="p-6 text-red-600">Accesso negato</div>;
  }

  return (
    <PageLayout>
      <div className="bg-slate-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* HEADER */}
          <div className="flex items-center gap-3 mb-6">
            <History className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl font-semibold text-slate-800">
              Storico Comunicazioni
            </h1>
          </div>

          {/* FILTRI — visibili solo se ci sono dati */}
          {!loading && communications.length > 0 && (
            <PanelloFiltri
              filtri={filtri}
              onChange={(parziali) => setFiltri((f) => ({ ...f, ...parziali }))}
              onReset={() => setFiltri(FILTRI_DEFAULT)}
              totale={communications.length}
              filtrati={comunicazioniFiltrate.length}
            />
          )}

          {/* LOADING */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center text-slate-500">
              Caricamento...
            </div>
          ) : /* NESSUNA COMUNICAZIONE */
          communications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Nessuna comunicazione presente</p>
            </div>
          ) : /* NESSUN RISULTATO CON FILTRI ATTIVI */
          comunicazioniFiltrate.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Filter className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-3">
                Nessuna comunicazione corrisponde ai filtri selezionati
              </p>
              <button
                onClick={() => setFiltri(FILTRI_DEFAULT)}
                className="text-sm text-indigo-600 hover:underline"
              >
                Azzera filtri
              </button>
            </div>
          ) : (
            /* TABELLA */
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] table-auto">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3">
                        <button
                          onClick={() => cambiaOrdinamento("datainserimento")}
                          className="
     flex items-center gap-1
   "
                        >
                          Data
                          {iconaOrdinamento("datainserimento")}
                        </button>
                      </th>

                      <th className="px-4 py-3">
                        <button
                          onClick={() => cambiaOrdinamento("messaggio")}
                          className="
      flex items-center gap-1
   "
                        >
                          Messaggio
                          {iconaOrdinamento("messaggio")}
                        </button>
                      </th>

                      <th className="px-4 py-3">
                        <button
                          onClick={() => cambiaOrdinamento("num_destinatari")}
                          className="
      flex items-center gap-1
   "
                        >
                          Destinatari
                          {iconaOrdinamento("num_destinatari")}
                        </button>
                      </th>

                      <th className="px-4 py-3">
                        <button
                          onClick={() => cambiaOrdinamento("fstato")}
                          className="
      flex items-center gap-1
   "
                        >
                          Stato
                          {iconaOrdinamento("fstato")}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comunicazioniPaginate.map((comm) => (
                      <RigaComunicazione
                        key={`${comm.codsoc}-${comm.idcomunicazione}`}
                        comm={comm}
                        onOpenDestinatari={setCommSelezionata}
                      />
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-between items-center px-4 py-4 border-t">
                  <div className="text-sm text-slate-500">
                    Pagina {paginaCorrente} di {totalePagine}
                  </div>

                  <div className="flex gap-2">
                    <button
                      disabled={paginaCorrente === 1}
                      onClick={() => setPaginaCorrente((p) => p - 1)}
                      className="
                            px-3 py-1 border rounded
                            disabled:opacity-50
                        "
                    >
                      Precedente
                    </button>

                    <button
                      disabled={paginaCorrente === totalePagine}
                      onClick={() => setPaginaCorrente((p) => p + 1)}
                      className="
                            px-3 py-1 border rounded
                            disabled:opacity-50
                        "
                    >
                      Successiva
                    </button>
                  </div>
                </div>
              </div>
              {commSelezionata && (
                <PopupDestinatari
                  comm={commSelezionata}
                  onClose={() => setCommSelezionata(null)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
