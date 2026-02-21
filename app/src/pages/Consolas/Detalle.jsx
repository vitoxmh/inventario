import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Header from '../../components/Header/Header';
import AsideGame from '../../components/Aside/AsideGame';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import '../DetalleJuego/DetalleJuego.scss';
import { API_URL } from '../../config/api';


export default function Detalle() {


    const { id, id_imagen } = useParams();
    const [galeria, setGaleria] = useState([]);
    const [consola, setConsola] = useState(null);


    useEffect(() => {
    
            // Galeria
        fetch(`${API_URL}/imagenes/?juego_id=${id_imagen}&type=all`)
        .then(r => r.json())
        .then(setGaleria);


        // consola
        fetch(`${API_URL}/consolas/?id=${id}`)
        .then(r => r.json())
        .then(setConsola);

    }, [id, id_imagen]);

     if (!consola) return <p>Cargando...</p>;
    return (
        <>
         <div className="container">
            <Header clase="header-detalle-juego" />
            <main className='main'>
                 <AsideGame clase={"sidebar-detalle-juego"}
                 section={"/consolas/edit"} 
                 imgPortada={consola.portada}
                 imgContraportada={consola.contraportada}
                 cartucho={consola.cartucho}
                 manual={consola.manual} 
                 caja={consola.caja}
                 id={consola.id}
                 id_imagen={consola.id_imagen}
                 />
                 <div className='container-main'>
                    <Breadcrumb items={[    
                                            { label: "Games", to: "/games" },
                                            { label: consola.plataforma, to: "/plataformas" },
                                            { label: consola.nombre, active: true }
                                        ]}/>
                    <div className="detalle-juego">
                        <h3 className="detalle-juego-title"><span>{consola.fabricante}</span>{consola.nombre}</h3>
                        <p className='detalle-juego-description'>Estado: {consola.estado}</p>
                        <div className="detalle-juego-price">
                            <p className="detalle-juego-price-title">Est. Market Value</p>
                            <p className="detalle-juego-price-value">${consola.valor.toLocaleString("es-CL")}</p>
                            <p className="detalle-juego-price-last">Last synced: 2h ago</p>
                            <span className="detalle-juego-price-payments material-icons">payments</span>
                        </div>
                    </div>
                    <div className='detalle-juego-cards'>
                        <div className='detalle-juego-card'>
                            <p className='detalle-juego-card-text'>Plataforma</p>
                            <h4 className='detalle-juego-card-title'>{consola.plataforma}</h4>
                        </div>
                        <div className='detalle-juego-card'>
                            <p className='detalle-juego-card-text'>Desarrollador</p>
                            <h4 className='detalle-juego-card-title'>{consola.desarrollador}</h4>
                        </div>
                        
                        <div className='detalle-juego-card'>
                            <p className='detalle-juego-card-text'>Genero</p>
                            <h4 className='detalle-juego-card-title'>{consola.genero}</h4>
                        </div>
                        <div className='detalle-juego-card'>
                            <p className='detalle-juego-card-text'>Región</p>
                            <h4 className='detalle-juego-card-title'>{consola.region}</h4>
                        </div>
                        <div className='detalle-juego-card'>
                            <p className='detalle-juego-card-text'>Año Lanzamiento</p>
                            <h4 className='detalle-juego-card-title'>{consola.lanzamiento}</h4>
                        </div>
                    </div>
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
            </main>
        </div>

  
        </>
    );


}