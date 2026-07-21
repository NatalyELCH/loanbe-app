import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import API_URL from "../config";
import {
  PlusCircle,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  History,
  AlertCircle,
  Search,
  Filter,
  Loader2,
  Trash2,
  Pencil,
  X,
  Check,
} from "lucide-react";

function Transacciones() {
  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "null");
    } catch {
      return null;
    }
  }, []);

  const [tipo, setTipo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [monto, setMonto] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingTable, setLoadingTable] = useState(true);
  const [historial, setHistorial] = useState([]);

  // Estado para la edición de transacciones
  const [editandoId, setEditandoId] = useState(null);
  const [formEdit, setFormEdit] = useState({ tipo: "", categoria: "", monto: "" });

  // Filtros de búsqueda
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");

  /* =========================================
     CATEGORÍAS
  ========================================= */
  const categorias = {
    ingreso: ["salario", "negocio", "freelance", "ventas", "inversion"],
    gasto: ["comida", "transporte", "ropa", "salud", "educacion", "entretenimiento"],
    ahorro: ["cuenta ahorro", "fondo emergencia", "ahorro personal"],
    prestamo: ["hipotecario", "estudiantil", "personal"],
  };

  const categoriasDisponibles = useMemo(() => {
    return categorias[tipo] || [];
  }, [tipo]);

  // Categorías disponibles específicamente para el modo edición
  const categoriasDisponiblesEdit = useMemo(() => {
    return categorias[formEdit.tipo] || [];
  }, [formEdit.tipo]);

  /* =========================================
     CARGAR HISTORIAL LOCAL DEL USUARIO
  ========================================= */
  useEffect(() => {
    if (usuario?._id) {
      cargarHistorial();
    } else {
      setLoadingTable(false);
    }
  }, [usuario?._id]);

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
      console.error("Error al cargar historial:", error);
    } finally {
      setLoadingTable(false);
    }
  };

  /* =========================================
     NORMALIZADOR & RESET
  ========================================= */
  const normalizar = (s) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const resetForm = () => {
    setTipo("");
    setCategoria("");
    setMonto("");
  };

  /* =========================================
     VALIDACIÓN
  ========================================= */
  const validarFormulario = () => {
    if (!usuario?._id) return "No se ha detectado una sesión activa de usuario.";
    if (!tipo) return "Debes seleccionar un tipo de transacción.";
    if (!categoria) return "Debes seleccionar una categoría.";
    if (!monto || Number(monto) <= 0) return "Ingresa un monto válido mayor a 0.";
    return null;
  };

  /* =========================================
     GUARDAR TRANSACCIÓN
  ========================================= */
  const guardarTransaccion = async (e) => {
    e.preventDefault();
    const error = validarFormulario();

    if (error) {
      alert(error);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        usuario_id: usuario._id,
        tipo: normalizar(tipo),
        categoria: normalizar(categoria),
        monto: Number(monto),
      };

      const respuesta = await axios.post(`${API_URL}/transacciones`, payload);

      if (respuesta.data?.saldoActual !== undefined) {
        const usuarioActualizado = {
          ...usuario,
          saldo: respuesta.data.saldoActual,
        };
        localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
      }

      alert("Transacción registrada con éxito.");
      resetForm();
      cargarHistorial();
    } catch (err) {
      console.error("ERROR TRANSACCION:", err);
      alert("Error al procesar la transacción. Verifica la conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     ELIMINAR TRANSACCIÓN (Actualiza Saldo en LocalStorage)
  ========================================= */
  const eliminarTransaccion = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta transacción?")) return;

    try {
      const respuesta = await axios.delete(`${API_URL}/transacciones/${id}`);

      if (respuesta.data?.saldoActual !== undefined) {
        const usuarioActualizado = {
          ...usuario,
          saldo: respuesta.data.saldoActual,
        };
        localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
      }

      alert("Transacción eliminada correctamente.");
      cargarHistorial();
    } catch (error) {
      console.error("Error al eliminar transacción:", error);
      alert("No se pudo eliminar la transacción.");
    }
  };

  /* =========================================
     EDITAR TRANSACCIÓN
  ========================================= */
  const iniciarEdicion = (t) => {
    setEditandoId(t._id);
    setFormEdit({
      tipo: t.tipo,
      categoria: t.categoria,
      monto: t.monto,
    });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setFormEdit({ tipo: "", categoria: "", monto: "" });
  };

  const guardarEdicion = async (id) => {
    if (!formEdit.tipo || !formEdit.categoria || !formEdit.monto || Number(formEdit.monto) <= 0) {
      alert("Ingresa datos válidos.");
      return;
    }

    try {
      const respuesta = await axios.put(`${API_URL}/transacciones/${id}`, {
        tipo: normalizar(formEdit.tipo),
        categoria: normalizar(formEdit.categoria),
        monto: Number(formEdit.monto),
      });

      if (respuesta.data?.saldoActual !== undefined) {
        const usuarioActualizado = {
          ...usuario,
          saldo: respuesta.data.saldoActual,
        };
        localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
      }

      alert("Transacción actualizada correctamente.");
      cancelarEdicion();
      cargarHistorial();
    } catch (error) {
      console.error("Error al actualizar la transacción:", error);
      alert("Error al actualizar la transacción.");
    }
  };

  /* =========================================
     CÁLCULOS Y FILTRADO EN TIEMPO REAL
  ========================================= */
  const totales = useMemo(() => {
    return historial.reduce(
      (acc, t) => {
        const m = Number(t.monto || 0);
        if (t.tipo === "ingreso") acc.ingresos += m;
        else if (t.tipo === "gasto") acc.gastos += m;
        else if (t.tipo === "ahorro") acc.ahorros += m;
        return acc;
      },
      { ingresos: 0, gastos: 0, ahorros: 0 }
    );
  }, [historial]);

  const historialFiltrado = useMemo(() => {
    return historial
      .slice()
      .reverse()
      .filter((t) => {
        const coincideTipo =
          filtroTipo === "todos" || normalizar(t.tipo) === normalizar(filtroTipo);

        const textoBusqueda = normalizar(busqueda);
        const coincideTexto =
          normalizar(t.categoria).includes(textoBusqueda) ||
          normalizar(t.tipo).includes(textoBusqueda);

        return coincideTipo && coincideTexto;
      });
  }, [historial, filtroTipo, busqueda]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-left font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* BANNER / HEADER */}
        <div className="bg-[#1e617a] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider mb-1">
              <Wallet size={16} />
              <span>Módulo Financiero</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Registro de Transacciones
            </h1>
            <p className="text-white/80 text-xs md:text-sm mt-0.5">
              Gestiona tus entradas, salidas, ahorros y préstamos en tiempo real.
            </p>
          </div>

          {usuario && (
            <div className="bg-white/15 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center self-center min-w-[130px]">
              <span className="text-[10px] uppercase text-white/70 font-semibold block tracking-wider">
                Usuario Activo
              </span>
              <span className="text-sm font-bold text-white mt-0.5">
                {usuario.nombre || "Cliente"}
              </span>
            </div>
          )}
        </div>

        {!usuario && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-800 text-xs font-semibold">
            <AlertCircle size={18} className="text-amber-600 shrink-0" />
            <span>Atención: No se ha detectado un usuario activo. Inicia sesión para poder registrar movimientos.</span>
          </div>
        )}

        {/* MÉTRICAS RÁPIDAS (KPIs) */}
        {usuario && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Ingresos Totales</p>
                <p className="text-lg font-extrabold text-emerald-600">${totales.ingresos.toFixed(2)}</p>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                <ArrowDownLeft size={20} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Gastos Totales</p>
                <p className="text-lg font-extrabold text-rose-500">${totales.gastos.toFixed(2)}</p>
              </div>
              <div className="p-2.5 bg-rose-50 rounded-xl text-rose-500">
                <ArrowUpRight size={20} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Ahorro Reserva</p>
                <p className="text-lg font-extrabold text-sky-600">${totales.ahorros.toFixed(2)}</p>
              </div>
              <div className="p-2.5 bg-sky-50 rounded-xl text-sky-600">
                <PiggyBank size={20} />
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            ANÁLISIS FINANCIERO INTELIGENTE (LOANBE INSIGHTS)
        ========================================= */}
        {usuario && historial.length > 0 && (() => {
          const totalGastos = totales.gastos;
          const totalIngresos = totales.ingresos;
          const totalAhorros = totales.ahorros;
          const esGastoAlto = totalGastos > totalIngresos && totalIngresos > 0;
          const porcentajeAhorro = totalIngresos > 0 ? (totalAhorros / totalIngresos) * 100 : 0;

          return (
            <div className="bg-gradient-to-r from-slate-900 to-[#1e617a] rounded-2xl p-5 text-white shadow-md space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                <AlertCircle size={16} />
                <span>💡 Análisis Financiero Inteligente (LoanBe Insights)</span>
              </div>
              
              <div className="space-y-2 text-xs md:text-sm text-slate-200">
                {esGastoAlto && (
                  <p className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                    ⚠️ <span className="font-semibold">Atención:</span> Tus gastos totales (${totalGastos.toFixed(2)}) están superando tus ingresos registrados. ¡Vigila tu presupuesto!
                  </p>
                )}

                {porcentajeAhorro >= 20 && (
                  <p className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                    🎉 <span className="font-semibold">¡Excelente ritmo!:</span> Estás destinando un {porcentajeAhorro.toFixed(0)}% de tus entradas al ahorro. ¡Vas por buen camino!
                  </p>
                )}

                {!esGastoAlto && totalIngresos > 0 && (
                  <p className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                    💡 <span className="font-semibold">Consejo del día:</span> Mantén el balance actual controlando tus movimientos para maximizar tu capital libre.
                  </p>
                )}
              </div>
            </div>
          );
        })()}

        {/* FORMULARIO DE REGISTRO */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5 flex items-center gap-2">
            <PlusCircle size={16} className="text-[#1e617a]" />
            Nueva Operación
          </h2>

          <form onSubmit={guardarTransaccion} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-slate-600">Tipo de Movimiento</label>
              <select
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1e617a] transition-all cursor-pointer"
                value={tipo}
                onChange={(e) => {
                  setTipo(e.target.value);
                  setCategoria("");
                }}
              >
                <option value="">Selecciona tipo...</option>
                <option value="ingreso">Ingreso (+)</option>
                <option value="gasto">Gasto (-)</option>
                <option value="ahorro">Ahorro (Reserva)</option>
                <option value="prestamo">Préstamo (Crédito)</option>
              </select>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-slate-600">Categoría</label>
              <select
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1e617a] transition-all cursor-pointer disabled:opacity-50"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                disabled={!tipo}
              >
                <option value="">
                  {tipo ? "Selecciona categoría..." : "Selecciona un tipo primero"}
                </option>
                {categoriasDisponibles.map((item, index) => (
                  <option key={index} value={item} className="capitalize">
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-slate-600">Monto ($)</label>
              <input
                type="number"
                step="0.01"
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1e617a] transition-all"
                placeholder="0.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />
            </div>

            <div className="md:col-span-3 pt-2">
              <button
                type="submit"
                disabled={loading || !usuario}
                className="w-full bg-[#1e617a] hover:bg-[#174b5f] active:scale-[0.99] disabled:opacity-50 text-white font-bold text-xs py-3.5 px-4 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Procesando operación...
                  </>
                ) : (
                  "Guardar Transacción"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* HISTORIAL RECIENTE */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <History size={16} className="text-[#1e617a]" />
              Mis Movimientos Recientes
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              Mostrando: {historialFiltrado.length} de {historial.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
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

            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["todos", "ingreso", "gasto", "ahorro", "prestamo"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltroTipo(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer whitespace-nowrap ${
                    filtroTipo === f
                      ? "bg-[#1e617a] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* TABLA CON ACCIONES */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="p-3">N°</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3">Monto</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {loadingTable ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">
                      <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#1e617a]" />
                      Cargando historial...
                    </td>
                  </tr>
                ) : historialFiltrado.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">
                      <Filter size={24} className="mx-auto mb-2 text-slate-300" />
                      No se encontraron transacciones que coincidan.
                    </td>
                  </tr>
                ) : (
                  historialFiltrado.map((t, idx) => {
                    const rawFecha = t.createdAt || t.fecha || t.date || t.created_at;
                    const fecha = rawFecha ? new Date(rawFecha).toLocaleDateString() : "N/A";
                    const esEditando = editandoId === t._id;

                    return (
                      <tr key={t._id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-semibold text-slate-400">{idx + 1}</td>
                        
                        {/* TIPO */}
                        <td className="p-3">
                          {esEditando ? (
                            <select
                              value={formEdit.tipo}
                              onChange={(e) =>
                                setFormEdit({
                                  ...formEdit,
                                  tipo: e.target.value,
                                  categoria: "",
                                })
                              }
                              className="bg-white border rounded p-1 text-xs"
                            >
                              <option value="ingreso">Ingreso</option>
                              <option value="gasto">Gasto</option>
                              <option value="ahorro">Ahorro</option>
                              <option value="prestamo">Préstamo</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md ${
                                t.tipo === "ingreso"
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                  : t.tipo === "gasto"
                                  ? "bg-rose-50 text-rose-600 border border-rose-100"
                                  : t.tipo === "ahorro"
                                  ? "bg-sky-50 text-sky-600 border border-sky-100"
                                  : "bg-amber-50 text-amber-600 border border-amber-100"
                              }`}
                            >
                              {t.tipo}
                            </span>
                          )}
                        </td>

                        {/* CATEGORÍA (SELECTOR DINÁMICO AL EDITAR) */}
                        <td className="p-3 capitalize font-medium">
                          {esEditando ? (
                            <select
                              value={formEdit.categoria}
                              onChange={(e) =>
                                setFormEdit({ ...formEdit, categoria: e.target.value })
                              }
                              className="bg-white border rounded p-1 text-xs w-32"
                            >
                              <option value="">Selecciona...</option>
                              {categoriasDisponiblesEdit.map((cat, i) => (
                                <option key={i} value={cat} className="capitalize">
                                  {cat}
                                </option>
                              ))}
                            </select>
                          ) : (
                            t.categoria
                          )}
                        </td>

                        {/* MONTO */}
                        <td className="p-3 font-bold text-slate-800">
                          {esEditando ? (
                            <input
                              type="number"
                              step="0.01"
                              value={formEdit.monto}
                              onChange={(e) =>
                                setFormEdit({ ...formEdit, monto: e.target.value })
                              }
                              className="bg-white border rounded p-1 text-xs w-20"
                            />
                          ) : (
                            `$${Number(t.monto || 0).toFixed(2)}`
                          )}
                        </td>

                        <td className="p-3 text-slate-400">{fecha}</td>

                        {/* ACCIONES */}
                        <td className="p-3 text-center">
                          {esEditando ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => guardarEdicion(t._id)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                title="Guardar Cambios"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={cancelarEdicion}
                                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition"
                                title="Cancelar"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => iniciarEdicion(t)}
                                className="p-1.5 text-slate-500 hover:text-[#1e617a] hover:bg-slate-100 rounded-lg transition"
                                title="Editar"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => eliminarTransaccion(t._id)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Eliminar"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          )}
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
    </div>
  );
}

export default Transacciones;