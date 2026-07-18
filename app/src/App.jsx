import './App.scss'
import "bootstrap-icons/font/bootstrap-icons.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Home from "./pages/Home/Home";
import Plataformas from "./pages/Plataformas";
import JuegoDetalle from "./pages/JuegoDetalle";
import Games from "./pages/Games/Games";
import Consolas from "./pages/Consolas/Consolas";
import NewGame from './pages/NewGame/NewGame';
import DetalleJuego from './pages/DetalleJuego/DetalleJuego';
import EditarGame from './pages/Editar/EditarGame';
import DetallePlataforma from './pages/DetallePlataforma/DetallePlataforma';
import NewConsola from './pages/Consolas/NewConsola';
import DetalleConsola from './pages/Consolas/Detalle';
import EditConsola from './pages/Consolas/EditConsola';
import AmiibosYFiguras from './pages/Amiibos/Amiibos';
import NewAmiiboYFigura from './pages/Amiibos/NewAmiibo';
import DetalleAmiiboYFigura from './pages/Amiibos/DetalleAmiibo';
import EditAmiiboYFigura from './pages/Amiibos/EditAmiibo';
import Libros from './pages/Libros/Libros';
import NewLibro from './pages/Libros/NewLibro';
import DetalleLibro from './pages/Libros/DetalleLibro';
import EditLibro from './pages/Libros/EditLibro';
import Accesorios from './pages/Accesorios/Accesorios';
import NewAccesorio from './pages/Accesorios/NewAccesorio';
import DetalleAccesorio from './pages/Accesorios/DetalleAccesorio';
import EditAccesorio from './pages/Accesorios/EditAccesorio';
import Favoritos from './pages/Favoritos/Favoritos';
import RecienAgregado from './pages/RecienAgregado/RecienAgregado';
   
function App() {

  return (
    <>
      <AuthProvider>
        <SidebarProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/plataformas" element={<ProtectedRoute><Plataformas /></ProtectedRoute>} />
            <Route path="/game/:id/:id_imagen" element={<ProtectedRoute><JuegoDetalle /></ProtectedRoute>} />
            <Route path="/games/" element={<ProtectedRoute><Games /></ProtectedRoute>} />
            <Route path="/consolas/" element={<ProtectedRoute><Consolas /></ProtectedRoute>} />
            <Route path="/new-game/" element={<ProtectedRoute adminOnly><NewGame /></ProtectedRoute>} />
            <Route path="/detalle-juego/:id/:id_imagen" element={<ProtectedRoute><DetalleJuego /></ProtectedRoute>} />
            <Route path="/editar-juego/:id/:id_imagen" element={<ProtectedRoute adminOnly><EditarGame /></ProtectedRoute>} />
            <Route path="/detalle-plataforma/:id/" element={<ProtectedRoute><DetallePlataforma /></ProtectedRoute>} />
            <Route path="/consolas/add/" element={<ProtectedRoute adminOnly><NewConsola /></ProtectedRoute>} />
            <Route path="/consolas/detalle/:id/:id_imagen/" element={<ProtectedRoute><DetalleConsola /></ProtectedRoute>} />
            <Route path="/consolas/edit/:id/:id_imagen/" element={<ProtectedRoute adminOnly><EditConsola /></ProtectedRoute>} />
            <Route path="/amiibos/" element={<ProtectedRoute><AmiibosYFiguras /></ProtectedRoute>} />
            <Route path="/amiibos/nuevo/" element={<ProtectedRoute adminOnly><NewAmiiboYFigura /></ProtectedRoute>} />
            <Route path="/amiibos/detalle/:id/:id_imagen/" element={<ProtectedRoute><DetalleAmiiboYFigura /></ProtectedRoute>} />
            <Route path="/amiibos/editar/:id/:id_imagen/" element={<ProtectedRoute adminOnly><EditAmiiboYFigura /></ProtectedRoute>} />
            <Route path="/libros/" element={<ProtectedRoute><Libros /></ProtectedRoute>} />
            <Route path="/libros/nuevo/" element={<ProtectedRoute adminOnly><NewLibro /></ProtectedRoute>} />
            <Route path="/libros/detalle/:id/:id_imagen/" element={<ProtectedRoute><DetalleLibro /></ProtectedRoute>} />
            <Route path="/libros/editar/:id/:id_imagen/" element={<ProtectedRoute adminOnly><EditLibro /></ProtectedRoute>} />
            <Route path="/accesorios/" element={<ProtectedRoute><Accesorios /></ProtectedRoute>} />
            <Route path="/accesorios/nuevo/" element={<ProtectedRoute adminOnly><NewAccesorio /></ProtectedRoute>} />
            <Route path="/accesorios/detalle/:id/:id_imagen/" element={<ProtectedRoute><DetalleAccesorio /></ProtectedRoute>} />
            <Route path="/accesorios/editar/:id/:id_imagen/" element={<ProtectedRoute adminOnly><EditAccesorio /></ProtectedRoute>} />
            <Route path="/favoritos/" element={<ProtectedRoute><Favoritos /></ProtectedRoute>} />
            <Route path="/recien-agregado/" element={<ProtectedRoute><RecienAgregado /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
        </SidebarProvider>
      </AuthProvider>
    </>
  )
}

export default App
