from fastapi import FastAPI
from database import Base, engine
from routes import usuarios

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(usuarios.router)


@app.get("/")
def home():
    return {"mensagem": "API Busão do Rolê funcionando"}