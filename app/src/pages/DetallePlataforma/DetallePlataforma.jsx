import { useState, useEffect } from "react";
import Header from '../../components/Header/Header'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import Aside from '../../components/Aside/Aside'
import CardGames from '../../components/Cards/CardGame';
import { useParams, Link } from "react-router-dom";
import { API_URL } from '../../config/api';

export default function DetallePlataforma() {
    
    const [juegos, setJuegos] = useState([]);
    const {id} = useParams();



    useEffect(() => {
        
        fetch(`${API_URL}/games/?action=all-plataforma&plataforma_id=`+id)
        .then(r => r.json())
        .then(setJuegos);

    }, [id]);

   console.log(juegos[0]);

    return (
        <>
            <div class="container">
                
                <main className='main'>
                    <Header/>
                    <div className='container-main'>
                    <Breadcrumb items={[    
                                            { label: "Plataformas", to: "/plataformas" },
                                            { label: juegos[0]?.plataforma, active: true },
                                        ]}/>
                    <div className='list-cards'>
                         <h3 className="detalle-juego-title"><span>{juegos[0]?.plataforma}</span>Total: {juegos.length}</h3>
                        <h2 className='list-cards-title'>Listado de Plataformas <span></span></h2>
                        <div className='list-cards-container'>
                            {juegos.map((game) => (
                                <CardGames dataGame={game} key={game.id}/>
                            ))}
                        </div>
                    </div>
                    </div>
                </main>
            </div>
        </>
    );


};