import { useEffect, useState } from "react";
import Header from '../../components/Header/Header'
import Cards from '../../components/Cards/CardPaginator';
import Aside from '../../components/Aside/Aside'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import SearchFilters from '../../components/SearchFilters/SearchFilters';
import { API_URL } from '../../config/api';

export default function Consolas() {  
  const [plataformas, setPlataformas] = useState([]);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    document.title = 'Consolas';
    fetch(`${API_URL}/plataformas/`)
      .then(r => r.json())
      .then(setPlataformas);
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="container">
      <Aside plataformas={plataformas}/>
      <main className='main'>
        <Header/>
        <div className='container-main'>
          <Breadcrumb items={[{ label: "Consolas", active: true }]}/>
          
          <SearchFilters 
            onFilterChange={handleFilterChange}
            plataformas={plataformas}
          />

          <div className='list-cards'>
            <h2 className='list-cards-title'>Listado de Consolas <span></span></h2>
            <Cards 
              apiEndpoint={`${API_URL}/consolas/`} 
              onDelete={true}
              deleteEndpoint={`${API_URL}/consolas/`}
              filters={filters}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
