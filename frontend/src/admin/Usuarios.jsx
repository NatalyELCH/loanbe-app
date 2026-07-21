import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import API_URL from "../config";
import { 
  Search, 
  RefreshCw, 
  Users, 
  Wallet, 
  TrendingUp, 
  Mail, 
  UserCheck, 
  MoreVertical,
  ArrowUpDown
} from "lucide-react";
import { io } from "socket.io-client";

const socket = io(API_URL);

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [transacciones, setTransacciones] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [orden, setOrden] = useState("desc");

  // CARGAR DATOS
  const obtenerDatos = async () => {
    try {
      setLoading(true);

      const [u, t] = await Promise.all([
        axios.get(`${API_URL}/usuarios`),
        axios.get(`${API_URL}/transacciones`)
      ]);

      setUsuarios(u.data || []);
      setTransacciones(t.data || []);
    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerDatos();

    socket.on("nueva-transaccion", (data) => {
      setTransacciones((prev) => [data, ...prev]);
    });

    return () => {
      socket.off("nueva-transaccion");
    };
  }, []);

  // FILTRAR CLIENTES Y EXCLUIR ADMINS
  const clientes = useMemo(() => {
    return usuarios.filter(
      (u) => u.rol?.toLowerCase() !== "admin" && u.tipo?.toLowerCase() !== "admin"
    );
  }, [usuarios]);

  // CALCULAR SALDO REAL
  const usuariosConSaldo = useMemo(() => {
    return clientes.map((u) => {
      const movimientos = transacciones.filter((t) => {
        const tUserId = typeof t.usuario_id === "object" ? t.usuario_id._id : t.usuario_id;
        return String(tUserId) === String(u._id);
      });

      let saldoMovimientos = 0;

      movimientos.forEach((t) => {
        const monto = Number(t.monto || 0);
        if (t.tipo === "ingreso" || t.tipo === "prestamo") saldoMovimientos += monto;
        if (t.tipo === "gasto" || t.tipo === "ahorro") saldoMovimientos -= monto;
      });

      return {
        ...u,
        saldoCalculado: Number(u.saldo || 0) + saldoMovimientos,
        totalTransacciones: movimientos.length
      };
    });
  }, [clientes, transacciones]);

  // FILTRADO + ORDEN
  const usuariosFiltrados = useMemo(() => {
    let data = usuariosConSaldo.filter((u) =>
      u.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    );

    data.sort((a, b) => {
      return orden === "desc"
        ? b.saldoCalculado - a.saldoCalculado
        : a.saldoCalculado - b.saldoCalculado;
    });

    return data;
  }, [usuariosConSaldo, search, orden]);

  // ESTADÍSTICAS (KPIs)
  const stats = useMemo(() => {
    const total = usuariosConSaldo.length;
    const saldoTotal = usuariosConSaldo.reduce(
      (acc, u) => acc + Number(u.saldoCalculado || 0),
      0
    );
    const promedio = total ? saldoTotal / total : 0;

    return { total, saldoTotal, promedio };
  }, [usuariosConSaldo]);

  return (
    /* 🎯 CAMBIO AQUI: Contenedor 100% de ancho con padding equilibrado */
    <div className="w-full px-6 py-4 space-y-5">

      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Clientes y Usuarios
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitoreo financiero y gestión de cuentas activas en LoanBe
          </p>
        </div>

        <button
          onClick={obtenerDatos}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-[#1e617a] hover:bg-[#154658] active:scale-[0.98] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          <span>Actualizar datos</span>
        </button>
      </div>

      {/* TARJETAS KPI REDISEÑADAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <KpiCard
          title="Clientes Registrados"
          value={stats.total}
          icon={Users}
          badgeText="Activos"
          color="teal"
        />
        <KpiCard
          title="Saldo Total Administrado"
          value={`$${stats.saldoTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Wallet}
          badgeText="Total Global"
          color="blue"
        />
        <KpiCard
          title="Promedio por Cliente"
          value={`$${stats.promedio.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={TrendingUp}
          badgeText="Media de Capital"
          color="emerald"
        />
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-lg">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e617a]/20 focus:border-[#1e617a] transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <ArrowUpDown size={16} className="text-slate-400 hidden sm:block" />
          <select
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1e617a]/20 focus:border-[#1e617a] cursor-pointer"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
          >
            <option value="desc">Ordenar: Mayor Saldo</option>
            <option value="asc">Ordenar: Menor Saldo</option>
          </select>
        </div>
      </div>

      {/* TABLA MODERNA Y LIMPIA */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {/* ENCABEZADO DE TABLA */}
        <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Listado de Clientes ({usuariosFiltrados.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-slate-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="mx-auto text-slate-300 mb-2" size={36} />
            <p className="text-slate-500 font-medium text-sm">No se encontraron clientes registrados</p>
            <p className="text-slate-400 text-xs mt-1">Prueba cambiando el término de búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6">Cliente</th>
                  <th className="py-3 px-6">Contacto</th>
                  <th className="py-3 px-6 text-center">Movimientos</th>
                  <th className="py-3 px-6 text-right">Saldo Calculado</th>
                  <th className="py-3 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {usuariosFiltrados.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition-colors group">
                    
                    {/* CLIENTE */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1e617a] to-[#2b88aa] text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
                          {u.nombre?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 line-clamp-1">{u.nombre}</p>
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
                            <UserCheck size={9} /> Cliente
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* CONTACTO */}
                    <td className="py-3.5 px-6 text-slate-500">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Mail size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{u.email || "Sin correo"}</span>
                      </div>
                    </td>

                    {/* MOVIMIENTOS */}
                    <td className="py-3.5 px-6 text-center">
                      <span className="inline-block bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-0.5 rounded-lg">
                        {u.totalTransacciones} reg.
                      </span>
                    </td>

                    {/* SALDO */}
                    <td className="py-3.5 px-6 text-right">
                      <p className={`font-bold text-sm ${u.saldoCalculado < 0 ? "text-rose-600" : "text-[#1e617a]"}`}>
                        ${u.saldoCalculado.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </td>

                    {/* ACCIÓN */}
                    <td className="py-3.5 px-4 text-center">
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                        <MoreVertical size={16} />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}

// COMPONENTE DE TARJETA KPI REUTILIZABLE
function KpiCard({ title, value, icon: Icon, badgeText, color = "teal" }) {
  const colorStyles = {
    teal: "bg-teal-50 text-teal-600 border-teal-100",
    blue: "bg-sky-50 text-sky-600 border-sky-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-black text-slate-800 mt-1.5 tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-xl border ${colorStyles[color]}`}>
          <Icon size={18} />
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
          {badgeText}
        </span>
        <span className="text-[10px] text-slate-400">Actualizado en vivo</span>
      </div>
    </div>
  );
}

export default Usuarios;