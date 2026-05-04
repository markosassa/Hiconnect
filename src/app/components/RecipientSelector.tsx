import { useState } from "react";
import { Search, X, Building2, User } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "motion/react";

interface Recipient {
  matricola: string;
  nome: string;
  cognome: string;
}

const mockEmployees: Recipient[] = [
  { matricola: "0000002", nome: "ANGELA", cognome: "LATERZA" },
  { matricola: "0000006", nome: "GIUSEPPE", cognome: "FORTE" },
  { matricola: "0000014", nome: "AURELIO", cognome: "ZAZZARA" },
  { matricola: "0000021", nome: "LORENZO", cognome: "DISABATO" },
  { matricola: "0000022", nome: "GIUSEPPINA", cognome: "CASAREALE" },
  { matricola: "0000028", nome: "IVAN", cognome: "FARAONI" },
  { matricola: "0000029", nome: "VITO", cognome: "COLAIANNI" },
  { matricola: "0000030", nome: "DANIELE", cognome: "FORTE" },
  { matricola: "0000042", nome: "TOMMASO", cognome: "MONGELLI" },
  { matricola: "0000045", nome: "ROBERTO", cognome: "RASULO" },
];

const mockDepartments = [
  { id: "1", name: "Amministrazione", employees: 45 },
  { id: "2", name: "Produzione", employees: 120 },
  { id: "3", name: "Vendite", employees: 35 },
  { id: "4", name: "IT", employees: 18 },
  { id: "5", name: "Logistica", employees: 52 },
  { id: "6", name: "Risorse Umane", employees: 12 },
];

interface Props {
  recipients: Recipient[];
  setRecipients: (recipients: Recipient[]) => void;
  recipientType: "single" | "all" | "custom";
  setRecipientType: (type: "single" | "all" | "custom") => void;
}

