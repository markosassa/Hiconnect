import Sidebar from "./Sidebar";
import { User, AppState } from "../App";
import { History, Calendar, Users, Mail, MessageCircle, Link2, Paperclip } from "lucide-react";
import { format } from "date-fns";

interface StoricoComunicazioniProps {
  currentUser: User;
  onLogout: () => void;
  appState: AppState;
}

export default function StoricoComunicazioni({
  currentUser,
  onLogout,
  appState,
}: StoricoComunicazioniProps) {
  const getDestinatariText = (comm: any) => {
    if (comm.tipoDestinatari === "tutti") {
      return `Tutti i destinatari (${comm.destinatari.length})`;
    } else if (comm.tipoDestinatari === "singolo") {
      const recipient = appState.recipients.find(
        (r) => r.id === comm.destinatari[0]
      );
      return recipient
        ? `${recipient.nome} ${recipient.cognome}`
        : "Destinatario eliminato";
    } else if (comm.tipoDestinatari === "attributo" && comm.filtroAttributo) {
      const attr = appState.attributes.find(
        (a) => a.id === comm.filtroAttributo.attributoId
      );
      return `Filtro: ${attr?.nome || "N/A"} = ${comm.filtroAttributo.valore} (${
        comm.destinatari.length
      })`;
    }
    return "N/A";
  };

  return (
    <div className="flex">
      <Sidebar currentUser={currentUser} onLogout={onLogout} />
      <div className="flex-1 bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <History className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-semibold text-slate-800">
              Storico Comunicazioni
            </h1>
          </div>

          <div className="space-y-4">
            {appState.communications.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">
                  Nessuna comunicazione inviata. Inizia creando una nuova comunicazione.
                </p>
              </div>
            ) : (
              appState.communications
                .sort(
                  (a, b) =>
                    new Date(b.data).getTime() - new Date(a.data).getTime()
                )
                .map((comm) => (
                  <div
                    key={comm.id}
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                          {comm.oggetto}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {format(new Date(comm.data), "dd/MM/yyyy HH:mm")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{getDestinatariText(comm)}</span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          comm.tipoDestinatari === "tutti"
                            ? "bg-purple-100 text-purple-700"
                            : comm.tipoDestinatari === "singolo"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {comm.tipoDestinatari === "tutti"
                          ? "Broadcast"
                          : comm.tipoDestinatari === "singolo"
                          ? "Singolo"
                          : "Filtrato"}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-slate-700 whitespace-pre-wrap">
                          {comm.contenuto}
                        </p>
                      </div>

                      {/* Canali di Invio */}
                      {comm.canaliInvio && comm.canaliInvio.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-600">Canali:</span>
                          {comm.canaliInvio.map((canale) => (
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
                              {canale === "email" ? "Email" : "WhatsApp"}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Links */}
                      {comm.links && comm.links.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                            <Link2 className="w-4 h-4" />
                            <span>Link allegati:</span>
                          </div>
                          <div className="space-y-1">
                            {comm.links.map((link, idx) => (
                              <a
                                key={idx}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-sm text-indigo-600 hover:text-indigo-700 hover:underline truncate"
                              >
                                {link}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Allegati */}
                      {comm.allegati && comm.allegati.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                            <Paperclip className="w-4 h-4" />
                            <span>Allegati:</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {comm.allegati.map((allegato, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                              >
                                {allegato}
                              </span>
                            ))}
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
