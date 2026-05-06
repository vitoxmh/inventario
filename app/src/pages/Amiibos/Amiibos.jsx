import { useEffect } from "react";
import Header from '../../components/Header/Header'
import Cards from '../../components/Cards/CardPaginator';
import Aside from '../../components/Aside/Aside'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { API_URL } from '../../config/api';

export default function AmiibosYFiguras() {  
  useEffect(() => {
    document.title = 'Amiibos y Figuras';
  }, []);

  return (
    <div className="container">
      <Aside/>
      <main className='main'>
        <Header/>
        <div className='container-main'>
          <Breadcrumb items={[{ label: "Amiibos y Figuras", active: true }]}/>
          <div className='list-cards'>
            <h2 className='list-cards-title'>Listado de Amiibos y Figuras <span></span></h2>
            <Cards 
              apiEndpoint={`${API_URL}/amiibos/`} 
              type="amiibo"
              onDelete={true}
              deleteEndpoint={`${API_URL}/amiibos/`}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
