import { useState, useMemo } from "react";
import styles from "./Tabla.module.scss";
import { Link } from "react-router-dom";


export default function Tabla({
  columnas,
  datos,
  filasPorPaginaInicial = 30,
  onEdit,
  onDelete
}) {
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(filasPorPaginaInicial);
  const [busqueda, setBusqueda] = useState("");

  // 🔍 Filtrar datos
  const datosFiltrados = useMemo(() => {
    if (!busqueda) return datos;

   return datos.filter(fila =>
      columnas.some(col =>
        String(fila[col.key] ?? "")
          .toLowerCase()
          .includes(busqueda.toLowerCase())
      )
    );
  }, [busqueda, datos, columnas]);

  // 📄 Paginación
  const totalPaginas = Math.ceil(datosFiltrados.length / filasPorPagina);
  const inicio = (paginaActual - 1) * filasPorPagina;
  const fin = inicio + filasPorPagina;
  const datosPaginados = datosFiltrados.slice(inicio, fin);

  // Resetear página al buscar o cambiar filas
  const onBuscar = (e) => {
    setBusqueda(e.target.value);
    setPaginaActual(1);
  };

  const cambiarFilas = (e) => {
    setFilasPorPagina(Number(e.target.value));
    setPaginaActual(1);
  };

  const formatearValor = (key, value, fila) => {

    if (key === "titulo") {
      return (
        <Link to={`/detalle-juego/${fila.id}/${fila.id_imagen}`} className={styles.link}>
          {value}
        </Link>
      );
    }

    if (key === "valor" && value != null) {
      return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        minimumFractionDigits: 0
      }).format(value);
    }

    return value;
  };


  return (
    <div className={styles.tablaContainer}>

      {/* 🔍 Buscador */}
      <div className={styles.toolbar}>
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={onBuscar}
        />

        <select value={filasPorPagina} onChange={cambiarFilas}>
          {[5, 10, 20, 50].map(n => (
            <option key={n} value={n}>
              {n} filas
            </option>
          ))}
        </select>
      </div>

      {/* 📊 Tabla */}
      <table className={styles.tabla}>
        <thead>
          <tr>
            {columnas.map(col => (
              <th key={col.key}>
              {col.label}
            </th>
            ))}
            {(onEdit || onDelete) && <th>Acciones</th>}
          </tr>
        </thead>

        <tbody>
          {datosPaginados.length === 0 ? (
            <tr>
              <td colSpan={columnas.length + 1}>
                No hay resultados
              </td>
            </tr>
          ) : (
            datosPaginados.map(fila => (
              <tr key={fila.id}>
                {columnas.map(col => (
                  <td key={col}>
                    {formatearValor(col.key, fila[col.key], fila)}
                  </td>
                ))}

                {(onEdit || onDelete) && (
                  <td>
                    <div className="btn-group" role="group" aria-label="Basic mixed styles example">
                    {onEdit && (
                      <button className="btn btn-primary" onClick={() => onEdit(fila)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pen" viewBox="0 0 16 16">
                          <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
                        </svg>
                        </button>
                    )}
                    {onDelete && (
                      <button className="btn btn-danger" onClick={() => onDelete(fila)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-circle" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                      </svg>
                      </button>
                    )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ▶️ Paginador */}
      {totalPaginas > 1 && (
        <div className={styles.paginador}>
          
          <button
          className="page-link"
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual(p => p - 1)}
          >
            <i className="bi bi-arrow-left-circle"></i>
          </button>

          <span>
            Página {paginaActual} de {totalPaginas}
          </span>

          <button
          className="page-link"
            disabled={paginaActual === totalPaginas}
            onClick={() => setPaginaActual(p => p + 1)}
          >
          <i className="bi bi-arrow-right-circle"></i>
          </button>
        </div>
      )}
    </div>
  );
}
