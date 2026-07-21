import { useState } from "react";
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Calendar, 
  Trash2, 
  Info,
  CheckCheck
} from "lucide-react";
import BottomNav from "../../mobile/BottomNav";

function NotificacionesMobile() {
  const [notificaciones, setNotificaciones] = useState([
    {
      id: 1,
      tipo: "gasto",
      titulo: "Recordatorio de Gastos",
      mensaje: "No olvides registrar tus gastos del día de hoy para mantener tu presupuesto al día.",
      tiempo: "Hace 2 horas",
      leida: false,
      icono: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      id: 2,
      titulo: "¡Meta de Ahorro Alcanzada!",
      mensaje: "Felicidades, has completado con éxito tu objetivo de ahorro para 'Fondo de Emergencia'.",
      tiempo: "Ayer",
      leida: false,
      icono: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      id: 3,
      titulo: "Resumen Semanal Disponible",
      mensaje: "Tu balance de esta semana muestra un incremento del 12% en tus ahorros netos.",
      tiempo: "Hace 3 días",
      leida: true,
      icono: TrendingUp,
      color: "text-[#1e617a]",
      bg: "bg-[#1e617a]/10"
    },
    {
      id: 4,
      titulo: "Resumen Mensual Generado",
      mensaje: "El reporte financiero de cierre de mes ya está listo para su análisis en estadísticas.",
      tiempo: "Hace 5 días",
      leida: true,
      icono: Calendar,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    }
  ]);

  const marcarComoLeidas = () => {
    setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })));
  };

  const eliminarNotificacion = (id) => {
    setNotificaciones(notificaciones.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 pb-28 text-left font-sans text-slate-800">
      
      <div className="mb-4 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Centro de Alertas</p>
          <h1 className="text-xl font-black text-slate-900 mt-0.5 flex items-center gap-2">
            <Bell className="text-[#1e617a]" size={20} /> Notificaciones
          </h1>
        </div>
        {notificaciones.length > 0 && (
          <button 
            onClick={marcarComoLeidas}
            className="text-[11px] font-bold text-[#1e617a] bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-1 active:scale-95 transition"
          >
            <CheckCheck size={14} /> Marcar leídas
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notificaciones.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-xs mt-10">
            <Bell size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-700">No tienes notificaciones pendientes</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Te avisaremos cuando haya actividad importante.</span>
          </div>
        ) : (
          notificaciones.map((notif) => {
            const IconComponent = notif.icono;
            return (
              <div 
                key={notif.id} 
                className={`bg-white rounded-3xl p-4 shadow-xs border transition relative ${notif.leida ? 'border-slate-100 opacity-80' : 'border-[#1e617a]/30 ring-1 ring-[#1e617a]/10'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-2xl ${notif.bg} ${notif.color} shrink-0 mt-0.5`}>
                    <IconComponent size={18} />
                  </div>
                  <div className="flex-1 pr-6">
                    <div className="flex justify-between items-center mb-0.5">
                      <h2 className="font-bold text-slate-900 text-xs">{notif.titulo}</h2>
                      <span className="text-[9px] text-slate-400">{notif.tiempo}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{notif.mensaje}</p>
                  </div>
                </div>

                <button 
                  onClick={() => eliminarNotificacion(notif.id)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition"
                  title="Eliminar notificación"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 bg-white rounded-3xl p-4 shadow-xs border border-slate-100">
        <p className="text-[11px] text-slate-500 flex gap-2 items-start">
          <Info size={14} className="text-[#1e617a] shrink-0 mt-0.5" />
          Las alertas de resumen semanal y mensual se programan automáticamente según la actividad de tu cuenta en LoanBe.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}

export default NotificacionesMobile;