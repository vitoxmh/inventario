import './App.scss'
import "bootstrap-icons/font/bootstrap-icons.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plataformas" element={<Plataformas />} />
          <Route path="/game/:id/:id_imagen" element={<JuegoDetalle />} />
          <Route path="/games/" element={<Games />} />
          <Route path="/consolas/" element={<Consolas />} />
          <Route path="/new-game/" element={<NewGame />} />
          <Route path="/detalle-juego/:id/:id_imagen" element={<DetalleJuego />} />
          <Route path="/editar-juego/:id/:id_imagen" element={<EditarGame />} />
          <Route path="/detalle-plataforma/:id/" element={<DetallePlataforma />} />
          <Route path="/consolas/add/" element={<NewConsola />} />
          <Route path="/consolas/detalle/:id/:id_imagen/" element={<DetalleConsola />} />
          <Route path="/consolas/edit/:id/:id_imagen/" element={<EditConsola />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
