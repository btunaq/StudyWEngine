// frontend/src/services/api.js
const API_URL = 'http://localhost:8000';

export const muralService = {
  getNotes: () => fetch(`${API_URL}/notes`).then(res => res.json()),
  createNote: (note) => fetch(`${API_URL}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note)
  }).then(res => res.json()),
  updateNote: (id, note) => fetch(`${API_URL}/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note)
  }),
  deleteNote: (id) => fetch(`${API_URL}/notes/${id}`, { method: 'DELETE' }),

  getPhotos: () => fetch(`${API_URL}/photos`).then(res => res.json()),
  createPhoto: (photo) => fetch(`${API_URL}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(photo)
  }).then(res => res.json()),
  updatePhoto: (id, photo) => fetch(`${API_URL}/photos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(photo)
  }),
  deletePhoto: (id) => fetch(`${API_URL}/photos/${id}`, { method: 'DELETE' }),
};