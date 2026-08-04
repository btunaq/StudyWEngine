from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3

app = FastAPI()

# 1. Configuração do CORS para permitir o frontend (React) se comunicar
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Definição da estrutura de dados esperada do React (Modelos)
class NoteBase(BaseModel):
    text: str
    x: int
    y: int

class PhotoBase(BaseModel):
    image_data: str # Aqui a mágica acontece: a imagem chega como um textão Base64
    x: int
    y: int

# 3. Conexão com o banco de dados SQLite
def get_db():
    conn = sqlite3.connect('mural.db')
    conn.row_factory = sqlite3.Row 
    return conn

# 4. Inicialização do Banco (Cria as duas tabelas se não existirem)
@app.on_event("startup")
def startup():
    conn = get_db()
    
    # Tabela para os Post-its
    conn.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            text TEXT, 
            x INTEGER, 
            y INTEGER
        )
    ''')
    
    # Tabela para as Fotos
    conn.execute('''
        CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            image_data TEXT, 
            x INTEGER, 
            y INTEGER
        )
    ''')
    
    conn.commit()
    conn.close()

# ==========================================
# ROTAS PARA OS POST-ITS (NOTAS)
# ==========================================

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
    return {"message": "Post-it deletado com sucesso"}


# ==========================================
# ROTAS PARA AS FOTOS
# ==========================================

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
    cursor.execute("INSERT INTO photos (image_data, x, y) VALUES (?, ?, ?)", 
                   (photo.image_data, photo.x, photo.y))
    conn.commit()
    photo_id = cursor.lastrowid
    conn.close()
    return {"id": photo_id, **photo.dict()}

@app.put("/photos/{photo_id}")
def update_photo(photo_id: int, photo: PhotoBase):
    """Note que não atualizamos o image_data, apenas as coordenadas X e Y quando a foto é arrastada"""
    conn = get_db()
    conn.execute("UPDATE photos SET x=?, y=? WHERE id=?", 
                 (photo.x, photo.y, photo_id))
    conn.commit()
    conn.close()
    return {"id": photo_id, **photo.dict()}

@app.delete("/photos/{photo_id}")
def delete_photo(photo_id: int):
    conn = get_db()
    conn.execute("DELETE FROM photos WHERE id=?", (photo_id,))
    conn.commit()
    conn.close()
    return {"message": "Foto deletada com sucesso"}