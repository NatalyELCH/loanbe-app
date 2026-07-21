import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import API_URL from "../config";
import { io } from "socket.io-client";

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Landmark,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Users,
  Percent,
  RefreshCw
} from "lucide-react";

import {
  Bar,
  Line,
  Doughnut,
  Radar
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  RadialLinearScale,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  RadialLinearScale,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const socket = io(API_URL);

function Estadisticas() {
  const [transacciones, setTransacciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  // 📡 CARGAR DATOS
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [t, u] = await Promise.all([
        axios.get(`${API_URL}/transacciones`),
        axios.get(`${API_URL}/usuarios`)
      ]);

      setTransacciones(t.data || []);
      setUsuarios(u.data || []);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();

    socket.on("nueva-transaccion", (data) => {
      setTransacciones((prev) => [data, ...prev]);
    });

    return () => {
      socket.off("nueva-transaccion");
    };
  }, []);

  // Normalizar strings
  const normalizar = (s) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  // Excluir administradores
  const clientes = useMemo(() => {
    return usuarios.filter(
      (u) => u.rol?.toLowerCase() !== "admin" && u.tipo?.toLowerCase() !== "admin"
    );
  }, [usuarios]);

  // 📊 RESUMEN BANCO
  const dataBanco = useMemo(() => {
    return transacciones.reduce(
      (acc, t) => {
        const tipo = normalizar(t.tipo);
        const monto = Number(t.monto || 0);

        if (tipo === "ingreso") acc.ingresos += monto;
        if (tipo === "gasto") acc.gastos += monto;
        if (tipo === "ahorro") acc.ahorros += monto;
        if (tipo === "prestamo") acc.prestamos += monto;

        return acc;
      },
      { ingresos: 0, gastos: 0, ahorros: 0, prestamos: 0 }
    );
  }, [transacciones]);

  // 💰 SALDO TOTAL DE CLIENTES
  const saldoUsuarios = useMemo(() => {
    return clientes.reduce((acc, u) => acc + Number(u.saldo || 0), 0);
  }, [clientes]);

  const promedioSaldo = clientes.length ? saldoUsuarios / clientes.length : 0;

  // OPCIONES BASE MEJORADAS CON TIPOGRAFÍA MÁS CLARA Y ESPACIADO
  const chartOptionsBase = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 18,
          font: { size: 12, family: "Inter, sans-serif", weight: "600" },
          color: "#475569"
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 11, weight: "500" } }
      },
      y: {
        grid: { color: "#f1f5f9" },
        ticks: { color: "#64748b", font: { size: 11, weight: "500" } }
      }
    }
  };

  // 📊 BARRAS COMPARACIÓN
  const dataBarras = {
    labels: ["Ingresos", "Gastos", "Ahorros", "Préstamos"],
    datasets: [
      {
        label: "Monto Total ($)",
        data: [
          dataBanco.ingresos,
          dataBanco.gastos,
          dataBanco.ahorros,
          dataBanco.prestamos,
        ],
        backgroundColor: ["#10b981", "#ef4444", "#0284c7", "#f59e0b"],
        borderRadius: 10,
        barThickness: 36,
      },
    ],
  };

  // 🍩 DOUGHNUT CHART
  const dataDoughnut = {
    labels: ["Ingresos", "Gastos", "Ahorros", "Préstamos"],
    datasets: [
      {
        data: [
          dataBanco.ingresos,
          dataBanco.gastos,
          dataBanco.ahorros,
          dataBanco.prestamos,
        ],
        backgroundColor: ["#10b981", "#ef4444", "#0284c7", "#f59e0b"],
        borderWidth: 3,
        borderColor: "#ffffff",
      },
    ],
  };

  // 📈 LÍNEA HISTÓRICA
  const dataLinea = {
    labels: transacciones.map((t, i) => t.fecha ? new Date(t.fecha).toLocaleDateString() : `Mov ${i + 1}`),
    datasets: [
      {
        label: "Evolución Financiera ($)",
        data: transacciones.reduce((acc, t, i) => {
          const monto = Number(t.monto || 0);
          const prev = acc[i - 1] || 0;
          const nuevo = normalizar(t.tipo) === "ingreso" ? prev + monto : prev - monto;
          acc.push(nuevo);
          return acc;
        }, []),
        borderColor: "#1e617a",
        backgroundColor: "rgba(30, 97, 122, 0.08)",
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
    ],
  };

  // 🕸️ RADAR
  const dataRadar = {
    labels: ["Ingresos", "Gastos", "Ahorros", "Préstamos"],
    datasets: [
      {
        label: "Proporción Financiera",
        data: [
          dataBanco.ingresos,
          dataBanco.gastos,
          dataBanco.ahorros,
          dataBanco.prestamos,
        ],
        backgroundColor: "rgba(30, 97, 122, 0.18)",
        borderColor: "#1e617a",
        borderWidth: 2,
        pointBackgroundColor: "#1e617a",
      },
    ],
  };

  // 📊 BARRAS APILADAS
  const dataApiladas = {
    labels: ["Consolidado Global"],
    datasets: [
      { label: "Ingresos", data: [dataBanco.ingresos], backgroundColor: "#10b981" },
      { label: "Gastos", data: [dataBanco.gastos], backgroundColor: "#ef4444" },
      { label: "Ahorros", data: [dataBanco.ahorros], backgroundColor: "#0284c7" },
      { label: "Préstamos", data: [dataBanco.prestamos], backgroundColor: "#f59e0b" },
    ],
  };

  // 📊 TOP USUARIOS MAYOR SALDO
  const topUsuariosSaldo = useMemo(() => {
    return [...clientes]
      .sort((a, b) => Number(b.saldo || 0) - Number(a.saldo || 0))
      .slice(0, 5);
  }, [clientes]);

  const dataUsuariosSaldo = {
    labels: topUsuariosSaldo.map((u) => u.nombre),
    datasets: [
      {
        label: "Saldo Acumulado ($)",
        data: topUsuariosSaldo.map((u) => Number(u.saldo || 0)),
        backgroundColor: "#1e617a",
        borderRadius: 8,
        barThickness: 24,
      },
    ],
  };

  // 📊 TOP USUARIOS MAYOR GASTO
  const dataGastosUsuarios = useMemo(() => {
    const mapa = {};

    transacciones.forEach((t) => {
      if (normalizar(t.tipo) !== "gasto") return;

      const usuarioId = typeof t.usuario_id === "object" ? t.usuario_id._id : t.usuario_id;
      const usuario = clientes.find((u) => String(u._id) === String(usuarioId));
      const nombre = usuario?.nombre || "Desconocido";

      mapa[nombre] = (mapa[nombre] || 0) + Number(t.monto || 0);
    });

    const ordenados = Object.entries(mapa)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      labels: ordenados.map((item) => item[0]),
      datasets: [
        {
          label: "Total Gastado ($)",
          data: ordenados.map((item) => item[1]),
          backgroundColor: "#ef4444",
          borderRadius: 8,
          barThickness: 24,
        },
      ],
    };
  }, [transacciones, clientes]);

  return (
    <div className="w-full px-6 py-4 space-y-6 text-left">

      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1e617a] tracking-wider uppercase">
            <BarChart3 size={15} />
            <span>Métricas Avanzadas LoanBe</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5">
            Estadísticas Generales del Sistema
          </h1>
          <p className="text-slate-500 text-sm">
            Monitoreo analítico de balance, distribución de capital y comportamiento de usuarios.
          </p>
        </div>

        <button
          onClick={cargarDatos}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-[#1e617a] hover:bg-[#154658] active:scale-[0.98] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          <span>Sincronizar</span>
        </button>
      </div>

      {/* TARJETAS KPIS PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        
        <KpiStat
          title="Ingresos"
          value={`$${dataBanco.ingresos.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          color="emerald"
        />

        <KpiStat
          title="Gastos"
          value={`$${dataBanco.gastos.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={TrendingDown}
          color="rose"
        />

        <KpiStat
          title="Ahorros"
          value={`$${dataBanco.ahorros.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={PiggyBank}
          color="sky"
        />

        <KpiStat
          title="Préstamos"
          value={`$${dataBanco.prestamos.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={Landmark}
          color="amber"
        />

        <KpiStat
          title="Saldo Usuarios"
          value={`$${saldoUsuarios.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          subtitle={`Promed: $${promedioSaldo.toFixed(2)}`}
          icon={Wallet}
          color="navy"
        />

      </div>

      {/* 🚀 BLOQUE 1: GRÁFICOS PRINCIPALES DE ENTRADA (MÁS ALTOS - 320px a 360px) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* COMPARACIÓN GENERAL DE MONTOS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <BarChart3 size={16} className="text-[#1e617a]" />
              Comparación Financiera General
            </h2>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-semibold">
              USD
            </span>
          </div>
          {/* ALTURA AUMENTADA A 330px */}
          <div className="h-[330px] w-full">
            <Bar data={dataBarras} options={chartOptionsBase} />
          </div>
        </div>

        {/* DISTRIBUCIÓN PORCENTUAL (DOUGHNUT) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <PieIcon size={16} className="text-[#1e617a]" />
              Distribución Porcentual del Capital
            </h2>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-semibold">
              Proporción
            </span>
          </div>
          {/* ALTURA AUMENTADA A 330px */}
          <div className="h-[330px] w-full flex items-center justify-center">
            <Doughnut data={dataDoughnut} options={{ ...chartOptionsBase, cutout: "62%" }} />
          </div>
        </div>

      </div>

      {/* 🚀 BLOQUE 2: GRÁFICO DE EVOLUCIÓN COMPLETO (ANCHO TOTAL - 360px) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
            <Activity size={16} className="text-[#1e617a]" />
            Evolución Financiera Histórica en el Tiempo
          </h2>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded font-semibold">
            Flujo Acumulado
          </span>
        </div>
        {/* ALTURA AUMENTADA A 360px */}
        <div className="h-[360px] w-full">
          <Line data={dataLinea} options={chartOptionsBase} />
        </div>
      </div>

      {/* 🚀 BLOQUE 3: ANÁLISIS DE USUARIOS Y EQUILIBRIO (MÁS ALTOS - 320px) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* TOP USUARIOS SALDO */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <Users size={16} className="text-[#1e617a]" />
              Top 5: Clientes con Mayor Capital Disponible
            </h2>
            <span className="text-[10px] bg-sky-50 text-sky-700 px-2.5 py-1 rounded font-semibold">
              Saldo
            </span>
          </div>
          <div className="h-[320px] w-full">
            <Bar 
              data={dataUsuariosSaldo} 
              options={{
                ...chartOptionsBase,
                indexAxis: "y"
              }} 
            />
          </div>
        </div>

        {/* TOP USUARIOS GASTO */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <TrendingDown size={16} className="text-rose-500" />
              Top 5: Clientes con Mayor Nivel de Gastos
            </h2>
            <span className="text-[10px] bg-rose-50 text-rose-700 px-2.5 py-1 rounded font-semibold">
              Egresos
            </span>
          </div>
          <div className="h-[320px] w-full">
            <Bar 
              data={dataGastosUsuarios} 
              options={chartOptionsBase} 
            />
          </div>
        </div>

      </div>

      {/* 🚀 BLOQUE 4: COMPOSICIÓN Y RADAR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* BARRAS APILADAS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <Percent size={16} className="text-[#1e617a]" />
              Composición de Flujo Consolidado
            </h2>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-semibold">
              Apilado
            </span>
          </div>
          <div className="h-[320px] w-full">
            <Bar 
              data={dataApiladas} 
              options={{
                ...chartOptionsBase,
                scales: {
                  x: { stacked: true, grid: { display: false } },
                  y: { stacked: true, grid: { color: "#f1f5f9" } }
                }
              }} 
            />
          </div>
        </div>

        {/* EQUILIBRIO OPERATIVO (RADAR) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} className="text-[#1e617a]" />
              Perfil de Balance y Equilibrio
            </h2>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-semibold">
              Radar
            </span>
          </div>
          <div className="h-[320px] w-full flex items-center justify-center">
            <Radar data={dataRadar} options={chartOptionsBase} />
          </div>
        </div>

      </div>

    </div>
  );
}

// COMPONENTE KPI DE TARJETA
function KpiStat({ title, value, subtitle, icon: Icon, color = "navy" }) {
  const styles = {
    emerald: "bg-emerald-500 text-white",
    rose: "bg-rose-500 text-white",
    sky: "bg-sky-500 text-white",
    amber: "bg-amber-500 text-white",
    navy: "bg-[#1e617a] text-white",
  };

  return (
    <div className={`p-4 rounded-2xl shadow-sm ${styles[color]} flex flex-col justify-between relative overflow-hidden transition-all hover:scale-[1.01]`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold opacity-80 uppercase tracking-wider">{title}</p>
          <h2 className="text-xl font-black mt-1 tracking-tight">{value}</h2>
        </div>
        <div className="p-2 bg-white/20 rounded-xl">
          <Icon size={18} />
        </div>
      </div>
      {subtitle && (
        <p className="text-[10px] font-medium opacity-90 mt-2 pt-2 border-t border-white/20">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default Estadisticas;