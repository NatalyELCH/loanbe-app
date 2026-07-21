import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Plus, Trophy, Trash2, PiggyBank, PlusCircle, X, CheckCircle2 } from "lucide-react";
import BottomNav from "../../mobile/BottomNav";
import API_URL from "../../config";

function MetasAhorroMobile() {
  const navigate = useNavigate();

  const [metas, setMetas] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [montoObjetivo, setMontoObjetivo] = useState("");
  const [montoAhorrado, setMontoAhorrado] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);

  const [metaAbonandoId, setMetaAbonandoId] = useState(null);
  const [montoAbono, setMontoAbono] = useState("");
  const [errorRender, setErrorRender] = useState(null);

  // Cargar metas desde el backend al iniciar
  useEffect(() => {
    try {
      const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "null");
      const userId = usuarioGuardado?._id || usuarioGuardado?.id;

      if (!userId) {
        navigate("/mobile/login");
        return;
      }

      fetch(`${API_URL}/metas/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setMetas(data);
          }
        })
        .catch((err) => console.error("Error al cargar metas:", err));
    } catch (e) {
      console.error("Error en useEffect:", e);
      setErrorRender(e.message);
    }
  }, [navigate]);

  const guardarMeta = async (e) => {
    e.preventDefault();
    if (!titulo || !montoObjetivo || Number(montoObjetivo) <= 0) {
      alert("Por favor ingresa un nombre y un objetivo válido.");
      return;
    }

    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "null");
    const userId = usuarioGuardado?._id || usuarioGuardado?.id;
    if (!userId) {
      navigate("/mobile/login");
      return;
    }

    const objetivo = Number(montoObjetivo);
    const ahorrado = Number(montoAhorrado || 0);

    if (ahorrado > objetivo) {
      alert("El monto ahorrado inicial no puede superar el monto objetivo.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/metas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: userId,
          titulo,
          montoObjetivo: objetivo,
          montoAhorrado: ahorrado,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar la meta en el servidor");
      }

      const nuevaMetaCreada = await response.json();
      setMetas([...metas, nuevaMetaCreada]);

      setTitulo("");
      setMontoObjetivo("");
      setMontoAhorrado("");
      setMostrarForm(false);
    } catch (error) {
      console.error(error);
      alert("No se pudo conectar con el servidor para guardar la meta.");
    }
  };

  const eliminarMeta = async (id) => {
    try {
      const response = await fetch(`${API_URL}/metas/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMetas(metas.filter((m) => m._id !== id));
      }
    } catch (error) {
      console.error("Error al eliminar meta:", error);
    }
  };

  const abonarAMeta = async (id) => {
    const valorAbono = Number(montoAbono);
    if (!valorAbono || valorAbono <= 0) {
      alert("Ingresa un monto válido para abonar.");
      return;
    }

    const metaActual = metas.find((m) => m._id === id);
    if (!metaActual) return;

    const faltaPorAhorrar = metaActual.montoObjetivo - metaActual.montoAhorrado;

    if (valorAbono > faltaPorAhorrar) {
      alert(`¡Atención! Solo te faltan $${faltaPorAhorrar.toFixed(2)} para completar esta meta. No puedes abonar $${valorAbono.toFixed(2)} porque excedería el objetivo.`);
      return;
    }

    const nuevoMontoAhorrado = metaActual.montoAhorrado + valorAbono;

    try {
      const response = await fetch(`${API_URL}/metas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ montoAhorrado: nuevoMontoAhorrado }),
      });

      if (response.ok) {
        const metaActualizadaServidor = await response.json();
        setMetas(
          metas.map((m) => (m._id === id ? metaActualizadaServidor : m))
        );
        setMetaAbonandoId(null);
        setMontoAbono("");
      }
    } catch (error) {
      console.error("Error al abonar a la meta:", error);
    }
  };

  if (errorRender) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
        <h2 className="text-lg font-bold text-rose-600 mb-2">Algo salió mal al cargar la vista</h2>
        <p className="text-xs text-slate-500">{errorRender}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-5 pb-28 text-left">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Target className="text-[#1e617a]" /> Metas de Ahorro
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Planea y alcanza tus objetivos financieros
          </p>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="p-3 bg-[#1e617a] text-white rounded-2xl shadow-sm hover:bg-[#174b5f] transition cursor-pointer"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* FORMULARIO CREAR META */}
      {mostrarForm && (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-6 animate-fade-in">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <PiggyBank size={16} className="text-[#1e617a]" /> Nueva Meta
          </h2>

          <form onSubmit={guardarMeta} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-600">Nombre de la Meta</label>
              <input
                type="text"
                placeholder="Ej. Comprar una laptop, Viaje..."
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-[#1e617a]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600">Monto Objetivo ($)</label>
                <input
                  type="number"
                  placeholder="1200"
                  value={montoObjetivo}
                  onChange={(e) => setMontoObjetivo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-[#1e617a]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">Ahorrado Inicial ($)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={montoAhorrado}
                  onChange={(e) => setMontoAhorrado(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-[#1e617a]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1e617a] text-white font-bold text-xs py-3 rounded-xl transition shadow-xs mt-2 cursor-pointer"
            >
              Guardar Meta
            </button>
          </form>
        </div>
      )}

      {/* LISTA DE METAS */}
      <div className="space-y-4">
        {metas.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm">
            <Trophy size={40} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-600">No tienes metas registradas</p>
            <p className="text-xs text-slate-400 mt-1">
              Presiona el botón + para empezar a definir tus objetivos.
            </p>
          </div>
        ) : (
          metas.map((meta) => {
            const porcentaje = Math.min(
              100,
              Math.round((meta.montoAhorrado / meta.montoObjetivo) * 100)
            );
            const metaCumplida = meta.montoAhorrado >= meta.montoObjetivo;
            const estaAbonando = metaAbonandoId === meta._id;

            return (
              <div
                key={meta._id}
                className={`bg-white rounded-3xl p-5 shadow-sm border relative space-y-3 transition-all ${
                  metaCumplida ? "border-emerald-300 bg-emerald-50/20" : "border-slate-100"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800 text-base">{meta.titulo}</h3>
                      {metaCumplida && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={12} /> ¡Completada!
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ${meta.montoAhorrado.toFixed(2)} de ${meta.montoObjetivo.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${
                        metaCumplida
                          ? "text-emerald-700 bg-emerald-100 border-emerald-200"
                          : "text-[#1e617a] bg-sky-50 border-sky-100"
                      }`}
                    >
                      {porcentaje}%
                    </span>

                    {!metaCumplida && (
                      <button
                        onClick={() => {
                          setMetaAbonandoId(estaAbonando ? null : meta._id);
                          setMontoAbono("");
                        }}
                        className="p-1.5 text-slate-400 hover:text-[#1e617a] bg-slate-50 hover:bg-sky-50 rounded-xl transition cursor-pointer"
                        title="Abonar a la meta"
                      >
                        <PiggyBank size={18} />
                      </button>
                    )}

                    <button
                      onClick={() => eliminarMeta(meta._id)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 rounded-xl transition cursor-pointer"
                      title="Eliminar meta"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* BARRA DE PROGRESO */}
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      metaCumplida ? "bg-emerald-500" : "bg-[#1e617a]"
                    }`}
                    style={{ width: `${porcentaje}%` }}
                  ></div>
                </div>

                {/* CAJITA DESPLEGABLE PARA ABONAR */}
                {estaAbonando && !metaCumplida && (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center gap-2 mt-2 animate-fade-in">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Monto a abonar..."
                      value={montoAbono}
                      onChange={(e) => setMontoAbono(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#1e617a]"
                      autoFocus
                    />
                    <button
                      onClick={() => abonarAMeta(meta._id)}
                      className="bg-[#1e617a] text-white p-2 rounded-xl text-xs font-bold hover:bg-[#174b5f] transition cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <PlusCircle size={16} /> Sumar
                    </button>
                    <button
                      onClick={() => setMetaAbonandoId(null)}
                      className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl transition cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default MetasAhorroMobile;