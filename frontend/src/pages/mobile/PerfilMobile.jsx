import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../../config";
import { User, Mail, Calendar, Shield, LogOut, Save, ArrowLeft, KeyRound, X } from "lucide-react";
import BottomNav from "../../mobile/BottomNav";

function PerfilMobile() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({ _id: "", nombre: "", correo: "", rol: "", createdAt: "" });
  const [nombre, setNombre] = useState("");
  const [editando, setEditando] = useState(false);
  
  // Estados para cambiar contraseña
  const [modalPasswordOpen, setModalPasswordOpen] = useState(false);
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "null");
    if (!usuarioGuardado) {
      navigate("/mobile/login");
      return;
    }
    setUsuario(usuarioGuardado);
    setNombre(usuarioGuardado.nombre || "");
  }, [navigate]);

  const guardarCambios = () => {
    const usuarioActualizado = { ...usuario, nombre };
    localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
    setUsuario(usuarioActualizado);
    setEditando(false);
    alert("Perfil actualizado en el dispositivo.");
  };

  const cambiarPassword = async (e) => {
    e.preventDefault();
    if (!passwordActual || !passwordNueva) {
      alert("Por favor completa todos los campos de contraseña.");
      return;
    }

    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!regexPassword.test(passwordNueva)) {
      alert("La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un signo especial.");
      return;
    }

    const userId = usuario._id || usuario.id;
    if (!userId) {
      alert("No se encontró el ID de usuario. Por favor vuelve a iniciar sesión.");
      return;
    }

    setLoadingPassword(true);
    try {
      await axios.put(`${API_URL}/usuarios/${userId}/password`, {
        passwordActual,
        passwordNueva
      });

      alert("¡Contraseña actualizada con éxito!");
      setPasswordActual("");
      setPasswordNueva("");
      setModalPasswordOpen(false);
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      const mensajeError = error.response?.data?.message || "Error al actualizar la contraseña.";
      alert(mensajeError);
    } finally {
      setLoadingPassword(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.clear();
    navigate("/mobile/login");
  };

  const formatearFecha = (rawDate) => {
    if (!rawDate) return "No disponible";
    const fecha = new Date(rawDate);
    return isNaN(fecha.getTime()) ? "No disponible" : fecha.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-5 pb-28 text-left">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Mi Perfil</h1>
        <button
          onClick={() => navigate("/mobile/dashboard")}
          className="p-2 bg-white rounded-full shadow-xs text-slate-600 hover:bg-slate-100 transition"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* TARJETA AVATAR */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center mb-6 text-center">
        <div className="w-20 h-20 bg-[#1e617a] text-white rounded-full flex items-center justify-center text-3xl font-bold mb-3 shadow-md">
          {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : "U"}
        </div>
        <h2 className="text-xl font-bold text-slate-800">{usuario.nombre || "Usuario"}</h2>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-semibold mt-1 capitalize">
          {usuario.rol || "Cliente"}
        </span>
      </div>

      {/* DETALLES DE LA CUENTA */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4 mb-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Información Personal
        </h3>

        {/* NOMBRE */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <User size={14} className="text-[#1e617a]" /> Nombre Completo
          </label>
          {editando ? (
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#1e617a]"
            />
          ) : (
            <p className="text-sm font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              {usuario.nombre || "N/A"}
            </p>
          )}
        </div>

        {/* CORREO */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Mail size={14} className="text-[#1e617a]" /> Correo Electrónico
          </label>
          <p className="text-sm font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            {usuario.correo || "N/A"}
          </p>
        </div>

        {/* FECHA DE REGISTRO */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Calendar size={14} className="text-[#1e617a]" /> Fecha de Registro
          </label>
          <p className="text-sm font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            {formatearFecha(usuario.createdAt || usuario.fechaRegistro)}
          </p>
        </div>

        {/* ROL */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Shield size={14} className="text-[#1e617a]" /> Tipo de Acceso
          </label>
          <p className="text-sm font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 capitalize">
            {usuario.rol || "Cliente"}
          </p>
        </div>

        {/* BOTÓN EDITAR / GUARDAR */}
        <div className="pt-2">
          {editando ? (
            <button
              onClick={guardarCambios}
              className="w-full bg-[#1e617a] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-[#164a5e] transition"
            >
              <Save size={16} /> Guardar Cambios
            </button>
          ) : (
            <button
              onClick={() => setEditando(true)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-xs transition"
            >
              Editar Información
            </button>
          )}
        </div>
      </div>

      {/* SECCIÓN SEGURIDAD */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Seguridad
        </h3>
        <button
          onClick={() => setModalPasswordOpen(true)}
          className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
        >
          <KeyRound size={16} className="text-[#1e617a]" /> Cambiar Contraseña
        </button>
      </div>

      {/* CERRAR SESIÓN */}
      <button
        onClick={cerrarSesion}
        className="w-full bg-rose-50 border border-rose-200 text-rose-600 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-rose-100 transition shadow-xs"
      >
        <LogOut size={18} /> Cerrar Sesión
      </button>

      {/* MODAL CAMBIAR CONTRASEÑA */}
      {modalPasswordOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <KeyRound size={18} className="text-[#1e617a]" /> Cambiar Contraseña
              </h3>
              <button 
                onClick={() => setModalPasswordOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={cambiarPassword} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Contraseña Actual</label>
                <input
                  type="password"
                  value={passwordActual}
                  onChange={(e) => setPasswordActual(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1e617a]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  value={passwordNueva}
                  onChange={(e) => setPasswordNueva(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1e617a]"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalPasswordOpen(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingPassword}
                  className="w-1/2 bg-[#1e617a] hover:bg-[#164a5e] text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm flex items-center justify-center"
                >
                  {loadingPassword ? "Guardando..." : "Actualizar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BARRA DE NAVEGACIÓN INFERIOR */}
      <BottomNav />
    </div>
  );
}

export default PerfilMobile;