import './FormNewGame.scss'
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { API_URL, apiFetch } from '../../config/api';
import { validateRequired, validateMaxLength, validateNumeric, validateRange } from '../../config/validations';

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
        publicador: "",
        comentario: "",
        puntuacion: 0
    });

    const [errors, setErrors] = useState({});
    const estadoOptions = ["Nuevo", "Usado - Excelente", "Usado - Bueno", "Usado - Aceptable"];
    const [plataformas, setPlataformas] = useState([]);
    const [portada, setPortada] = useState(null);
    const [contraportada, setContraportada] = useState(null);
    const [galeria, setGaleria] = useState(null);
    const [poster, setPoster] = useState(null);
    const [logo, setLogo] = useState(null);

    const portadaInputRef = useRef(null);
    const contraportadaInputRef = useRef(null);
    const galeriaInputRef = useRef(null);
    const posterInputRef = useRef(null);
    const logoInputRef = useRef(null);

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
        "Compilación",
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
        apiFetch(`/games/plataformas.php`)
        .then(r => r.json())
        .then(json => setPlataformas(Array.isArray(json.data) ? json.data : []));
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
                publicador: juegoEditar.publicador || "",
                comentario: juegoEditar.comentario || "",
                puntuacion: juegoEditar.puntuacion || 0
            });

             // Cargar imágenes si vienen del juego
            setPortada(imagenesEditar.filter(img => img.tipo === '0').at(-1) || null);
            setContraportada(imagenesEditar.filter(img => img.tipo === '1').at(-1) || null);
            setGaleria(imagenesEditar.filter(img => img.tipo === '4') || []);
            setPoster(imagenesEditar.filter(img => img.tipo === '2').at(-1) || null);
            setLogo(imagenesEditar.filter(img => img.tipo === '3').at(-1) || null);
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

    const newErrors = {};

    const tituloErr = validateRequired(form.titulo, 'Título') || validateMaxLength(form.titulo, 255, 'Título');
    if (tituloErr) newErrors.titulo = tituloErr;

    const plataformaErr = validateRequired(form.plataforma_id, 'Plataforma');
    if (plataformaErr) newErrors.plataforma_id = plataformaErr;

    const lanzamientoErr = validateRequired(form.lanzamiento, 'Año de lanzamiento') || validateNumeric(form.lanzamiento, 'Año de lanzamiento') || validateRange(form.lanzamiento, 'Año de lanzamiento', 1900, 2099);
    if (lanzamientoErr) newErrors.lanzamiento = lanzamientoErr;

    const publicadorErr = validateRequired(form.publicador, 'Publicador') || validateMaxLength(form.publicador, 255, 'Publicador');
    if (publicadorErr) newErrors.publicador = publicadorErr;

    const generoErr = validateRequired(form.genero, 'Género') || validateMaxLength(form.genero, 100, 'Género');
    if (generoErr) newErrors.genero = generoErr;

    const estadoErr = validateRequired(form.estado, 'Estado');
    if (estadoErr) newErrors.estado = estadoErr;

    if (form.valor !== "" && form.valor !== undefined) {
        const valorErr = validateNumeric(form.valor, 'Valor') || validateRange(form.valor, 'Valor', 0, 999999999);
        if (valorErr) newErrors.valor = valorErr;
    }

    if (form.puntuacion !== undefined && form.puntuacion !== 0) {
        const puntuacionErr = validateRange(form.puntuacion, 'Puntuación', 0, 5);
        if (puntuacionErr) newErrors.puntuacion = puntuacionErr;
    }

    if (form.comentario !== "" && form.comentario !== undefined) {
        const comentarioErr = validateMaxLength(form.comentario, 1000, 'Comentario');
        if (comentarioErr) newErrors.comentario = comentarioErr;
    }

    if (form.desarrollador !== "" && form.desarrollador !== undefined) {
        const desarrolladorErr = validateMaxLength(form.desarrollador, 255, 'Desarrollador');
        if (desarrolladorErr) newErrors.desarrollador = desarrolladorErr;
    }

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    setErrors({});

    try {

         let juegoId = juegoEditar?.id_juego;
         let data = null;
     
         if (juegoEditar){

             const res = await apiFetch(`/games/${juegoEditar.id_juego}/`,
            {
                method: "PUT",
                body: JSON.stringify(form)
            }
            );

            if (!res.ok) throw new Error("Error al editar el juego");

        }else{

            const res = await apiFetch(`/games/`, {
                method: "POST",
                body: JSON.stringify(form)
            });

            if (!res.ok) throw new Error("Error al crear el juego");

            const json = await res.json();
            data = json.data;

            

        }

        juegoId = juegoEditar ? juegoEditar.id_imagen_games : data.id;
        
        
        if (portada && portada instanceof File) {

            // Luego enviar las imágenes si hay
            const fd = new FormData();
            fd.append("imagenes[]", portada);

            fd.append("juego_id", juegoId);
            fd.append("tipo", '0');

                const imgRes = await apiFetch(`/imagenes/`, {
                    method: "POST",
                    body: fd
                });

                if (!imgRes.ok) throw new Error("Error al subir imágenes");
        }


        if (contraportada && contraportada instanceof File) {

          // Luego enviar las imágenes si hay
            const fd = new FormData();
            fd.append("imagenes[]", contraportada);
            fd.append("juego_id", juegoId);
            fd.append("tipo", '1');

                const imgRes = await apiFetch(`/imagenes/`, {
                    method: "POST",
                    body: fd
                });

                if (!imgRes.ok) throw new Error("Error al subir imágenes");
        }





        
         if (galeria && galeria.length > 0) {

          // Luego enviar las imágenes si hay
            const fd = new FormData();


            for (let img of galeria) {
                if (img instanceof File) {
                    fd.append("imagenes[]", img);
                }
            }

            if (fd.has("imagenes[]")) {
                fd.append("juego_id", juegoId);
                fd.append("tipo", '4');

                const imgRes = await apiFetch(`/imagenes/`, {
                    method: "POST",
                    body: fd
                });

                if (!imgRes.ok) throw new Error("Error al subir imágenes");
            }
        }



        if (poster && poster instanceof File) {

            const fd = new FormData();
            fd.append("imagenes[]", poster);
            fd.append("juego_id", juegoId);
            fd.append("tipo", '2');

                const imgRes = await apiFetch(`/imagenes/`, {
                    method: "POST",
                    body: fd
                });

                if (!imgRes.ok) throw new Error("Error al subir imágenes");
        }

        if (logo && logo instanceof File) {

            const fd = new FormData();
            fd.append("imagenes[]", logo);
            fd.append("juego_id", juegoId);
            fd.append("tipo", '3');

                const imgRes = await apiFetch(`/imagenes/`, {
                    method: "POST",
                    body: fd
                });

                if (!imgRes.ok) throw new Error("Error al subir logo");
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
    if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
    }
  };


  const getImageSrc = (img) => {

    if (!img) return null;

    // Imagen nueva (binaria)
    if (img instanceof File) {
        return URL.createObjectURL(img);
    }

    // Imagen existente (string)
    return `${API_URL}/imagenes/uploads/${img.archivo}`;
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
                            {errors.titulo && <span className="form-field-error">{errors.titulo}</span>}
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
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))} 
                            </select>
                            {errors.plataforma_id && <span className="form-field-error">{errors.plataforma_id}</span>}
                        </div>
                        <div>
                            <label className='game-form-label' htmlFor="lanzamiento">Año Lanzamiento</label>
                            <input className='game-form-input' type="number" id="lanzamiento" name="lanzamiento"
                             value={form.lanzamiento}
                            onChange={onChange}
                            required
                            min="1900"
                            max="2099"
                            step="1"
                            placeholder='1992' />
                            {errors.lanzamiento && <span className="form-field-error">{errors.lanzamiento}</span>}
                        </div>
                        <div>
                            <label className='game-form-label' htmlFor="desarrollador">Desarrollador</label>
                            <input className='game-form-input' type="text" id="desarrollador" name="desarrollador" placeholder='Nintendo' 
                            value={form.desarrollador}
                            onChange={onChange}
                            />
                            {errors.desarrollador && <span className="form-field-error">{errors.desarrollador}</span>}
                        </div>
                        <div>
                            <label className='game-form-label' htmlFor="publicador">Distribuidors</label>
                            <input className='game-form-input' type="text" id="publicador" name="publicador" placeholder='Nintendo' 
                            value={form.publicador}
                            onChange={onChange}
                            required
                            />
                            {errors.publicador && <span className="form-field-error">{errors.publicador}</span>}
                        </div> 
                        <div>
                            <label className='game-form-label' htmlFor="genero">Genero</label>
                            
                             <select
                                className="game-form-input"
                                id="genero"
                                name="genero"
                                value={form.genero}
                                onChange={onChange}
                                required
                                >
                                <option value="">Seleccionar género</option>
                                {generosVideojuegos.map(genero => (
                                    <option key={genero} value={genero}>
                                    {genero}
                                    </option>
                                ))}
                                </select>
                                {errors.genero && <span className="form-field-error">{errors.genero}</span>}

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
                                    <option key={estado} value={estado}>{estado}</option>
                                ))}
                            </select>
                            {errors.estado && <span className="form-field-error">{errors.estado}</span>}
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
                            {errors.valor && <span className="form-field-error">{errors.valor}</span>}
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
                        <div className='game-form-100'>
                            <label className='game-form-label' htmlFor="comentario">Comentario</label>
                            <textarea 
                                className='game-form-input' 
                                id="comentario" 
                                name="comentario" 
                                placeholder='Agregar un comentario sobre el juego...'
                                value={form.comentario}
                                onChange={onChange}
                                rows="3"
                            />
                            {errors.comentario && <span className="form-field-error">{errors.comentario}</span>}
                        </div>
                        <div className='game-form-100'>
                            <label className='game-form-label'>Puntuación</label>
                            <div className='game-form-stars'>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`game-form-star-btn ${form.puntuacion >= star ? 'active' : ''}`}
                                        onClick={() => setForm({ ...form, puntuacion: star })}
                                    >
                                        <span className="material-icons">{form.puntuacion >= star ? 'star' : 'star_border'}</span>
                                    </button>
                                ))}
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

                    <h4 className='game-form-data-title game-form-100 game-form-data-title--white'>Poster / Background</h4>
                    <div className='game-form-drop-image game-form-100 drop-area'
                        onDrop={(e)=>handleDrop(e,setPoster)} 
                        onDragOver={(e)=>e.preventDefault()}
                        onClick={()=>posterInputRef.current.click()}
                    >

                        {poster && poster !== null ? (
                            <img src={getImageSrc(poster)} alt="poster" className="game-form-drop-image-prev" />
                        ) : (
                        <>
                            <span className="material-icons game-form-drop-image-icono">image</span>
                            <p className="game-form-drop-image-text">Poster Image</p>
                        </>
                        )}

                        <input type="file" accept="image/*" ref={posterInputRef} style={{display:'none'}}
                            onChange={(e)=>handleSelect(e,setPoster)}
                        />
                    </div>

                    <h4 className='game-form-data-title game-form-100 game-form-data-title--white'>Logo</h4>
                    <div className='game-form-drop-image game-form-100 drop-area'
                        onDrop={(e)=>handleDrop(e,setLogo)} 
                        onDragOver={(e)=>e.preventDefault()}
                        onClick={()=>logoInputRef.current.click()}
                    >

                        {logo && logo !== null ? (
                            <img src={getImageSrc(logo)} alt="logo" className="game-form-drop-image-prev" />
                        ) : (
                        <>
                            <span className="material-icons game-form-drop-image-icono">image</span>
                            <p className="game-form-drop-image-text">Logo Image</p>
                        </>
                        )}

                        <input type="file" accept="image/*" ref={logoInputRef} style={{display:'none'}}
                            onChange={(e)=>handleSelect(e,setLogo)}
                        />
                    </div>
                </div>
            </div>
        </div>
        </form>
    </>
    
);

}