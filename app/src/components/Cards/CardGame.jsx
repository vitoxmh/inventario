import { Link } from "react-router-dom";
import './CardGames.scss'
import { API_URL } from '../../config/api'; 

export default function CardGames({dataGame =null}) {

    return (
    <> 
      <Link to={`/detalle-juego/${dataGame.id}/${dataGame.id_imagen}`} key={dataGame.id}>
                  <div className='list-cards-container-card'>
                    <span className='list-cards-container-card-region'>{dataGame.estado}</span>
                    <img alt="Game Cover" class="list-cards-container-card-img"  src={dataGame.archivo? `${API_URL}/imagenes/uploads/${dataGame.archivo}` : "/img/default-game-cover.png"}></img>
                    <div className='list-cards-container-card-body'>
                      <div className='list-cards-container-card-estado'>
                        <span>{dataGame.region}</span> ${dataGame.valor.toLocaleString("es-CL")}
                      </div>
                      <h3 className='list-cards-container-card-title'>{dataGame.titulo}</h3>
                      <p className='list-cards-container-card-plataform'>{dataGame.plataforma} • {dataGame.lanzamiento}</p>
                    </div>
                  </div> 
        </Link>
    </>
    );
}