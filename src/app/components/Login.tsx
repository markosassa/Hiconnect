import { LogIn } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import api from "../../lib/axios";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    const ok = await login(username, password);

    if (!ok) {
      setError("Credenziali non valide");
      return;
    }

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-zinc-200 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
  <div className="text-center mb-8">

  <div className="flex justify-center mb-6">

    <img
      src="/logo.png"
      alt="HiConnect"
      className="h-24 object-contain"
    />

  </div>

  <p className="text-slate-600 mt-2">
    Accedi al tuo account
  </p>
</div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Inserisci username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Inserisci password"
              required
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Accedi
          </button>

          <p className="text-sm text-slate-500 text-center mt-4">
            Credenziali default: admin / admin123
          </p>
        </form>
      </motion.div>
    </div>
  );
}
