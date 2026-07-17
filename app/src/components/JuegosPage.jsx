import { useState, useEffect } from "react";
import Modal from "../components/Modal/Modal";
import FormJuego from "../components/FormJuego/FormJuego";
import Tabla from "../components/Tabla/Tabla";
import { API_URL, apiFetch } from '../../config/api';

export default function JuegosPage() {

  const [modalAbierto, setModalAbierto] = useState(false);
  const [juegoEditar, setJuegoEditar] = useState(null);
  const [juegos, setJuegos] = useState([]);

  const cargarJuegos = () => {
    apiFetch(`/games/`)
      .then(r => r.json())
      .then(json => setJuegos(json.data || []));
  };

  useEffect(() => {
    cargarJuegos();
  }, []);

  return (
    <> 
      <button
        className="btn btn-success mb-3 mt-3"
        onClick={() => {
          setJuegoEditar(null);
          setModalAbierto(true);
        }}
      >
        <i className="bi bi-file-plus"></i> Agregar consola
      </button>

      <Tabla
        columnas={[
          { key: "titulo", label: "Titulo" },
          { key: "region", label: "Región" },
          { key: "plataforma", label: "Plataforma" },
          { key: "valor", label: "Valor (CLP)" }
        ]}
        datos={juegos}
        onEdit={(juego) => {
          setJuegoEditar(juego);
          setModalAbierto(true);
        }}
        onDelete={(juego) => {
          if (window.confirm(`¿Eliminar el juego "${juego.titulo}"?`)) {
            apiFetch(`/games/${juego.id}/`, {
              method: "DELETE"
            })
            .then(r => {
              if (r.ok) {
                cargarJuegos();
              } else {
                alert("Error al eliminar el juego.");
              }
            });
          }
        }}
      />

      <Modal
        abierto={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          setJuegoEditar(null);
        }}
      >
        <FormJuego
        juegoEditar={juegoEditar}
        onSuccess={() => {
          setModalAbierto(false);
          setJuegoEditar(null);
          cargarJuegos();
        }}
      />
      </Modal>
    </>
  );
}
