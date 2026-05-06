import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from '../../components/Header/Header'
import Aside from '../../components/Aside/Aside'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { API_URL } from '../../config/api';

export default function Libros() {  
    const [libros, setLibros] = useState([]);

    const cargarLibros = () => {
        fetch(`${API_URL}/libros/`)
        .then(r => r.json())
        .then(data => setLibros(data.data || []));
    };

    useEffect(() => {
        document.title = 'Libros';
        cargarLibros();
    }, []);

    const eliminarLibro = (e, libro) => {
        e.preventDefault();
        if (!window.confirm(`¿Eliminar el libro "${libro.titulo}"?`)) return;
        
        fetch(`${API_URL}/libros/${libro.id}/`, { method: 'DELETE' })
            .then(r => {
                if (r.ok) {
                    cargarLibros();
                } else {
                    alert("Error al eliminar el libro");
                }
            });
    };

    return (
      <div className="container">
        <Aside/>
        <main className='main'>
          <Header/>
          <div className='container-main'>
            <Breadcrumb items={[{ label: "Libros", active: true }]}/>
            <div className='list-cards'>
              <div className='game-form'>
                <h3 className='game-form-title'>Nuevo Libro</h3>
                <p className='game-form-subtitle'>Agrega un nuevo libro.</p>
                <div className="game-form-action-button">
                    <Link className='game-form-action-button-save' to="/libros/nuevo/"><span className="material-icons">save</span> Nuevo Libro</Link>
                </div> 
              </div>
              <h2 className='list-cards-title'>Listado de Libros <span></span></h2>
              <div className='list-cards-container'>
                {libros.map((libro) => (
                    <Link to={`/libros/detalle/${libro.id}/${libro.id_imagen}`} key={libro.id}>
                        <div className='list-cards-container-card'>
                            <button 
                                className="card-delete-btn"
                                onClick={(e) => eliminarLibro(e, libro)}
                                title="Eliminar"
                            >
                                <span className="material-icons">delete</span>
                            </button>
                            <img alt="Libro" className="list-cards-container-card-img" src={libro.portada ? `${API_URL}/imagenes/uploads/${libro.portada}` : "/img/default-game-cover.png"}></img>
                            <div className='list-cards-container-card-body'>
                                <h3 className='list-cards-container-card-title'>{libro.titulo}</h3>
                                <p className='list-cards-container-card-plataform'>{libro.autor} • {libro.anio}</p>
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