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
          <Route path="/amiibos/" element={<AmiibosYFiguras />} />
          <Route path="/amiibos/nuevo/" element={<NewAmiiboYFigura />} />
          <Route path="/amiibos/detalle/:id/:id_imagen/" element={<DetalleAmiiboYFigura />} />
          <Route path="/amiibos/editar/:id/:id_imagen/" element={<EditAmiiboYFigura />} />
          <Route path="/libros/" element={<Libros />} />
          <Route path="/libros/nuevo/" element={<NewLibro />} />
          <Route path="/libros/detalle/:id/:id_imagen/" element={<DetalleLibro />} />
          <Route path="/libros/editar/:id/:id_imagen/" element={<EditLibro />} />
          <Route path="/accesorios/" element={<Accesorios />} />
          <Route path="/accesorios/nuevo/" element={<NewAccesorio />} />
          <Route path="/accesorios/detalle/:id/:id_imagen/" element={<DetalleAccesorio />} />
          <Route path="/accesorios/editar/:id/:id_imagen/" element={<EditAccesorio />} />
          <Route path="/favoritos/" element={<Favoritos />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
