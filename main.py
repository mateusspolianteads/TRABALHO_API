from fastapi import FastAPI
from database import Base, engine
from routes import usuarios, clientes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(usuarios.router)
app.include_router(clientes.router)


@app.get("/")
def home():
    return {"mensagem": "API Busão do Rolê funcionando"}
