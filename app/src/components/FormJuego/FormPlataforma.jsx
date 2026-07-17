import { API_URL, apiFetch } from '../../config/api';
import { useState, useEffect } from "react";
import './FormJuego.scss'

export default function FormPlataforma({ onSuccess, plataformaEditar = null }) {

  const [form, setForm] = useState({
    nombre: "",
    fabricante: "",
    id_imagen: ""
  });


  const [imagenes, setImagenes] = useState([]);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);


  const fabricantes = [
    {
      id: 1,
      nombre: "Nintendo"
    },
    {
      id: 2,
      nombre: "Sony"
    },
    {
      id: 3,
      nombre: "Sega"
    },
    {
      id: 4,
      nombre: "Microsoft"
    },
    {
      id: 5,
      nombre: "Atari"
    },
    {
      id: 6,
      nombre: "SNK"
    }
  ];

  

  /* 🔹 Si viene juego a editar, cargar datos */
  useEffect(() => {
    if (plataformaEditar) {
      setForm({
        nombre: plataformaEditar.nombre || "",
        fabricante: plataformaEditar.fabricante || "",
        id_imagen: plataformaEditar.id_imagen || ""
      });
    }
  }, [plataformaEditar]);



    useEffect(() => {

      if (!plataformaEditar) return;

      apiFetch(`/imagenes/?juego_id=${plataformaEditar.id_imagen}`)
        .then(r => r.json())
        .then(setImagenesExistentes);

    }, [plataformaEditar]);




const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    let plataformaId = null;
    let id_imagen = null;

    try {


      /* 1️⃣ CREAR o EDITAR PLATAFORMA */
      if (plataformaEditar) {
        // EDITAR

        let plataformaId = plataformaEditar.id;
        id_imagen = plataformaEditar.id_imagen;


        const res = await apiFetch(
          `/plataformas/${plataformaId}/`,
          {
            method: "PUT",
            body: JSON.stringify(form)
          }
        );

        if (!res.ok) throw new Error("Error al editar el juego");
      } else {
        // CREAR
        const res = await apiFetch("/plataformas/", {
          method: "POST",
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

        const imgRes = await apiFetch(
          "/imagenes/",
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
      <h2 className="form-title">{plataformaEditar ? "Editar plataforma" : "Nueva plataforma"}</h2>
        <div className="form-group">
          <label className="form-group-label">
            <p>Titulo:</p>
            <input
              name="nombre"
              placeholder="Ejemplo: Nintendo 64"
              required
              value={form.nombre}
              onChange={onChange}
            />
          </label>

          <label className="form-group-label">
            <p>Fabricante:</p>
            <select  name="fabricante" value={form.fabricante} onChange={onChange} >
              <option value="" disabled>Seleccione un fabricante</option>
              {fabricantes.map((fabricante) => (
                <option key={fabricante.id} value={fabricante.nombre} selected={form.fabricante === fabricante.nombre}>
                  {fabricante.nombre}
                </option>
              ))}
            </select>
          </label>
          
           <label className="form-group-label form-group-imagenes mb-3">
            <p>Imágenes:</p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImagenes([...e.target.files])}
          />
          </label>
    


              {imagenesExistentes.length > 0 && (
              <div className="form-group-imagenes mb-3">
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


        <button type="submit" className="btn btn-primary">
          {plataformaEditar ? (<><i className='bi bi-floppy'></i> Guardar cambios</>) : (<><i className='bi bi-floppy'></i> Agregar plataforma</>)}
        </button>
      </div>
    </form>
  );
}
