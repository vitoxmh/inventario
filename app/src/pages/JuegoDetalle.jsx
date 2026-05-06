import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from '../components/Header/Header'
import ImageSlider from '../components/ImageSlider/ImageSlider'
import './juegoDetalle.scss'
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { API_URL } from '../config/api';

export default function JuegoDetalle() {

  
  const { id, id_imagen } = useParams();
  const [juego, setJuego] = useState(null);
  const [imagenes, setImagenes] = useState([]);

useEffect(() => {
    // Juego
    fetch(`${API_URL}/games/?id=${id}`)
      .then(r => r.json())
      .then((data) => {
        setJuego(data);
        document.title = data.titulo || 'Detalle Juego';
      });


        // Imágenes
    fetch(`${API_URL}/imagenes/?juego_id=${id_imagen}&type=4`)
      .then(r => r.json())
      .then(setImagenes);


  }, [id]);

  if (!juego) return <p>Cargando...</p>;



  return (
    <>
      <Header></Header>
      <main className='container'>
        <Breadcrumb level1={"Games"} namePage={juego.titulo}></Breadcrumb>

        <div className="card">
          <div>

            <ImageSlider images={imagenes} />
 
          </div>
          <div>
                <h1 className="card-title">{juego.titulo}</h1>
                <ul className="card-items">
                  <li><strong>Plataforma:</strong> {juego.plataforma}</li>
                  <li><strong>Región:</strong> {juego.region}</li>
                  <li><strong>Formato:</strong> {juego.formato}</li>
                  <li><strong>Estado:</strong> {juego.estado}</li>
                  <li><strong>Incluye:</strong>
                    <ol className="card-items">
                      <li>Cartucho: {juego.cartucho ? "Sí" : "No"}</li>
                      <li>Manual: {juego.manual ? "Sí" : "No"}</li>
                      <li>Caja: {juego.caja ? "Sí" : "No"}</li>
                    </ol>
                  </li>
                  <li><strong>Valor:</strong> {new Intl.NumberFormat("es-CL", {
                                                style: "currency",
                                                currency: "CLP",
                                                minimumFractionDigits: 0
                                              }).format(juego.valor)}</li>
              </ul>

          </div>
        </div>
       
      

      
    </main>
    </>
  );
}
