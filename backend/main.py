from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

class NoteBase(BaseModel):
    text: str
    x: int
    y: int

class PhotoBase(BaseModel):
    image_data: str
    x: int
    y: int
    w: int = 320 # Largura padrão caso não seja enviada
    h: int = 256 # Altura padrão caso não seja enviada

def get_db():
    conn = sqlite3.connect('mural.db')
    conn.row_factory = sqlite3.Row 
    return conn

@app.on_event("startup")
def startup():
    conn = get_db()
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            text TEXT, 
            x INTEGER, 
            y INTEGER
        )
    ''')
    
    # Adicionamos as colunas w e h na tabela
    conn.execute('''
        CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            image_data TEXT, 
            x INTEGER, 
            y INTEGER,
            w INTEGER,
            h INTEGER
        )
    ''')
    
    conn.commit()
    conn.close()

# --- ROTAS DE POST-ITS ---
@app.get("/notes")
def get_notes():
    conn = get_db()
    notes = conn.execute("SELECT * FROM notes").fetchall()
    conn.close()
    return [dict(note) for note in notes]

@app.post("/notes")
def create_note(note: NoteBase):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO notes (text, x, y) VALUES (?, ?, ?)", 
                   (note.text, note.x, note.y))
    conn.commit()
    note_id = cursor.lastrowid
    conn.close()
    return {"id": note_id, **note.dict()}

@app.put("/notes/{note_id}")
def update_note(note_id: int, note: NoteBase):
    conn = get_db()
    conn.execute("UPDATE notes SET text=?, x=?, y=? WHERE id=?", 
                 (note.text, note.x, note.y, note_id))
    conn.commit()
    conn.close()
    return {"id": note_id, **note.dict()}

@app.delete("/notes/{note_id}")
def delete_note(note_id: int):
    conn = get_db()
    conn.execute("DELETE FROM notes WHERE id=?", (note_id,))
    conn.commit()
    conn.close()
    return {"message": "Deletado"}


# --- ROTAS DE FOTOS ---
@app.get("/photos")
def get_photos():
    conn = get_db()
    photos = conn.execute("SELECT * FROM photos").fetchall()
    conn.close()
    return [dict(photo) for photo in photos]

@app.post("/photos")
def create_photo(photo: PhotoBase):
    conn = get_db()
    cursor = conn.cursor()
    # Adicionamos o w e h no banco
    cursor.execute("INSERT INTO photos (image_data, x, y, w, h) VALUES (?, ?, ?, ?, ?)", 
                   (photo.image_data, photo.x, photo.y, photo.w, photo.h))
    conn.commit()
    photo_id = cursor.lastrowid
    conn.close()
    return {"id": photo_id, **photo.dict()}

@app.put("/photos/{photo_id}")
def update_photo(photo_id: int, photo: PhotoBase):
    conn = get_db()
    # Atualizamos as coordenadas e o tamanho!
    conn.execute("UPDATE photos SET x=?, y=?, w=?, h=? WHERE id=?", 
                 (photo.x, photo.y, photo.w, photo.h, photo_id))
    conn.commit()
    conn.close()
    return {"id": photo_id, **photo.dict()}

@app.delete("/photos/{photo_id}")
def delete_photo(photo_id: int):
    conn = get_db()
    conn.execute("DELETE FROM photos WHERE id=?", (photo_id,))
    conn.commit()
    conn.close()
    return {"message": "Deletado"}