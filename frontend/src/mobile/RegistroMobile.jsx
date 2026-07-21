import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import API_URL from "../config";

function RegistroMobile() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const registrar = async () => {
    if (!nombre || !correo || !password) {
      alert("Por favor completa todos los campos.");
      return;
    }

    // Expresión regular: Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un signo especial
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!regexPassword.test(password)) {
      alert("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un signo especial.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/registro`,
        {
          nombre,
          correo,
          password,
          rol: "cliente"
        }
      );

      alert("Usuario registrado correctamente");
      navigate("/mobile/login");
    } catch (error) {
      console.log(error);
      const mensajeError = error.response?.data?.message || "Error al registrar usuario";
      alert(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6 text-left">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        
        {/* HEADER */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#1e617a]">
            LoanBe Mobile
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Crea tu cuenta financiera
          </p>
        </div>

        {/* NOMBRE */}
        <div className="mb-4">
          <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Nombre Completo</label>
          <input
            type="text"
            placeholder="Ej. Juan Pérez"
            className="w-full border border-slate-200 bg-slate-50 p-3 rounded-2xl outline-none focus:ring-2 focus:ring-[#1e617a] text-sm"
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        {/* CORREO */}
        <div className="mb-4">
          <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Correo Electrónico</label>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            className="w-full border border-slate-200 bg-slate-50 p-3 rounded-2xl outline-none focus:ring-2 focus:ring-[#1e617a] text-sm"
            onChange={(e) => setCorreo(e.target.value)}
          />
        </div>

        {/* PASSWORD */}
        <div className="mb-6">
          <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Contraseña</label>
          <input
            type="password"
            placeholder="Mín. 8 caracteres, Mayús, Minús, Núm y Signo"
            className="w-full border border-slate-200 bg-slate-50 p-3 rounded-2xl outline-none focus:ring-2 focus:ring-[#1e617a] text-sm"
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">
            Debe incluir: 8+ caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial.
          </p>
        </div>

        {/* BOTON */}
        <button
          onClick={registrar}
          disabled={loading}
          className="w-full bg-[#1e617a] hover:bg-[#174b5e] text-white p-3 rounded-2xl font-semibold transition flex items-center justify-center text-sm shadow-sm"
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>

        {/* LOGIN */}
        <div className="text-center mt-6">
          <p className="text-slate-400 text-sm">
            ¿Ya tienes cuenta?
          </p>
          <Link
            to="/mobile/login"
            className="inline-block mt-1 text-[#1e617a] font-semibold hover:underline text-sm"
          >
            Iniciar Sesión
          </Link>
        </div>

      </div>
    </div>
  );
}

export default RegistroMobile;