import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL, apiFetch } from '../../config/api';

export default function EditAmiibo() {
    const navigate = useNavigate();
    const { id, id_imagen } = useParams();
    
    const [form, setForm] = useState({
        titulo: "",
        anio: "",
        estado: "",
        calificacion: "",
        precio: "",
        comentario: ""
    });
    const [portada, setPortada] = useState(null);
    const [contraportada, setContraportada] = useState(null);
    const [portadaActual, setPortadaActual] = useState(null);
    const [contraportadaActual, setContraportadaActual] = useState(null);
    const portadaInputRef = useRef(null);
    const contraportadaInputRef = useRef(null);

    const estadoOptions = ["Nuevo", "Usado - Excelente", "Usado - Bueno", "Usado - Aceptable"];
    const calificacionOptions = ["⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"];

    useEffect(() => {
        apiFetch(`${API_URL}/amiibos/?id=${id}`)
            .then(r => r.json())
            .then((json) => {
                const data = json.data;
                setForm({
                    titulo: data.titulo || "",
                    anio: data.anio || "",
                    estado: data.estado || "",
                    calificacion: data.calificacion || "",
                    precio: data.precio || "",
                    comentario: data.comentario || ""
                });
                document.title = `Editar ${data.titulo}`;
            });

        apiFetch(`${API_URL}/imagenes/?juego_id=${id_imagen}&type=all`)
            .then(r => r.json())
            .then((json) => {
                const data = json.data || [];
                setPortadaActual(data.find(img => img.tipo === "0"));
                setContraportadaActual(data.find(img => img.tipo === "1"));
            });
    }, [id, id_imagen]);

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
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await apiFetch(`${API_URL}/amiibos/${id}/`, {
                method: "PUT",
                body: JSON.stringify({ ...form, id_imagen })
            });

            if (!res.ok) throw new Error("Error al actualizar el amiibo");

            if (portada) {
                const fd = new FormData();
                fd.append("imagenes[]", portada);
                fd.append("amiibo_id", id_imagen);
                fd.append("tipo", "0");

                await apiFetch(`${API_URL}/imagenes/`, {
                    method: "POST",
                    body: fd
                });
            }

            if (contraportada) {
                const fd = new FormData();
                fd.append("imagenes[]", contraportada);
                fd.append("amiibo_id", id_imagen);
                fd.append("tipo", "1");

                await apiFetch(`${API_URL}/imagenes/`, {
                    method: "POST",
                    body: fd
                });
            }

            navigate(`/amiibos/detalle/${id}/${id_imagen}`);
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    const getImageSrc = (img) => {
        if (!img) return null;
        if (img instanceof File) {
            return URL.createObjectURL(img);
        }
        return `${API_URL}/imagenes/uploads/${img}`;
    };

    return (
        <div className="container">
            <form onSubmit={onSubmit}>
                <div className="game-form">
                    <h3 className="game-form-title">Editar Amiibo</h3>
                    <p className="game-form-subtitle">Edita la información del amiibo.</p>
                    <div className="game-form-action-button">
                        <button className="game-form-action-button-save" type="submit">
                            <span className="material-icons">save</span> Guardar Cambios
                        </button>
                    </div>
                </div>

                <div className="game-form-container">
                    <div className="game-form-data">
                        <div className="game-form-container-inputs">
                            <h3 className="game-form-data-title game-form-100">
                                <span className="material-icons">info</span> Información del Amiibo
                            </h3>
                            <div className="game-form-100">
                                <label className="game-form-label" htmlFor="titulo">Título</label>
                                <input
                                    className="game-form-input"
                                    type="text"
                                    id="titulo"
                                    name="titulo"
                                    placeholder="Ingrese el título del amiibo"
                                    value={form.titulo}
                                    onChange={onChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="game-form-label" htmlFor="anio">Año</label>
                                <input
                                    className="game-form-input"
                                    type="number"
                                    id="anio"
                                    name="anio"
                                    value={form.anio}
                                    onChange={onChange}
                                />
                            </div>
                            <div>
                                <label className="game-form-label" htmlFor="estado">Estado</label>
                                <select
                                    className="game-form-input"
                                    id="estado"
                                    name="estado"
                                    value={form.estado}
                                    onChange={onChange}
                                >
                                    <option value="">Seleccionar Estado</option>
                                    {estadoOptions.map((estado) => (
                                        <option key={estado} value={estado}>{estado}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="game-form-label" htmlFor="calificacion">Calificación</label>
                                <select
                                    className="game-form-input"
                                    id="calificacion"
                                    name="calificacion"
                                    value={form.calificacion}
                                    onChange={onChange}
                                >
                                    <option value="">Seleccionar Calificación</option>
                                    {calificacionOptions.map((cal) => (
                                        <option key={cal} value={cal}>{cal}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="game-form-label" htmlFor="precio">Precio</label>
                                <input
                                    className="game-form-input"
                                    type="number"
                                    id="precio"
                                    name="precio"
                                    placeholder="$30.000"
                                    value={form.precio}
                                    onChange={onChange}
                                />
                            </div>
                            <div className="game-form-100">
                                <label className="game-form-label" htmlFor="comentario">Comentario</label>
                                <textarea
                                    className="game-form-input"
                                    id="comentario"
                                    name="comentario"
                                    placeholder="Agregar un comentario sobre el amiibo..."
                                    value={form.comentario}
                                    onChange={onChange}
                                    rows="3"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="game-form-aside">
                        <div className="game-form-container-inputs game-form-aside--input">
                            <h3 className="game-form-data-title game-form-100">
                                <span className="material-icons">add_photo_alternate</span>Imagen Frontal
                            </h3>
                            <div
                                className="game-form-drop game-form-100 drop-area"
                                onDrop={(e) => handleDrop(e, setPortada)}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => portadaInputRef.current.click()}
                            >
                                {portada ? (
                                    <img src={getImageSrc(portada)} alt="amiibo" className="game-form-drop-image-prev" />
                                ) : portadaActual ? (
                                    <img src={`${API_URL}/imagenes/uploads/${portadaActual.archivo}`} alt="amiibo" className="game-form-drop-image-prev" />
                                ) : (
                                    <>
                                        <div className="game-form-drop-icono">
                                            <i className="material-icons">upload_file</i>
                                        </div>
                                        <p className="game-form-drop-title">Drag and drop imagen frontal</p>
                                        <p className="game-form-drop-subtitle">Supporting PNG, JPG, WEBP (Max 10MB)</p>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={portadaInputRef}
                                    style={{ display: "none" }}
                                    onChange={(e) => handleSelect(e, setPortada)}
                                />
                            </div>

                            <h3 className="game-form-data-title game-form-100 game-form-data-title--white">
                                <span className="material-icons">add_photo_alternate</span>Imagen Trasera
                            </h3>
                            <div
                                className="game-form-drop game-form-100 drop-area"
                                onDrop={(e) => handleDrop(e, setContraportada)}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => contraportadaInputRef.current.click()}
                            >
                                {contraportada ? (
                                    <img src={getImageSrc(contraportada)} alt="amiibo trasera" className="game-form-drop-image-prev" />
                                ) : contraportadaActual ? (
                                    <img src={`${API_URL}/imagenes/uploads/${contraportadaActual.archivo}`} alt="amiibo trasera" className="game-form-drop-image-prev" />
                                ) : (
                                    <>
                                        <div className="game-form-drop-icono">
                                            <i className="material-icons">upload_file</i>
                                        </div>
                                        <p className="game-form-drop-title">Drag and drop imagen trasera</p>
                                        <p className="game-form-drop-subtitle">Supporting PNG, JPG, WEBP (Max 10MB)</p>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={contraportadaInputRef}
                                    style={{ display: "none" }}
                                    onChange={(e) => handleSelect(e, setContraportada)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}