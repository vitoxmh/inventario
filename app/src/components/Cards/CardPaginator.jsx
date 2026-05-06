import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import "./CardPaginator.scss";
import { API_URL } from '../../config/api'; 

export default function Cards({
  apiEndpoint = `${API_URL}/games/`,
  columnas = 4,
  porPagina = 20,
  onDelete = null,
  deleteEndpoint = null
}) {
  const [juegos, setJuegos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [loading, setLoading] = useState(false);

  const cargarJuegos = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: pagina,
      limit: porPagina,
      ...(busqueda && { search: busqueda })
    });

    try {
      const resp = await fetch(`${apiEndpoint}?${params}`);
      const data = await resp.json();
      setJuegos(data.data || []);
      setTotalPaginas(data.pagination?.totalPages || 0);
    } catch (error) {
      console.error("Error cargando juegos:", error);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, pagina, porPagina, busqueda]);

  useEffect(() => {
    cargarJuegos();
  }, [cargarJuegos]);

  useEffect(() => {
    setPagina(1);
  }, [busqueda]);

  const handleDelete = async (e, juego) => {
    e.preventDefault();
    if (!window.confirm(`¿Eliminar "${juego.titulo}"?`)) return;
    
    try {
      const endpoint = deleteEndpoint ? `${deleteEndpoint}${juego.id}/` : `${apiEndpoint}${juego.id}/`;
      const resp = await fetch(endpoint, { method: 'DELETE' });
      if (resp.ok) {
        cargarJuegos();
      } else {
        alert("Error al eliminar");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar");
    }
  };

  return (
    <>
      <div>
        <input
          type="text"
          placeholder="Buscar por título..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="list-cards-container">
        {loading ? (
          <p>Cargando...</p>
        ) : juegos.length === 0 ? (
          <p>No se encontraron juegos</p>
        ) : (
          juegos.map(juego => (
            <Link
              to={`/detalle-juego/${juego.id}/${juego.id_imagen}`}
              key={juego.id}
            >
              <div className="list-cards-container-card">
                {onDelete && (
                  <button 
                    className="card-delete-btn"
                    onClick={(e) => handleDelete(e, juego)}
                    title="Eliminar"
                  >
                    <span className="material-icons">delete</span>
                  </button>
                )}
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
                    {juego.plataforma}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {totalPaginas > 1 && (
        <div className="paginador">
          <button
            className="paginador-item material-icons"
            disabled={pagina === 1}
            onClick={() => setPagina(p => p - 1)}
          >
            chevron_left
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPaginas || Math.abs(p - pagina) <= 2)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
              acc.push(p);
              return acc;
            }, [])
            .map((item, idx) => 
              item === '...' ? (
                <span key={`ellipsis-${idx}`} className="paginador-item">...</span>
              ) : (
                <button
                  key={item}
                  className={pagina === item ? "paginador-item-activo" : "paginador-item"}
                  onClick={() => setPagina(item)}
                >
                  {item}
                </button>
              )
            )
          }

          <button
            className="paginador-item material-icons"
            disabled={pagina === totalPaginas}
            onClick={() => setPagina(p => p + 1)}
          >
            chevron_right
          </button>
        </div>
      )}
    </>
  );
}
