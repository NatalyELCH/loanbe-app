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
  RefreshCw,
  Cpu,
  GitCommit,
  Info,
  Scale,
  CalendarCheck
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

  // 📊 RESUMEN DEL SISTEMA
  const dataSistema = useMemo(() => {
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

  // 💰 SALDO TOTAL DE USUARIOS
  const saldoUsuarios = useMemo(() => {
    return clientes.reduce((acc, u) => acc + Number(u.saldo || 0), 0);
  }, [clientes]);

  const promedioSaldo = clientes.length ? saldoUsuarios / clientes.length : 0;

  // 2. Procesamiento por Meses para Evolución y Modelos IA
  const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  
  const datosPorMes = useMemo(() => {
    const acumulado = {};
    transacciones.forEach(t => {
      const fecha = new Date(t.createdAt || t.fecha || Date.now());
      const mesKey = `${fecha.getFullYear()}-${fecha.getMonth()}`;
      const nombreMes = mesesNombres[fecha.getMonth()];
      
      if (!acumulado[mesKey]) {
        acumulado[mesKey] = { name: nombreMes, ingresos: 0, gastos: 0, balance: 0, volumenTotal: 0 };
      }
      
      const monto = Number(t.monto || 0);
      acumulado[mesKey].volumenTotal += monto;
      if (t.tipo === "ingreso") {
        acumulado[mesKey].ingresos += monto;
        acumulado[mesKey].balance += monto;
      } else if (t.tipo === "gasto") {
        acumulado[mesKey].gastos += monto;
        acumulado[mesKey].balance -= monto;
      }
    });

    const ordenados = Object.values(acumulado);
    return ordenados.length > 0 ? ordenados : [{ name: "Actual", ingresos: dataSistema.ingresos, gastos: dataSistema.gastos, balance: dataSistema.ingresos - dataSistema.gastos, volumenTotal: dataSistema.ingresos + dataSistema.gastos }];
  }, [transacciones, dataSistema]);

  // --- MODELO PREDICTIVO: REGRESIÓN LINEAL (Volumen de Operaciones Globales) ---
  const prediccionVolumenProximoMes = useMemo(() => {
    const y = datosPorMes.map(d => d.volumenTotal);
    const n = y.length;
    if (n === 0) return 0;
    if (n === 1) return y[0];

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += y[i];
      sumXY += i * y[i];
      sumXX += i * i;
    }

    const denominator = (n * sumXX - sumX * sumX);
    if (denominator === 0) return y[n - 1];

    const m = (n * sumXY - sumX * sumY) / denominator;
    const b = (sumY - m * sumX) / denominator;

    const proximoValor = m * n + b;
    return Math.max(0, proximoValor);
  }, [datosPorMes]);

  // --- MODELO DE MACHINE LEARNING: CLUSTERING K-MEANS (Transacciones Globales) ---
  const clustersKMeans = useMemo(() => {
    const montosValidos = transacciones.map(t => Number(t.monto || 0)).filter(m => m > 0);
    if (montosValidos.length === 0) return { bajos: 0, medios: 0, altos: 0 };

    let min = Math.min(...montosValidos);
    let max = Math.max(...montosValidos);
    let c1 = min + (max - min) * 0.2; 
    let c2 = min + (max - min) * 0.5; 
    let c3 = min + (max - min) * 0.8; 

    let clusters = { bajos: 0, medios: 0, altos: 0 };

    for (let iter = 0; iter < 5; iter++) {
      let grupo1 = [], grupo2 = [], grupo3 = [];

      montosValidos.forEach(m => {
        let d1 = Math.abs(m - c1);
        let d2 = Math.abs(m - c2);
        let d3 = Math.abs(m - c3);

        if (d1 <= d2 && d1 <= d3) grupo1.push(m);
        else if (d2 <= d1 && d2 <= d3) grupo2.push(m);
        else grupo3.push(m);
      });

      if (grupo1.length > 0) c1 = grupo1.reduce((a, b) => a + b, 0) / grupo1.length;
      if (grupo2.length > 0) c2 = grupo2.reduce((a, b) => a + b, 0) / grupo2.length;
      if (grupo3.length > 0) c3 = grupo3.reduce((a, b) => a + b, 0) / grupo3.length;

      clusters = {
        bajos: grupo1.length,
        medios: grupo2.length,
        altos: grupo3.length,
        valBajo: c1,
        valMedio: c2,
        valAlto: c3
      };
    }

    return clusters;
  }, [transacciones]);

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
          dataSistema.ingresos,
          dataSistema.gastos,
          dataSistema.ahorros,
          dataSistema.prestamos,
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
          dataSistema.ingresos,
          dataSistema.gastos,
          dataSistema.ahorros,
          dataSistema.prestamos,
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
          dataSistema.ingresos,
          dataSistema.gastos,
          dataSistema.ahorros,
          dataSistema.prestamos,
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
      { label: "Ingresos", data: [dataSistema.ingresos], backgroundColor: "#10b981" },
      { label: "Gastos", data: [dataSistema.gastos], backgroundColor: "#ef4444" },
      { label: "Ahorros", data: [dataSistema.ahorros], backgroundColor: "#0284c7" },
      { label: "Préstamos", data: [dataSistema.prestamos], backgroundColor: "#f59e0b" },
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
            Monitoreo analítico de balance, distribución de capital y comportamiento de usuarios en la plataforma.
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
          value={`$${dataSistema.ingresos.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          color="emerald"
        />

        <KpiStat
          title="Gastos"
          value={`$${dataSistema.gastos.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={TrendingDown}
          color="rose"
        />

        <KpiStat
          title="Ahorros"
          value={`$${dataSistema.ahorros.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={PiggyBank}
          color="sky"
        />

        <KpiStat
          title="Préstamos"
          value={`$${dataSistema.prestamos.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
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

      {/* --- SECCIÓN INTELIGENCIA ARTIFICIAL: REGRESIÓN LINEAL Y CLUSTERING K-MEANS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Regresión Lineal (Predicción Global) */}
        <div className="bg-gradient-to-br from-[#1e617a] to-[#144356] text-white p-6 rounded-2xl shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-cyan-200 text-xs font-bold uppercase tracking-wider">
                <Cpu size={16} />
                <span>Regresión Lineal (Predicción IA)</span>
              </div>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-200 px-2.5 py-1 rounded font-semibold border border-cyan-400/30">
                Tendencia Global
              </span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight mt-1 mb-2">
              Volumen Estimado Próximo Mes: ${prediccionVolumenProximoMes.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <p className="text-xs text-cyan-100/80 leading-relaxed mb-4">
              Modelo predictivo basado en mínimos cuadrados que analiza el comportamiento histórico de las transacciones acumuladas para proyectar el flujo monetario futuro del sistema de gestión.
            </p>
          </div>
          <div className="bg-black/20 p-3 rounded-xl backdrop-blur-xs flex items-center gap-3">
            <CalendarCheck size={20} className="text-cyan-300 shrink-0" />
            <span className="text-[11px] text-cyan-100 font-medium">Proyección automatizada para planificación de liquidez de la plataforma.</span>
          </div>
        </div>

        {/* Clustering K-Means (Segmentación de Movimientos Globales) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <GitCommit size={16} className="text-[#1e617a]" />
                <span>Clustering K-Means (Segmentación Global)</span>
              </h2>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-semibold">
                K = 3 Centroides
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-3 my-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Bajos (~${(clustersKMeans.valBajo || 0).toFixed(0)})</span>
                <span className="text-emerald-600 text-lg font-black">{clustersKMeans.bajos}</span>
                <span className="text-[9px] text-slate-400 block">operaciones</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Medios (~${(clustersKMeans.valMedio || 0).toFixed(0)})</span>
                <span className="text-amber-600 text-lg font-black">{clustersKMeans.medios}</span>
                <span className="text-[9px] text-slate-400 block">operaciones</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Altos (~${(clustersKMeans.valAlto || 0).toFixed(0)})</span>
                <span className="text-rose-600 text-lg font-black">{clustersKMeans.altos}</span>
                <span className="text-[9px] text-slate-400 block">operaciones</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex gap-2 items-center">
            <Info size={14} className="text-[#1e617a] shrink-0" />
            Clasifica automáticamente todas las transacciones de la plataforma en perfiles de impacto financiero.
          </p>
        </div>

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
              Top 5: Usuarios con Mayor Capital Disponible
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
              Top 5: Usuarios con Mayor Nivel de Gastos
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