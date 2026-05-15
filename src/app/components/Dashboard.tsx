import { useEffect, useState } from "react";
import axios from "axios";
import PageLayout from "./PageLayout";

import {
  Activity,
  AlertTriangle,
  Users,
  Send,
  Mail,
  MessageCircle,
  Server,
  Clock3,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Plus,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { motion } from "framer-motion";

import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

type DashboardStats = {
  comunicazioni_oggi: number;
  comunicazioni_fallite: number;
  destinatari_totali: number;
  utenti_attivi: number;
  jobs_processing: number;
  whatsapp_online: number;
  whatsapp_totali: number;
};

type ComunicazioneRecente = {
  idcomunicazione: number;
  oggetto: string;
  stato: string;
  created_at: string;
  canali: string[];
};

type JobRecente = {
  id: number;
  job_name: string;
  queue: string;
  status: string;
  started_at: string;
};

type ChartItem = {
  giorno: string;
  email: number;
  whatsapp: number;
};

export default function Dashboard() {
  const { user, hasFunzione } = useAuth();

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [chartData, setChartData] = useState<ChartItem[]>([]);



  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const [
        statsRes,
        chartRes,
        comunicazioniRes,
        jobsRes,
      ] = await Promise.all([
        axios.get(`/api/dashboard/stats`, {
          params: {
            codsoc: user?.codsoc,
          },
        }),

        axios.get(`/api/dashboard/chart`, {
          params: {
            codsoc: user?.codsoc,
          },
        }),

        axios.get(`/api/dashboard/comunicazioni`, {
          params: {
            codsoc: user?.codsoc,
          },
        }),

        axios.get(`/api/monitoring/jobs?page=1`),
      ]);

      setStats(statsRes.data.data);

      setChartData(chartRes.data.data || []);

      

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboard();

      const interval = setInterval(() => {
        fetchDashboard();
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [user]);

  

  return (
    <PageLayout>
      <div className="bg-slate-50">
        <div className="max-w-7xl mx-auto">

        <div className="max-w-7xl mx-auto">

          {/* HEADER */}

          <div className="flex items-center justify-between mb-8">

            <div>

              <h1 className="text-3xl font-bold text-slate-800">
                Dashboard
              </h1>

              <p className="text-slate-500 mt-1">
                Monitoraggio comunicazioni e sistema
              </p>
            </div>

            <button
              onClick={fetchDashboard}
              className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Aggiorna
            </button>
          </div>

          {/* QUICK ACTIONS */}

          <div className="grid grid-cols-3 gap-4 mb-8">

            <QuickAction
              title="Nuova Comunicazione"
              icon={<Send className="w-5 h-5" />}
              to="/comunicazioni/nuova"
            />

            <QuickAction
              title="Nuovo Destinatario"
              icon={<Users className="w-5 h-5" />}
              to="/destinatari"
            />
            <QuickAction
              title="Nuovo Attributo"
              icon={<Users className="w-5 h-5" />}
              to="/attributi"
            />

            

          </div>

          {/* STATS */}

          <div className="grid grid-cols-4 gap-6 mb-8">

            <StatsCard
              title="Comunicazioni Oggi"
              value={stats?.comunicazioni_oggi || 0}
              icon={<Send className="w-6 h-6" />}
            />

            <StatsCard
              title="Comunicazioni Fallite"
              value={stats?.comunicazioni_fallite || 0}
              icon={<AlertTriangle className="w-6 h-6" />}
            />

            <StatsCard
              title="Destinatari"
              value={stats?.destinatari_totali || 0}
              icon={<Users className="w-6 h-6" />}
            />

            <StatsCard
              title="Utenti Attivi"
              value={stats?.utenti_attivi || 0}
              icon={<Activity className="w-6 h-6" />}
            />

          </div>

          {/* SECONDARY STATS */}

          <div className="grid grid-cols-2 gap-6 mb-8">

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-800">
                  Stato Email
                </h2>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">
                  SMTP operativo
                </span>

                <span className="flex items-center gap-2 text-green-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Online
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

              <div className="flex items-center gap-3 mb-4">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-slate-800">
                  WhatsApp
                </h2>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">
                  Sessioni attive
                </span>

                <span className="font-semibold text-slate-800">
                  {stats?.whatsapp_online || 0}/
                  {stats?.whatsapp_totali || 0}
                </span>
              </div>
            </div>

            

          </div>

          {/* CHART */}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Comunicazioni Ultimi Giorni
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Email e WhatsApp inviati
                </p>
              </div>
            </div>

            <div className="h-[350px]">

              <ResponsiveContainer width="100%" height="100%">

                <LineChart data={chartData}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="giorno" />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="email"
                    stroke="#4f46e5"
                    strokeWidth={3}
                  />

                  <Line
                    type="monotone"
                    dataKey="whatsapp"
                    stroke="#16a34a"
                    strokeWidth={3}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* TABLES */}

          

          {/* FOOTER */}

          <div className="mt-10 text-center text-sm text-slate-400">
            Dashboard aggiornata automaticamente ogni 15 secondi
          </div>

        </div>

        </div>
      </div>
    </PageLayout>
  );
}

function StatsCard({
  title,
  value,
  icon,
}: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <div className="flex items-center justify-between mb-5">

        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
          {icon}
        </div>

      </div>

      <div className="text-3xl font-bold text-slate-800">
        {value}
      </div>

      <div className="text-slate-500 mt-2 text-sm">
        {title}
      </div>

    </div>
  );
}

function QuickAction({
  title,
  icon,
  to,
}: any) {
  return (
    <Link
      to={to}
      className="bg-white border border-slate-200 rounded-2xl p-5 hover:bg-slate-100 transition-all flex items-center gap-4"
    >

      <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
        {icon}
      </div>

      <div>

        <div className="font-medium text-slate-800">
          {title}
        </div>

        <div className="text-sm text-slate-500 mt-1 flex items-center gap-1">
          <Plus className="w-3 h-3" />
          Apri
        </div>

      </div>

    </Link>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {

  if (status === "failed") {
    return (
      <span className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
        <XCircle className="w-3 h-3" />
        Failed
      </span>
    );
  }

  if (status === "completed") {
    return (
      <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
        <CheckCircle2 className="w-3 h-3" />
        Completed
      </span>
    );
  }

  return (
    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">
      Processing
    </span>
  );
}
