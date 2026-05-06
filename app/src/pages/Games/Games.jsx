import { useEffect, useState } from "react";
import Header from '../../components/Header/Header'
import Cards from '../../components/Cards/CardPaginator';
import Aside from '../../components/Aside/Aside'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { API_URL } from '../../config/api';

export default function Games() {  
  const [plataformas, setPlataformas] = useState([]);

  useEffect(() => {
    document.title = 'Juegos';
    fetch(`${API_URL}/plataformas/`)
      .then(r => r.json())
      .then(setPlataformas);
  }, []);

  return (
    <div className="container">
      <Aside plataformas={plataformas}/>
      <main className='main'>
        <Header/>
        <div className='container-main'>
          <Breadcrumb items={[{ label: "Juegos", active: true }]}/>
          <div className='list-cards'>
            <h2 className='list-cards-title'>Listado de Juegos <span></span></h2>
            <Cards 
              apiEndpoint={`${API_URL}/games/`} 
              type="juego"
              onDelete={true}
              deleteEndpoint={`${API_URL}/games/`}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
