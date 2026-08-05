import { useState, useEffect } from 'react';

export function Photo({ photo, onUpdate, onDelete }) {
  const [position, setPosition] = useState({ x: photo.x, y: photo.y });
  // Agora lemos o valor que veio do banco, ou usamos o padrão se for novo
  const [size, setSize] = useState({ width: photo.w || 320, height: photo.h || 256 }); 
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const handleMoveMouseDown = (e) => {
    setIsDragging(true);
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY, w: size.width, h: size.height });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      } else if (isResizing) {
        const newWidth = Math.max(150, resizeStart.w + (e.clientX - resizeStart.x));
        const newHeight = Math.max(150, resizeStart.h + (e.clientY - resizeStart.y));
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      // Quando soltar o clique de mover ou redimensionar, manda tudo atualizado para a API!
      if (isDragging) {
        setIsDragging(false);
        onUpdate(photo.id, { ...photo, x: position.x, y: position.y, w: size.width, h: size.height });
      }
      if (isResizing) {
        setIsResizing(false);
        onUpdate(photo.id, { ...photo, x: position.x, y: position.y, w: size.width, h: size.height });
      }
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, offset, position.x, position.y, resizeStart, photo, onUpdate, size.width, size.height]);

  return (
    <div
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        position: 'absolute'
      }}
      className={`p-1 bg-white shadow-xl rounded-md flex flex-col z-10 ${isDragging || isResizing ? 'shadow-2xl z-40' : ''}`}
    >
      <div
        onMouseDown={handleMoveMouseDown}
        className="w-full h-6 cursor-grab active:cursor-grabbing flex justify-between items-center bg-gray-50 rounded-t border-b border-gray-100 shrink-0"
      >
        <span className="text-gray-400 text-xs font-bold px-2 select-none">⋮⋮</span>
        <button onClick={() => onDelete(photo.id)} className="text-red-400 hover:text-red-600 font-bold px-2 cursor-pointer z-50">
          X
        </button>
      </div>

      <div className="flex-1 w-full h-full p-1 pointer-events-none overflow-hidden relative bg-white">
        <img
          src={photo.image_data}
          alt="Mural"
          draggable="false"
          className="w-full h-full object-contain select-none"
        />
      </div>

      <div
        onMouseDown={handleResizeMouseDown}
        className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize bg-transparent z-50 flex items-end justify-end p-1"
      >
        <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 10L10 8V10H8ZM4 10L10 4V6L6 10H4ZM0 10L10 0V2L2 10H0Z" fill="#94A3B8"/>
        </svg>
      </div>
    </div>
  );
}