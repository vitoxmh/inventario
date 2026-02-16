import { useState, useEffect } from "react";
import Header from '../../components/Header/Header'
import Cards from '../../components/Cards/CardPaginator';
import Aside from '../../components/Aside/Aside'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { API_URL } from '../../config/api';

export default function Games() {  
    

  const [juegos, setJuegos] = useState([]);
  
  const cargarJuegos = () => {

    fetch(`${API_URL}/games/`)
    .then(r => r.json())
    .then(setJuegos);

  };
  
  useEffect(() => {

      cargarJuegos();

  }, []);
 
    return (
      <div className="container">
        <Aside/>
        <main className='main'>
          <Header/>
          <div className='container-main'>
            <Breadcrumb items={[{ label: "Plataformas", active: true }]}/>
            <div className='list-cards'>
              <h2 className='list-cards-title'>Listado de Plataformas <span></span></h2>

                <Cards datos={juegos} onEdit={() => {}} onDelete={() => {}} />

            </div>
          </div>
        </main>
      </div>
  );
}