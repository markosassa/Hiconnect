import { useRef } from "react";
import { Paperclip, Plus, X, FileText, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  attachments: File[];
  setAttachments: (attachments: File[]) => void;
}

export function AttachmentManager({ attachments, setAttachments }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments([...attachments, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
          <Paperclip className="w-5 h-5 text-amber-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-800">Allegati</h3>
      </div>

      {/* Info Banner */}
      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-800">
          Gli allegati caricati verranno cancellati automaticamente dal sistema tra 30 giorni
        </p>
      </div>

      {/* Attachments List */}
      <div className="space-y-2 mb-4">
        <AnimatePresence>
          {attachments.map((file, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 group hover:border-amber-300 transition-colors"
            >
              <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                onClick={() => removeAttachment(index)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {attachments.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">
            Nessun file selezionato
          </p>
        )}
      </div>

      {/* Upload Button */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-lg text-slate-600
                   hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-all
                   flex items-center justify-center gap-2 font-medium cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Scegli file
        </motion.div>
      </label>
    </div>
  );
}
