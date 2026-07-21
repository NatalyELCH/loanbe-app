import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ADMIN
import Login from "./admin/Login";
import Admin from "./admin/Admin";
import Dashboard from "./admin/Dashboard";
import Usuarios from "./admin/Usuarios";
import Estadisticas from "./admin/Estadisticas";
import Ranking from "./admin/Ranking";

// MOBILE
import LoginMobile from "./mobile/LoginMobile";
import RegistroMobile from "./mobile/RegistroMobile";
import DashboardMobile from "./mobile/DashboardMobile";
import Transacciones from "./mobile/Transacciones";
import Movimientos from "./mobile/Movimientos";

// PAGES MOBILE (Sin Configuración)
import EstadisticasMobile from "./pages/mobile/EstadisticasMobile";
import PerfilMobile from "./pages/mobile/PerfilMobile";
import MetasAhorroMobile from "./pages/mobile/MetasAhorroMobile";
import NotificacionesMobile from "./pages/mobile/NotificacionesMobile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ADMIN */}
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/usuarios" element={<Usuarios />} />
        <Route path="/admin/estadisticas" element={<Estadisticas />} />
        <Route path="/admin/ranking" element={<Ranking />} />

        {/* MOBILE */}
        <Route path="/mobile" element={<Navigate to="/mobile/login" replace />} />
        <Route path="/mobile/" element={<Navigate to="/mobile/login" replace />} />
        <Route path="/mobile/login" element={<LoginMobile />} />
        <Route path="/mobile/registro" element={<RegistroMobile />} />
        <Route path="/mobile/dashboard" element={<DashboardMobile />} />
        <Route path="/mobile/transacciones" element={<Transacciones />} />
        <Route path="/mobile/estadisticas" element={<EstadisticasMobile />} />
        <Route path="/mobile/perfil" element={<PerfilMobile />} />
        <Route path="/mobile/movimientos" element={<Movimientos />} />
        <Route path="/mobile/metas" element={<MetasAhorroMobile />} />
        <Route path="/mobile/notificaciones" element={<NotificacionesMobile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;