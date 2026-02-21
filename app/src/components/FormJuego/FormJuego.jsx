import { useState, useEffect } from "react";
import './FormJuego.scss'

export default function FormJuego({ onSuccess, juegoEditar = null }) {
  const [form, setForm] = useState({
    titulo: "",
    plataforma_id: "",
    id_imagen: "",
    region: "",
    formato: "",
    estado: "",
    valor: "",
    cartucho: 0,
    manual: 0,
    caja: 0
  });


  const regionOptions = ["NTSC-U", "NTSC-J", "PAL", "NTSC-C"];
  const formatoOptions = ["Físico", "Digital"];
  const estadoOptions = ["Nuevo", "Usado - Excelente", "Usado - Bueno", "Usado - Aceptable"];

  const [imagenes, setImagenes] = useState([]);
  const [plataformas, setPlataformas] = useState([]);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);


  /* 🔹 Cargar plataformas */
  useEffect(() => {
    fetch("http://localhost:8080/api/games/plataformas.php")
      .then(r => r.json())
      .then(setPlataformas);
  }, []);

  /* 🔹 Si viene juego a editar, cargar datos */
  useEffect(() => {
    if (juegoEditar) {

     
      setForm({
        titulo: juegoEditar.titulo || "",
        plataforma_id: juegoEditar.plataforma_id || "",
        id_imagen: juegoEditar.id_imagen || "",
        region: juegoEditar.region || "",
        formato: juegoEditar.formato || "",
        estado: juegoEditar.estado || "",
        valor: juegoEditar.valor || "",
        cartucho: juegoEditar.cartucho || 0,
        manual: juegoEditar.manual || 0,
        caja: juegoEditar.caja || 0
      });
    }
  }, [juegoEditar]);


  useEffect(() => {
  if (!juegoEditar) return;

  fetch(`http://localhost:8080/api/imagenes/?juego_id=${juegoEditar.id_imagen}`)
    .then(r => r.json())
    .then(setImagenesExistentes);
}, [juegoEditar]);

const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      let juegoId = juegoEditar?.id;

      /* 1️⃣ CREAR o EDITAR JUEGO */
      if (juegoEditar) {
        // EDITAR
        const res = await fetch(
          `http://localhost:8080/api/games/${juegoEditar.id}/`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
          }
        );

        if (!res.ok) throw new Error("Error al editar el juego");

      } else {
        // CREAR
        const res = await fetch("http://localhost:8080/api/games/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });

        if (!res.ok) throw new Error("Error al crear el juego");

        const data = await res.json();
      
        juegoId = data.id;

        

      /* 2️⃣ SUBIR IMÁGENES (nuevas) */
      if (imagenes.length > 0) {
        const fd = new FormData();
        
        
        fd.append("juego_id", juegoId);

        for (let img of imagenes) {
          fd.append("imagenes[]", img);
        }

        const imgRes = await fetch(
          "http://localhost:8080/api/imagenes/",
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
      <h2 className="form-title">{juegoEditar ? "Editar juego" : "Nuevo juego"}</h2>
        <div className="form-group">
          <label className="form-group-label">
            <p>Titulo:</p>
            <input
              name="titulo"
              placeholder="Título"
              required
              value={form.titulo}
              onChange={onChange}
            />
          </label>

          <label className="form-group-label">
            <p>Plataforma:</p>
            <select
              name="plataforma_id"
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

          <label className="form-group-label">
            <p>Región:</p>
            <select
              name="region"
              required
              value={form.region}
              onChange={onChange}
            > 
              <option value="">Región</option>
              {regionOptions.map((region) => (
                <option key={region} value={region} selected={form.region === region}>{region}</option>
              ))}
            </select> 

          </label>

          <label className="form-group-label">
            <p>Formato:</p>
            <select
              name="formato"
              required
              value={form.formato}
              onChange={onChange}
            > 
              <option value="">Formato</option>
              {formatoOptions.map((formato) => (
                <option key={formato} value={formato} selected={form.formato === formato}>{formato}</option>
              ))}
            </select>

          </label>
          
          <label className="form-group-label">
            <p>Estado:</p>
            <select
              name="estado"
              required
              value={form.estado}
              onChange={onChange}
            > 
              <option value="">Estado</option>
              {estadoOptions.map((estado) => (
                <option key={estado} value={estado} selected={form.estado === estado}>{estado}</option>
              ))}
            </select>
           
          </label>

          <label className="form-group-label">
            <p>Valor:</p>
            <input
              name="valor"
              type="number"
            placeholder="Valor"
            value={form.valor}
            onChange={onChange}
          />
          </label>
          <hr className="form-group-hr" />
          
          <div className="form-group-checkboxes">

          <p className="form-group-checkboxes-text"><strong>Incluye:</strong> </p>
          <div  className="form-group-checkboxes-list">
            <div className="form-check form-switch">
              <label className="form-check-label" for="switchCheckDefault">Cartucho:</label>
                <input className="form-check-input" 
                type="checkbox" 
                role="switch"
                name="cartucho"
                checked={form.cartucho === 1}
                onChange={(e) =>
                    setForm({ ...form, cartucho: e.target.checked ? 1 : 0 })
                } 
              />
                
            </div> 


            <div className="form-check form-switch">
                <input className="form-check-input" 
                type="checkbox" 
                role="switch"
                name="manual"
                checked={form.manual === 1}
                onChange={(e) =>
                    setForm({ ...form, manual: e.target.checked ? 1 : 0 })
                } 
              />
                <label className="form-check-label" for="switchCheckDefault">Manual:</label>
            </div>


            <div className="form-check form-switch">
                <input className="form-check-input" 
                type="checkbox" 
                role="switch"
                name="caja"
                checked={form.caja === 1}
                onChange={(e) =>
                    setForm({ ...form, caja: e.target.checked ? 1 : 0 })
                } 
              />
                <label className="form-check-label" for="switchCheckDefault">Caja:</label>
            </div>
          </div>


          </div>

          <hr className="form-group-hr" />

          <p>
            {juegoEditar
              ? "Agregar nuevas imágenes"
              : "Imágenes del juego"}
          </p>
          <label className="form-group-label">
            <p>Imágenes:</p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImagenes([...e.target.files])}
          />
          </label>
    
          {imagenesExistentes.length > 0 && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {imagenesExistentes.map(img => (
                  <img
                    key={img.id}
                    src={`http://localhost:8080/api/imagenes/uploads/${img.archivo}`}
                    alt=""
                    style={{
                      width: 120,
                      height: 120,
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
          {juegoEditar ? "📝 Guardar cambios" : "💾 Agregar juego"}
        </button>
      </div>
    </form>
  );
}
