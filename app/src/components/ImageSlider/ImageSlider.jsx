import { useState } from "react";

export default function ImageSlider({ images = [] }) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
        Sin imágenes
      </div>
    );
  }

  const showControls = images.length > 1;

  const prev = () => {
    setIndex(index === 0 ? images.length - 1 : index - 1);
  };

  const next = () => {
    setIndex(index === images.length - 1 ? 0 : index + 1);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <img
        src={images[index].archivo ? `http://localhost:8080/api/imagenes/uploads/${images[index].archivo}` : images[index]}
        alt=""
        width={350}
        className="w-full h-64 object-contain rounded shadow"
      />

      {/* BOTONES */}
      {showControls && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white px-3 py-1 rounded"
          >
            ‹
          </button>

          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white px-3 py-1 rounded"
          >
            ›
          </button>
        </>
      )}

      {/* INDICADOR */}
      {showControls && (
        <div className="text-center mt-2 text-sm text-gray-500">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
