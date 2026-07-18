import Aside from '../../components/Aside/Aside'
import { API_URL, apiFetch } from '../../config/api';
import Header from '../../components/Header/Header';
import CardGames from '../../components/Cards/CardGame';
import { Link } from "react-router-dom";
import { useState, useEffect} from "react";
import './Home.scss'

export default function Home() {
    useEffect(() => {
        document.title = 'Inventory';
    }, []);

    const [plataformas, setPlataformas] = useState([]);
    const [lastGame, setLastGame] = useState([]);
    const [lastConsolas, setLastConsolas] = useState([]);
    const [lastAmiibos, setLastAmiibos] = useState([]);
    const [lastLibros, setLastLibros] = useState([]);
    const [lastAccesorios, setLastAccesorios] = useState([]);

    useEffect(() => {
        apiFetch('/plataformas/?action=countPlataformas')
        .then(r => r.json())
        .then(json => setPlataformas(Array.isArray(json.data) ? json.data : []));
    }, []);



     useEffect(() => {
        apiFetch('/games/?action=last')
        .then(r => r.json())
        .then(json => setLastGame(Array.isArray(json.data) ? json.data : []));
    }, []);

    useEffect(() => {
        apiFetch('/consolas/?action=last')
        .then(r => r.json())
        .then(json => setLastConsolas(Array.isArray(json.data) ? json.data : []));
    }, []);

    useEffect(() => {
        apiFetch('/amiibos/?action=last')
        .then(r => r.json())
        .then(json => setLastAmiibos(Array.isArray(json.data) ? json.data : []));
    }, []);

    useEffect(() => {
        apiFetch('/libros/?action=last')
        .then(r => r.json())
        .then(json => setLastLibros(Array.isArray(json.data) ? json.data : []));
    }, []);

    useEffect(() => {
        apiFetch('/accesorios/?action=last')
        .then(r => r.json())
        .then(json => setLastAccesorios(Array.isArray(json.data) ? json.data : []));
    }, []);



    const totalGames = plataformas.reduce((suma, item) => {

                                          return suma + item.total;

                                      }, 0);

    const totalValor = plataformas.reduce((suma, item) => {

                                          return suma + (item.totalprecio === null ? 0 : Number(item.totalprecio));

                                      }, 0);

  return (
    <>
    <div className="container">
        <Aside plataformas={plataformas}/>
        <main className='main'>
          <Header/>
          <div className='container-main'>
            <div className='list-info'>
                <div className='list-info-box'>
                  <p className='list-info-box-title'>Est. Collection Value</p>
                  <p className='list-info-box-value'>${totalValor.toLocaleString("es-CL")}</p>
                  <p className='list-info-box-aumento'><i className='material-icons'>trending_up</i>+12.5% this month</p>
                </div>
                <div className='list-info-box'>
                  <p className='list-info-box-title'>Total de jeugos</p>
                  <p className='list-info-box-value list-info-box-value--white'>{totalGames}</p>
                  <p className='list-info-box-aumento list-info-box-aumento--white'>48 added this week</p>
                </div>
                <div className='list-info-box'>
                  <p className='list-info-box-title'>Est. Collection Value</p>
                  <p className='list-info-box-value list-info-box-value--white'>$42,850.00</p>
                  <p className='list-info-box-aumento list-info-box-aumento--white'>48 added this week</p>
                </div>
                <Link to="/new-game/" className='list-info-box list-info-box--green'>
                  <span className="material-icons text-3xl mb-1">add_circle</span>
                  <p>Add New Game</p>
                </Link>
            </div>
            <div className='list-cards'>
              <h2 className='list-cards-title'>Ultimos Juegos <span></span></h2>
              <div className='list-cards-container'>

                {lastGame.map((game) => (
                  <CardGames dataGame={game} key={game.id}/>
                ))}
           
              </div>
            </div>
            <div className='list-cards'>
              <h2 className='list-cards-title'>Ultimas Consolas <span></span></h2>
              <div className='list-cards-container'>

                {lastConsolas.map((consola) => (
                  <Link to={`/consolas/detalle/${consola.id}/${consola.id_imagen}`} key={consola.id}>
                    <div className='list-cards-container-card'>
                      <span className='list-cards-container-card-region'>{consola.estado}</span>
                      <img alt="Consola" className="list-cards-container-card-img"  src={consola.archivo? `${API_URL}/imagenes/uploads/${consola.archivo}` : "/img/default-game-cover.png"}></img>
                      <div className='list-cards-container-card-body'>
                        <h3 className='list-cards-container-card-title'>{consola.nombre}</h3>
                        <p className='list-cards-container-card-plataform'>{consola.plataforma}</p>
                      </div>
                    </div> 
                  </Link>
                ))}
           
              </div>
            </div>
            <div className='list-cards'>
              <h2 className='list-cards-title'>Ultimos Amiibos <span></span></h2>
              <div className='list-cards-container'>

                {lastAmiibos.map((amiibo) => (
                  <Link to={`/amiibos/detalle/${amiibo.id}/${amiibo.id_imagen}`} key={amiibo.id}>
                    <div className='list-cards-container-card'>
                      <img alt="Amiibo" className="list-cards-container-card-img"  src={amiibo.portada? `${API_URL}/imagenes/uploads/${amiibo.portada}` : "/img/default-game-cover.png"}></img>
                      <div className='list-cards-container-card-body'>
                        <h3 className='list-cards-container-card-title'>{amiibo.titulo}</h3>
                        <p className='list-cards-container-card-plataform'>{amiibo.anio}</p>
                      </div>
                    </div> 
                  </Link>
                ))}
           
              </div>
            </div>
            <div className='list-cards'>
              <h2 className='list-cards-title'>Ultimos Libros <span></span></h2>
              <div className='list-cards-container'>
                {lastLibros.map((libro) => (
                  <Link to={`/libros/detalle/${libro.id}/${libro.id_imagen}`} key={libro.id}>
                    <div className='list-cards-container-card'>
                      <img alt="Libro Cover" className="list-cards-container-card-img" src={libro.portada ? `${API_URL}/imagenes/uploads/${libro.portada}` : "/img/default-game-cover.png"}></img>
                      <div className='list-cards-container-card-body'>
                        <h3 className='list-cards-container-card-title'>{libro.titulo}</h3>
                        <p className='list-cards-container-card-plataform'>{libro.autor}</p>
                      </div>
                    </div> 
                  </Link>
                ))}
              </div>
            </div>
            <div className='list-cards'>
              <h2 className='list-cards-title'>Ultimos Accesorios <span></span></h2>
              <div className='list-cards-container'>
                {lastAccesorios.map((accesorio) => (
                  <Link to={`/accesorios/detalle/${accesorio.id}/${accesorio.id_imagen}`} key={accesorio.id}>
                    <div className='list-cards-container-card'>
                      <img alt="Accesorio Cover" className="list-cards-container-card-img" src={accesorio.portada ? `${API_URL}/imagenes/uploads/${accesorio.portada}` : "/img/default-game-cover.png"}></img>
                      <div className='list-cards-container-card-body'>
                        <h3 className='list-cards-container-card-title'>{accesorio.nombre}</h3>
                        <p className='list-cards-container-card-plataform'>{accesorio.tipo}</p>
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