import './FormNewGame.scss'
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from '../../config/api'; 

export default function FormNewGame({ onSuccess, juegoEditar = null, imagenesEditar = [] }) {

    const [form, setForm] = useState({
        titulo: "",
        plataforma_id: "",
        valor: "",
        lanzamiento: "",
        manual: 0,
        caja: 0,
        cartucho: 0,
        estado: "",
        desarrollador: "",
        genero: "",
        region: "",
        publicador: ""
    });

    const estadoOptions = ["Nuevo", "Usado - Excelente", "Usado - Bueno", "Usado - Aceptable"];
    const [plataformas, setPlataformas] = useState([]);
    const [portada, setPortada] = useState(null);
    const [contraportada, setContraportada] = useState(null);
    const [galeria, setGaleria] = useState(null);

    const portadaInputRef = useRef(null);
    const contraportadaInputRef = useRef(null);
    const galeriaInputRef = useRef(null);

    const generosVideojuegos = [
        "Acción",
        "Acción-Aventura",
        "Aventura",
        "Arcade",
        "Battle Royale",
        "Beat 'em up",
        "Bullet Hell",
        "Carreras",
        "Casual",
        "Clicker",
        "Cooperativo",
        "Competitivo",
        "Deportes",
        "Educativo",
        "Estrategia",
        "Estrategia en Tiempo Real (RTS)",
        "Estrategia por Turnos (TBS)",
        "4X",
        "FPS",
        "Hack and Slash",
        "Idle / Incremental",
        "JRPG",
        "Lucha",
        "Metroidvania",
        "MOBA",
        "Mundo Abierto",
        "Musical / Ritmo",
        "Narrativo",
        "Party",
        "Plataformas",
        "Puzzle",
        "Roguelike",
        "Roguelite",
        "Rol (RPG)",
        "Sandbox",
        "Shooter",
        "Sigilo",
        "Simulación",
        "Survival Horror",
        "Terror",
        "Tower Defense",
        "TPS",
        "Visual Novel"
        ];

      

    /* 🔹 Cargar plataformas */
    useEffect(() => {
        fetch(`${API_URL}/games/plataformas.php`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            })
        .then(r => r.json())
        .then(setPlataformas);
    }, []);


    useEffect(() => {

        if (juegoEditar) {

            setForm({
                titulo: juegoEditar.titulo || "",
                plataforma_id: juegoEditar.plataforma_id || "",
                valor: juegoEditar.valor || "",
                lanzamiento: juegoEditar.lanzamiento || "",
                manual: juegoEditar.manual || 0,
                caja: juegoEditar.caja || 0,
                cartucho: juegoEditar.cartucho || 0,
                estado: juegoEditar.estado || "",
                desarrollador: juegoEditar.desarrollador || "",
                genero: juegoEditar.genero || "",
                region: juegoEditar.region || "",
                publicador: juegoEditar.publicador || ""
            });

             // Cargar imágenes si vienen del juego
            setPortada(imagenesEditar.filter(img => img.tipo === '0').at(-1) || null);
            setContraportada(imagenesEditar.filter(img => img.tipo === '1').at(-1) || null);
            setGaleria(imagenesEditar.filter(img => img.tipo === '4') || []);
    }
    }, [juegoEditar, imagenesEditar]);


      // 🖼 Funciones para drag & drop
    const handleDrop = (e, setImagen) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) setImagen(file);
    };

    const handleSelect = (e, setImagen) => {
        const file = e.target.files[0];
        if (file) setImagen(file);
    };


    const onSubmit = async (e) => {

    e.preventDefault();

    try {

         let juegoId = juegoEditar?.id_juego;
         let data = null;
     
         if (juegoEditar){

             const res = await fetch(`${API_URL}/games/${juegoEditar.id_juego}/`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            }
            );

            if (!res.ok) throw new Error("Error al editar el juego");

        }else{

            const res = await fetch(`${API_URL}/games/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            if (!res.ok) throw new Error("Error al crear el juego");

            data = await res.json();

            

        }

        juegoId = juegoEditar ? juegoEditar.id_imagen_games : data.id;
        
        
        if (portada) {




          // Luego enviar las imágenes si hay
            const fd = new FormData();
            fd.append("imagenes[]", portada);

            fd.append("juego_id", juegoId);
            fd.append("tipo", '0');

                const imgRes = await fetch(`${API_URL}/imagenes/`, {
                    method: "POST",
                    body: fd
                });

                if (!imgRes.ok) throw new Error("Error al subir imágenes");
        }


        if (contraportada) {

          // Luego enviar las imágenes si hay
            const fd = new FormData();
            fd.append("imagenes[]", contraportada);
            fd.append("juego_id", juegoId);
            fd.append("tipo", '1');

                const imgRes = await fetch(`${API_URL}/imagenes/`, {
                    method: "POST",
                    body: fd
                });

                if (!imgRes.ok) throw new Error("Error al subir imágenes");
        }





        
         if (galeria) {

          // Luego enviar las imágenes si hay
            const fd = new FormData();


            for (let img of galeria) {
                fd.append("imagenes[]", img);
            }

            fd.append("juego_id", juegoId);
            fd.append("tipo", '4');

                const imgRes = await fetch(`${API_URL}/imagenes/`, {
                    method: "POST",
                    body: fd
                });

                if (!imgRes.ok) throw new Error("Error al subir imágenes");
        }




  
      /* ✅ TODO OK */
      onSuccess();

    } catch (err) {
      console.error(err);
      alert(err.message);
    }
    };


  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value
    });
  };


  const getImageSrc = (img) => {

    if (!img) return null;

    // Imagen nueva (binaria)
    if (img instanceof File) {
        return URL.createObjectURL(img);
    }

    // Imagen existente (string)
    return `http://localhost:8080/api/imagenes/uploads/${img.archivo}`;
    };

return (
    <><form onSubmit={onSubmit}>
        <div className='game-form'>
            <h3 className='game-form-title'>{juegoEditar ? "Editar Juego" : "Agregar Nuevo juego"}</h3>
            <p className='game-form-subtitle'>Catalogue sus medios físicos o digitales con metadatos precisos y carátulas de alta resolución.</p>
            <div className="game-form-action-button">
                <button className='game-form-action-button-save' type="submit" ><span className="material-icons">save</span> {juegoEditar ? "Editar Juego" : "Nuevo Juego"}</button>
            </div> 
        </div>
        
        <div className='game-form-container'>
            <div className='game-form-data'>
                <div>

                    <div className='game-form-container-inputs'>
                        <h3 className='game-form-data-title game-form-100'><span className="material-icons">info</span> Core Specifications </h3>
                        <div className='game-form-100'>
                            <label className='game-form-label' htmlFor="titulo">Titulo</label>
                            <input className='game-form-input' type="text" id="titulo" name="titulo" placeholder='Ingrese el título del juego'
                            value={form.titulo}
                            onChange={onChange}
                            required
                            />
                        </div>
                        <div>
                            <label className='game-form-label' htmlFor="plataforma_id">Plataforma</label>
                            <select className="game-form-input" id="plataforma_id" name="plataforma_id"
                            value={form.plataforma_id}
                            onChange={onChange} 
                            required
                            >
                                 <option value="">Seleccionar Plataforma</option>
                                {plataformas.map(p => (
                                    <option key={p.id} value={p.id} selected={form.plataforma_id === p.id}>{p.nombre}</option>
                                ))} 
                            </select>
                        </div>
                        <div>
                            <label className='game-form-label' htmlFor="lanzamiento">Año Lanzamiento</label>
                            <input className='game-form-input' type="number" id="lanzamiento" name="lanzamiento"
                             value={form.lanzamiento}
                            onChange={onChange}
                            required
                            placeholder='1992' />
                        </div>
                        <div>
                            <label className='game-form-label' htmlFor="desarrollador">Desarrollador</label>
                            <input className='game-form-input' type="text" id="desarrollador" name="desarrollador" placeholder='Nintendo' 
                            value={form.desarrollador}
                            onChange={onChange}
                            />
                        </div>
                        <div>
                            <label className='game-form-label' htmlFor="publicador">Distribuidors</label>
                            <input className='game-form-input' type="text" id="publicador" name="publicador" placeholder='Nintendo' 
                            value={form.publicador}
                            onChange={onChange}
                            required
                            />
                        </div> 
                        <div>
                            <label className='game-form-label' htmlFor="genero">Genero</label>
                            
                             <select
                                className="game-form-input"
                                id="genero"
                                name="genero"
                                required
                                value={form.genero}
                                onChange={onChange}
                                required
                                >
                                <option value="">Seleccionar género</option>
                                {generosVideojuegos.map(genero => (
                                    <option key={genero} value={genero} selected={form.genero === genero}>
                                    {genero}
                                    </option>
                                ))}
                                </select>

                        </div>
                         <div>
                            <label className='game-form-label' htmlFor="estado">Estado</label>
                            <select className="game-form-input" id="estado" name="estado"
                            required
                            value={form.estado}
                            onChange={onChange}
                            >
                                 <option value="">Estado</option>
                                {estadoOptions.map((estado) => (
                                    <option key={estado} value={estado} selected={form.estado === estado}>{estado}</option>
                                ))}
                            </select>
                        </div>
                    </div>
 

                    <div className='game-form-container-inputs'>
                        <h3 className='game-form-data-title game-form-100'><span className="material-icons">list_alt</span>Inventory Status  </h3>
                        <div>
                            <label className='game-form-label' htmlFor="valor">Precio</label>
                            <input className='game-form-input' type="number" id="valor" name="valor" placeholder='$30.000' 
                            value={form.valor}
                            onChange={onChange}
                            />
                        </div>
                       

                        <div>
                            <label className='game-form-label' htmlFor="title">Región</label>
                            <div className='game-form-button-group'>
                                <label>
                            
                                    <input      
                                        className="game-form-radio" type="radio" name="region" value="NTSC-U"
                                        checked={form.region === "NTSC-U"}
                                        onChange={onChange}
                                    ></input>
                                    <span className="game-form-checkbox-group-button">NTSC-U</span>
                                </label>
                                <label>
                                     <input className="game-form-radio" type="radio" name="region" value="NTSC-J"
                                        checked={form.region === "NTSC-J"}
                                        onChange={onChange}
                                     ></input>
                                     <span className="game-form-checkbox-group-button">NTSC-J</span>
                                </label>
                                <label>
                                 <input className="game-form-radio" type="radio" name="region" value="PAL"
                                    checked={form.region === "PAL"}
                                        onChange={onChange}
                                 ></input>
                                 <span className="game-form-checkbox-group-button">PAL</span>
                                </label> 
                            </div>
                        </div>
                        <div className='game-form-100'>
                            <label className='game-form-label' htmlFor="title">Contenido</label>
                            <div className='game-form-checkbox-group'>
                                <label className='game-form-checkbox-group-label'>
                                    <div className='game-form-checkbox-group-item'>
                                        <input type="checkbox" name="manual" 
                                        checked={form.manual === 1}
                                        onChange={onChange}
                                         className='game-form-checkbox-group-input'/>
                                        <div className='game-form-checkbox-group-d-check'></div>
                                    </div>
                                    <span className='game-form-checkbox-group-text'>Manual</span>
                                </label>
                                 <label className='game-form-checkbox-group-label'>
                                    <div className='game-form-checkbox-group-item'>
                                        <input type="checkbox" name="caja" 
                                        checked={form.caja === 1}
                                        onChange={onChange}
                                         className='game-form-checkbox-group-input'/>
                                        <div className='game-form-checkbox-group-d-check'></div>
                                    </div>
                                    <span className='game-form-checkbox-group-text'>Caja</span>
                                </label>
                                 <label className='game-form-checkbox-group-label'>
                                    <div className='game-form-checkbox-group-item'>
                                        <input type="checkbox" name="cartucho" 
                                        checked={form.cartucho === 1}
                                        onChange={onChange}
                                         className='game-form-checkbox-group-input'/>
                                        <div className='game-form-checkbox-group-d-check'></div>
                                    </div>
                                    <span className='game-form-checkbox-group-text'>Cartucho/Disco</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='game-form-aside'>

                <div className='game-form-container-inputs game-form-aside--input'>

                    <h3 className='game-form-data-title game-form-100'><span className="material-icons">add_photo_alternate</span>Media Assets </h3>
                    
                    <div className='game-form-drop game-form-100 drop-area'
                        onDrop={(e)=>handleDrop(e,setPortada)} 
                        onDragOver={(e)=>e.preventDefault()}
                        onClick={()=>portadaInputRef.current.click()}
                    >
   
                        {portada && portada !== null ? (
                            <img src={getImageSrc(portada)} alt="portada" className="game-form-drop-image-prev" />
                        ) : (
                            <>
                                <div className='game-form-drop-icono'>
                                <i className='material-icons'>upload_file</i>
                           
                        </div>
                        <p className='game-form-drop-title'>Drag and drop box art</p>
                        <p className='game-form-drop-subtitle'>Supporting PNG, JPG, WEBP (Max 10MB)</p>
                            </>
                        )}
                        <input type="file" 
                            accept="image/*" 
                            multiple
                            ref={portadaInputRef} 
                            style={{display:'none'}}
                                onChange={(e)=>handleSelect(e,setPortada)}
                        />
                    </div>
                    <h4 className='game-form-data-title game-form-100 game-form-data-title--white'>Live Preview: Front Cover</h4>
                    
                    <div className='game-form-drop-image game-form-100 drop-area'
                        onDrop={(e)=>handleDrop(e,setContraportada)} 
                        onDragOver={(e)=>e.preventDefault()}
                        onClick={()=>contraportadaInputRef.current.click()}
                    >
                         {contraportada && contraportada !== null ? ( 
                            <img src={getImageSrc(contraportada)} alt="contraportada" className="game-form-drop-image-prev" />
                        ) : (
                           <>
                            <span className='material-icons game-form-drop-image-icono'>image</span>
                        <p className='game-form-drop-image-text'>Cover Art Missing</p>
                           </>
                        )}
                        <input type="file" accept="image/*"  multiple ref={contraportadaInputRef} style={{display:'none'}}
                            onChange={(e)=>handleSelect(e,setContraportada)}
                        />
                    </div>

                     <h4 className='game-form-data-title game-form-100 game-form-data-title--white'>Galeria</h4>
                    <div className='game-form-drop-image game-form-100 drop-area'
                        onDrop={(e)=>handleDrop(e,setGaleria)} 
                        onDragOver={(e)=>e.preventDefault()}
                        onClick={()=>galeriaInputRef.current.click()}
                    >

                       {galeria && galeria !== null && galeria.length > 0 ? (
                        <div className="game-form-drop-instagram">
                            {galeria.map((img, index) => (
                            <div key={index}>
                                <img
                                src={getImageSrc(img)}
                                alt={`galeria-${index}`}
                                className=""
                                />
                            </div>
                            ))}
                        </div>
                        ) : (
                        <>
                            <span className="material-icons game-form-drop-image-icono">image</span>
                            <p className="game-form-drop-image-text">Cover Art Missing</p>
                        </>
                        )}

                        <input type="file" accept="image/*" multiple ref={galeriaInputRef} style={{display:'none'}}
                            onChange={(e)=>setGaleria([...e.target.files])}
                        />
                    </div>
                </div>
            </div>
        </div>
        </form>
    </>
    
);

}