import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import API_URL from "../config";

function Login() {

  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const iniciarSesion = async () => {

    try {

      const respuesta = await axios.post(
        `${API_URL}/login`,
        {
          correo,
          password
        }
      );

      if (respuesta.data.message === "Login correcto") {

        const usuario = respuesta.data.usuario;

        localStorage.setItem(
          "usuario",
          JSON.stringify(usuario)
        );

        // SOLO ADMIN
        if (usuario.rol === "admin") {

          navigate("/admin");

        } else {

          alert("Acceso solo para administradores");

        }

      } else {

        alert("Usuario incorrecto");

      }

    } catch (error) {

      console.log(error);
      alert("Error al iniciar sesión");

    }

  };

  return (

    <div className="min-h-screen flex bg-[#f8fafc]">

      {/* IZQUIERDA */}
      <div
        className="hidden md:flex w-1/2 relative bg-cover bg-center items-center justify-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200')",
        }}
      >

        <div className="absolute inset-0 bg-[#1e617a]/80"></div>

        <div className="relative z-10 text-white px-12">

          <h1 className="text-5xl font-bold mb-4">
            LOANBE
          </h1>

          <p className="text-lg text-white/80 leading-relaxed max-w-md">
            Plataforma financiera inteligente
            para control de movimientos y análisis.
          </p>

        </div>
      </div>

      {/* DERECHA */}
      <div className="flex-1 flex items-center justify-center p-6">

        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">

          <div className="mb-8 text-center">

            <h2 className="text-3xl font-bold text-[#1e617a]">
              Iniciar Sesión
            </h2>

            <p className="text-slate-400 mt-2 text-sm">
              Acceso exclusivo para administradores
            </p>

          </div>

          <div className="mb-4">

            <label className="block text-sm font-semibold text-slate-600 mb-2">
              Correo Electrónico
            </label>

            <input
              type="email"
              placeholder="admin@gmail.com"
              className="w-full border border-slate-200 bg-slate-50 p-3 rounded-2xl outline-none focus:border-[#1e617a]"
              onChange={(e) => setCorreo(e.target.value)}
            />

          </div>

          <div className="mb-6">

            <label className="block text-sm font-semibold text-slate-600 mb-2">
              Contraseña
            </label>

            <input
              type="password"
              placeholder="••••••••"
              className="w-full border border-slate-200 bg-slate-50 p-3 rounded-2xl outline-none focus:border-[#1e617a]"
              onChange={(e) => setPassword(e.target.value)}
            />

          </div>

          <button
            onClick={iniciarSesion}
            className="w-full bg-[#1e617a] hover:bg-[#174b5e] text-white p-3 rounded-2xl font-semibold"
          >
            Ingresar
          </button>

        </div>
      </div>
    </div>
  );
}

export default Login;