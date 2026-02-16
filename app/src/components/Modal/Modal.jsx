import styles from "./Modal.module.scss";

export default function Modal({ abierto, onClose, children }) {
  if (!abierto) return null;

  return (
    <dialog ref={dialogRef}>
        <h2>Modal nativo</h2>
        <p>Usando dialog en React</p>
		{children}
        <button onClick={closeModal}>Cerrar</button>
      </dialog>
  );
}
