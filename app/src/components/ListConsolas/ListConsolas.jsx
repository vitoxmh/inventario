import { useState, useEffect } from "react";
import Modal from "../Modal/Modal";
import FormConsola from "../FormJuego/FormConsola";
import Tabla from "../Tabla/Tabla";
import { API_URL, apiFetch } from '../../config/api';

export default function ListConsolas() {

  const [modalAbierto, setModalAbierto] = useState(false);
  const [consolaEditar, setConsolaEditar] = useState(null);
  const [consolas, setConsolas] = useState([]);

  const cargarConsolas = () => {
    apiFetch(`/consolas/`)
      .then(r => r.json())
      .then(json => setConsolas(json.data || []));
  };

  useEffect(() => {
    cargarConsolas();
  }, []);

  return (
    <>
      <button className="btn btn-success mb-3 mt-3"
        onClick={() => {
          setConsolaEditar(null);
          setModalAbierto(true);
        }}
      >
        <i className="bi bi-file-plus"></i> Agregar consola
      </button>

      <Tabla
       
        columnas={[
          { key: "nombre", label: "Consola" },
          { key: "lanzamiento", label: "Año de lanzamiento" },
          { key: "plataforma", label: "Plataforma" },
          { key: "valor", label: "Valor (CLP)" }
        ]}

        filasPorPaginaInicial={10}


        datos={consolas}

        onEdit={(consola) => {
          setConsolaEditar(consola);
          setModalAbierto(true);
        }}
        onDelete={(consola) => {
          if (window.confirm(`¿Eliminar la consola "${consola.nombre}"?`)) {
            apiFetch(`/consolas/${consola.id}/`, {
              method: "DELETE"
            })
            .then(r => {
              if (r.ok) {
                cargarConsolas();
              } else {
                alert("Error al eliminar la consola.");
              }
            });
          }
        }}
      />

      <Modal
        abierto={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          setConsolaEditar(null);
        }}
      >
        <FormConsola
        consolaEditar={consolaEditar}
        onSuccess={() => {
          setModalAbierto(false);
          setConsolaEditar(null);
          cargarConsolas();
        }}
      />
      </Modal>
    </>
  );
}
