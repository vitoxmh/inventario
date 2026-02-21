import Aside from '../../components/Aside/Aside'
import { API_URL } from '../../config/api';
import Header from '../../components/Header/Header';
import CardGames from '../../components/Cards/CardGame';
import { Link } from "react-router-dom";
import { useState, useEffect} from "react";
import './Home.scss'

export default function Home() {

    const [plataformas, setPlataformas] = useState([]);
    const [lastGame, setLastGame] = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/plataformas/?action=countPlataformas`)
        .then(r => r.json())
        .then(setPlataformas);
    }, []);



     useEffect(() => {
        fetch(`${API_URL}/games/?action=last`)
        .then(r => r.json())
        .then(setLastGame);
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
              <h2 className='list-cards-title'>Current Spotlight <span></span></h2>
              <div className='list-cards-container'>

                {lastGame.map((game) => (
                  <CardGames dataGame={game} key={game.id}/>
                ))}
           
              </div>
            </div>
          </div>    
        </main>
      </div>
      </>
  );
}