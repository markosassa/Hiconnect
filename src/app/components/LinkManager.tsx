import { useState } from "react";
import { Link2, Plus, X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  links: string[];
  setLinks: (links: string[]) => void;
}

export function LinkManager({ links, setLinks }: Props) {
  const [newLink, setNewLink] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const addLink = () => {
    if (newLink.trim() && isValidUrl(newLink)) {
      setLinks([...links, newLink.trim()]);
      setNewLink("");
      setIsAdding(false);
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
          <Link2 className="w-5 h-5 text-purple-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-800">Link</h3>
      </div>

      {/* Links List */}
      <div className="space-y-2 mb-4">
        <AnimatePresence>
          {links.map((link, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 group hover:border-purple-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-sm text-slate-700 hover:text-purple-600 truncate transition-colors"
              >
                {link}
              </a>
              <button
                onClick={() => removeLink(index)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {links.length === 0 && !isAdding && (
          <p className="text-sm text-slate-500 text-center py-4">
            Nessun link aggiunto
          </p>
        )}
      </div>

      {/* Add Link Form */}
      <AnimatePresence>
        {isAdding ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <input
              type="url"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addLink();
                if (e.key === "Escape") {
                  setIsAdding(false);
                  setNewLink("");
                }
              }}
              placeholder="https://esempio.com"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={addLink}
                disabled={!newLink.trim() || !isValidUrl(newLink)}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Aggiungi
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewLink("");
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Annulla
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsAdding(true)}
            className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-lg text-slate-600
                     hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all
                     flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Aggiungi Link
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
