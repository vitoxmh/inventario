import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import "./CardPaginator.scss";
import { API_URL } from '../../config/api'; 
 
export default function CardAmiibos({
  apiEndpoint = `${API_URL}/amiibos/`,
  columnas = 4,
  porPagina = 20,
  detailPath = "/amiibos/detalle",
  itemTitleField = "titulo",
  itemSubtitleField = "anio"
}) {
  const [items, setItems] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [loading, setLoading] = useState(false);

  const cargarItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: pagina,
      limit: porPagina,
      ...(busqueda && { search: busqueda })
    });

    try {
      const resp = await fetch(`${apiEndpoint}?${params}`);
      const data = await resp.json();
      setItems(data.data || []);
      setTotalPaginas(data.pagination?.totalPages || 0);
    } catch (error) {
      console.error("Error cargando amiibos:", error);
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
        {loading ? (
          <p>Cargando...</p>
        ) : items.length === 0 ? (
          <p>No se encontraron amiibos</p>
        ) : (
          items.map(item => (
            <Link
              to={`${detailPath}/${item.id}/${item.id_imagen}`}
              key={item.id}
            >
              <div className="list-cards-container-card">
                <span className='list-cards-container-card-region'>CLP {item.valor?.toLocaleString()}</span>
                <img
                  alt="Item"
                  className="list-cards-container-card-img"
                  src={
                    item.iportada || item.portada
                      ? `${API_URL}/imagenes/uploads/${item.iportada || item.portada}`
                      : "/img/default-game-cover.png"
                  }
                />

                <div className="list-cards-container-card-body">
                  <h3 className="list-cards-container-card-title">
                    {item[itemTitleField]}
                  </h3>
                  <p className="list-cards-container-card-plataform">
                    {item[itemSubtitleField]}
                  </p>
                  <p className='list-cards-container-card-estado'><span>{item.estado}</span></p>
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