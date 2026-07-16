import { useState, useEffect, useCallback } from "react";
import { apiFetch } from '../../config/api';

export function useGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ totalPages: 0 });

  const fetchGames = useCallback(async (endpoint, page = 1, search = '', favorito = null) => {
    setLoading(true);
    const params = new URLSearchParams({
      page,
      limit: 20,
      ...(search && { search }),
      ...(favorito && { favorito })
    });

    try {
      const resp = await apiFetch(`${endpoint}?${params}`);
      const data = await resp.json();
      setGames(data.data || []);
      setPagination(data.pagination || { totalPages: 0 });
    } catch (error) {
      console.error('Error cargando juegos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavorito = async (id, currentState) => {
    try {
      const res = await apiFetch(`/games/${id}/`, {
        method: 'PUT',
        body: JSON.stringify({ favorito: !currentState })
      });
      if (res.ok) {
        setGames(games.map(g => 
          g.id === id ? { ...g, favorito: !currentState } : g
        ));
      }
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
    }
  };

  return { games, loading, pagination, fetchGames, toggleFavorito };
}
