import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL, apiFetch } from '../../config/api';
import { validateRequired, validateMaxLength, validateNumeric, validateRange } from '../../config/validations';

export default function NewAccesorio() {
    const navigate = useNavigate();
    useEffect(() => {
        document.title = 'Nuevo Accesorio';
    }, []);
    const [form, setForm] = useState({
        nombre: "",
        tipo: "",
        plataforma: "",
        anio: new Date().getFullYear(),
        estado: "",
        precio: "",
        comentario: ""
    });
    const [errors, setErrors] = useState({});
    const [portada, setPortada] = useState(null);
    const [contraportada, setContraportada] = useState(null);
    const [masImagenes, setMasImagenes] = useState([]);
    const portadaInputRef = useRef(null);
    const contraportadaInputRef = useRef(null);

    const estadoOptions = ["Nuevo", "Usado - Excelente", "Usado - Bueno", "Usado - Aceptable"];
    const tipoOptions = ["Control", "Cargador", "Memoria", "Auriculares", "Estuche", "Otro"];
    const [plataformaOptions, setPlataformaOptions] = useState([]);

    useEffect(() => {
        apiFetch('/games/plataformas.php', {
            method: "GET",
        })
        .then(r => r.json())
        .then(json => setPlataformaOptions(json.data));
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

    const handleMultipleSelect = (e) => {
        const files = Array.from(e.target.files);
        setMasImagenes(prev => [...prev, ...files]);
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

        const nombreErr = validateRequired(form.nombre, 'Nombre') || validateMaxLength(form.nombre, 'Nombre', 255);
        if (nombreErr) newErrors.nombre = nombreErr;

        const tipoErr = validateMaxLength(form.tipo, 'Tipo', 100);
        if (tipoErr) newErrors.tipo = tipoErr;

        const anioErr = validateNumeric(form.anio, 'Año') || validateRange(form.anio, 'Año', 1900, 2099);
        if (anioErr) newErrors.anio = anioErr;

        const precioErr = validateNumeric(form.precio, 'Precio') || validateRange(form.precio, 'Precio', 0, 999999999);
        if (precioErr) newErrors.precio = precioErr;

        const comentarioErr = validateMaxLength(form.comentario, 'Comentario', 1000);
        if (comentarioErr) newErrors.comentario = comentarioErr;

        const plataformaErr = validateNumeric(form.plataforma, 'Plataforma');
        if (plataformaErr) newErrors.plataforma = plataformaErr;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const res = await apiFetch('/accesorios/', {
                method: "POST",
                body: JSON.stringify(form)
            });

            if (!res.ok) throw new Error("Error al crear el accesorio");

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
                fd.append("accesorio_id", data.id_imagen);
                fd.append("tipo", "1");

                await apiFetch('/imagenes/', {
                    method: "POST",
                    body: fd
                });
            }

            for (const img of masImagenes) {
                const fd = new FormData();
                fd.append("imagenes[]", img);
                fd.append("accesorio_id", data.id_imagen);
                fd.append("tipo", "2");

                await apiFetch('/imagenes/', {
                    method: "POST",
                    body: fd
                });
            }

            navigate("/accesorios/");
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
                    <h3 className="game-form-title">Agregar Nuevo Accesorio</h3>
                    <p className="game-form-subtitle">Catalogue sus accesorios de videojuegos.</p>
                    <div className="game-form-action-button">
                        <button className="game-form-action-button-save" type="submit">
                            <span className="material-icons">save</span> Guardar Accesorio
                        </button>
                    </div>
                </div>

                <div className="game-form-container">
                    <div className="game-form-data">
                        <div className="game-form-container-inputs">
                            <h3 className="game-form-data-title game-form-100">
                                <span className="material-icons">info</span> Información del Accesorio
                            </h3>
                            <div className="game-form-100">
                                <label className="game-form-label" htmlFor="nombre">Nombre</label>
                                <input
                                    className="game-form-input"
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    placeholder="Ingrese el nombre del accesorio"
                                    value={form.nombre}
                                    onChange={onChange}
                                    required
                                />
                                {errors.nombre && <span className="form-field-error">{errors.nombre}</span>}
                            </div>
                            <div>
                                <label className="game-form-label" htmlFor="tipo">Tipo</label>
                                <select
                                    className="game-form-input"
                                    id="tipo"
                                    name="tipo"
                                    value={form.tipo}
                                    onChange={onChange}
                                >
                                    <option value="">Seleccionar Tipo</option>
                                    {tipoOptions.map((tipo) => (
                                        <option key={tipo} value={tipo}>{tipo}</option>
                                    ))}
                                </select>
                                {errors.tipo && <span className="form-field-error">{errors.tipo}</span>}
                            </div>
                            <div>
                                <label className="game-form-label" htmlFor="plataforma">Plataforma</label>
                                <select
                                    className="game-form-input"
                                    id="plataforma"
                                    name="plataforma"
                                    value={form.plataforma}
                                    onChange={onChange}
                                >
                                    <option value="">Seleccionar Plataforma</option>
                                    {plataformaOptions.map((plat) => (
                                        <option key={plat.id} value={plat.id}>{plat.nombre}</option>
                                    ))}
                                </select>
                                {errors.plataforma && <span className="form-field-error">{errors.plataforma}</span>}
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
                                {errors.estado && <span className="form-field-error">{errors.estado}</span>}
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
                                    placeholder="Agregar un comentario sobre el accesorio..."
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
                                    <img src={getImageSrc(portada)} alt="accesorio" className="game-form-drop-image-prev" />
                                ) : (
                                    <>
                                        <div className="game-form-drop-icono">
                                            <i className="material-icons">upload_file</i>
                                        </div>
                                        <p className="game-form-drop-title">Drag and drop imagen</p>
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
                                    <img src={getImageSrc(contraportada)} alt="accesorio" className="game-form-drop-image-prev" />
                                ) : (
                                    <>
                                        <div className="game-form-drop-icono">
                                            <i className="material-icons">upload_file</i>
                                        </div>
                                        <p className="game-form-drop-title">Drag and drop imagen</p>
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

                            <h3 className="game-form-data-title game-form-100 game-form-data-title--white">
                                <span className="material-icons">add_photo_alternate</span>Más Imágenes
                            </h3>
                            <div className="game-form-drop game-form-100 drop-area">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleMultipleSelect}
                                    style={{ display: "none" }}
                                    id="mas-imagenes-accesorio"
                                />
                                <label htmlFor="mas-imagenes-accesorio" className="game-form-drop-label">
                                    <div className="game-form-drop-icono">
                                        <i className="material-icons">upload_file</i>
                                    </div>
                                    <p className="game-form-drop-title">Seleccionar múltiples imágenes</p>
                                    <p className="game-form-drop-subtitle">PNG, JPG, WEBP (Max 10MB)</p>
                                </label>
                            </div>
                            {masImagenes.length > 0 && (
                                <div className="gallery-preview">
                                    {masImagenes.map((img, idx) => (
                                        <div key={idx} className="gallery-preview-item">
                                            <img src={URL.createObjectURL(img)} alt="" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}