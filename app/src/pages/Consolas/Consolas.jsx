import { useEffect, useState } from "react";
import Header from '../../components/Header/Header'
import Cards from '../../components/Cards/CardPaginator';
import Aside from '../../components/Aside/Aside'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { API_URL } from '../../config/api';

export default function Consolas() {  
  useEffect(() => {
    document.title = 'Consolas';
  }, []);

  return (
    <div className="container">
      <Aside/>
      <main className='main'>
        <Header/>
        <div className='container-main'>
          <Breadcrumb items={[{ label: "Consolas", active: true }]}/>
          <div className='list-cards'>
            <h2 className='list-cards-title'>Listado de Consolas <span></span></h2>
            <Cards 
              apiEndpoint={`${API_URL}/consolas/`} 
              onDelete={true}
              deleteEndpoint={`${API_URL}/consolas/`}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
