import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bar, Line, Radar, Doughnut, PolarArea } from "react-chartjs-2";

import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Wallet, 
  Activity, 
  PieChart as PieIcon, 
  ShieldCheck,
  Info,
  Layers,
  Compass,
  CalendarCheck,
  Scale,
  Cpu,
  GitCommit
} from "lucide-react";

import API_URL from "../../config";
import BottomNav from "../../mobile/BottomNav";

ChartJS.register(
  BarElement,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

function EstadisticasMobile() {
  const navigate = useNavigate();
  const [transacciones, setTransacciones] = useState([]);

  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario"));
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!usuario?._id) {
      navigate("/mobile/login");
      return;
    }
    obtenerDatos();
  }, [usuario, navigate]);

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

  // 1. Cálculos de Totales Globales
  const ingresos = transacciones
    .filter(t => t.tipo === "ingreso")
    .reduce((a, b) => a + Number(b.monto || 0), 0);

  const gastos = transacciones
    .filter(t => t.tipo === "gasto")
    .reduce((a, b) => a + Number(b.monto || 0), 0);

  const ahorros = transacciones
    .filter(t => t.tipo === "ahorro")
    .reduce((a, b) => a + Number(b.monto || 0), 0);

  const prestamos = transacciones
    .filter(t => t.tipo === "prestamo")
    .reduce((a, b) => a + Number(b.monto || 0), 0);

  // Saldo Actual
  const saldoActual = (usuario?.saldo !== undefined) ? Number(usuario.saldo) : (ingresos - gastos);

  const totalFlujo = ingresos + gastos + ahorros + prestamos || 1;
  const pIngresos = (ingresos / totalFlujo) * 100;
  const pGastos = (gastos / totalFlujo) * 100;
  const pAhorros = (ahorros / totalFlujo) * 100;
  const pPrestamos = (prestamos / totalFlujo) * 100;

  // 2. Procesamiento por Meses para Evolución y Comparación
  const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  
  const datosPorMes = useMemo(() => {
    const acumulado = {};
    transacciones.forEach(t => {
      const fecha = new Date(t.createdAt || t.fecha || Date.now());
      const mesKey = `${fecha.getFullYear()}-${fecha.getMonth()}`;
      const nombreMes = mesesNombres[fecha.getMonth()];
      
      if (!acumulado[mesKey]) {
        acumulado[mesKey] = { name: nombreMes, ingresos: 0, gastos: 0, balance: 0 };
      }
      
      const monto = Number(t.monto || 0);
      if (t.tipo === "ingreso") {
        acumulado[mesKey].ingresos += monto;
        acumulado[mesKey].balance += monto;
      } else if (t.tipo === "gasto") {
        acumulado[mesKey].gastos += monto;
        acumulado[mesKey].balance -= monto;
      }
    });

    const ordenados = Object.values(acumulado);
    return ordenados.length > 0 ? ordenados : [{ name: "Actual", ingresos: ingresos, gastos: gastos, balance: ingresos - gastos }];
  }, [transacciones, ingresos, gastos]);

  // --- MODELO PREDICTIVO: REGRESIÓN LINEAL (Gastos Futuros) ---
  const prediccionGastosProximoMes = useMemo(() => {
    const y = datosPorMes.map(d => d.gastos);
    const n = y.length;
    if (n === 0) return 0;
    if (n === 1) return y[0];

    // Regresión lineal simple: y = mx + b (x es el índice del mes 0, 1, 2...)
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

    // Predecir para el siguiente índice (n)
    const proximoValor = m * n + b;
    return Math.max(0, proximoValor);
  }, [datosPorMes]);

  // --- MODELO DE MACHINE LEARNING: CLUSTERING K-MEANS (Simplificado en JS para Transacciones) ---
  const clustersKMeans = useMemo(() => {
    const montosValidos = transacciones.map(t => Number(t.monto || 0)).filter(m => m > 0);
    if (montosValidos.length === 0) return { bajos: 0, medios: 0, altos: 0 };

    // Inicializar 3 centroides aproximados basados en Min y Max (K=3: Bajos, Medios, Altos)
    let min = Math.min(...montosValidos);
    let max = Math.max(...montosValidos);
    let c1 = min + (max - min) * 0.2; // Centroide Bajo
    let c2 = min + (max - min) * 0.5; // Centroide Medio
    let c3 = min + (max - min) * 0.8; // Centroide Alto

    let clusters = { bajos: 0, medios: 0, altos: 0 };

    // Simular 5 iteraciones de K-Means
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

  // Datos para Gráfico de Líneas (Evolución Mensual)
  const flujoLinea = {
    labels: datosPorMes.map(d => d.name),
    datasets: [{
      label: "Ingresos Mensuales ($)",
      data: datosPorMes.map(d => d.ingresos),
      borderColor: "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.08)",
      borderWidth: 2,
      pointBackgroundColor: "#10b981",
      pointRadius: 4,
      fill: true,
      tension: 0.3,
    }, {
      label: "Gastos Mensuales ($)",
      data: datosPorMes.map(d => d.gastos),
      borderColor: "#f43f5e",
      backgroundColor: "rgba(244, 63, 94, 0.08)",
      borderWidth: 2,
      pointBackgroundColor: "#f43f5e",
      pointRadius: 4,
      fill: true,
      tension: 0.3,
    }]
  };

  // Comparación entre el mes actual y el anterior
  const mesActualData = datosPorMes[datosPorMes.length - 1] || { ingresos: 0, gastos: 0, balance: 0 };
  const mesAnteriorData = datosPorMes[datosPorMes.length - 2] || { ingresos: 0, gastos: 0, balance: 0 };
  const diferenciaBalance = mesActualData.balance - mesAnteriorData.balance;

  const coloresGraficos = [
    "rgba(16, 185, 129, 0.85)", 
    "rgba(244, 63, 94, 0.85)",  
    "rgba(30, 97, 122, 0.85)",  
    "rgba(245, 158, 11, 0.85)"  
  ];

  // Gráfico de Barras
  const barras = {
    labels: ["Ingresos", "Gastos", "Ahorros", "Préstamos"],
    datasets: [{ label: "Monto ($)", data: [ingresos, gastos, ahorros, prestamos], backgroundColor: coloresGraficos, borderRadius: 8 }]
  };

  // Gráfico de Dona
  const donaData = {
    labels: ["Ingresos", "Gastos", "Ahorros", "Préstamos"],
    datasets: [{
      data: [ingresos, gastos, ahorros, prestamos],
      backgroundColor: coloresGraficos,
      borderWidth: 2,
      borderColor: "#ffffff"
    }]
  };

  // Gráfico Polar
  const polarData = {
    labels: ["Ingresos", "Gastos", "Ahorros", "Préstamos"],
    datasets: [{
      data: [ingresos, gastos, ahorros, prestamos],
      backgroundColor: [
        "rgba(16, 185, 129, 0.7)", 
        "rgba(244, 63, 94, 0.7)",  
        "rgba(30, 97, 122, 0.7)",  
        "rgba(245, 158, 11, 0.7)"  
      ]
    }]
  };

  // Gráfico de Radar
  const radarData = {
    labels: ["Ingresos", "Gastos", "Ahorros", "Préstamos"],
    datasets: [{
      label: "Balance",
      data: [ingresos, gastos, ahorros, prestamos],
      backgroundColor: "rgba(30, 97, 122, 0.15)",
      borderColor: "#1e617a",
      pointBackgroundColor: "#1e617a",
      borderWidth: 1.5,
    }],
  };

  const opcionesGenerales = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#f1f5f9" }, ticks: { font: { size: 10 }, color: "#64748b" } },
      x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' }, color: "#475569" } }
    }
  };

  const opcionesLinea = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        position: 'bottom',
        labels: { font: { size: 9, weight: 'bold' }, color: '#475569', boxWidth: 10 } 
      } 
    },
    scales: {
      y: { beginAtZero: true, grid: { color: "#f1f5f9" }, ticks: { font: { size: 10 }, color: "#64748b" } },
      x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' }, color: "#475569" } }
    }
  };

  const opcionesCircular = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 10, weight: 'bold' }, color: '#475569', boxWidth: 12 }
      }
    }
  };

  const opcionesRadar = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { r: { grid: { color: "#e2e8f0" }, ticks: { display: false } } }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 pb-28 text-left font-sans text-slate-800">
      
      {/* HEADER COMPACTO */}
      <div className="mb-4">
        <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Panel interactivo del cliente</p>
        <h1 className="text-xl font-black text-slate-900 mt-0.5 flex items-center gap-2">
          <BarChart3 className="text-[#1e617a]" size={20} /> Analítica Financiera
        </h1>
      </div>

      {/* TARJETAS RESUMEN */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Wallet size={18} /></div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Saldo Actual</span>
            <span className="text-indigo-600 text-base font-black">${saldoActual.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp size={18} /></div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Ingresos</span>
            <span className="text-emerald-600 text-base font-black">${ingresos.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-rose-50 text-rose-500 rounded-xl"><TrendingDown size={18} /></div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Gastos</span>
            <span className="text-rose-500 text-base font-black">${gastos.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-[#1e617a]/10 text-[#1e617a] rounded-xl"><PiggyBank size={18} /></div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Ahorrado</span>
            <span className="text-[#1e617a] text-base font-black">${ahorros.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN ANALÍTICA EXTRA: Balance & Comparativa */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Scale size={14} className="text-[#1e617a]" />
            <span className="text-[10px] font-bold uppercase">Balance Mensual</span>
          </div>
          <p className={`text-sm font-black ${mesActualData.balance >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
            ${mesActualData.balance.toFixed(2)}
          </p>
          <span className="text-[9px] text-slate-400">Neto del período actual</span>
        </div>

        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <CalendarCheck size={14} className="text-[#1e617a]" />
            <span className="text-[10px] font-bold uppercase">Vs Mes Anterior</span>
          </div>
          <p className={`text-sm font-black ${diferenciaBalance >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
            {diferenciaBalance >= 0 ? `+${diferenciaBalance.toFixed(2)}` : diferenciaBalance.toFixed(2)}
          </p>
          <span className="text-[9px] text-slate-400">Variación intermensual</span>
        </div>
      </div>

      {/* --- NUEVA SECCIÓN: MODELO DE INTELIGENCIA ARTIFICIAL (REGRESIÓN & CLUSTERING) --- */}
      <div className="grid grid-cols-1 gap-2.5 mb-4">
        {/* Regresión Lineal (Predicción) */}
        <div className="bg-gradient-to-br from-[#1e617a] to-[#144356] text-white rounded-3xl p-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Cpu size={18} className="text-cyan-300" />
            <h2 className="font-bold text-xs uppercase tracking-wider text-cyan-200">Regresión Lineal (Predicción de Gastos)</h2>
          </div>
          <div className="flex items-baseline justify-between bg-black/15 p-3 rounded-2xl backdrop-blur-xs mb-2">
            <div>
              <span className="text-[10px] text-cyan-100/75 block uppercase font-medium">Gasto estimado próximo mes</span>
              <span className="text-xl font-black text-white">${prediccionGastosProximoMes.toFixed(2)}</span>
            </div>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-200 px-2 py-1 rounded-lg border border-cyan-400/30">Tendencia IA</span>
          </div>
          <p className="text-[10px] text-cyan-100/80 leading-relaxed">
            Modelo matemático que calcula la línea de tendencia de tus gastos históricos para proyectar tu comportamiento financiero futuro.
          </p>
        </div>

        {/* Clustering K-Means (Segmentación de Transacciones) */}
        <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100">
          <div className="flex items-center gap-1.5 mb-2">
            <GitCommit size={16} className="text-[#1e617a]" />
            <h2 className="font-bold text-slate-800 text-xs">Clustering K-Means (Segmentación de Movimientos)</h2>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center">
              <span className="text-[9px] text-slate-400 font-bold block uppercase">Bajos (~${(clustersKMeans.valBajo || 0).toFixed(0)})</span>
              <span className="text-emerald-600 text-base font-black">{clustersKMeans.bajos}</span>
              <span className="text-[8px] text-slate-400 block">transacciones</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center">
              <span className="text-[9px] text-slate-400 font-bold block uppercase">Medios (~${(clustersKMeans.valMedio || 0).toFixed(0)})</span>
              <span className="text-amber-600 text-base font-black">{clustersKMeans.medios}</span>
              <span className="text-[8px] text-slate-400 block">transacciones</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center">
              <span className="text-[9px] text-slate-400 font-bold block uppercase">Altos (~${(clustersKMeans.valAlto || 0).toFixed(0)})</span>
              <span className="text-rose-600 text-base font-black">{clustersKMeans.altos}</span>
              <span className="text-[8px] text-slate-400 block">transacciones</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex gap-2 items-start">
            <Info size={14} className="text-[#1e617a] shrink-0 mt-0.5" />
            Agrupamiento automatizado (K=3 centroides) que clasifica tus montos en perfiles de impacto financiero.
          </p>
        </div>
      </div>

      {/* 1. GRÁFICO DE LÍNEAS (Evolución Mensual) */}
      <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100 mb-4">
        <div className="flex items-center gap-1.5 mb-1">
          <Activity size={16} className="text-[#1e617a]" />
          <h2 className="font-bold text-slate-800 text-xs">Evolución Mensual (Líneas)</h2>
        </div>
        <div className="h-44 w-full mb-2">
          <Line data={flujoLinea} options={opcionesLinea} />
        </div>
        <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex gap-2 items-start">
          <Info size={14} className="text-[#1e617a] shrink-0 mt-0.5" />
          Muestra el comportamiento y la tendencia de los ingresos y gastos a lo largo de los meses.
        </p>
      </div>

      {/* 2. GRÁFICO DE BARRAS */}
      <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100 mb-4">
        <h2 className="font-bold text-slate-800 text-xs mb-1">Volumen en Columnas</h2>
        <div className="h-40 w-full mb-2">
          <Bar data={barras} options={opcionesGenerales} />
        </div>
        <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex gap-2 items-start">
          <Info size={14} className="text-[#1e617a] shrink-0 mt-0.5" />
          Compara el monto exacto en dólares entre lo ingresado, gastado, ahorrado y prestado.
        </p>
      </div>

      {/* 3. GRÁFICO DE DONA */}
      <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100 mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <PieIcon size={16} className="text-[#1e617a]" />
          <h2 className="font-bold text-slate-800 text-xs">Proporción de Capital (Dona)</h2>
        </div>
        <div className="h-44 w-full mb-2">
          <Doughnut data={donaData} options={opcionesCircular} />
        </div>
        <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex gap-2 items-start">
          <Info size={14} className="text-[#1e617a] shrink-0 mt-0.5" />
          Permite al cliente ver de manera visual qué porción del total de su dinero ocupa cada categoría.
        </p>
      </div>

      {/* 4. GRÁFICO POLAR */}
      <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100 mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Compass size={16} className="text-[#1e617a]" />
          <h2 className="font-bold text-slate-800 text-xs">Distribución Radial (Polar)</h2>
        </div>
        <div className="h-44 w-full mb-2">
          <PolarArea data={polarData} options={opcionesCircular} />
        </div>
        <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex gap-2 items-start">
          <Info size={14} className="text-[#1e617a] shrink-0 mt-0.5" />
          Muestra los volúmenes en sectores circulares proporcionales para identificar rápidamente desequilibrios.
        </p>
      </div>

      {/* 5. GRÁFICO DE RADAR */}
      <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100 mb-4">
        <div className="flex items-center gap-1.5 mb-1">
          <ShieldCheck size={16} className="text-[#1e617a]" />
          <h2 className="font-bold text-slate-800 text-xs">Equilibrio Financiero Global</h2>
        </div>
        <div className="h-44 w-full mb-2">
          <Radar data={radarData} options={opcionesRadar} />
        </div>
        <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex gap-2 items-start">
          <Info size={14} className="text-[#1e617a] shrink-0 mt-0.5" />
          Ayuda a visualizar si las finanzas del usuario forman una estructura simétrica y saludable.
        </p>
      </div>

      {/* 6. PORCENTAJE DE AHORRO Y PROPORCIÓN LINEAL */}
      <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100 mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Layers size={16} className="text-[#1e617a]" />
          <h2 className="font-bold text-slate-800 text-xs">Porcentaje de Ahorro y Distribución</h2>
        </div>
        
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex mb-3">
          <div style={{ width: `${pIngresos}%` }} className="bg-emerald-500 h-full" />
          <div style={{ width: `${pGastos}%` }} className="bg-rose-500 h-full" />
          <div style={{ width: `${pAhorros}%` }} className="bg-[#1e617a] h-full" />
          <div style={{ width: `${pPrestamos}%` }} className="bg-amber-500 h-full" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="flex justify-between p-1.5 bg-slate-50 rounded-lg">
            <span className="text-slate-600 font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Ingresos</span>
            <span className="font-bold text-slate-800">{pIngresos.toFixed(0)}%</span>
          </div>
          <div className="flex justify-between p-1.5 bg-slate-50 rounded-lg">
            <span className="text-slate-600 font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Gastos</span>
            <span className="font-bold text-slate-800">{pGastos.toFixed(0)}%</span>
          </div>
          <div className="flex justify-between p-1.5 bg-slate-50 rounded-lg">
            <span className="text-slate-600 font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#1e617a]"></span> Ahorros</span>
            <span className="font-bold text-slate-800">{pAhorros.toFixed(0)}%</span>
          </div>
          <div className="flex justify-between p-1.5 bg-slate-50 rounded-lg">
            <span className="text-slate-600 font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Préstamos</span>
            <span className="font-bold text-slate-800">{pPrestamos.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default EstadisticasMobile;