import { useEffect } from "react";
import Header from '../../components/Header/Header'
import Cards from '../../components/Cards/CardPaginator';
import Aside from '../../components/Aside/Aside'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { API_URL } from '../../config/api';

export default function Amiibos() {  
  useEffect(() => {
    document.title = 'Amiibos';
  }, []);

  return (
    <div className="container">
      <Aside/>
      <main className='main'>
        <Header/>
        <div className='container-main'>
          <Breadcrumb items={[{ label: "Amiibos", active: true }]}/>
          <div className='list-cards'>
            <h2 className='list-cards-title'>Listado de Amiibos <span></span></h2>
            <Cards 
              apiEndpoint={`${API_URL}/amiibos/`} 
              onDelete={true}
              deleteEndpoint={`${API_URL}/amiibos/`}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
