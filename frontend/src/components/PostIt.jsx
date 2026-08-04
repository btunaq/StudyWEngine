import { useState } from 'react';

export function PostIt({ note, onUpdate, onDelete }) {
  const [position, setPosition] = useState({ x: note.x, y: note.y });
  const [text, setText] = useState(note.text);
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
      onUpdate(note.id, { ...note, x: position.x, y: position.y, text });
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
      style={{ left: `${position.x}px`, top: `${position.y}px`, position: 'absolute' }}
      className={`w-64 h-64 bg-yellow-100 shadow-xl flex flex-col rounded-md ${isDragging ? 'shadow-2xl z-40' : 'z-10'}`}
    >
      <div 
        onMouseDown={handleMouseDown} 
        className="w-full h-8 bg-yellow-300 rounded-t-md cursor-grab active:cursor-grabbing flex items-center justify-between px-2"
      >
        <span className="text-yellow-700 text-xs font-bold">⋮⋮ Mover</span>
        <button onClick={() => onDelete(note.id)} className="text-red-500 hover:text-red-700 font-bold px-2 rounded hover:bg-red-100/50 cursor-pointer">
          X
        </button>
      </div>
      <textarea 
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => onUpdate(note.id, { ...note, x: position.x, y: position.y, text })}
        className="flex-1 bg-transparent p-4 resize-none outline-none text-gray-800 font-medium"
        placeholder="Anote ou edite aqui..."
      />
    </div>
  );
}