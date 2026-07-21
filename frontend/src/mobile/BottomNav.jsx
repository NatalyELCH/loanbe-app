import { useNavigate, useLocation } from "react-router-dom";
import { Home, PieChart, Bell, User, ArrowLeftRight } from "lucide-react";

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 px-3 py-2 flex justify-around items-center z-50 shadow-lg">
      
      <button 
        onClick={() => navigate("/mobile/dashboard")}
        className={`flex flex-col items-center gap-0.5 transition ${isActive("/mobile/dashboard") ? "text-[#1e617a]" : "text-slate-400 hover:text-slate-600"}`}
      >
        <Home size={20} />
        <span className="text-[9px] font-bold">Inicio</span>
      </button>

      <button 
        onClick={() => navigate("/mobile/movimientos")}
        className={`flex flex-col items-center gap-0.5 transition ${isActive("/mobile/movimientos") ? "text-[#1e617a]" : "text-slate-400 hover:text-slate-600"}`}
      >
        <ArrowLeftRight size={20} />
        <span className="text-[9px] font-bold">Movimientos</span>
      </button>

      <button 
        onClick={() => navigate("/mobile/estadisticas")}
        className={`flex flex-col items-center gap-0.5 transition ${isActive("/mobile/estadisticas") ? "text-[#1e617a]" : "text-slate-400 hover:text-slate-600"}`}
      >
        <PieChart size={20} />
        <span className="text-[9px] font-bold">Estadísticas</span>
      </button>

      <button 
        onClick={() => navigate("/mobile/notificaciones")}
        className={`flex flex-col items-center gap-0.5 transition ${isActive("/mobile/notificaciones") ? "text-[#1e617a]" : "text-slate-400 hover:text-slate-600"}`}
      >
        <Bell size={20} />
        <span className="text-[9px] font-bold">Alertas</span>
      </button>

      <button 
        onClick={() => navigate("/mobile/perfil")}
        className={`flex flex-col items-center gap-0.5 transition ${isActive("/mobile/perfil") ? "text-[#1e617a]" : "text-slate-400 hover:text-slate-600"}`}
      >
        <User size={20} />
        <span className="text-[9px] font-bold">Perfil</span>
      </button>

    </div>
  );
}

export default BottomNav;