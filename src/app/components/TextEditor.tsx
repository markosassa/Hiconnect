import { useState } from "react";
import { Bold, Italic, Underline, Strikethrough, Type } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  content: string;
  setContent: (content: string) => void;
  characterCount: number;
  characterLimit: number;
}

export function TextEditor({ content, setContent, characterCount, characterLimit }: Props) {
  const [isFocused, setIsFocused] = useState(false);

  const applyFormatting = (tag: string) => {
    const textarea = document.getElementById("content-editor") as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (selectedText) {
      const before = content.substring(0, start);
      const after = content.substring(end);
      const formatted = `<${tag}>${selectedText}</${tag}>`;
      setContent(before + formatted + after);
    }
  };

  const isNearLimit = characterCount > characterLimit * 0.8;
  const isOverLimit = characterCount > characterLimit;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Type className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-medium text-slate-800">
            Messaggio
          </h2>
        </div>

        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => applyFormatting("b")}
            className="p-2 rounded hover:bg-white transition-colors group"
            title="Grassetto"
          >
            <Bold className="w-4 h-4 text-slate-600 group-hover:text-slate-800" />
          </button>
          <button
            onClick={() => applyFormatting("i")}
            className="p-2 rounded hover:bg-white transition-colors group"
            title="Corsivo"
          >
            <Italic className="w-4 h-4 text-slate-600 group-hover:text-slate-800" />
          </button>
          <button
            onClick={() => applyFormatting("u")}
            className="p-2 rounded hover:bg-white transition-colors group"
            title="Sottolineato"
          >
            <Underline className="w-4 h-4 text-slate-600 group-hover:text-slate-800" />
          </button>
          <button
            onClick={() => applyFormatting("s")}
            className="p-2 rounded hover:bg-white transition-colors group"
            title="Barrato"
          >
            <Strikethrough className="w-4 h-4 text-slate-600 group-hover:text-slate-800" />
          </button>
        </div>
      </div>

      {/* Text Area */}
      <div className="relative">
        <textarea
          id="content-editor"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Scrivi qui il contenuto della comunicazione..."
          className={`w-full h-64 p-4 border-2 rounded-xl resize-none focus:outline-none transition-all ${
            isFocused
              ? "border-emerald-500 ring-4 ring-emerald-500/10"
              : "border-slate-200 hover:border-slate-300"
          } ${isOverLimit ? "border-red-500 ring-4 ring-red-500/10" : ""}`}
        />

        {/* Character Counter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`absolute bottom-4 right-4 text-sm font-medium ${
            isOverLimit
              ? "text-red-600"
              : isNearLimit
              ? "text-amber-600"
              : "text-slate-500"
          }`}
        >
          {characterCount} / {characterLimit}
        </motion.div>
      </div>

      {/* Helper Text */}
      {isOverLimit && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600 flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
          Hai superato il limite di caratteri
        </motion.p>
      )}
    </div>
  );
}
