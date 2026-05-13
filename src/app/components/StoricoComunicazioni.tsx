import {
  useEffect,
  useState,
} from "react";

import Sidebar from "./Sidebar";

import {
  History,
  Calendar,
  Users,
  Mail,
  MessageCircle,
  Link2,
  Paperclip,
} from "lucide-react";

import {
  format,
} from "date-fns";

import axios from "axios";

import {
  useAuth,
} from "../../hooks/useAuth";

/**
 * TYPES
 */

type Allegato = {
  idallegato: number;
  nomefile: string;
  path: string;
};

type Comunicazione = {
  codsoc: number;
  idcomunicazione: number;

  messaggio: string;

  fstato: number;

  datainserimento: string;

  datainvio: string;

  destinatari?: number[];

  canali?: string[];

  links?: string[];

  allegati?: Allegato[];
};

export default function StoricoComunicazioni() {

  const {
    user,
    hasFunzione,
  } = useAuth();

  /**
   * STATES
   */

  const [
    communications,
    setCommunications,
  ] = useState<
    Comunicazione[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /**
   * FETCH
   */

  const fetchCommunications =
    async () => {

      try {

        const res =
          await axios.get(
            `/api/comunicazioni/${user?.codsoc}`,
            
          );

        setCommunications(
          res.data.data || []
        );

      } catch (err) {

        console.error(err);

        setCommunications([]);

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    if (
      user &&
      hasFunzione(
        "storico"
      )
    ) {

      fetchCommunications();
    }

  }, [user]);

  /**
   * ACL
   */

  if (
    !hasFunzione(
      "storico"
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

          <div className="flex items-center gap-3 mb-6">

            <History className="w-8 h-8 text-emerald-600" />

            <h1 className="text-3xl font-semibold text-slate-800">

              Storico Comunicazioni
            </h1>
          </div>

          <div className="space-y-4">

            {loading ? (

              <div className="bg-white rounded-xl shadow-md p-8 text-center text-slate-500">

                Caricamento...
              </div>

            ) : communications.length === 0 ? (

              <div className="bg-white rounded-xl shadow-md p-12 text-center">

                <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />

                <p className="text-slate-500">

                  Nessuna comunicazione presente
                </p>
              </div>

            ) : (

              communications

                .sort(
                  (a, b) =>

                    new Date(
                      b.datainserimento
                    ).getTime()

                    -

                    new Date(
                      a.datainserimento
                    ).getTime()
                )

                .map((comm) => (

                  <div
                    key={`${comm.codsoc}-${comm.idcomunicazione}`}
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                  >

                    <div className="flex items-start justify-between mb-4">

                      <div className="flex-1">

                        <div className="flex items-center gap-4 text-sm text-slate-600">

                          <div className="flex items-center gap-2">

                            <Calendar className="w-4 h-4" />

                            <span>

                              {
                                format(
                                  new Date(
                                    comm.datainserimento
                                  ),
                                  "dd/MM/yyyy HH:mm"
                                )
                              }
                            </span>
                          </div>

                          <div className="flex items-center gap-2">

                            <Users className="w-4 h-4" />

                            <span>

                              {
                                comm.destinatari?.length || 0
                              } destinatari
                            </span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          comm.fstato === 1
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >

                        {
                          comm.fstato === 1
                            ? "Inviata"
                            : "In coda"
                        }
                      </span>
                    </div>

                    <div className="space-y-4">

                      {/* MESSAGGIO */}

                      <div className="bg-slate-50 rounded-lg p-4">

                        <p className="text-slate-700 whitespace-pre-wrap">

                          {comm.messaggio}
                        </p>
                      </div>

                      {/* CANALI */}

                      {comm.canali &&
                        comm.canali.length > 0 && (

                        <div className="flex items-center gap-2 text-sm">

                          <span className="text-slate-600">

                            Canali:
                          </span>

                          {comm.canali.map(
                            (canale) => (

                              <span
                                key={canale}
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
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

                                {
                                  canale === "email"
                                    ? "Email"
                                    : "WhatsApp"
                                }
                              </span>
                            )
                          )}
                        </div>
                      )}

                      {/* LINKS */}

                      {comm.links &&
                        comm.links.length > 0 && (

                        <div>

                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">

                            <Link2 className="w-4 h-4" />

                            <span>

                              Links
                            </span>
                          </div>

                          <div className="space-y-1">

                            {comm.links.map(
                              (
                                link,
                                idx
                              ) => (

                                <a
                                  key={idx}
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-sm text-indigo-600 hover:underline truncate"
                                >

                                  {link}
                                </a>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* ALLEGATI */}

                      {comm.allegati &&
                        comm.allegati.length > 0 && (

                        <div>

                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">

                            <Paperclip className="w-4 h-4" />

                            <span>

                              Allegati
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">

                            {comm.allegati.map(
                              (
                                allegato
                              ) => (

                                <a
                                  key={allegato.idallegato}
                                  href={`http://localhost:8000/${allegato.path}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100"
                                >

                                  {
                                    allegato.nomefile
                                  }
                                </a>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}