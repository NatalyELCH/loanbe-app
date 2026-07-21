import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import API_URL from "../config";
import { exportarAExcel, exportarACSV, exportarAPDF } from "../utils/exportUtils";
import { 
  Download, 
  FileText,
  ArrowUpRight, 
  ArrowDownRight, 
  PiggyBank, 
  HandCoins, 
  Wallet, 
  Activity, 
  Filter,
  CreditCard,
  Building2,
  TrendingUp,
  PieChart as PieChartIcon
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  RadialLinearScale,
  Filler,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Line, Radar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  RadialLinearScale,
  Filler,
  Title,
  Tooltip,
  Legend
);

// Formateador de moneda profesional
const formatCurrency = (val) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(val || 0);
};

function Dashboard() {
  const [transacciones, setTransacciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("todos");

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    try {
      const [t, u] = await Promise.all([
        axios.get(`${API_URL}/transacciones`),
        axios.get(`${API_URL}/usuarios`)
      ]);
      setTransacciones(t.data || []);
      setUsuarios(u.data || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  // Filtrar para excluir usuarios con rol de administrador del menú desplegable
  const clientes = useMemo(() => {
    return usuarios.filter(
      (u) => u.rol?.toLowerCase() !== "admin" && u.tipo?.toLowerCase() !== "admin"
    );
  }, [usuarios]);

  const transaccionesFiltradas = useMemo(() => {
    if (usuarioSeleccionado === "todos") return transacciones;
    return transacciones.filter((t) => {
      const id = typeof t.usuario_id === "object" ? t.usuario_id._id : t.usuario_id;
      return String(id) === String(usuarioSeleccionado);
    });
  }, [transacciones, usuarioSeleccionado]);
/* =========================================
    HELPER Y EXPORTACIONES DE REPORTES
========================================= */
const obtenerDatosParaExportar = () => {
  if (!transaccionesFiltradas || transaccionesFiltradas.length === 0) {
    alert("No hay transacciones disponibles para exportar en este filtro.");
    return null;
  }
  return transaccionesFiltradas.map((t, index) => {
    // Buscar el nombre del titular considerando varias estructuraciones posibles
    let nombreUsuario = "N/A";
    if (typeof t.usuario_id === "object" && t.usuario_id !== null) {
      nombreUsuario = t.usuario_id.nombre || t.usuario_id.name || t.usuario_id.username || "N/A";
    } else if (typeof t.usuario === "object" && t.usuario !== null) {
      nombreUsuario = t.usuario.nombre || t.usuario.name || "N/A";
    } else if (typeof t.usuario_id === "string") {
      // Buscar si el ID coincide con alguno de los usuarios de la lista
      const uEncontrado = usuarios.find((u) => String(u._id) === String(t.usuario_id));
      if (uEncontrado) nombreUsuario = uEncontrado.nombre;
    }

    // Buscar la fecha en diferentes formatos de clave (createdAt, fecha, date, created_at)
    const rawFecha = t.createdAt || t.fecha || t.date || t.created_at;
    const fechaFormateada = rawFecha ? new Date(rawFecha).toLocaleDateString() : "N/A";

    return {
      "N°": index + 1,
      "ID Transacción": t._id || "N/A",
      "Titular / Usuario": nombreUsuario,
      "Tipo": (t.tipo || "N/A").toUpperCase(),
      "Categoría": t.categoria || "N/A",
      "Monto ($)": Number(t.monto || 0),
      "Fecha": fechaFormateada,
    };
  });
};

const exportarReporteExcel = () => {
  const datos = obtenerDatosParaExportar();
  if (!datos) return;
  const fechaHoy = new Date().toISOString().split("T")[0];
  const sufijo = usuarioSeleccionado === "todos" ? "General" : "Cliente";
  exportarAExcel(datos, `Reporte_Financiero_${sufijo}_${fechaHoy}.xlsx`);
};

const exportarReporteCSV = () => {
  const datos = obtenerDatosParaExportar();
  if (!datos) return;
  const fechaHoy = new Date().toISOString().split("T")[0];
  const sufijo = usuarioSeleccionado === "todos" ? "General" : "Cliente";
  exportarACSV(datos, `Reporte_Financiero_${sufijo}_${fechaHoy}.csv`);
};

const exportarReportePDF = () => {
  if (!transaccionesFiltradas || transaccionesFiltradas.length === 0) {
    alert("No hay transacciones disponibles para exportar.");
    return;
  }

  const datosFormateados = transaccionesFiltradas.map((t, index) => {
    // Buscar el nombre del titular
    let nombreUsuario = "N/A";
    if (typeof t.usuario_id === "object" && t.usuario_id !== null) {
      nombreUsuario = t.usuario_id.nombre || t.usuario_id.name || t.usuario_id.username || "N/A";
    } else if (typeof t.usuario === "object" && t.usuario !== null) {
      nombreUsuario = t.usuario.nombre || t.usuario.name || "N/A";
    } else if (typeof t.usuario_id === "string") {
      const uEncontrado = usuarios.find((u) => String(u._id) === String(t.usuario_id));
      if (uEncontrado) nombreUsuario = uEncontrado.nombre;
    }

    // Buscar la fecha
    const rawFecha = t.createdAt || t.fecha || t.date || t.created_at;
    const fechaFormateada = rawFecha ? new Date(rawFecha).toLocaleDateString() : "N/A";

    return {
      "N°": index + 1,
      "Titular": nombreUsuario,
      "Tipo": (t.tipo || "N/A").toUpperCase(),
      "Categoría": t.categoria || "N/A",
      "Monto ($)": `$${Number(t.monto || 0).toFixed(2)}`,
      "Fecha": fechaFormateada,
    };
  });

  const fechaHoy = new Date().toISOString().split("T")[0];
  const sufijo = usuarioSeleccionado === "todos" ? "General" : "Cliente";

  exportarAPDF(
    datosFormateados,
    `Reporte Financiero (${sufijo})`,
    `Reporte_Financiero_${sufijo}_${fechaHoy}.pdf`
  );
};
  /* =========================================
      CÁLCULOS Y CONFIGURACIÓN DE GRÁFICOS
  ========================================= */
  const dataSistema = useMemo(() => {
    return transaccionesFiltradas.reduce(
      (acc, t) => {
        const monto = Number(t.monto || 0);
        if (t.tipo === "ingreso") acc.ingresos += monto;
        if (t.tipo === "gasto") acc.gastos += monto;
        if (t.tipo === "ahorro") acc.ahorros += monto;
        if (t.tipo === "prestamo") acc.prestamos += monto;
        return acc;
      },
      { ingresos: 0, gastos: 0, ahorros: 0, prestamos: 0 }
    );
  }, [transaccionesFiltradas]);

  const saldoSistema = dataSistema.ingresos - dataSistema.gastos;

  // CHART CONFIG: Barras
  const dataBarras = {
    labels: ["Ingresos", "Gastos", "Ahorros", "Préstamos"],
    datasets: [
      {
        label: "Monto Total ($)",
        data: [dataSistema.ingresos, dataSistema.gastos, dataSistema.ahorros, dataSistema.prestamos],
        backgroundColor: ["#10b981", "#ef4444", "#0284c7", "#f59e0b"],
        borderRadius: 6,
        barThickness: 24,
      },
    ],
  };

  // CHART CONFIG: Línea (Evolución)
  const dataLinea = {
    labels: transaccionesFiltradas.map((_, i) => `Mov ${i + 1}`),
    datasets: [
      {
        label: "Flujo de Caja Acumulado",
        data: transaccionesFiltradas.reduce((acc, t, i) => {
          const monto = Number(t.monto || 0);
          const prev = acc[i - 1] || 0;
          const nuevo = t.tipo === "ingreso" ? prev + monto : prev - monto;
          acc.push(nuevo);
          return acc;
        }, []),
        borderColor: "#1e617a",
        backgroundColor: "rgba(30, 97, 122, 0.05)",
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  // CHART CONFIG: Radar
  const dataRadar = {
    labels: ["Ingresos", "Gastos", "Ahorros", "Préstamos"],
    datasets: [
      {
        label: "Balance General",
        data: [
          dataSistema.ingresos,
          dataSistema.gastos,
          dataSistema.ahorros,
          dataSistema.prestamos,
        ],
        backgroundColor: "rgba(30, 97, 122, 0.15)",
        borderColor: "#1e617a",
        borderWidth: 2,
        pointBackgroundColor: "#1e617a",
      },
    ],
  };

  // CHART CONFIG: Gastos Estimados (Distribución)
  const dataGastos = useMemo(() => {
    const totalGastos = dataSistema.gastos;
    return {
      labels: ["Alimentación", "Transporte", "Servicios", "Otros"],
      datasets: [
        {
          label: "Distribución de Gastos",
          data: [
            totalGastos * 0.4,
            totalGastos * 0.3,
            totalGastos * 0.2,
            totalGastos * 0.1,
          ],
          backgroundColor: ["#f43f5e", "#fb923c", "#f59e0b", "#64748b"],
          borderRadius: 6,
          barThickness: 24,
        },
      ],
    };
  }, [dataSistema]);

  const chartOptionsBase = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          font: { size: 11, family: "Inter, sans-serif", weight: "500" },
          color: "#64748b"
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { size: 11 } }
      },
      y: {
        grid: { color: "#f1f5f9" },
        ticks: { color: "#94a3b8", font: { size: 11 } }
      }
    }
  };

  return (
    <div className="w-full px-6 py-4 space-y-5 text-left">
      
      {/* TARJETAS CABECERA PRINCIPAL */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1e617a] tracking-wider uppercase">
            <Building2 size={15} />
            <span>Consola Financiera LoanBe</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Resumen General de Cuentas
          </h1>
          <p className="text-slate-500 text-sm">
            Monitoreo en tiempo real de operaciones, flujos de caja y estados financieros.
          </p>
        </div>

        {/* GRUPO DE FILTRO Y BOTONES DE EXPORTACIÓN */}
        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          
          {/* SELECTOR DE USUARIO FILTRADO */}
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs text-[#1e617a]">
              <Filter size={16} />
            </div>
            <div className="flex flex-col text-left pr-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Filtrar Titular</span>
              <select
                value={usuarioSeleccionado}
                onChange={(e) => setUsuarioSeleccionado(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer py-0.5 pr-2"
              >
                <option value="todos">Todos los Clientes / Cuentas</option>
                {clientes.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* BOTÓN EXPORTAR EXCEL */}
          <button
            onClick={exportarReporteExcel}
            className="flex items-center gap-2 bg-[#1e617a] hover:bg-[#174b5f] active:scale-95 text-white text-xs font-bold px-4 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
            title="Exportar reporte a Excel"
          >
            <Download size={16} />
            <span>Excel</span>
          </button>

          {/* BOTÓN EXPORTAR CSV */}
          <button
            onClick={exportarReporteCSV}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold px-4 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
            title="Exportar reporte a CSV"
          >
            <Download size={16} />
            <span>CSV</span>
          </button>

          {/* BOTÓN EXPORTAR PDF */}
          <button
            onClick={exportarReportePDF}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold px-4 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
            title="Exportar reporte a PDF"
          >
            <FileText size={16} />
            <span>PDF</span>
          </button>

        </div>
      </div>

      {/* BANNER DE BALANCE NETO DESTACADO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* TARJETAS PRINCIPAL BALANCE */}
        <div className="lg:col-span-2 bg-[#1e617a] rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-300 flex items-center gap-2">
              <Wallet size={16} />
              Balance Neto Consolidado
            </span>
            <span className="text-[11px] bg-white/10 text-white/90 px-3 py-1 rounded-full font-medium border border-white/10">
              Estado: Disponible
            </span>
          </div>

          <div className="my-5 z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {formatCurrency(saldoSistema)}
            </h2>
            <p className="text-xs text-white/70 mt-1 font-normal">
              Diferencia activa entre ingresos liquidados y gastos operativos registrados.
            </p>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs z-10">
            <div className="flex items-center gap-2 text-white/80">
              <Activity size={15} className="text-emerald-300" />
              <span>Transacciones Auditadas: <strong>{transaccionesFiltradas.length}</strong></span>
            </div>
            <span className="text-white/60 text-[11px]">LoanBe Core</span>
          </div>
        </div>

        {/* INDICADOR OPERATIVO */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Indicador Operativo
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp size={18} />
            </div>
          </div>

          <div className="space-y-1.5 my-2">
            <span className="text-2xl font-black text-slate-800">
              {saldoSistema >= 0 ? "Flujo Positivo" : "Déficit Temporal"}
            </span>
            <p className="text-xs text-slate-500 leading-relaxed">
              El saldo disponible actual permite cubrir los compromisos y obligaciones del periodo sin inconvenientes.
            </p>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full ${saldoSistema >= 0 ? "bg-emerald-500" : "bg-rose-500"}`} 
              style={{ width: `${Math.min(Math.max((saldoSistema / (dataSistema.ingresos || 1)) * 100, 10), 100)}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* METRICAS Y KPIS (CUATRO TARJETAS LIMPIAS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* INGRESOS */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-sm transition-all hover:border-slate-300">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Ingresos Totales
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-800">
            {formatCurrency(dataSistema.ingresos)}
          </h2>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
            ● Entradas activas
          </span>
        </div>

        {/* GASTOS */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-sm transition-all hover:border-slate-300">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Gastos Totales
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg border border-rose-100">
              <ArrowDownRight size={16} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-800">
            {formatCurrency(dataSistema.gastos)}
          </h2>
          <span className="text-[11px] text-rose-500 font-semibold mt-1 inline-block">
            ● Salidas ejecutadas
          </span>
        </div>

        {/* AHORROS */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-sm transition-all hover:border-slate-300">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Ahorros Acumulados
            </span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg border border-sky-100">
              <PiggyBank size={16} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-800">
            {formatCurrency(dataSistema.ahorros)}
          </h2>
          <span className="text-[11px] text-sky-600 font-semibold mt-1 inline-block">
            ● Fondo reservado
          </span>
        </div>

        {/* PRESTAMOS */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-sm transition-all hover:border-slate-300">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Préstamos Registrados
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
              <HandCoins size={16} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-800">
            {formatCurrency(dataSistema.prestamos)}
          </h2>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">
            ● Histórico registrado
          </span>
        </div>

      </div>

      {/* GRILLA DE GRÁFICOS ANALÍTICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* BARRAS: VOLUMEN GENERAL */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <CreditCard size={15} className="text-[#1e617a]" />
              Volumen General por Categoría
            </h2>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
              USD
            </span>
          </div>
          <div className="h-[250px] w-full">
            <Bar data={dataBarras} options={chartOptionsBase} />
          </div>
        </div>

        {/* BARRAS: DISTRIBUCIÓN DE GASTOS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <PieChartIcon size={15} className="text-[#1e617a]" />
              Distribución de Gastos Operativos
            </h2>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
              Estimado
            </span>
          </div>
          <div className="h-[250px] w-full">
            <Bar data={dataGastos} options={chartOptionsBase} />
          </div>
        </div>

        {/* LÍNEA: EVOLUCIÓN HISTÓRICA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <Activity size={15} className="text-[#1e617a]" />
              Evolución del Flujo Acumulado
            </h2>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold">
              Histórico
            </span>
          </div>
          <div className="h-[250px] w-full">
            <Line data={dataLinea} options={chartOptionsBase} />
          </div>
        </div>

        {/* RADAR: PERFIL PROPORCIONAL */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <Building2 size={15} className="text-[#1e617a]" />
              Perfil de Proporción Financiera
            </h2>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
              Equilibrio
            </span>
          </div>
          <div className="h-[250px] w-full">
            <Radar data={dataRadar} options={chartOptionsBase} />
          </div>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;