import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import API_URL from "../config";
import BottomNav from "./BottomNav";
import { History, Search, Filter, Loader2, ArrowDownLeft, ArrowUpRight, PiggyBank } from "lucide-react";

function Movimientos() {
  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "null");
    } catch {
      return null;
    }
  }, []);

  const [historial, setHistorial] = useState([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");

  useEffect(() => {
    if (usuario?._id) cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    setLoadingTable(true);
    try {
      const res = await axios.get(`${API_URL}/transacciones`);
      const misTransacciones = (res.data || []).filter((t) => {
        const id = typeof t.usuario_id === "object" ? t.usuario_id?._id : t.usuario_id;
        return String(id) === String(usuario?._id);
      });
      setHistorial(misTransacciones);
    } catch (error) {
      console.error("Error al cargar movimientos:", error);
    } finally {
      setLoadingTable(false);
    }
  };

  const normalizar = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const historialFiltrado = useMemo(() => {
    return historial
      .slice()
      .reverse()
      .filter((t) => {
        const coincideTipo = filtroTipo === "todos" || normalizar(t.tipo) === normalizar(filtroTipo);
        const texto = normalizar(busqueda);
        const coincideTexto = normalizar(t.categoria).includes(texto) || normalizar(t.tipo).includes(texto);
        return coincideTipo && coincideTexto;
      });
  }, [historial, filtroTipo, busqueda]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-left pb-24">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-[#1e617a] rounded-2xl p-6 text-white shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <History size={22} /> Historial de Movimientos
            </h1>
            <p className="text-white/80 text-xs mt-1">
              Consulta y filtra todos tus ingresos, gastos y registros pasados.
            </p>
          </div>
        </div>

        {/* CONTENIDO HISTORIAL */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 border-b border-slate-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por categoría o tipo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-[#1e617a]"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto">
              {["todos", "ingreso", "gasto", "ahorro", "prestamo"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltroTipo(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer whitespace-nowrap ${
                    filtroTipo === f ? "bg-[#1e617a] text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="p-3">N°</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3">Monto</th>
                  <th className="p-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {loadingTable ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-400">
                      <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#1e617a]" />
                      Cargando registros...
                    </td>
                  </tr>
                ) : historialFiltrado.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-400">
                      <Filter size={24} className="mx-auto mb-2 text-slate-300" />
                      No hay registros que coincidan.
                    </td>
                  </tr>
                ) : (
                  historialFiltrado.map((t, idx) => (
                    <tr key={t._id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-semibold text-slate-400">{idx + 1}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md ${
                          t.tipo === "ingreso" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                          t.tipo === "gasto" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                          t.tipo === "ahorro" ? "bg-sky-50 text-sky-600 border border-sky-100" :
                          "bg-amber-50 text-amber-600 border border-amber-100"
                        }`}>
                          {t.tipo}
                        </span>
                      </td>
                      <td className="p-3 capitalize font-medium">{t.categoria}</td>
                      <td className="p-3 font-bold text-slate-800">${Number(t.monto || 0).toFixed(2)}</td>
                     <td className="p-3 text-slate-400">
  {(() => {
    const rawDate = t.fecha || t.createdAt || t.date || t.updatedAt;
    if (!rawDate) return "Sin fecha";
    const parsedDate = new Date(rawDate);
    return isNaN(parsedDate.getTime()) ? "Fecha inválida" : parsedDate.toLocaleDateString();
  })()}
</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      <BottomNav />
    </div>
  );
}

export default Movimientos;