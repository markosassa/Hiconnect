import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <Menu className="w-5 h-5" />
          <span className="sr-only">Open menu</span>
        </button>
        <div className="text-lg font-semibold text-slate-900">HiConnect</div>
        <div className="w-10" />
      </div>

      <div className="md:flex">
        <div
          className={`fixed inset-y-0 left-0 z-40 w-full max-w-xs bg-emerald-900 shadow-xl transition-transform duration-200 md:static md:translate-x-0 md:block ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="md:hidden p-4 flex justify-end">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center rounded-xl bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <X className="w-5 h-5" />
              <span className="sr-only">Close menu</span>
            </button>
          </div>
          <Sidebar />
        </div>

        <div className="flex-1 md:ml-0">
          <div className="px-4 py-6 md:px-8 md:py-8">{children}</div>
        </div>
      </div>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}
    </div>
  );
}
