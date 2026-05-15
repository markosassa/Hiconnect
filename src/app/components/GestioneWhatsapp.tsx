import { useEffect, useState } from "react";
import PageLayout from "./PageLayout";
import {
  MessageCircle,
  QrCode,
  Power,
  Trash2,
  Wifi,
  WifiOff,
  RefreshCcw,
} from "lucide-react";
import { motion } from "motion/react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";

type WhatsappStatus = {
  connected: boolean;
  status: string;
  label: string;
  qrcode: string | null;
};

type WhatsappAccountInfo = {
  pushName?: string;
  wid?: string;
};

export default function GestioneWhatsapp() {

  const { user, hasFunzione } = useAuth();

  const isSuperAdmin =
    hasFunzione("whatsapp-admin");

  const [loading, setLoading] =
    useState(false);

  const [status, setStatus] =
    useState<WhatsappStatus>({
      connected: false,
      status: "",
      label: "",
      qrcode: null,
    });

  const [accountInfo, setAccountInfo] =
    useState<WhatsappAccountInfo | null>(
      null
    );

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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

  const fetchStatus = async () => {

    try {

      setLoading(true);

      // STATUS
      const res = await axios.get(
        `/api/whatsapp/status/${user?.codsoc}`
      );

      const data = res.data.data;

      let qrCode: string | null = null;

      let accountData:
        WhatsappAccountInfo | null = null;

      // QR CODE
      if (data.status === "qr") {

        const qrRes = await axios.get(
          `/api/whatsapp/qrcode/${user?.codsoc}`
        );

        const qrData = qrRes.data.data;

        qrCode =
          qrData.startsWith("data:image")
            ? qrData
            : `data:image/png;base64,${qrData}`;
      }

      // ACCOUNT INFO
      if (
        data.status === "authenticated"
      ) {

        const meRes = await axios.get(
          `/api/whatsapp/me/${user?.codsoc}`,
          
        );

        accountData = {
          pushName:
            meRes.data.data?.pushName ||
            meRes.data.data?.name ||
            "",

          wid:
            meRes.data.data?.wid ||
            meRes.data.data?.id ||
            "",
        };
      }

      setAccountInfo(accountData);

      setStatus({
        connected: data.connected,
        status: data.status,
        label: data.label,
        qrcode: qrCode,
      });

    } catch (err) {

      setAlert({
        type: "error",
        message: getErrorMessage(err),
      });

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    fetchStatus();

    const interval = setInterval(() => {
      fetchStatus();
    }, 10000);

    return () => clearInterval(interval);

  }, []);

  useEffect(() => {

    if (!alert) return;

    const timer = setTimeout(() => {
      setAlert(null);
    }, 4000);

    return () => clearTimeout(timer);

  }, [alert]);

  const handleRestart = async () => {

    try {

      setLoading(true);

      await axios.post(
        `/api/whatsapp/restart/${user?.codsoc}`
      );

      setAlert({
        type: "success",
        message:
          "Richiesta riavvio inviata",
      });

      await fetchStatus();

    } catch (err) {

      setAlert({
        type: "error",
        message: getErrorMessage(err),
      });

    } finally {

      setLoading(false);
    }
  };

  const handleDisconnect = async () => {

    if (
      !confirm(
        "Sei sicuro di voler disconnettere WhatsApp?"
      )
    ) {
      return;
    }

    try {

      setLoading(true);

      await axios.post(
        `/api/whatsapp/disconnect/${user?.codsoc}`
      );

      setAlert({
        type: "success",
        message:
          "WhatsApp disconnesso correttamente",
      });

      await fetchStatus();

    } catch (err) {

      setAlert({
        type: "error",
        message: getErrorMessage(err),
      });

    } finally {

      setLoading(false);
    }
  };

  const handleQueueCleanup = async () => {

    if (
      !confirm(
        "Vuoi eliminare tutti i messaggi in coda?"
      )
    ) {
      return;
    }

    try {

      setLoading(true);

      await axios.post(
        `/api/whatsapp/clear-queue/${user?.codsoc}`
      );

      setAlert({
        type: "success",
        message:
          "Coda messaggi pulita correttamente",
      });

    } catch (err) {

      setAlert({
        type: "error",
        message: getErrorMessage(err),
      });

    } finally {

      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="bg-slate-50 p-4 md:p-8">

        <div className="max-w-5xl mx-auto">

          {/* HEADER */}

          <div className="flex items-center gap-3 mb-6">

            <MessageCircle className="w-8 h-8 text-green-600" />

            <h1 className="text-3xl font-semibold text-slate-800">
              Gestione WhatsApp
            </h1>
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

          {/* STATUS */}

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md p-6 mb-6"
          >

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-xl font-semibold text-slate-800 mb-2">
                  Stato Connessione
                </h2>

                <div className="flex items-center gap-2">

                  {status.connected ? (
                    <>
                      <Wifi className="w-5 h-5 text-green-600" />

                      <span className="text-green-600 font-medium">
                        Connesso
                      </span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-5 h-5 text-red-600" />

                      <span className="text-red-600 font-medium">
                        Non connesso
                      </span>
                    </>
                  )}
                </div>

                <p className="text-slate-500 text-sm mt-2">
                  {status.label}
                </p>
              </div>

              <button
                onClick={fetchStatus}
                disabled={loading}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg"
              >
                <RefreshCcw className="w-4 h-4" />
                Aggiorna
              </button>
            </div>
          </motion.div>

          {/* ACCOUNT INFO */}

          {status.connected &&
            accountInfo && (

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md p-6 mb-6"
            >

              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Account Collegato
              </h2>

              <div className="space-y-4">

                <div>

                  <p className="text-sm text-slate-500">
                    Nome Account
                  </p>

                  <p className="text-lg font-medium text-slate-800">
                    {accountInfo.pushName || "-"}
                  </p>
                </div>

                <div>

                  <p className="text-sm text-slate-500">
                    Numero WhatsApp
                  </p>

                  <p className="text-lg font-medium text-slate-800">
                    {accountInfo.wid || "-"}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* QR CODE */}

          {isSuperAdmin &&
            status.status === "qr" &&
            status.qrcode && (

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md p-6 mb-6"
            >

              <div className="flex items-center gap-3 mb-4">

                <QrCode className="w-6 h-6 text-slate-700" />

                <h2 className="text-xl font-semibold text-slate-800">
                  QRCode Connessione
                </h2>
              </div>

              <div className="flex justify-center">

                <img
                  src={status.qrcode}
                  alt="QRCode WhatsApp"
                  className="w-72 h-72 object-contain border rounded-xl p-4"
                />
              </div>

              <p className="text-center text-slate-500 mt-4 text-sm">
                Scansiona il QRCode con WhatsApp
              </p>
            </motion.div>
          )}

          {/* ACTIONS */}

          {isSuperAdmin && (

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md p-6"
            >

              <h2 className="text-xl font-semibold text-slate-800 mb-6">
                Azioni Amministrative
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <button
                  onClick={handleRestart}
                  
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl disabled:opacity-50"
                >
                  <RefreshCcw className="w-5 h-5" />
                  Riavvia
                </button>

                <button
                  onClick={handleDisconnect}
                  disabled={
                    loading ||
                    !status.connected
                  }
                  className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl disabled:opacity-50"
                >
                  <WifiOff className="w-5 h-5" />
                  Disconnetti
                </button>

                <button
                  onClick={handleQueueCleanup}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-3 rounded-xl disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5" />
                  Pulizia Coda
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}