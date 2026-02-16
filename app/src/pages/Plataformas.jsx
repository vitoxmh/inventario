import { useState, useEffect } from "react";
import Header from '../components/Header/Header'
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import Aside from '../components/Aside/Aside'
import { Link } from "react-router-dom";
import { API_URL } from '../config/api'; 
 
export default function Plataformas() {

    const [plataformas, setPlataformas] = useState([]);

    const cargarPlataformas = () => {
        fetch(`${API_URL}/plataformas/`)
        .then(r => r.json())
        .then(setPlataformas);
    };

    useEffect(() => {
        cargarPlataformas();
    }, []);


  return (
    <>
      <div class="container">
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
                        
                        <span className='list-cards-container-card-region'>Total juegos: {plataforma.total}</span>
                        <img alt="Game Cover" class="list-cards-container-card-img"  src={plataforma.archivo? `http://localhost:8080/api/imagenes/uploads/${plataforma.archivo}` : "/img/default-game-cover.png"}></img>
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