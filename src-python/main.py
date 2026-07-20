from fastapi import FastAPI
from sqlalchemy import text
from database import SessionLocal

app = FastAPI()

@app.get("/juegos")

def obtener_juegos():

    db = SessionLocal()

    try:
        resultado = db.execute(text("""
            SELECT id, titulo
            FROM juegos
            ORDER BY titulo
        """))

        juegos = []

        for fila in resultado:
            juegos.append({
                "id": fila.id,
                "nombre": fila.titulo
                
            })

        return juegos

    finally:
        db.close()