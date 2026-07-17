import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Header from '../../components/Header/Header';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import './DetalleAmiibo.scss';
import { API_URL, apiFetch } from '../../config/api';

export default function DetalleAmiibo() {
    const { id, id_imagen } = useParams();
    const navigate = useNavigate();
    const [amiibo, setAmiibo] = useState(null);
    const [imagenes, setImagenes] = useState([]);
    const dialogRef = useRef(null);

    useEffect(() => {
        apiFetch(`/amiibos/?id=${id}`)
            .then(r => r.json())
            .then((json) => {
                const data = json.data;
                setAmiibo(data);
                document.title = data.titulo || 'Detalle Amiibo';
            });

        apiFetch(`/imagenes/?juego_id=${id_imagen}&type=all`)
            .then(r => r.json())
            .then(json => setImagenes(json.data || []));
    }, [id, id_imagen]);

    if (!amiibo) return <p>Cargando...</p>;

    const portada = imagenes.find(img => img.tipo === "0");
    const contraportada = imagenes.find(img => img.tipo === "1");

    const deleteImage = (imgId) => {
        apiFetch(`/imagenes/${imgId}/`, {
            method: 'DELETE',
        })
        .then(r => r.json())
        .then(json => {
            if (json.success) {
                setImagenes(imagenes.filter(imagen => imagen.id !== imgId));
            }
        });
    };

    const deleteAmiibo = () => {
        if (!window.confirm("¿Estás seguro de eliminar este amiibo?")) return;
        
        apiFetch(`/amiibos/${id}/`, {
            method: 'DELETE',
        })
        .then(r => r.json())
        .then(data => {
            navigate("/amiibos/");
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
                    <Link to={`/amiibos/editar/${id}/${id_imagen}`} className="sidebar-btn">
                        <span className="material-icons">edit</span>
                        Editar Amiibo
                    </Link>
                    <button onClick={deleteAmiibo} className="sidebar-btn-delete">
                        <span className="material-icons">delete</span>
                        Eliminar
                    </button>
                </div>
                
                <div className='container-main'>
                    <div className="detalle-juego-overlay">
                        <Breadcrumb items={[
                            { label: "Amiibos", to: "/amiibos" },
                            { label: amiibo.titulo, active: true }
                        ]}/>
                        
                        <div className="detalle-juego">
                            <h3 className="detalle-juego-title">
                                <span>Amiibo</span>{amiibo.titulo}
                            </h3>
                            
                            {amiibo.calificacion && (
                                <div className='detalle-juego-stars'>
                                    <span>{amiibo.calificacion}</span>
                                </div>
                            )}
                            
                            <p className='detalle-juego-description'>Estado: {amiibo.estado}</p>
                            
                            <div className="detalle-juego-price">
                                <p className="detalle-juego-price-title">Precio</p>
                                <p className="detalle-juego-price-value">${amiibo.precio?.toLocaleString("es-CL") || 0}</p>
                                <span className="detalle-juego-price-payments material-icons">payments</span>
                            </div>
                        </div>
                        
                        <div className='detalle-juego-cards'>
                            <div className='detalle-juego-card'>
                                <p className='detalle-juego-card-text'>Año</p>
                                <h4 className='detalle-juego-card-title'>{amiibo.anio || '-'}</h4>
                            </div>
                            <div className='detalle-juego-card'>
                                <p className='detalle-juego-card-text'>Estado</p>
                                <h4 className='detalle-juego-card-title'>{amiibo.estado || '-'}</h4>
                            </div>
                            <div className='detalle-juego-card'>
                                <p className='detalle-juego-card-text'>Calificación</p>
                                <h4 className='detalle-juego-card-title'>{amiibo.calificacion || '-'}</h4>
                            </div>
                        </div>
                        
                        {amiibo.comentario && (
                            <div className='detalle-juego-comentario'>
                                <h4 className='detalle-juego-comentario-title'>Comentario</h4>
                                <p className='detalle-juego-comentario-text'>{amiibo.comentario}</p>
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