import { useState, useEffect } from "react";
import Header from '../../components/Header/Header'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import Aside from '../../components/Aside/Aside'
import { Link } from "react-router-dom";
import { API_URL } from '../../config/api'; 
 
export default function Consolas({consolaEditar}) {

    const [consolas, setConsolas] = useState([]);

    const cargarConsolas = () => {
        fetch(`${API_URL}/consolas/`)
        .then(r => r.json())
        .then(setConsolas);
    };

    useEffect(() => {
        cargarConsolas();
    }, []);


  return (
    <>
      <div className="container">
          <Aside consolas={consolas}/>
          <main className='main'>
            <Header/>
            <div className='container-main'>
              <Breadcrumb items={[    
                                                        { label: "Consolas", active: true }
                                                    ]}/>
              <div className='list-cards'>
                <div className='game-form'>
                <h3 className='game-form-title'>Nueva Consola</h3>
                <p className='game-form-subtitle'>Agrega una nueva consola.</p>
                  <div className="game-form-action-button">
                      <Link className='game-form-action-button-save' to="/consolas/edit/"><span className="material-icons">save</span> {consolaEditar ? "Editar Consola" : "Nueva Consola"}</Link>
                  </div> 
              </div>
                <h2 className='list-cards-title'>Listado de Consolas <span></span></h2>
                <div className='list-cards-container'>
                  {consolas.map((consola) => (
                    <Link to={`/consolas/detalle/${consola.id}/${consola.id_imagen}`} key={consola.id}>
                      <div className='list-cards-container-card'>
                        
                        <span className='list-cards-container-card-region'>Total juegos: {consola.total}</span>
                        <img alt="Game Cover" className="list-cards-container-card-img"  src={consola.archivo? `http://localhost:8080/api/imagenes/uploads/${consola.archivo}` : "/img/default-game-cover.png"}></img>
                        <div className='list-cards-container-card-body'>
                          
                          <h3 className='list-cards-container-card-title'>{consola.nombre}</h3>
                          <p className='list-cards-container-card-plataform'>{consola.fabricante} • {consola.lanzamiento}</p>
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