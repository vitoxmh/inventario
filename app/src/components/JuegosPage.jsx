import { useState, useEffect } from "react";
import Modal from "../components/Modal/Modal";
import FormJuego from "../components/FormJuego/FormJuego";
import Tabla from "../components/Tabla/Tabla";
import { API_URL } from '../../config/api';

export default function JuegosPage() {

  const [modalAbierto, setModalAbierto] = useState(false);
  const [juegoEditar, setJuegoEditar] = useState(null);
  const [juegos, setJuegos] = useState([]);

  const cargarJuegos = () => {
    fetch(`${API_URL}/games/`)
      .then(r => r.json())
      .then(setJuegos);
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
           console.log("EDITAR:", juego); // 👈 DEBUG
          setJuegoEditar(juego);
          setModalAbierto(true);
        }}
        onDelete={(juego) => {
          if (window.confirm(`¿Eliminar el juego "${juego.titulo}"?`)) {
            fetch(`${API_URL}/games/${juego.id}/`, {
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