export function RecipientSelector({ recipients, setRecipients, recipientType, setRecipientType }: Props) {
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const [isSingleEmployeeDialogOpen, setIsSingleEmployeeDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredEmployees = mockEmployees.filter(emp =>
    emp.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.cognome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.matricola.includes(searchQuery)
  );

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDepartmentConfirm = () => {
    setRecipientType("custom");
    setIsDepartmentDialogOpen(false);
  };

  const handleSingleEmployeeSelect = (employee: Recipient) => {
    setRecipients([employee]);
    setRecipientType("single");
    setIsSingleEmployeeDialogOpen(false);
    setSearchQuery("");
  };

  const handleTypeChange = (type: "single" | "all" | "custom") => {
    if (type === "single") {
      setIsSingleEmployeeDialogOpen(true);
    } else if (type === "all") {
      setRecipients([]);
      setRecipientType("all");
    } else if (type === "custom") {
      setIsDepartmentDialogOpen(true);
    }
  };

  const removeRecipient = () => {
    setRecipients([]);
    setRecipientType("all");
  };

  const toggleDepartment = (deptId: string) => {
    const newSelected = new Set(selectedDepartments);
    if (newSelected.has(deptId)) {
      newSelected.delete(deptId);
    } else {
      newSelected.add(deptId);
    }
    setSelectedDepartments(newSelected);
  };

  return (
    <div className="space-y-4">
      {/* Type Selector */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleTypeChange("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            recipientType === "all"
              ? "bg-emerald-600 text-white shadow-md"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Tutti i dipendenti
        </button>
        <button
          onClick={() => handleTypeChange("single")}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            recipientType === "single"
              ? "bg-emerald-600 text-white shadow-md"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <User className="w-4 h-4" />
          Singola matricola
        </button>
        <button
          onClick={() => handleTypeChange("custom")}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            recipientType === "custom"
              ? "bg-emerald-600 text-white shadow-md"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Reparti
        </button>
      </div>

      {/* Selected Single Recipient */}
      {recipientType === "single" && recipients.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-slate-50 rounded-lg p-4 border border-slate-200"
        >
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
            <User className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">
              {recipients[0].nome} {recipients[0].cognome}
            </span>
            <span className="text-xs text-slate-500">({recipients[0].matricola})</span>
            <button
              onClick={removeRecipient}
              className="ml-auto text-slate-400 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Selected Departments */}
      {recipientType === "custom" && selectedDepartments.size > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-slate-50 rounded-lg p-4 border border-slate-200"
        >
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedDepartments).map((deptId) => {
              const dept = mockDepartments.find(d => d.id === deptId);
              if (!dept) return null;
              return (
                <motion.div
                  key={deptId}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm"
                >
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">
                    {dept.name}
                  </span>
                  <span className="text-xs text-slate-500">({dept.employees})</span>
                  <button
                    onClick={() => toggleDepartment(deptId)}
                    className="ml-1 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Single Employee Selection Dialog */}
      <Dialog.Root open={isSingleEmployeeDialogOpen} onOpenChange={setIsSingleEmployeeDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-[90vw] max-w-3xl max-h-[80vh] overflow-hidden z-50">
            <div className="p-6 border-b border-slate-200">
              <Dialog.Title className="text-2xl font-semibold text-slate-800 mb-2">
                Seleziona Dipendente
              </Dialog.Title>
              <Dialog.Description className="text-sm text-slate-600 mb-4">
                Cerca e seleziona un singolo dipendente
              </Dialog.Description>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cerca per nome, cognome o matricola..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-auto max-h-[400px]">
              <table className="w-full">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Matricola</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Nome</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Cognome</th>
                    <th className="text-center px-6 py-3 text-sm font-medium text-slate-600">Seleziona</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEmployees.map((emp, idx) => (
                    <tr
                      key={emp.matricola}
                      onClick={() => handleSingleEmployeeSelect(emp)}
                      className={`border-b border-slate-100 hover:bg-emerald-50 transition-colors cursor-pointer ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-25"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-slate-700 font-mono">{emp.matricola}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{emp.nome}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{emp.cognome}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="w-4 h-4 mx-auto rounded-full border-2 border-slate-300 group-hover:border-emerald-500" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Risultati da {(currentPage - 1) * itemsPerPage + 1} a{" "}
                {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} di {filteredEmployees.length}
              </div>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg transition-all ${
                      page === currentPage
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <Dialog.Close asChild>
                <button className="px-6 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors">
                  Annulla
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Department Selection Dialog */}
      <Dialog.Root open={isDepartmentDialogOpen} onOpenChange={setIsDepartmentDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-[90vw] max-w-2xl max-h-[80vh] overflow-hidden z-50">
            <div className="p-6 border-b border-slate-200">
              <Dialog.Title className="text-2xl font-semibold text-slate-800 mb-2">
                Seleziona Reparti
              </Dialog.Title>
              <Dialog.Description className="text-sm text-slate-600 mb-4">
                Scegli uno o più reparti per la comunicazione
              </Dialog.Description>
            </div>

            {/* Departments List */}
            <div className="p-6 space-y-3 max-h-[400px] overflow-auto">
              {mockDepartments.map((dept) => (
                <motion.div
                  key={dept.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleDepartment(dept.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedDepartments.has(dept.id)
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedDepartments.has(dept.id)
                        ? "bg-emerald-600"
                        : "bg-slate-100"
                    }`}>
                      <Building2 className={`w-5 h-5 ${
                        selectedDepartments.has(dept.id) ? "text-white" : "text-slate-600"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800">{dept.name}</h4>
                      <p className="text-sm text-slate-500">{dept.employees} dipendenti</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedDepartments.has(dept.id)}
                      onChange={() => {}}
                      className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 pointer-events-none"
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <Dialog.Close asChild>
                <button className="px-6 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors">
                  Annulla
                </button>
              </Dialog.Close>
              <button
                onClick={handleDepartmentConfirm}
                disabled={selectedDepartments.size === 0}
                className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700
                         transition-colors shadow-lg shadow-emerald-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Conferma ({selectedDepartments.size})
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
