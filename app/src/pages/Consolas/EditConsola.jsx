import Header from '../../components/Header/Header'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import Aside from '../../components/Aside/Aside'
import FormNewConsola from '../../components/Forms/FormNewConsola'; 
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { API_URL, apiFetch } from '../../config/api';
 
export default function EditConsola() {


  const [consola, setConsola] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const { id, id_imagen } = useParams();

useEffect(() => {

      apiFetch(`${API_URL}/consolas/?id=${id}`)
            .then(r => r.json())
            .then((json) => {
                const data = json.data;
                setConsola(data);
                document.title = `Editar ${data.nombre}`;
            });


      apiFetch(`${API_URL}/imagenes/?juego_id=${id_imagen}&type=all`)
        .then(r => r.json())
        .then(setImagenes);

    
  }, [id, id_imagen]);


  return (
    <>
      <div className="container">
        <Aside/>
        <main className='main'>
          <Header/>
          <div className='container-main'>
            <FormNewConsola 
            consolaEditar={consola}
            imagenesEditar={imagenes}
            />
          </div>    
        </main>
      </div>
    </>
  );
}