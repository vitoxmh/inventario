import { useState, useEffect } from "react";

export default function ImageSlider({ images = [] }) {
  const [index, setIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  const openModal = (imgIndex) => {
    setModalIndex(imgIndex);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const modalPrev = (e) => {
    e.stopPropagation();
    setModalIndex(modalIndex === 0 ? images.length - 1 : modalIndex - 1);
  };

  const modalNext = (e) => {
    e.stopPropagation();
    setModalIndex(modalIndex === images.length - 1 ? 0 : modalIndex + 1);
  };

  const handleKeyDown = (e) => {
    if (!modalOpen) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") setModalIndex(modalIndex === 0 ? images.length - 1 : modalIndex - 1);
    if (e.key === "ArrowRight") setModalIndex(modalIndex === images.length - 1 ? 0 : modalIndex + 1);
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen, modalIndex]);

  if (images.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
        Sin imágenes
      </div>
    );
  }

  const showControls = images.length > 1;
  const getImageSrc = (img) => img.archivo 
    ? `http://localhost:8080/api/imagenes/uploads/${img.archivo}` 
    : img;

  return (
    <>
      <div className="relative w-full max-w-xl mx-auto">
        <img
          src={getImageSrc(images[index])}
          alt=""
          width={350}
          className="w-full h-64 object-contain rounded shadow cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => openModal(index)}
        />

        {showControls && (
          <>
            <button
              onClick={() => setIndex(index === 0 ? images.length - 1 : index - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white px-3 py-1 rounded hover:bg-black/80 transition-colors"
            >
              ‹
            </button>

            <button
              onClick={() => setIndex(index === images.length - 1 ? 0 : index + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white px-3 py-1 rounded hover:bg-black/80 transition-colors"
            >
              ›
            </button>
          </>
        )}

        {showControls && (
          <div className="text-center mt-2 text-sm text-gray-500">
            {index + 1} / {images.length}
          </div>
        )}

        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-2 flex-wrap">
            {images.map((img, i) => (
              <img
                key={i}
                src={getImageSrc(img)}
                alt=""
                onClick={() => { setIndex(i); openModal(i); }}
                className={`w-12 h-12 object-cover rounded cursor-pointer border-2 transition-all ${
                  i === index ? "border-blue-500 opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeModal}
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10"
          >
            ×
          </button>

          <button
            onClick={modalPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-5xl hover:text-gray-300 transition-colors"
          >
            ‹
          </button>

          <img
            src={getImageSrc(images[modalIndex])}
            alt=""
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={modalNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-5xl hover:text-gray-300 transition-colors"
          >
            ›
          </button>

          <div className="absolute bottom-4 text-white text-sm">
            {modalIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
