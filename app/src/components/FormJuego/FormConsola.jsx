import { API_URL } from '../../config/api';
import { useState, useEffect } from "react";
import './FormJuego.scss'

export default function FormConsola({ onSuccess, consolaEditar = null }) {

  const [plataformas, setPlataformas] = useState([]);
  const [imagenes, setImagenes] = useState([]);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);


  const [form, setForm] = useState({
    nombre: "",
    lanzamiento: "",
    plataforma_id: "",
    id_imagen: "",
    valor: ""
  });


    /* 🔹 Cargar plataformas */
  useEffect(() => {
    fetch(`${API_URL}/games/plataformas.php`)
      .then(r => r.json())
      .then(setPlataformas);
  }, []);



  /* 🔹 Si viene juego a editar, cargar datos */
  useEffect(() => {
    if (consolaEditar) {

      setForm({
        nombre: consolaEditar.nombre || "",
        lanzamiento: consolaEditar.lanzamiento || "",
        valor: consolaEditar.valor || "",
        plataforma_id: consolaEditar.plataforma_id || "",
        id_imagen: consolaEditar.id_imagen || ""
      });

    }
  }, [consolaEditar]);



  useEffect(() => {

    if (!consolaEditar) return;

    fetch(`${API_URL}/imagenes/?juego_id=${consolaEditar.id_imagen}`)
      .then(r => r.json())
      .then(setImagenesExistentes);

  }, [consolaEditar]);




const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    let consolaId = null;
    let id_imagen = null;

    try {


      /* 1️⃣ CREAR o EDITAR PLATAFORMA */
      if (consolaEditar) {
        // EDITAR

         let consolaId = consolaEditar.id;
         id_imagen = consolaEditar.id_imagen;

        const res = await fetch(
          `${API_URL}/consolas/${consolaId}/`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
          }
        );

        if (!res.ok) throw new Error("Error al editar el juego");
      } else {
        // CREAR
        const res = await fetch(`${API_URL}/consolas/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });

        if (!res.ok) throw new Error("Error al crear el juego");

        const data = await res.json();
        id_imagen = data.id;

      }


    if (imagenes.length > 0) {
        const fd = new FormData();
        
        
        fd.append("juego_id", id_imagen);
        for (let img of imagenes) {
          fd.append("imagenes[]", img);
        }

        const imgRes = await fetch(
          `${API_URL}/imagenes/`,
          {
            method: "POST",
            body: fd
          }
        );

        if (!imgRes.ok) throw new Error("Error al subir imágenes");
      }



      /* ✅ TODO OK */
      onSuccess();

    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <form onSubmit={onSubmit}>
    <div>
      <h2 className="form-title">{consolaEditar ? "Editar consola" : "Nueva consola"}</h2>
        <div className="form-group">
          <label className="form-group-label">
            <p>Consola:</p>
            <input
              name="nombre"
              placeholder="Ejemplo: Nintendo 64"
              required
              value={form.nombre}
              onChange={onChange}
            />
          </label>


           <label className="form-group-label">
            <p>Lanzamiento:</p>
            <input
              name="lanzamiento"
              placeholder="Ejemplo: 1996"
              required
              value={form.lanzamiento}
              onChange={onChange}
            />
          </label>


           <label className="form-group-label">
            <p>Valor:</p>
            <input
              name="valor"
              placeholder="30000"
              required
              value={form.valor}
              onChange={onChange}
            />
          </label>


        <label className="form-group-label">
            <p>Plataforma:</p>
            <select
              name="plataforma_id"
              className="form-select"
              required
              value={form.plataforma_id}
              onChange={onChange}
            >
              <option value="">Plataforma</option>
              {plataformas.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </label>


        <label className="form-group-label form-group-imagenes">
            <p>Imágenes:</p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImagenes([...e.target.files])}
          />
          </label>
    


              {imagenesExistentes.length > 0 && (
              <div className="form-group-imagenes">
                {imagenesExistentes.map(img => (
                  <img
                    key={img.id}
                    src={`${API_URL}/imagenes/uploads/${img.archivo}`}
                    alt=""
                    style={{
                      width: 100,
                      height: "auto",
                      objectFit: "cover",
                      borderRadius: 4,
                      border: "1px solid #ccc"
                    }}
                  />
                ))}
              </div>
            )}


        </div>


        <button type="submit">
          {consolaEditar ? "📝 Guardar cambios" : "💾 Agregar consola"}
        </button>
      </div>
    </form>
  );
}
