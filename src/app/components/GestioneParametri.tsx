import { useEffect, useState } from "react";
import axios from "axios";
import PageLayout from "./PageLayout";
import {Settings2,Save,RefreshCcw,CheckCircle2,AlertCircle,} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";

type Parametro = {
    codsoc: number;
    codparametro: string;
    valore: string;
    desparametro: string;
};

type Feedback = {
    type: "success" | "error";
    message: string;
};
export default function GestioneParametri(){
    const { user, hasFunzione } = useAuth();
    const [parametri, setParametri] = useState<Parametro[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    const fetchParametri = async () => {
        try{
            setLoading(true);
            const res = await axios.get(`/api/parametri/${user?.codsoc}`);
            setParametri(res.data.data || []);
        }catch(err:any){
            console.error(err);
            setFeedback({
                type: "error",
                message:
                err?.response?.data?.message ||
                "Errore durante il caricamento dei parametri",
            })
        }finally{
            setLoading(false);
        }
    }
    useEffect(() => {
      if(user && hasFunzione('gestione-parametri')){
        fetchParametri();
      }  
    }, [user]);
    useEffect( () => {
        if(!feedback) return;
        const timer = setTimeout(() =>{
            setFeedback(null);
        }, 4000);
        return () => clearTimeout(timer);
    }, [feedback]);

    const handleChange = (codparametro: string, valore: string) => {
        setParametri((prev) =>
            prev.map((p) =>
                p.codparametro === codparametro ? {
                    ...p,
                    valore,
                }
                :p
            )
        );
    };

    const handleSave = async () => {
        try{
            setSaving(true);

            await axios.post(
                `/api/parametri/${user?.codsoc}`,
                {
                parametri,
                }
            );

            setFeedback({
                type: "success",
                message:
                "Parametri salvati correttamente",
            });
        }catch(err:any){
            console.error(err);

            setFeedback({
                type: "error",
                message:
                err?.response?.data?.message ||
                "Errore durante il salvataggio",
            });
        }finally {
            setSaving(false);

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };
    
    if (!hasFunzione("gestione-parametri")) {
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

        {/* HEADER */}

        <div className="flex items-center justify-between mb-8">

          <div className="flex items-center gap-3">

            <Settings2 className="w-8 h-8 text-indigo-600" />

            <div>

              <h1 className="text-3xl font-semibold text-slate-800">
                Parametri Società
              </h1>

              <p className="text-slate-500 mt-1">
                Configurazione generale applicativa
              </p>

            </div>
          </div>

          <div className="flex gap-3">

            <button
              onClick={fetchParametri}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 transition-colors"
            >

              <RefreshCcw className="w-4 h-4" />

              Aggiorna

            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >

              <Save className="w-4 h-4" />

              {saving
                ? "Salvataggio..."
                : "Salva Parametri"}

            </button>
          </div>
        </div>

        {/* FEEDBACK */}

        {feedback && (

          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
              feedback.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >

            <div className="flex items-center gap-2">

              {feedback.type === "success" ? (

                <CheckCircle2 className="w-5 h-5" />

              ) : (

                <AlertCircle className="w-5 h-5" />

              )}

              {feedback.message}

            </div>

          </motion.div>
        )}

        {/* CARD */}

        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">

          {loading ? (

            <div className="p-10 text-center text-slate-500">
              Caricamento parametri...
            </div>

          ) : parametri.length === 0 ? (

            <div className="p-10 text-center text-slate-500">
              Nessun parametro configurato
            </div>

          ) : (

            <div className="divide-y divide-slate-100">

              {parametri.map((parametro) => (

                <div
                  key={parametro.codparametro}
                  className="p-6 grid grid-cols-12 gap-6 items-start"
                >

                  <div className="col-span-4">

                    <div className="font-medium text-slate-800">
                      {parametro.codparametro}
                    </div>

                    <div className="text-sm text-slate-500 mt-1">
                      {parametro.desparametro}
                    </div>

                  </div>

                  <div className="col-span-8">

                    

                      <input
                        type="text"
                        value={parametro.valore}
                        onChange={(e) =>
                          handleChange(
                            parametro.codparametro,
                            e.target.value
                          )
                        }
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />

                    

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>

  </PageLayout>
);
}