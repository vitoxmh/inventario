import { useState, useEffect, useCallback } from "react";
import Header from '../../components/Header/Header'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import Aside from '../../components/Aside/Aside'
import CardGames from '../../components/Cards/CardGame';
import { useParams, Link } from "react-router-dom";
import { API_URL } from '../../config/api';
import '../../components/Cards/CardPaginator.scss';

export default function DetallePlataforma() {
    
    const [juegos, setJuegos] = useState([]);
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const [plataforma, setPlataforma] = useState("");
    const {id} = useParams();

    const cargarJuegos = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({
            action: 'all-plataforma',
            plataforma_id: id,
            page: pagina,
            limit: 20,
            ...(busqueda && { search: busqueda })
        });

        try {
            const resp = await fetch(`${API_URL}/games/?${params}`);
            const data = await resp.json();
            setJuegos(data.data || []);
            setTotalPaginas(data.pagination?.totalPages || 0);
            setTotal(data.pagination?.total || 0);
            if (data.data && data.data.length > 0) {
                setPlataforma(data.data[0].plataforma);
                document.title = data.data[0].plataforma;
            }
        } catch (error) {
            console.error("Error cargando juegos:", error);
        } finally {
            setLoading(false);
        }
    }, [id, pagina, busqueda]);

    useEffect(() => {
        cargarJuegos();
    }, [cargarJuegos]);

    useEffect(() => {
        setPagina(1);
    }, [busqueda]);

    useEffect(() => {
        fetch(`${API_URL}/plataformas/?id=${id}`)
            .then(r => r.json())
            .then((data) => {
                if (data && data.nombre) {
                    setPlataforma(data.nombre);
                    document.title = data.nombre;
                }
            });
    }, [id]);

    return (
        <>
            <div className="container">
                
                <main className='main'>
                    <Header/>
                    <div className='container-main'>
                    <Breadcrumb items={[    
                                            { label: "Plataformas", to: "/plataformas" },
                                            { label: juegos[0]?.plataforma || "Cargando...", active: true },
                                        ]}/>
                    <div className='list-cards'>
                         <h3 className="detalle-juego-title"><span>{juegos[0]?.plataforma}</span>Total: {total}</h3>
                         <div>
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                        <div className='list-cards-container'>
                            {loading ? (
                                <p>Cargando...</p>
                            ) : juegos.length === 0 ? (
                                <p>No se encontraron juegos</p>
                            ) : (
                                juegos.map((game) => (
                                    <CardGames dataGame={game} key={game.id}/>
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
                    </div>
                    </div>
                </main>
            </div>
        </>
    );
};