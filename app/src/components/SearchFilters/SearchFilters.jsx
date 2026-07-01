import { useState, useEffect } from "react";
import styles from "./SearchFilters.module.scss";

export default function SearchFilters({ 
  onFilterChange, 
  plataformas = [],
  initialFilters = {}
}) {
  const [filters, setFilters] = useState({
    search: '',
    plataforma_id: '',
    estado: '',
    valor_min: '',
    valor_max: '',
    fecha_inicio: '',
    fecha_fin: '',
    orden: 'created_at_desc',
    ...initialFilters
  });

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      plataforma_id: '',
      estado: '',
      valor_min: '',
      valor_max: '',
      fecha_inicio: '',
      fecha_fin: '',
      orden: 'created_at_desc'
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className={styles.filtersContainer}>
      <form onSubmit={handleSubmit} className={styles.filtersForm}>
        
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Buscar por título..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn}>
            <i className="material-icons">search</i>
          </button>
        </div>

        <div className={styles.filtersGrid}>
          
          <div className={styles.filterGroup}>
            <label>Plataforma</label>
            <select 
              value={filters.plataforma_id} 
              onChange={(e) => handleChange('plataforma_id', e.target.value)}
            >
              <option value="">Todas</option>
              {plataformas.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Estado</label>
            <select 
              value={filters.estado} 
              onChange={(e) => handleChange('estado', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="nuevo">Nuevo</option>
              <option value="usado">Usado</option>
              <option value="reparacion">En reparación</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Precio mín (CLP)</label>
            <input
              type="number"
              placeholder="0"
              value={filters.valor_min}
              onChange={(e) => handleChange('valor_min', e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label>Precio máx (CLP)</label>
            <input
              type="number"
              placeholder="999999"
              value={filters.valor_max}
              onChange={(e) => handleChange('valor_max', e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label>Fecha compra (desde)</label>
            <input
              type="date"
              value={filters.fecha_inicio}
              onChange={(e) => handleChange('fecha_inicio', e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label>Fecha compra (hasta)</label>
            <input
              type="date"
              value={filters.fecha_fin}
              onChange={(e) => handleChange('fecha_fin', e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label>Ordenar por</label>
            <select 
              value={filters.orden} 
              onChange={(e) => handleChange('orden', e.target.value)}
            >
              <option value="created_at_desc">Más recientes</option>
              <option value="titulo_asc">Título A-Z</option>
              <option value="titulo_desc">Título Z-A</option>
              <option value="valor_asc">Precio menor</option>
              <option value="valor_desc">Precio mayor</option>
              <option value="puntuacion_desc">Mejor puntuación</option>
              <option value="fecha_compra_desc">Fecha compra reciente</option>
            </select>
          </div>
        </div>

        <div className={styles.filtersActions}>
          <button type="submit" className={styles.applyBtn}>
            Aplicar filtros
          </button>
          <button 
            type="button" 
            className={styles.resetBtn}
            onClick={handleReset}
          >
            Limpiar filtros
          </button>
        </div>

      </form>
    </div>
  );
}
