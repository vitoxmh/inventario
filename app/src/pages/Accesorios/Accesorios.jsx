import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from '../../components/Header/Header'
import Aside from '../../components/Aside/Aside'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { API_URL } from '../../config/api';

export default function Accesorios() {  
    const [accesorios, setAccesorios] = useState([]);

    const cargarAccesorios = () => {
        fetch(`${API_URL}/accesorios/`)
        .then(r => r.json())
        .then(data => setAccesorios(data.data || []));
    };

    useEffect(() => {
        document.title = 'Accesorios';
        cargarAccesorios();
    }, []);

    const eliminarAccesorio = (e, accesorio) => {
        e.preventDefault();
        if (!window.confirm(`¿Eliminar el accesorio "${accesorio.nombre}"?`)) return;
        
        fetch(`${API_URL}/accesorios/${accesorio.id}/`, { method: 'DELETE' })
            .then(r => {
                if (r.ok) {
                    cargarAccesorios();
                } else {
                    alert("Error al eliminar el accesorio");
                }
            });
    };

    return (
      <div className="container">
        <Aside/>
        <main className='main'>
          <Header/>
          <div className='container-main'>
            <Breadcrumb items={[{ label: "Accesorios", active: true }]}/>
            <div className='list-cards'>
              <div className='game-form'>
                <h3 className='game-form-title'>Nuevo Accesorio</h3>
                <p className='game-form-subtitle'>Agrega un nuevo accesorio.</p>
                <div className="game-form-action-button">
                    <Link className='game-form-action-button-save' to="/accesorios/nuevo/"><span className="material-icons">save</span> Nuevo Accesorio</Link>
                </div> 
              </div>
              <h2 className='list-cards-title'>Listado de Accesorios <span></span></h2>
              <div className='list-cards-container'>
                {accesorios.map((accesorio) => (
                    <Link to={`/accesorios/detalle/${accesorio.id}/${accesorio.id_imagen}`} key={accesorio.id}>
                        <div className='list-cards-container-card'>
                            <button 
                                className="card-delete-btn"
                                onClick={(e) => eliminarAccesorio(e, accesorio)}
                                title="Eliminar"
                            >
                                <span className="material-icons">delete</span>
                            </button>
                            <img alt="Accesorio" className="list-cards-container-card-img" src={accesorio.portada ? `${API_URL}/imagenes/uploads/${accesorio.portada}` : "/img/default-game-cover.png"}></img>
                            <div className='list-cards-container-card-body'>
                                <h3 className='list-cards-container-card-title'>{accesorio.nombre}</h3>
                                <p className='list-cards-container-card-plataform'>{accesorio.tipo} • {accesorio.plataforma}</p>
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