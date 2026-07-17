import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Aside from '../../components/Aside/Aside'
import Header from '../../components/Header/Header';
import FormNewGame from '../../components/Forms/FormNewGame';
import { API_URL, apiFetch } from '../../config/api';
 
export default function EditarGame() {

    const { id, id_imagen } = useParams();
    const [juego, setJuego] = useState(null);
    const [imagenes, setImagenes] = useState([]);


useEffect(() => {
        // Juego
        apiFetch(`${API_URL}/games/?id=${id}`)
        .then(r => r.json())
        .then((json) => {
            const data = json.data;
            setJuego(data);
            document.title = `Editar ${data.titulo}`;
        });


            // Imágenes
    apiFetch(`${API_URL}/imagenes/?juego_id=${id_imagen}&type=all`)
    .then(r => r.json())
    .then(setImagenes);


}, [id]);



   

    if (!juego) return <p>Cargando...</p>;

     //console.log(imagenes);


    return (
        <>
        <div className="container">
            <Aside/>
            <main className='main'>
            <Header/>
            <div className='container-main'>
                <FormNewGame 

                juegoEditar={juego}
                imagenesEditar={imagenes}
                
                onSuccess={() => {
                alert("Juego creado con éxito");
                }}
                />
            </div>    
            </main>
        </div>
        </>
    );
}