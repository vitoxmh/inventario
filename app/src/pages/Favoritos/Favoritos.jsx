import { useEffect, useState } from "react";
import Header from '../../components/Header/Header'
import Cards from '../../components/Cards/CardPaginator';
import Aside from '../../components/Aside/Aside'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { API_URL, apiFetch } from '../../config/api';

export default function Favoritos() {  
  const [plataformas, setPlataformas] = useState([]);

  useEffect(() => {
    document.title = 'Juegos Favoritos';
    apiFetch(`/plataformas/`)
      .then(r => r.json())
      .then(json => setPlataformas(Array.isArray(json.data) ? json.data : []));
  }, []);

  return (
    <div className="container">
      <Aside plataformas={plataformas}/>
      <main className='main'>
        <Header/>
        <div className='container-main'>
          <Breadcrumb items={[{ label: "Favoritos", active: true }]}/>
          <div className='list-cards'>
            <h2 className='list-cards-title'>Juegos Favoritos <span></span></h2>
            <Cards 
              apiEndpoint={`${API_URL}/games/?favorito=1`} 
              type="juego"
              onDelete={false}
              deleteEndpoint={`${API_URL}/games/`}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
