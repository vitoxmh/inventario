import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Header from '../../components/Header/Header';
import AsideGame from '../../components/Aside/AsideGame';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import './DetalleJuego.scss';
import { API_URL, apiFetch } from '../../config/api';

export default function DetalleJuego() {  


    const { id, id_imagen } = useParams();
    const [juego, setJuego] = useState(null);
    const [plataformas, setPlataformas] = useState([]);
    const [portada, setPortada] = useState(null);
    const [contraportada, setContraportada] = useState(null);
    const [galeria, setGaleria] = useState([]);
    const [logo, setLogo] = useState(null);
    const [favorito, setFavorito] = useState(false);
    const dialogRef = useRef(null);
  
    useEffect(() => {
        // Galeria
        apiFetch(`/imagenes/?juego_id=${id_imagen}&type=all`)
        .then(r => r.json())
        .then((data) => {
            setGaleria(data);
            const logoImg = data.find(img => img.tipo === "3");
            if (logoImg) setLogo(logoImg);
        });


        // Juego
        apiFetch(`/games/?id=${id}`)
        .then(r => r.json())
        .then((json) => {
            const data = json.data;
            setJuego(data);
            setFavorito(data.favorito || false);
            document.title = data.titulo || 'Detalle Juego';
        });

    }, [id, id_imagen]);

    const toggleFavorito = async () => {
        try {
            const res = await apiFetch(`/games/${id}/`, {
                method: 'PUT',
                body: JSON.stringify({ ...juego, favorito: !favorito })
            });
            if (res.ok) {
                setFavorito(!favorito);
                setJuego({ ...juego, favorito: !favorito });
            }
        } catch (error) {
            console.error('Error al actualizar favorito:', error);
        }
    };


    

    if (!juego) return <p>Cargando...</p>;



    const imgContraportada = galeria.find(imagen => imagen.tipo === "1");

    const deleteImage = (id) => {

   
        apiFetch(`/imagenes/${id}/`, {
            method: 'DELETE',
        })
        .then(r => r.json())
        .then(json => {

                if (json.success) {
                    setGaleria(galeria.filter(imagen => imagen.id !== id));
                }
  

        });

    }


    const showImage = (imagen) => {

    
    }


    return (
        <>
        <div className="container">
            <Header clase="header-detalle-juego" />
            <main className='main'>
                 <AsideGame clase={"sidebar-detalle-juego"}
                  section={"/editar-juego"} 
                  imgPortada={juego.portada}
                  imgContraportada={juego.contraportada}
                  imgLogo={juego.logo}
                  cartucho={juego.cartucho}
                  manual={juego.manual} 
                  caja={juego.caja}
                  id={juego.id_juego}
                  id_imagen={juego.id_imagen_games}
                  />
                 <div className='container-main' style={juego.poster ? { 
                        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.95) 30%), url(${API_URL}/imagenes/uploads/${juego.poster})`, 
                        backgroundSize: 'cover', 
                        backgroundPosition: 'center' 
                    } : {}}>
                    <div className="detalle-juego-overlay">
                    <Breadcrumb items={[    
                                            { label: "Games", to: "/games" },
                                            { label: juego.plataforma, to: "/detalle-plataforma/"+juego.plataforma_id+"/" },
                                            { label: juego.titulo, active: true }
                                        ]}/>
                    <div className="detalle-juego">
                       
                        <div className="detalle-juego-title-container">
                            <h3 className="detalle-juego-title"><span>{juego.desarrollador}</span>{juego.titulo}</h3>
                            <button 
                                className={`detalle-juego-favorito-btn ${favorito ? 'active' : ''}`}
                                onClick={toggleFavorito}
                                title={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                            >
                                <span className="material-icons">
                                    {favorito ? 'favorite' : 'favorite_border'}
                                </span>
                            </button>
                        </div>
                         {juego.logo && (
                             <div className="logo-juego">
                                 <img src={`${API_URL}/imagenes/uploads/${juego.logo}`} alt="Logo"  />
                             </div>
                         )}
                         {juego.puntuacion > 0 && (
                             <div className='detalle-juego-stars'>
                                 {[1, 2, 3, 4, 5].map((star) => (
                                     <span key={star} className={`material-icons ${juego.puntuacion >= star ? 'star-filled' : 'star-empty'}`}>
                                         {juego.puntuacion >= star ? 'star' : 'star_border'}
                                     </span>
                                 ))}
                             </div>
                         )}
                        <p className='detalle-juego-description'>Estado: {juego.estado}</p>
                        <div className="detalle-juego-price">
                            <p className="detalle-juego-price-title">Est. Market Value</p>
                            <p className="detalle-juego-price-value">${juego.valor.toLocaleString("es-CL")}</p>
                            <p className="detalle-juego-price-last">Last synced: 2h ago</p>
                            <span className="detalle-juego-price-payments material-icons">payments</span>
                        </div>
                    </div>
                    <div className='detalle-juego-cards'>
                        <div className='detalle-juego-card'>
                            <p className='detalle-juego-card-text'>Plataforma</p>
                            <h4 className='detalle-juego-card-title'>{juego.plataforma}</h4>
                        </div>
                        <div className='detalle-juego-card'>
                            <p className='detalle-juego-card-text'>Desarrollador</p>
                            <h4 className='detalle-juego-card-title'>{juego.desarrollador}</h4>
                        </div>
                        
                        <div className='detalle-juego-card'>
                            <p className='detalle-juego-card-text'>Genero</p>
                            <h4 className='detalle-juego-card-title'>{juego.genero}</h4>
                        </div>
                        <div className='detalle-juego-card'>
                            <p className='detalle-juego-card-text'>Región</p>
                            <h4 className='detalle-juego-card-title'>{juego.region}</h4>
                        </div>
                        <div className='detalle-juego-card'>
                            <p className='detalle-juego-card-text'>Año Lanzamiento</p>
                            <h4 className='detalle-juego-card-title'>{juego.lanzamiento}</h4>
                        </div>
                    </div>
                    {juego.comentario && (
                        <div className='detalle-juego-comentario'>
                            <h4 className='detalle-juego-comentario-title'>Comentario</h4>
                            <p className='detalle-juego-comentario-text'>{juego.comentario}</p>
                        </div>
                    )}
                    <div className='detalle-juego-gallery'>
                        <h3 className='detalle-juego-gallery-title'>Physical Item Gallery</h3>
                        <div className='detalle-juego-gallery-images'>

                            {galeria.length >  0 ? galeria.filter(imagen => imagen.tipo === "4").map((imagen) => ( 
                                <div className='detalle-juego-gallery-foto' key={imagen.id}>
                                    <div className="detalle-juego-gallery-foto-btn">
                                        <button 
                                        onClick={() => { 
                                             dialogRef.current.showModal();
                                                dialogRef.current.querySelector(".modal-content").innerHTML = `<img src="http://localhost:8080/api/imagenes/uploads/${imagen.archivo}" alt="" width="100%" height="100%" style="object-fit: contain;" />`;
                                            }}
                                        className='detalle-juego-gallery-foto-btn-zoom material-icons'>zoom_in</button>
                                        <button 
                                        onClick={ () => deleteImage(imagen.id) }
                                        className='detalle-juego-gallery-foto-btn-delete material-icons'>delete_outline</button>
                                    </div>
                                     <img
                                        src={`${API_URL}/imagenes/uploads/${imagen.archivo}`}
                                        alt=""
                                        width={350}
                                        className="w-full h-64 object-contain rounded shadow"
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