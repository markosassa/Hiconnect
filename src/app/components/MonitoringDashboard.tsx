import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from "./Sidebar";

import {
  Activity,
  AlertTriangle,
  Users,
  Server,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function MonitoringDashboard() {

  const [stats, setStats] = useState<any>(null);

  const [jobs, setJobs] = useState<any[]>([]);

  const [accessLogs, setAccessLogs] = useState<any[]>([]);

  /**
   * PAGINATION
   */

  const [currentPage, setCurrentPage] =
    useState(1);

  const [lastPage, setLastPage] =
    useState(1);

  const [totalLogs, setTotalLogs] =
    useState(0);

  const [loadingLogs, setLoadingLogs] =
    useState(false);

  /**
   * FETCH STATS + JOBS
   */

  const fetchDashboard = async () => {

    try {

      const [
        statsRes,
        jobsRes,
      ] = await Promise.all([

        axios.get(
          '/api/monitoring/stats'
        ),

        axios.get(
          '/api/monitoring/jobs'
        ),
      ]);

      setStats(
        statsRes.data.data
      );

      setJobs(
        jobsRes.data.data.data
      );

    } catch (err) {

      console.error(err);
    }
  };

  /**
   * FETCH ACCESS LOGS
   */

  const fetchAccessLogs = async (
    page = 1
  ) => {

    try {

      setLoadingLogs(true);

      const res =
        await axios.get(
          '/api/monitoring/access-logs',
          {
            params: {
              page,
            },
          }
        );

      setAccessLogs(
        res.data.data.data
      );

      setCurrentPage(
        res.data.data.current_page
      );

      setLastPage(
        res.data.data.last_page
      );

      setTotalLogs(
        res.data.data.total
      );

    } catch (err) {

      console.error(err);

    } finally {

      setLoadingLogs(false);
    }
  };

  /**
   * INIT
   */

  useEffect(() => {

    fetchDashboard();

    fetchAccessLogs(currentPage);

    const interval =
      setInterval(() => {

        fetchDashboard();

        fetchAccessLogs(currentPage);

      }, 10000);

    return () =>
      clearInterval(interval);

  }, [currentPage]);

  /**
   * PAGINATION HANDLERS
   */

  const goToPage = (
    page: number
  ) => {

    if (
      page < 1 ||
      page > lastPage
    ) {
      return;
    }

    fetchAccessLogs(page);
  };

  return (
    <div className="flex">

      <Sidebar />

      <div className="p-8 flex-1 bg-slate-50 min-h-screen">

        <h1 className="text-3xl font-bold mb-8">
          Monitoring Dashboard
        </h1>

        {/* STATS */}

        <div className="grid grid-cols-4 gap-6 mb-8">

          <Card
            icon={
              <Server className="w-6 h-6" />
            }
            title="Jobs Totali"
            value={
              stats?.jobs_total || 0
            }
          />

          <Card
            icon={
              <AlertTriangle className="w-6 h-6" />
            }
            title="Jobs Falliti"
            value={
              stats?.jobs_failed || 0
            }
          />

          <Card
            icon={
              <Activity className="w-6 h-6" />
            }
            title="Processing"
            value={
              stats?.jobs_processing || 0
            }
          />

          <Card
            icon={
              <Users className="w-6 h-6" />
            }
            title="Utenti Attivi"
            value={
              stats?.active_users || 0
            }
          />
        </div>

        {/* JOBS */}

        <div className="bg-white rounded-xl shadow p-6 mb-8">

          <h2 className="text-xl font-semibold mb-4">
            Queue Jobs
          </h2>

          <div className="overflow-auto">

            <table className="w-full text-sm">

              <thead>

                <tr className="border-b">

                  <th className="text-left p-3">
                    Job
                  </th>

                  <th className="text-left p-3">
                    Queue
                  </th>

                  <th className="text-left p-3">
                    Status
                  </th>

                  <th className="text-left p-3">
                    Started
                  </th>
                </tr>
              </thead>

              <tbody>

                {jobs.map((job) => (

                  <tr
                    key={job.id}
                    className="border-b hover:bg-slate-50"
                  >
                    <td className="p-3">
                      {job.job_name}
                    </td>

                    <td className="p-3">
                      {job.queue}
                    </td>

                    <td className="p-3">

                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          job.status ===
                          'failed'
                            ? 'bg-red-100 text-red-700'
                            : job.status ===
                              'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>

                    <td className="p-3">
                      {job.started_at}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ACCESS LOGS */}

        <div className="bg-white rounded-xl shadow p-6">

          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="text-xl font-semibold">
                Access Logs
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Totale logs: {totalLogs}
              </p>
            </div>

            <div className="flex items-center gap-2">

              <button
                onClick={() =>
                  goToPage(
                    currentPage - 1
                  )
                }
                disabled={
                  currentPage === 1
                }
                className="
                  flex items-center gap-1
                  px-3 py-2
                  rounded-lg
                  border
                  bg-white
                  hover:bg-slate-50
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                <ChevronLeft className="w-4 h-4" />

                Prev
              </button>

              <div className="px-4 py-2 text-sm font-medium">
                Pagina {currentPage} di{' '}
                {lastPage}
              </div>

              <button
                onClick={() =>
                  goToPage(
                    currentPage + 1
                  )
                }
                disabled={
                  currentPage ===
                  lastPage
                }
                className="
                  flex items-center gap-1
                  px-3 py-2
                  rounded-lg
                  border
                  bg-white
                  hover:bg-slate-50
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                Next

                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-auto">

            <table className="w-full text-sm">

              <thead>

                <tr className="border-b">

                  <th className="p-3 text-left">
                    User
                  </th>

                  <th className="p-3 text-left">
                    IP
                  </th>

                  <th className="p-3 text-left">
                    Route
                  </th>

                  <th className="p-3 text-left">
                    Method
                  </th>

                  <th className="p-3 text-left">
                    Status
                  </th>

                  <th className="p-3 text-left">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>

                {loadingLogs ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="p-8 text-center text-slate-500"
                    >
                      Caricamento logs...
                    </td>
                  </tr>

                ) : accessLogs.length ===
                  0 ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="p-8 text-center text-slate-500"
                    >
                      Nessun log disponibile
                    </td>
                  </tr>

                ) : (

                  accessLogs.map(
                    (log) => (

                      <tr
                        key={log.id}
                        className="border-b hover:bg-slate-50"
                      >
                        <td className="p-3">
                          {log.email}
                        </td>

                        <td className="p-3">
                          {
                            log.ip_address
                          }
                        </td>

                        <td className="p-3 font-mono text-xs">
                          {log.route}
                        </td>

                        <td className="p-3">
                          <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs">
                            {log.method}
                          </span>
                        </td>

                        <td className="p-3">

                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              log.status_code >=
                              400
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {
                              log.status_code
                            }
                          </span>
                        </td>

                        <td className="p-3">
                          {
                            log.accessed_at
                          }
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  icon,
}: any) {

  return (
    <div className="bg-white rounded-xl shadow p-6">

      <div className="flex items-center justify-between mb-4">
        {icon}
      </div>

      <div className="text-3xl font-bold">
        {value}
      </div>

      <div className="text-slate-500 mt-2">
        {title}
      </div>
    </div>
  );
}