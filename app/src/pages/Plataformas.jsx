import { useState, useEffect } from "react";
import Header from '../components/Header/Header'
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import Aside from '../components/Aside/Aside'
import { Link } from "react-router-dom";
import { API_URL, apiFetch } from '../config/api'; 
 
export default function Plataformas() {

    const [plataformas, setPlataformas] = useState([]);

    const cargarPlataformas = () => {
        apiFetch('/plataformas/')
        .then(r => r.json())
        .then(setPlataformas);
    };

    useEffect(() => {
        document.title = 'Plataformas';
        cargarPlataformas();
    }, []);

    const eliminarPlataforma = (e, plataforma) => {
        e.preventDefault();
        if (!window.confirm(`¿Eliminar la plataforma "${plataforma.nombre}"? Esto eliminará todos los juegos asociados.`)) return;
        
        apiFetch(`/plataformas/${plataforma.id}/`, { method: 'DELETE' })
            .then(r => {
                if (r.ok) {
                    cargarPlataformas();
                } else {
                    alert("Error al eliminar la plataforma");
                }
            });
    };


  return (
    <>
      <div className="container">
          <Aside plataformas={plataformas}/>
          <main className='main'>
            <Header/>
            <div className='container-main'>
              <Breadcrumb items={[    
                                                        { label: "Plataformas", active: true }
                                                    ]}/>
              <div className='list-cards'>
                <h2 className='list-cards-title'>Listado de Plataformas <span></span></h2>
<div className='list-cards-container'>
                  {plataformas.map((plataforma) => (
                    <Link to={`/detalle-plataforma/${plataforma.id}/`} key={plataforma.id}>
                      <div className='list-cards-container-card'>
                        <button 
                            className="card-delete-btn"
                            onClick={(e) => eliminarPlataforma(e, plataforma)}
                            title="Eliminar"
                        >
                            <span className="material-icons">delete</span>
                        </button>
                        <span className='list-cards-container-card-region'>Total juegos: {plataforma.total}</span>
                        <img alt="Game Cover" className="list-cards-container-card-img"  src={plataforma.archivo? `${API_URL}/imagenes/uploads/${plataforma.archivo}` : "/img/default-game-cover.png"}></img>
                        <div className='list-cards-container-card-body'>
                          
                          <h3 className='list-cards-container-card-title'>{plataforma.nombre}</h3>
                          <p className='list-cards-container-card-plataform'>{plataforma.fabricante} • {plataforma.lanzamiento}</p>
                        </div>
                      </div> 
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </main>
      </div>
    </>
  );
}