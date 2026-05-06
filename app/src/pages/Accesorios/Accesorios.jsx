import { useEffect, useState } from "react";
import Header from '../../components/Header/Header'
import Cards from '../../components/Cards/CardPaginator';
import Aside from '../../components/Aside/Aside'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { API_URL } from '../../config/api';

export default function Accesorios() {  
  useEffect(() => {
    document.title = 'Accesorios';
  }, []);

  return (
    <div className="container">
      <Aside/>
      <main className='main'>
        <Header/>
        <div className='container-main'>
          <Breadcrumb items={[{ label: "Accesorios", active: true }]}/>
          <div className='list-cards'>
            <h2 className='list-cards-title'>Listado de Accesorios <span></span></h2>
            <Cards 
              apiEndpoint={`${API_URL}/accesorios/`} 
              type="accesorio"
              onDelete={true}
              deleteEndpoint={`${API_URL}/accesorios/`}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
