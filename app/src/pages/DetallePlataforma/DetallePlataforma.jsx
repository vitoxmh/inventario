import { useState, useEffect } from "react";
import Header from '../../components/Header/Header'
import Cards from '../../components/Cards/CardPaginator';
import Aside from '../../components/Aside/Aside'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { useParams } from "react-router-dom";
import { API_URL } from '../../config/api';

export default function DetallePlataforma() {
    const [plataforma, setPlataforma] = useState("");
    const [plataformas, setPlataformas] = useState([]);
    const {id} = useParams();

    useEffect(() => {
        fetch(`${API_URL}/plataformas/?id=${id}`)
            .then(r => r.json())
            .then((data) => {
                if (data && data.nombre) {
                    setPlataforma(data.nombre);
                    document.title = data.nombre;
                }
            });
    }, [id]);

    useEffect(() => {
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
                    <Breadcrumb items={[    
                        { label: "Plataformas", to: "/plataformas" },
                        { label: plataforma || "Cargando...", active: true },
                    ]}/>
                    <div className='list-cards'>
                        <h2 className='list-cards-title'>{plataforma} <span></span></h2>
                        <Cards 
                            apiEndpoint={`${API_URL}/games/?action=all-plataforma&plataforma_id=${id}`}
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
