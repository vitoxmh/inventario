import { API_URL, apiFetch } from '../../config/api';
import './FormNewGame.scss'
import { useState, useEffect, useRef } from "react"; 
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';

export default function FormNewConsola({consolaEditar = null, imagenesEditar = []}) {

    const [plataformas, setPlataformas] = useState([]);
    const portadaInputRef = useRef(null);
    const contraportadaInputRef = useRef(null);
    const galeriaInputRef = useRef(null);
    const [portada, setPortada] = useState(null);
    const [contraportada, setContraportada] = useState(null);
    const [galeria, setGaleria] = useState(null);
    const estadoOptions = ["Nuevo", "Usado - Excelente", "Usado - Bueno", "Usado - Aceptable"];

    const [form, setForm] = useState({
        nombre: "",
        plataforma_id: "",
        caja: "",
        manuales: "",
        carton: "",
        valor: "",
        comentario: "",
        otro: "",
        estado: "",
        type: "",
    });
 
    const typeConsola = [{id: 1, nombre: "Consola"}, {id: 2, nombre: "Accesorio"}, {id: 3, nombre: "Amiibo"}, {id: 4, nombre: "Figura"}, {id: 5, nombre: "Libro"}, {id: 6, nombre: "Otro"}];



    useEffect(() => {

        if (consolaEditar) {

            setForm({
                    nombre: consolaEditar.nombre || "",
                    plataforma_id: consolaEditar.plataforma_id || "",
                    caja: consolaEditar.caja || "",
                    manuales: consolaEditar.manuales || "",
                    carton: consolaEditar.carton || "",
                    valor: consolaEditar.valor || "",
                    comentario: consolaEditar.comentario || "",
                    otro: consolaEditar.otro || "",
                    estado: consolaEditar.estado || "",
                    type: consolaEditar.type || "",
            });

             // Cargar imágenes si vienen del juego
            setPortada(imagenesEditar.filter(img => img.tipo === '0').at(-1) || null);
            setContraportada(imagenesEditar.filter(img => img.tipo === '1').at(-1) || null);
            setGaleria(imagenesEditar.filter(img => img.tipo === '4') || []);
    }
    }, [consolaEditar, imagenesEditar]);


    useEffect(() => {
        apiFetch(`/games/plataformas.php`)
        .then(r => r.json())
        .then(json => setPlataformas(Array.isArray(json.data) ? json.data : []));
    }, []);



    const handleDrop = (e, setImagen) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) setImagen(file);
    };

    const handleSelect = (e, setImagen) => {
        const file = e.target.files[0];
        if (file) setImagen(file);
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
        return `${API_URL}/imagenes/uploads/${img.archivo}`;
    };


    const onSubmit = async (e) => {

        e.preventDefault();

        let consolaID = null;
        let data = null

        if(consolaEditar){


            const res = await apiFetch(`/consolas/${consolaEditar.id}/`, {
                method: "PUT",
                body: JSON.stringify(form)
            });


            if (!res.ok) throw new Error("Error al editar la consola");

            const json = await res.json();
            data = json.data;



        }else{

         const res = await apiFetch(`/consolas/`, {
                method: "POST",
                body: JSON.stringify(form)
            });

            if (!res.ok) throw new Error("Error al crear la consola");

            const json = await res.json();
            data = json.data;

           
        
        }


         consolaID = consolaEditar ? consolaEditar.id_imagen : data.id; 
        
        if (portada) {

          // Luego enviar las imágenes si hay
            const fd = new FormData();
            fd.append("imagenes[]", portada);

            fd.append("juego_id", consolaID);
            fd.append("tipo", '0');

                const imgRes = await apiFetch(`/imagenes/`, {
                    method: "POST",
                    body: fd
                });

                if (!imgRes.ok) throw new Error("Error al subir imágenes");
        }


        if (contraportada) {

          // Luego enviar las imágenes si hay
            const fd = new FormData();
            fd.append("imagenes[]", contraportada);
            fd.append("juego_id", consolaID);
            fd.append("tipo", '1');

                const imgRes = await apiFetch(`/imagenes/`, {
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

            fd.append("juego_id", consolaID);
            fd.append("tipo", '4');

                const imgRes = await apiFetch(`/imagenes/`, {
                    method: "POST",
                    body: fd
                });

                if (!imgRes.ok) throw new Error("Error al subir imágenes");
        }

    }

    return (
        <>
        <form onSubmit={onSubmit}>

            <Breadcrumb items={[    
                                                        { label: "Consolas", to: "/consolas" },
                                                        { label: "Nueva Consola", active: true },
                                                    ]}/>
            <div className='game-form'>
                <h3 className='game-form-title'>Nueva Consola</h3>
                <p className='game-form-subtitle'>Agrega una nueva consola.</p>
                 <div className="game-form-action-button">
                    <button className='game-form-action-button-save' type="submit" ><span className="material-icons">save</span> {consolaEditar ? "Editar Juego" : "Nuevo Juego"}</button>
                </div> 
            </div>
            <div className='game-form-container'>
                <div className='game-form-data'>
                    <div>
                        <div className='game-form-container-inputs'>
                            <h3 className='game-form-data-title game-form-100'><span className="material-icons">info</span> Especificaciones </h3>
                            <div className='game-form-100'>
                                <label className='game-form-label' htmlFor="nombre">Nombre</label>
                                <input className='game-form-input' type="text" id="nombre" name="nombre" placeholder='Ingrese el nombre de la consola'
                                value={form.nombre}
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
                                <label className='game-form-label' htmlFor="type">Tipo</label>
                                <select className="game-form-input" id="type" name="type"
                                value={form.type}
                                onChange={onChange} 
                                required
                                >
                                    <option value="">Seleccionar Type</option>
                                    {typeConsola.map(p => (
                                        <option key={p.id} value={p.id} selected={form.type === p.id}>{p.nombre}</option>
                                    ))} 
                                </select>
                            </div>
                            <div className='game-form-100'>
                                <label className='game-form-label' htmlFor="title">Contenido</label>
                                <div className='game-form-checkbox-group'>
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
                                            <input type="checkbox" name="manuales" 
                                            checked={form.manuales === 1}
                                            onChange={onChange}
                                            className='game-form-checkbox-group-input'/>
                                            <div className='game-form-checkbox-group-d-check'></div>
                                        </div>
                                        <span className='game-form-checkbox-group-text'>Manuales</span>
                                    </label>
                                    <label className='game-form-checkbox-group-label'>
                                        <div className='game-form-checkbox-group-item'>
                                            <input type="checkbox" name="carton" 
                                            checked={form.carton === 1}
                                            onChange={onChange}
                                            className='game-form-checkbox-group-input'/>
                                            <div className='game-form-checkbox-group-d-check'></div>
                                        </div>
                                        <span className='game-form-checkbox-group-text'>Carton</span>
                                    </label>
                                </div>
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
                             <div>
                                <label className='game-form-label' htmlFor="valor">Valor</label>
                                <input className='game-form-input' type="text" id="valor" name="valor" placeholder='$100.000' 
                                value={form.valor}
                                onChange={onChange}
                                required
                                />
                            </div>
                        </div>
                        <div className='game-form-container-inputs'>
                            <h3 className='game-form-data-title game-form-100'><span className="material-icons">info</span> Comentarios </h3>
                            <div className='game-form-100'>
                                <label className='game-form-label' htmlFor="comentario">Comentario</label>
                                <textarea className='game-form-input' id="comentario" name="comentario" placeholder='Comentarios adicionales...'
                                value={form.comentario}
                                onChange={onChange}
                        
                                />
                            </div> 
                            <div className='game-form-100'>
                                <label className='game-form-label' htmlFor="otro">Otro</label>
                                 <textarea className='game-form-input' type="text" id="otro" name="otro" placeholder='Otros detalles...' 
                                value={form.otro}
                                onChange={onChange}
                           
                                />
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
        </>)
    
    ;
}