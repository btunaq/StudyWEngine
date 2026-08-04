import { useState } from 'react';

export function Photo({ photo, onUpdate, onDelete }) {
  const [position, setPosition] = useState({ x: photo.x, y: photo.y });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  const handleMouseMove = (e) => {
    if (isDragging) setPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onUpdate(photo.id, { ...photo, x: position.x, y: position.y });
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
      style={{ left: `${position.x}px`, top: `${position.y}px`, position: 'absolute' }}
      className={`p-2 bg-white shadow-xl rounded-md flex flex-col gap-1 ${isDragging ? 'shadow-2xl z-40' : 'z-10'}`}
    >
      <div 
        onMouseDown={handleMouseDown} 
        className="w-full h-6 cursor-grab active:cursor-grabbing flex justify-end items-center bg-gray-50 rounded"
      >
         <button onClick={() => onDelete(photo.id)} className="text-red-500 hover:text-red-700 font-bold px-2 cursor-pointer">
          X
        </button>
      </div>
      {/* Renderiza a imagem convertida que veio do banco */}
      <img src={photo.image_data} alt="Mural" draggable="false" className="w-64 h-auto rounded-sm select-none pointer-events-none" />
    </div>
  );
}