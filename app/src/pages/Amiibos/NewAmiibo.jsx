import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL, apiFetch } from '../../config/api';
import { validateRequired, validateMaxLength, validateNumeric, validateRange } from '../../config/validations';

export default function NewAmiiboYFigura() {
    const navigate = useNavigate();
    useEffect(() => {
        document.title = 'Nuevo Amiibo / Figura';
    }, []);
    const [form, setForm] = useState({
        titulo: "",
        anio: new Date().getFullYear(),
        estado: "",
        calificacion: "",
        precio: "",
        comentario: ""
    });
    const [errors, setErrors] = useState({});
    const [portada, setPortada] = useState(null);
    const [contraportada, setContraportada] = useState(null);
    const portadaInputRef = useRef(null);
    const contraportadaInputRef = useRef(null);

    const estadoOptions = ["Nuevo", "Usado - Excelente", "Usado - Bueno", "Usado - Aceptable"];
    const calificacionOptions = ["⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"];

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
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        const tituloError = validateRequired(form.titulo) || validateMaxLength(form.titulo, 255);
        if (tituloError) newErrors.titulo = tituloError;
        if (form.anio) {
            const anioError = validateNumeric(form.anio, 'Año') || validateRange(form.anio, 'Año', 1900, 2099);
            if (anioError) newErrors.anio = anioError;
        }
        if (form.precio) {
            const precioError = validateNumeric(form.precio, 'Precio') || validateRange(form.precio, 'Precio', 0, 999999999);
            if (precioError) newErrors.precio = precioError;
        }
        if (form.comentario) {
            const comentarioError = validateMaxLength(form.comentario, 1000);
            if (comentarioError) newErrors.comentario = comentarioError;
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const res = await apiFetch('/amiibos/', {
                method: "POST",
                body: JSON.stringify(form)
            });

            if (!res.ok) throw new Error("Error al crear el amiibo/figura");
            
            const json = await res.json();
            const data = json.data;

            if (portada) {
                const fd = new FormData();
                fd.append("imagenes[]", portada);
                fd.append("juego_id", data.id_imagen);
                fd.append("tipo", "0");

                const imgRes = await apiFetch('/imagenes/', {
                    method: "POST",
                    body: fd
                });

                if (!imgRes.ok) {
                    console.error("Error uploading portada:", await imgRes.text());
                }
            }

            if (contraportada) {
                const fd = new FormData();
                fd.append("imagenes[]", contraportada);
                fd.append("juego_id", data.id_imagen);
                fd.append("tipo", "1");

                const imgRes = await apiFetch('/imagenes/', {
                    method: "POST",
                    body: fd
                });

                if (!imgRes.ok) {
                    console.error("Error uploading contraportada:", await imgRes.text());
                }
            }

            navigate("/amiibos/");
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
                    <h3 className="game-form-title">Agregar Nuevo Amiibo / Figura</h3>
                    <p className="game-form-subtitle">Cataloga tus amiibos y figuras coleccionables.</p>
                    <div className="game-form-action-button">
                        <button className="game-form-action-button-save" type="submit">
                            <span className="material-icons">save</span> Guardar
                        </button>
                    </div>
                </div>

                <div className="game-form-container">
                    <div className="game-form-data">
                        <div className="game-form-100">
                            <h3 className="game-form-data-title game-form-100">
                                <span className="material-icons">info</span> Información del Amiibo / Figura
                            </h3>
                            <div className="game-form-100">
                                <label className="game-form-label" htmlFor="titulo">Título</label>
                                <input
                                    className="game-form-input"
                                    type="text"
                                    id="titulo"
                                    name="titulo"
                                    placeholder="Ingresa el título"
                                    value={form.titulo}
                                    onChange={onChange}
                                    required
                                />
                                {errors.titulo && <span className="form-field-error">{errors.titulo}</span>}
                            </div>
                            <div>
                                <label className="game-form-label" htmlFor="anio">Año</label>
                                <input
                                    className="game-form-input"
                                    type="number"
                                    id="anio"
                                    name="anio"
                                    min="1900"
                                    max="2099"
                                    step="1"
                                    value={form.anio}
                                    onChange={onChange}
                                />
                                {errors.anio && <span className="form-field-error">{errors.anio}</span>}
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
                                {errors.precio && <span className="form-field-error">{errors.precio}</span>}
                            </div>
                            <div className="game-form-100">
                                <label className="game-form-label" htmlFor="comentario">Comentario</label>
                                <textarea
                                    className="game-form-input"
                                    id="comentario"
                                    name="comentario"
                                    placeholder="Agrega un comentario..."
                                    value={form.comentario}
                                    onChange={onChange}
                                    rows="3"
                                />
                                {errors.comentario && <span className="form-field-error">{errors.comentario}</span>}
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
                                ) : (
                                    <>
                                        <div className="game-form-drop-icono">
                                            <i className="material-icons">upload_file</i>
                                        </div>
                                        <p className="game-form-drop-title">Arrastra y suelta imagen frontal</p>
                                        <p className="game-form-drop-subtitle">Soporta PNG, JPG, WEBP (Max 10MB)</p>
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
                                ) : (
                                    <>
                                        <div className="game-form-drop-icono">
                                            <i className="material-icons">upload_file</i>
                                        </div>
                                        <p className="game-form-drop-title">Arrastra y suelta imagen trasera</p>
                                        <p className="game-form-drop-subtitle">Soporta PNG, JPG, WEBP (Max 10MB)</p>
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
