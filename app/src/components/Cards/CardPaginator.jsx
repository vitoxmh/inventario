import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import "./CardPaginator.scss";
import { API_URL } from '../../config/api'; 

export default function Cards({
  apiEndpoint = `${API_URL}/games/`,
  type = "juego",
  porPagina = 20,
  onDelete = null,
  deleteEndpoint = null
}) {
  const [items, setItems] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [loading, setLoading] = useState(false);

  const toggleFavorito = async (e, item) => {
    e.preventDefault();
    if (type !== 'juego') return;
    
    try {
      const nuevoEstado = !item.favorito;
      const res = await fetch(`${API_URL}/games/${item.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, favorito: nuevoEstado })
      });
      if (res.ok) {
        setItems(items.map(i => 
          i.id === item.id ? { ...i, favorito: nuevoEstado } : i
        ));
      }
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
    }
  };

  const cargarItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('page', pagina);
    params.append('limit', porPagina);
    if (busqueda) {
      params.append('search', busqueda);
    }

    const separator = apiEndpoint.includes('?') ? '&' : '?';
    const url = `${apiEndpoint}${separator}${params.toString()}`;

    try {
      const resp = await fetch(url);
      const data = await resp.json();
      setItems(data.data || []);
      setTotalPaginas(data.pagination?.totalPages || 0);
    } catch (error) {
      console.error(`Error cargando ${type}s:`, error);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, pagina, porPagina, busqueda]);

  useEffect(() => {
    cargarItems();
  }, [cargarItems]);

  useEffect(() => {
    setPagina(1);
  }, [busqueda]);

  const handleDelete = async (e, item) => {
    e.preventDefault();
    if (!window.confirm(`¿Eliminar "${item.titulo || item.nombre}"?`)) return;
    
    try {
      const endpoint = deleteEndpoint ? `${deleteEndpoint}${item.id}/` : `${apiEndpoint}${item.id}/`;
      const resp = await fetch(endpoint, { method: 'DELETE' });
      if (resp.ok) {
        cargarItems();
      } else {
        alert("Error al eliminar");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar");
    }
  };

  const getDetalleUrl = (item) => {
    const baseUrls = {
      'juego': `/detalle-juego/${item.id}/${item.id_imagen}`,
      'consola': `/consolas/detalle/${item.id}/${item.id_imagen}`,
      'libro': `/libros/detalle/${item.id}/${item.id_imagen}`,
      'amiibo': `/amiibos/detalle/${item.id}/${item.id_imagen}`
    };
    return baseUrls[type] || baseUrls['juego'];
  };

  const renderCard = (item) => {
    const isJuego = type === 'juego';
    const isConsola = type === 'consola';
    const isLibro = type === 'libro';
    const isAmiibo = type === 'amiibo';

    const titulo = item.titulo || item.nombre;
    const subtitulo = isJuego ? item.plataforma : 
                     isLibro ? `${item.autor || ''} ${item.anio ? `• ${item.anio}` : ''}` :
                     isAmiibo ? `${item.anio || ''}` :
                     item.plataforma || '';
    
    const imagenSrc = item.portada || item.archivo || item.iportada;
    const defaultImg = "/img/default-game-cover.png";

    return (
      <Link to={getDetalleUrl(item)} key={item.id}>
        <div className="list-cards-container-card">
          {isJuego && (
            <button 
              className={`card-favorito-btn ${item.favorito ? 'active' : ''}`}
              onClick={(e) => toggleFavorito(e, item)}
              title={item.favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <span className="material-icons">
                {item.favorito ? 'favorite' : 'favorite_border'}
              </span>
            </button>
          )}
          {onDelete && (
            <button 
              className="card-delete-btn"
              onClick={(e) => handleDelete(e, item)}
              title="Eliminar"
            >
              <span className="material-icons">delete</span>
            </button>
          )}
          <img
            alt={titulo}
            className="list-cards-container-card-img"
            src={
              imagenSrc
                ? `${API_URL}/imagenes/uploads/${imagenSrc}`
                : defaultImg
            }
          />

          <div className="list-cards-container-card-body">
            <h3 className="list-cards-container-card-title">
              {titulo}
            </h3>
            <p className="list-cards-container-card-plataform">
              {subtitulo}
            </p>
          </div>
        </div>
      </Link>
    );
  };

  const renderPagination = () => {
    if (totalPaginas <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPaginas; i++) {
      if (i === 1 || i === totalPaginas || Math.abs(i - pagina) <= 2) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }

    return (
      <div className="paginador">
        <button
          className="paginador-item material-icons"
          disabled={pagina === 1}
          onClick={() => setPagina(p => p - 1)}
        >
          chevron_left
        </button>

        {pages.map((item, idx) => 
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
        )}

        <button
          className="paginador-item material-icons"
          disabled={pagina === totalPaginas}
          onClick={() => setPagina(p => p + 1)}
        >
          chevron_right
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="search-container">
        <div className="search-box">
          <i className="material-icons search-icon">search</i>
          <input
            type="text"
            placeholder={`Buscar por título...`}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
          {busqueda && (
            <button 
              className="search-clear"
              onClick={() => setBusqueda("")}
              title="Limpiar búsqueda"
            >
              <i className="material-icons">close</i>
            </button>
          )}
        </div>
      </div>

      <div className="list-cards-container">
        {loading ? (
          <div className="loading-message">
            <i className="material-icons">hourglass_empty</i>
            <p>Cargando...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-message">
            <i className="material-icons">search_off</i>
            <p>No se encontraron {type}s</p>
            {busqueda && (
              <button 
                className="clear-search-btn"
                onClick={() => setBusqueda("")}
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          items.map(item => renderCard(item))
        )}
      </div>

      {renderPagination()}
    </>
  );
}
