import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Trophy, 
  LogOut, 
  CheckCircle2, 
  Layers, 
  ShieldCheck,
  TrendingUp,
  Activity
} from "lucide-react";

function Admin({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Comparación exacta de rutas
  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-full min-h-screen flex bg-slate-100 font-sans text-slate-800 antialiased">

      {/* SIDEBAR LATERAL FIX */}
      <aside className="w-64 bg-[#1e617a] text-white flex flex-col justify-between shrink-0 min-h-screen shadow-xl z-20 sticky top-0 h-screen">
        <div>
          {/* BRANDING */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-emerald-300" size={24} />
              <span className="text-xl font-bold tracking-wider text-white">LOANBE</span>
            </div>
            <span className="text-[10px] bg-white/10 text-emerald-300 px-2 py-0.5 rounded font-semibold border border-white/10">
              ADMIN
            </span>
          </div>

          {/* NAVEGACIÓN */}
          <nav className="p-4 space-y-1.5">
            <p className="px-3 text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2 text-left">
              Menú Principal
            </p>

            <button
              onClick={() => navigate("/admin/dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium text-left ${
                isActive("/admin/dashboard")
                  ? "bg-white/20 text-white font-semibold shadow-inner border-l-4 border-emerald-400"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Inicio</span>
            </button>

            <button
              onClick={() => navigate("/admin/usuarios")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium text-left ${
                isActive("/admin/usuarios")
                  ? "bg-white/20 text-white font-semibold shadow-inner border-l-4 border-emerald-400"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Users size={18} />
              <span>Usuarios</span>
            </button>

            <button
              onClick={() => navigate("/admin/estadisticas")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium text-left ${
                isActive("/admin/estadisticas")
                  ? "bg-white/20 text-white font-semibold shadow-inner border-l-4 border-emerald-400"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <BarChart3 size={18} />
              <span>Estadísticas</span>
            </button>

            <button
              onClick={() => navigate("/admin/ranking")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium text-left ${
                isActive("/admin/ranking")
                  ? "bg-white/20 text-white font-semibold shadow-inner border-l-4 border-emerald-400"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Trophy size={18} />
              <span>Ranking</span>
            </button>
          </nav>
        </div>

        {/* LOGOUT */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-200 hover:bg-rose-500/20 hover:text-white text-sm font-medium transition-all text-left"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* HEADER TOP BAR */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-xs sticky top-0 z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>PANEL ADMIN</span>
            <span>/</span>
            <span className="text-[#1e617a]">GENERAL</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sistema Online
            </span>
            
            <div className="h-4 w-px bg-slate-200 mx-1"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1e617a] text-white flex items-center justify-center text-xs font-bold">
                AD
              </div>
              <span className="text-xs font-semibold text-slate-700">Admin</span>
            </div>
          </div>
        </header>

        {/* CONTENIDO */}
        <main className="p-8 flex-1 overflow-y-auto">
          {!children ? (
            <div className="max-w-7xl mx-auto space-y-6">

              {/* BANNER PRINCIPAL */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs text-left">
                <h1 className="text-2xl font-bold text-[#1e617a] tracking-tight mb-2">
                  Bienvenido, Administrador 👋
                </h1>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-3xl">
                  Gestiona usuarios, supervisa movimientos financieros y analiza las estadísticas globales de la plataforma LoanBe en tiempo real.
                </p>
              </div>

              {/* TARJETAS KPI */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between text-left">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Estado del Sistema
                    </span>
                    <span className="text-2xl font-bold text-emerald-600 block">
                      Operativo
                    </span>
                    <span className="text-xs text-slate-400 mt-1 block">
                      • Todos los servicios activos
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                    <CheckCircle2 size={24} />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between text-left">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Módulos Activos
                    </span>
                    <span className="text-xl font-bold text-[#1e617a] block">
                      Usuarios • Reportes
                    </span>
                    <span className="text-xs text-slate-400 mt-1 block">
                      2 módulos conectados
                    </span>
                  </div>
                  <div className="p-3 bg-blue-50 text-[#1e617a] rounded-xl border border-blue-100">
                    <Layers size={24} />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between text-left">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Acceso Actual
                    </span>
                    <span className="text-2xl font-bold text-slate-800 block">
                      Administrador
                    </span>
                    <span className="text-xs text-slate-400 mt-1 block">
                      Acceso completo
                    </span>
                  </div>
                  <div className="p-3 bg-slate-100 text-slate-600 rounded-xl border border-slate-200">
                    <ShieldCheck size={24} />
                  </div>
                </div>

              </div>

              {/* SECCIÓN RESUMEN */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs text-left">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                  <Activity className="text-[#1e617a]" size={20} />
                  <h2 className="text-base font-bold text-slate-800">
                    Resumen Operativo del Sistema
                  </h2>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Desde este panel centralizado puedes monitorear el rendimiento global del sistema, auditar las transacciones realizadas por los clientes, gestionar las cuentas de usuario y revisar el ranking en tiempo real.
                </p>
              </div>

            </div>
          ) : (
            children
          )}
        </main>

      </div>

    </div>
  );
}

export default Admin;