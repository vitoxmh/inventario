import Aside from '../../components/Aside/Aside'
import { API_URL, apiFetch } from '../../config/api';
import Header from '../../components/Header/Header';
import CardGames from '../../components/Cards/CardGame';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import './RecienAgregado.scss'

export default function RecienAgregado() {
    useEffect(() => {
        document.title = 'Recien Agregado';
    }, []);

    const [plataformas, setPlataformas] = useState([]);
    const [lastGame, setLastGame] = useState([]);
    const [lastLibros, setLastLibros] = useState([]);
    const [lastAccesorios, setLastAccesorios] = useState([]);

    useEffect(() => {
        apiFetch('/plataformas/')
        .then(r => r.json())
        .then(json => setPlataformas(Array.isArray(json.data) ? json.data : []));
    }, []);

    useEffect(() => {
        apiFetch('/games/?action=last')
        .then(r => r.json())
        .then(json => setLastGame(Array.isArray(json.data) ? json.data : []));
    }, []);

    useEffect(() => {
        apiFetch('/libros/?action=last')
        .then(r => r.json())
        .then(json => setLastLibros(Array.isArray(json.data) ? json.data : []));
    }, []);

    useEffect(() => {
        apiFetch('/accesorios/?action=last')
        .then(r => r.json())
        .then(json => setLastAccesorios(Array.isArray(json.data) ? json.data : []));
    }, []);

    const formatPrice = (price) => {
        if (!price) return '';
        return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="container">
            <Aside plataformas={plataformas}/>
            <main className='main'>
                <Header/>
                <div className='container-main'>
                    <Breadcrumb items={[{ label: "Recien Agregado", active: true }]}/>
                    
                    <div className='list-cards'>
                        <h2 className='list-cards-title'>Ultimos Juegos <span></span></h2>
                        <div className='list-cards-container'>
                            {lastGame.map((game) => (
                                <CardGames dataGame={game} key={game.id}/>
                            ))}
                        </div>
                    </div>

                    <div className='list-cards'>
                        <h2 className='list-cards-title'>Ultimos Libros <span></span></h2>
                        <div className='list-cards-container'>
                            {lastLibros.map((libro) => (
                                <Link to={`/libros/detalle/${libro.id}/${libro.id_imagen}`} key={libro.id}>
                                    <div className='list-cards-container-card'>
                                        {libro.estado && (
                                            <span className={`list-cards-container-card-region ${libro.estado === 'nuevo' ? 'estado-nuevo' : 'estado-usado'}`}>
                                                {libro.estado}
                                            </span>
                                        )}
                                        <img 
                                            alt="Libro Cover" 
                                            className="list-cards-container-card-img"  
                                            src={libro.portada ? `${API_URL}/imagenes/uploads/${libro.portada}` : "/img/default-game-cover.png"}
                                        />
                                        <div className='list-cards-container-card-body'>
                                            <div className='list-cards-container-card-estado'>
                                                <span>{libro.editorial || 'N/A'}</span>
                                                {libro.valor && formatPrice(libro.valor)}
                                            </div>
                                            <h3 className='list-cards-container-card-title'>{libro.titulo}</h3>
                                            <p className='list-cards-container-card-plataform'>{libro.autor} {libro.anio ? `• ${libro.anio}` : ''}</p>
                                        </div>
                                    </div> 
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className='list-cards'>
                        <h2 className='list-cards-title'>Ultimos Accesorios <span></span></h2>
                        <div className='list-cards-container'>
                            {lastAccesorios.map((accesorio) => (
                                <Link to={`/accesorios/detalle/${accesorio.id}/${accesorio.id_imagen}`} key={accesorio.id}>
                                    <div className='list-cards-container-card'>
                                        {accesorio.estado && (
                                            <span className={`list-cards-container-card-region ${accesorio.estado === 'nuevo' ? 'estado-nuevo' : 'estado-usado'}`}>
                                                {accesorio.estado}
                                            </span>
                                        )}
                                        <img 
                                            alt="Accesorio Cover" 
                                            className="list-cards-container-card-img"  
                                            src={accesorio.portada ? `${API_URL}/imagenes/uploads/${accesorio.portada}` : "/img/default-game-cover.png"}
                                        />
                                        <div className='list-cards-container-card-body'>
                                            <div className='list-cards-container-card-estado'>
                                                <span>{accesorio.tipo || 'N/A'}</span>
                                                {accesorio.valor && formatPrice(accesorio.valor)}
                                            </div>
                                            <h3 className='list-cards-container-card-title'>{accesorio.nombre}</h3>
                                            <p className='list-cards-container-card-plataform'>{accesorio.plataforma} {accesorio.anio ? `• ${accesorio.anio}` : ''}</p>
                                        </div>
                                    </div> 
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>    
            </main>
        </div>
    );
}
