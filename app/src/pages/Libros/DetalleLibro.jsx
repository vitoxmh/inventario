import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Header from '../../components/Header/Header';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { API_URL } from '../../config/api';
import './Libros.scss';

export default function DetalleLibro() {
    const { id, id_imagen } = useParams();
    const navigate = useNavigate();
    const [libro, setLibro] = useState(null);
    const [imagenes, setImagenes] = useState([]);
    const dialogRef = useRef(null);

    useEffect(() => {
        fetch(`${API_URL}/libros/?id=${id}`)
            .then(r => r.json())
            .then((data) => {
                setLibro(data);
                document.title = data.titulo || 'Detalle Libro';
            });

        fetch(`${API_URL}/imagenes/?juego_id=${id_imagen}&type=all`)
            .then(r => r.json())
            .then(setImagenes);
    }, [id, id_imagen]);

    if (!libro) return <p>Cargando...</p>;

    const portada = imagenes.find(img => img.tipo === "0");

    const deleteImage = (imgId) => {
        fetch(`${API_URL}/imagenes/${imgId}/`, {
            method: 'DELETE',
        })
        .then(r => r.json())
        .then(data => {
            if (data.ok) {
                setImagenes(imagenes.filter(imagen => imagen.id !== imgId));
            }
        });
    };

    const deleteLibro = () => {
        if (!window.confirm("¿Estás seguro de eliminar este libro?")) return;
        
        fetch(`${API_URL}/libros/${id}/`, {
            method: 'DELETE',
        })
        .then(r => r.json())
        .then(data => {
            navigate("/libros/");
        });
    };

    const showImage = (imagen) => {
        dialogRef.current.showModal();
        dialogRef.current.querySelector(".modal-content").innerHTML = 
            `<img src="${API_URL}/imagenes/uploads/${imagen.archivo}" alt="" width="100%" height="100%" style="object-fit: contain;" />`;
    }

    return (
        <>
        <div className="container">
            <Header clase="header-detalle-juego" />
            <main className='main'>
                <div className="sidebar sidebar-detalle-juego">
                    <div className="sidebar-card">
                        {portada ? (
                            <img 
                                src={`${API_URL}/imagenes/uploads/${portada.archivo}`} 
                                alt="Portada"
                                className="sidebar-card-img"
                            />
                        ) : (
                            <div className="sidebar-card-img-vacio">
                                <span className="material-icons">image</span>
                            </div>
                        )}
                    </div>
                    <Link to={`/libros/editar/${id}/${id_imagen}`} className="sidebar-btn">
                        <span className="material-icons">edit</span>
                        Editar Libro
                    </Link>
                    <button onClick={deleteLibro} className="sidebar-btn-delete">
                        <span className="material-icons">delete</span>
                        Eliminar
                    </button>
                </div>
                
                <div className='container-main'>
                    <div className="detalle-juego-overlay">
                        <Breadcrumb items={[
                            { label: "Libros", to: "/libros" },
                            { label: libro.titulo, active: true }
                        ]}/>
                        
                        <div className="detalle-juego">
                            <h3 className="detalle-juego-title">
                                <span>Libro</span>{libro.titulo}
                            </h3>
                            
                            {libro.calificacion && (
                                <div className='detalle-juego-stars'>
                                    <span>{libro.calificacion}</span>
                                </div>
                            )}
                            
                            <p className='detalle-juego-description'>Estado: {libro.estado}</p>
                            
                            <div className="detalle-juego-price">
                                <p className="detalle-juego-price-title">Precio</p>
                                <p className="detalle-juego-price-value">${libro.precio?.toLocaleString("es-CL") || 0}</p>
                                <span className="detalle-juego-price-payments material-icons">payments</span>
                            </div>
                        </div>
                        
                        <div className='detalle-juego-cards'>
                            <div className='detalle-juego-card'>
                                <p className='detalle-juego-card-text'>Autor</p>
                                <h4 className='detalle-juego-card-title'>{libro.autor || '-'}</h4>
                            </div>
                            <div className='detalle-juego-card'>
                                <p className='detalle-juego-card-text'>Año</p>
                                <h4 className='detalle-juego-card-title'>{libro.anio || '-'}</h4>
                            </div>
                            <div className='detalle-juego-card'>
                                <p className='detalle-juego-card-text'>Editorial</p>
                                <h4 className='detalle-juego-card-title'>{libro.editorial || '-'}</h4>
                            </div>
                        </div>
                        
                        {libro.comentario && (
                            <div className='detalle-juego-comentario'>
                                <h4 className='detalle-juego-comentario-title'>Comentario</h4>
                                <p className='detalle-juego-comentario-text'>{libro.comentario}</p>
                            </div>
                        )}
                        
                        <div className='detalle-juego-gallery'>
                            <h3 className='detalle-juego-gallery-title'>Galería</h3>
                            <div className='detalle-juego-gallery-images'>
                                {imagenes.length > 0 ? imagenes.map((imagen) => (
                                    <div className='detalle-juego-gallery-foto' key={imagen.id}>
                                        <div className="detalle-juego-gallery-foto-btn">
                                            <button 
                                                onClick={() => showImage(imagen)}
                                                className='detalle-juego-gallery-foto-btn-zoom material-icons'>zoom_in</button>
                                            <button 
                                                onClick={() => deleteImage(imagen.id)}
                                                className='detalle-juego-gallery-foto-btn-delete material-icons'>delete_outline</button>
                                        </div>
                                        <img
                                            src={`${API_URL}/imagenes/uploads/${imagen.archivo}`}
                                            alt=""
                                            width={350}
                                        />
                                    </div>
                                )) : <p>No hay imágenes disponibles</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <dialog ref={dialogRef} className="modal">
            <button onClick={() => dialogRef.current.close()} className="modal-cerrar">x</button>
            <div className="modal-content">
            </div>
        </dialog>
        </>
    );
}