import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../config";
import { Trophy, RefreshCw, Award, Users } from "lucide-react";

function Rankings() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargarRankings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/usuarios`);
      const data = res.data || [];

      // Filtrar administradores y ordenar por saldo descendente
      const clientesFiltrados = data
        .filter((u) => u.rol?.toLowerCase() !== "admin" && u.tipo?.toLowerCase() !== "admin")
        .sort((a, b) => Number(b.saldo || 0) - Number(a.saldo || 0));

      setUsuarios(clientesFiltrados);
    } catch (error) {
      console.error("Error al cargar ranking:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRankings();
  }, []);

  return (
    /* 🎯 MISMA ESTRUCTURA DE ESPACIOS QUE ESTADÍSTICAS */
    <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-10 py-6 space-y-6 text-left">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1e617a] tracking-wider uppercase">
            <Trophy size={15} />
            <span>Clasificación Financiera</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mt-1">
            Ranking de Usuarios
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Tabla de posiciones de los clientes según su balance disponible e historial.
          </p>
        </div>

        <button
          onClick={cargarRankings}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-[#1e617a] hover:bg-[#154658] active:scale-[0.98] text-white text-sm font-semibold px-5 py-2.5 rounded-2xl transition-all shadow-xs disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* CONTENEDOR DE TABLA DE RANKING */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
            <Users size={16} className="text-[#1e617a]" />
            Listado General de Posiciones
          </h2>
          <span className="text-[10px] bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full font-semibold">
            {usuarios.length} Clientes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/75 text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-4 px-6 text-center">Posición</th>
                <th className="py-4 px-6">Usuario</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6 text-right">Saldo Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400 text-sm">
                    {loading ? "Cargando ranking..." : "No hay datos de usuarios disponibles."}
                  </td>
                </tr>
              ) : (
                usuarios.map((usuario, index) => {
                  const esTop1 = index === 0;
                  const esTop2 = index === 1;
                  const esTop3 = index === 2;

                  return (
                    <tr key={usuario._id || index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-center font-bold">
                        <div className="flex items-center justify-center">
                          {esTop1 && <Award size={20} className="text-amber-400" />}
                          {esTop2 && <Award size={20} className="text-slate-400" />}
                          {esTop3 && <Award size={20} className="text-amber-700" />}
                          {!esTop1 && !esTop2 && !esTop3 && (
                            <span className="text-slate-400 text-xs">#{index + 1}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {usuario.nombre}
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        {usuario.email || "—"}
                      </td>
                      <td className="py-4 px-6 text-right font-black text-[#1e617a]">
                        ${Number(usuario.saldo || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default Rankings;