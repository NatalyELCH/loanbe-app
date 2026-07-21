import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Target,
  Receipt,
  PiggyBank,
  CreditCard,
  ChevronRight,
  TrendingUp,
  TrendingDown
} from "lucide-react";

import axios from "axios";
import API_URL from "../config";
import BottomNav from "./BottomNav";

function DashboardMobile() {
  const navigate = useNavigate();
  const [transacciones, setTransacciones] = useState([]);

  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario"));
    } catch {
      return null;
    }
  }, []);

  // 🔐 PROTECCIÓN
  useEffect(() => {
    if (!usuario?._id) {
      navigate("/mobile/login");
    }
  }, [usuario, navigate]);

  // 🔥 CARGAR DATOS
  const obtenerDatos = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/transacciones/${usuario._id}`
      );
      setTransacciones(res.data || []);
    } catch (error) {
      console.log("Error al cargar datos:", error);
    }
  };

  useEffect(() => {
    if (usuario?._id) {
      obtenerDatos();
    }
  }, [usuario?._id]);

  // 🔥 ACTUALIZACIÓN EN TIEMPO REAL
  useEffect(() => {
    const interval = setInterval(() => {
      if (usuario?._id) obtenerDatos();
    }, 3000);

    return () => clearInterval(interval);
  }, [usuario?._id]);

  // 🔥 CERRAR SESIÓN
  const cerrarSesion = () => {
    localStorage.clear();
    navigate("/mobile/login");
  };

  // 📊 CÁLCULOS
  const ingresos = transacciones
    .filter((t) => t.tipo === "ingreso")
    .reduce((a, b) => a + Number(b.monto || 0), 0);

  const gastos = transacciones
    .filter((t) => t.tipo === "gasto")
    .reduce((a, b) => a + Number(b.monto || 0), 0);

  const ahorros = transacciones
    .filter((t) => t.tipo === "ahorro")
    .reduce((a, b) => a + Number(b.monto || 0), 0);

  const prestamos = transacciones
    .filter((t) => t.tipo === "prestamo")
    .reduce((a, b) => a + Number(b.monto || 0), 0);

  // 🔥 SALDO REAL
  const saldoInicial = Number(usuario?.saldo || 0);
  const saldo = saldoInicial + ingresos - gastos - prestamos;

  // Icono dinámico para movimientos
  const getIconoMovimiento = (tipo) => {
    switch (tipo) {
      case "ingreso":
        return <ArrowDownLeft className="text-emerald-600" size={18} />;
      case "gasto":
        return <ArrowUpRight className="text-rose-500" size={18} />;
      case "ahorro":
        return <PiggyBank className="text-sky-600" size={18} />;
      case "prestamo":
        return <CreditCard className="text-amber-600" size={18} />;
      default:
        return <Receipt className="text-slate-600" size={18} />;
    }
  };

  const getColorMovimiento = (tipo) => {
    switch (tipo) {
      case "ingreso":
        return "bg-emerald-50 text-emerald-600";
      case "gasto":
        return "bg-rose-50 text-rose-500";
      case "ahorro":
        return "bg-sky-50 text-sky-600";
      case "prestamo":
        return "bg-amber-50 text-amber-600";
      default:
        return "bg-slate-50 text-slate-600";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-5 pb-28 text-left font-sans">
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Bienvenido de nuevo</p>
          <h1 className="text-2xl font-extrabold text-slate-800 mt-0.5">
            {usuario?.nombre || "Usuario"} 👋
          </h1>
        </div>
        <button
          onClick={cerrarSesion}
          className="p-2.5 bg-white border border-slate-200/80 text-slate-600 rounded-2xl shadow-xs hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition cursor-pointer"
          title="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* TARJETA PRINCIPAL DE SALDO */}
      <div className="bg-gradient-to-br from-[#1e617a] via-[#174b5f] to-[#0f3241] text-white p-6 rounded-[2.5rem] shadow-xl shadow-[#1e617a]/15 mb-6 relative overflow-hidden">
        {/* Elemento decorativo de fondo */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex justify-between items-start">
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Saldo disponible</p>
            <h2 className="text-3xl font-black tracking-tight mt-1">
              ${saldo.toFixed(2)}
            </h2>
          </div>
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
            <Wallet size={24} className="text-white" />
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <TrendingUp size={16} className="text-emerald-300" />
            </div>
            <div>
              <p className="text-white/60 text-[11px] font-medium">Ingresos</p>
              <p className="font-bold text-emerald-300 text-sm">
                +${ingresos.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 rounded-xl">
              <TrendingDown size={16} className="text-rose-300" />
            </div>
            <div>
              <p className="text-white/60 text-[11px] font-medium">Gastos</p>
              <p className="font-bold text-rose-300 text-sm">
                -${gastos.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/20 rounded-xl">
              <PiggyBank size={16} className="text-sky-300" />
            </div>
            <div>
              <p className="text-white/60 text-[11px] font-medium">Ahorros</p>
              <p className="font-bold text-sky-200 text-sm">
                ${ahorros.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl">
              <CreditCard size={16} className="text-amber-300" />
            </div>
            <div>
              <p className="text-white/60 text-[11px] font-medium">Préstamos</p>
              <p className="font-bold text-amber-200 text-sm">
                -${prestamos.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE ACCESOS RÁPIDOS */}
      <div className="mb-6">
        <h2 className="font-bold text-slate-800 mb-3 text-sm tracking-wide">Acceso Rápido</h2>
        <div className="grid grid-cols-2 gap-3">
          {/* BOTÓN TRANSACCIONES */}
          <button
            onClick={() => navigate("/mobile/transacciones")}
            className="bg-white p-4 rounded-3xl shadow-xs border border-slate-100 flex flex-col justify-between items-start text-left hover:border-slate-200 active:scale-95 transition cursor-group group"
          >
            <div className="p-3 bg-sky-50 text-[#1e617a] rounded-2xl mb-3 group-hover:bg-[#1e617a] group-hover:text-white transition">
              <Receipt size={20} />
            </div>
            <div className="w-full flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 text-xs">Transacciones</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Registrar y ver</p>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition" />
            </div>
          </button>

          {/* BOTÓN METAS DE AHORRO */}
          <button
            onClick={() => navigate("/mobile/metas")}
            className="bg-white p-4 rounded-3xl shadow-xs border border-slate-100 flex flex-col justify-between items-start text-left hover:border-slate-200 active:scale-95 transition cursor-group group"
          >
            <div className="p-3 bg-sky-50 text-[#1e617a] rounded-2xl mb-3 group-hover:bg-[#1e617a] group-hover:text-white transition">
              <Target size={20} />
            </div>
            <div className="w-full flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 text-xs">Metas de Ahorro</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Ver objetivos</p>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition" />
            </div>
          </button>
        </div>
      </div>

      {/* ÚLTIMOS MOVIMIENTOS */}
      <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-slate-800 text-sm">Últimos movimientos</h2>
          <button 
            onClick={() => navigate("/mobile/transacciones")}
            className="text-xs font-bold text-[#1e617a] hover:underline"
          >
            Ver todos
          </button>
        </div>

        {transacciones.length === 0 ? (
          <div className="text-center py-6">
            <Receipt size={32} className="mx-auto text-slate-200 mb-2" />
            <p className="text-slate-400 text-xs font-medium">Sin movimientos registrados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transacciones
              .slice()
              .reverse()
              .slice(0, 5)
              .map((t, i) => (
                <div
                  key={t._id || i}
                  className="flex justify-between items-center p-2 rounded-2xl hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${getColorMovimiento(t.tipo)}`}>
                      {getIconoMovimiento(t.tipo)}
                    </div>

                    <div>
                      <p className="font-bold capitalize text-slate-800 text-xs">
                        {t.tipo}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">{t.categoria || "General"}</p>
                    </div>
                  </div>

                  <div
                    className={`font-black text-xs ${
                      t.tipo === "ingreso"
                        ? "text-emerald-600"
                        : t.tipo === "ahorro"
                        ? "text-sky-600"
                        : "text-slate-700"
                    }`}
                  >
                    {t.tipo === "ingreso" ? "+" : t.tipo === "ahorro" ? "" : "-"}${Number(t.monto).toFixed(2)}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* NAVEGACIÓN INFERIOR */}
      <BottomNav />
    </div>
  );
}

export default DashboardMobile;