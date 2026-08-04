import { useState, useEffect } from 'react';
import { muralService } from './services/api';
import { PostIt } from './components/PostIt';
import { Photo } from './components/Photo';

function App() {
  const [notes, setNotes] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [bgImage, setBgImage] = useState(localStorage.getItem('mural_bg') || '');

  useEffect(() => {
    muralService.getNotes().then(setNotes).catch(console.error);
    muralService.getPhotos().then(setPhotos).catch(console.error);
  }, []);

  const handleAddNote = () => {
    const newNote = { text: '', x: window.innerWidth / 2, y: window.innerHeight / 2 };
    muralService.createNote(newNote)
      .then(data => setNotes(prev => [...prev, data])) 
      .catch(err => alert(err.message));
  };

  const handleUpdateNote = (id, updatedNote) => {
    muralService.updateNote(id, updatedNote).catch(console.error);
    setNotes(prev => prev.map(n => n.id === id ? updatedNote : n));
  };

  const handleDeleteNote = (id) => {
    muralService.deleteNote(id).catch(console.error);
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  // ---------------------------------------------------------
  // PROCESSADOR INTELIGENTE: Aceita parâmetros de tamanho
  // ---------------------------------------------------------
  const processImage = (file, maxWidth, quality, callback) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      
      let width = img.width;
      let height = img.height;

      // Só reduz se a imagem for maior que o limite que passamos
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      callback(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = URL.createObjectURL(file);
  };

  // 1. Fotos do Mural (Mapas Mentais): Trava em Full HD (1920px) e 80% de qualidade
  const handleAddPhoto = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    processImage(file, 1920, 0.8, (base64Data) => {
      const newPhoto = { 
        image_data: base64Data, 
        x: window.innerWidth / 2 - 100, 
        y: window.innerHeight / 2 - 100 
      };
      
      muralService.createPhoto(newPhoto)
        .then(data => setPhotos(prev => [...prev, data]))
        .catch(err => alert("Erro ao salvar no servidor: " + err.message));
    });
    
    event.target.value = ''; 
  };

  // 2. Papel de Parede: Libera o 4K (3840px) e 90% de qualidade!
  const handleChangeBg = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    processImage(file, 3840, 0.9, (base64Data) => {
      try {
        localStorage.setItem('mural_bg', base64Data);
        setBgImage(base64Data);
      } catch (e) {
        alert("A imagem 4K é linda, mas o navegador não aguentou salvar na memória (LocalStorage lotado).");
      }
    });
    
    event.target.value = '';
  };

  const handleUpdatePhoto = (id, updatedPhoto) => {
    muralService.updatePhoto(id, updatedPhoto).catch(console.error);
    setPhotos(prev => prev.map(p => p.id === id ? updatedPhoto : p));
  };

  const handleDeletePhoto = (id) => {
    muralService.deletePhoto(id).catch(console.error);
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div 
      className="w-screen h-screen overflow-hidden relative"
      style={{
         backgroundColor: bgImage ? 'transparent' : '#f3f4f6',
         backgroundImage: bgImage ? `url(${bgImage})` : 'none',
         backgroundSize: 'cover',
         backgroundPosition: 'center'
      }}
    >
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/40 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/50 flex gap-4 z-50">
        <button onClick={handleAddNote} className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-lg cursor-pointer transition-colors shadow-sm">
          + Novo Post-it
        </button>

        <label htmlFor="upload-photo" className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg cursor-pointer transition-colors shadow-sm">
          + Adicionar Foto
        </label>
        <input id="upload-photo" type="file" accept="image/*" onChange={handleAddPhoto} className="hidden" />

        <label htmlFor="upload-bg" className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg cursor-pointer transition-colors shadow-sm">
          Mudar Fundo
        </label>
        <input id="upload-bg" type="file" accept="image/*" onChange={handleChangeBg} className="hidden" />
      </div>

      {notes.map(note => (
        <PostIt key={note.id} note={note} onUpdate={handleUpdateNote} onDelete={handleDeleteNote} />
      ))}

      {photos.map(photo => (
        <Photo key={photo.id} photo={photo} onUpdate={handleUpdatePhoto} onDelete={handleDeletePhoto} />
      ))}
    </div>
  );
}

export default App;