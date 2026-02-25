import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./CardPaginator.scss";
import { API_URL } from '../../config/api'; 
 
export default function Cards({
  datos = [],
  columnas = 4,
  porPagina = 20
}) {
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");

  // 1️⃣ FILTRAR PRIMERO
  const datosFiltrados = datos.filter(juego =>
    juego.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  // 2️⃣ PAGINAR DESPUÉS
  const totalPaginas = Math.ceil(datosFiltrados.length / porPagina);
  const inicio = (pagina - 1) * porPagina;
  const fin = inicio + porPagina;
  const datosPagina = datosFiltrados.slice(inicio, fin);

  // 3️⃣ Volver a página 1 cuando cambia la búsqueda
  useEffect(() => {
    setPagina(1);
  }, [busqueda]);

  return (
    <>
      <div>
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="list-cards-container">
        {datosPagina.map(juego => (
          <Link
            to={`/detalle-juego/${juego.id}/${juego.id_imagen}`}
            key={juego.id}
          >
            <div className="list-cards-container-card">
              <span className="list-cards-container-card-region">
                Total juegos: {juego.total}
              </span>

              <img
                alt="Game Cover"
                className="list-cards-container-card-img"
                src={
                  juego.portada
                    ? `${API_URL}/imagenes/uploads/${juego.portada}`
                    : "/img/default-game-cover.png"
                }
              />

              <div className="list-cards-container-card-body">
                <h3 className="list-cards-container-card-title">
                  {juego.titulo}
                </h3>
                <p className="list-cards-container-card-plataform">
                  {juego.plataforma} • {juego.lanzamiento}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPaginas > 1 && (
        <div className="paginador">
          <button
          className="paginador-item material-icons"
            disabled={pagina === 1}
            onClick={() => setPagina(pagina - 1)}
          >
            chevron_left
          </button>

          {[...Array(totalPaginas)].map((_, i) => (
            <button
              key={i}
              className={pagina === i + 1 ? "paginador-item-activo" : "paginador-item"}
              onClick={() => setPagina(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
          className="paginador-item material-icons"
            disabled={pagina === totalPaginas}
            onClick={() => setPagina(pagina + 1)}
          >
            chevron_right
          </button>
        </div>
      )}
    </>
  );
}
