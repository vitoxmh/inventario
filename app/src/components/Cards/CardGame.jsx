import { Link } from "react-router-dom";
import './CardGames.scss'
import { API_URL } from '../../config/api'; 

export default function CardGames({dataGame =null}) {
    const formatPrice = (price) => {
        if (!price) return '';
        return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
    <> 
      <Link to={`/detalle-juego/${dataGame.id}/${dataGame.id_imagen}`} key={dataGame.id}>
                  <div className='list-cards-container-card'>
                    {dataGame.estado && (
                        <span className={`list-cards-container-card-region ${dataGame.estado === 'nuevo' ? 'estado-nuevo' : 'estado-usado'}`}>
                            {dataGame.estado}
                        </span>
                    )}
                    <img 
                        alt="Game Cover" 
                        className="list-cards-container-card-img"  
                        src={dataGame.portada ? `${API_URL}/imagenes/uploads/${dataGame.portada}` : "/img/default-game-cover.png"}
                    />
                    <div className='list-cards-container-card-body'>
                      <div className='list-cards-container-card-estado'>
                        <span>{dataGame.region || 'N/A'}</span> 
                        {dataGame.valor && formatPrice(dataGame.valor)}
                      </div>
                      <h3 className='list-cards-container-card-title'>{dataGame.titulo}</h3>
                      <p className='list-cards-container-card-plataform'>{dataGame.plataforma} {dataGame.lanzamiento ? `• ${dataGame.lanzamiento}` : ''}</p>
                      {dataGame.puntuacion > 0 && (
                        <div className='list-cards-container-card-stars'>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={`material-icons ${dataGame.puntuacion >= star ? 'star-filled' : 'star-empty'}`}>
                              {dataGame.puntuacion >= star ? 'star' : 'star_border'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div> 
        </Link>
    </>
    );
}