from fastapi import APIRouter, HTTPException 
from database import SessionLocal
from schemas.usuario import UsuarioCreate
from services.usuario_service import criar_usuario, consultar_usuario
from pydantic import BaseModel
from models.usuario import Usuario

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuários"]
)

class LoginSchema(BaseModel):
    usuario: str
    senha: str


@router.post("/cadastrar")
def cadastrar(usuario: UsuarioCreate):
    db = SessionLocal()
    try:  
        novo_usuario = criar_usuario(db, usuario)

        return {
            "mensagem": "Usuário cadastrado com sucesso",
            "usuario": {
                "id": novo_usuario.id,
                "nome": novo_usuario.nome,
                "email": novo_usuario.email
            }
        }
    finally:
        db.close()  


@router.post("/login")
def login(dados: LoginSchema):
    db = SessionLocal()
    try:
        user = db.query(Usuario).filter(
            (Usuario.nome == dados.usuario) | (Usuario.email == dados.usuario),
            Usuario.senha == dados.senha
        ).first()

        if not user:
            raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")

        return {
            "status": "ok",
            "usuario": {
                "id": user.id,
                "nome": user.nome
            }
        }
    finally:
        db.close()


@router.get("/consultar/{id}")
def consultar_por_id(id: int):
    db = SessionLocal()
    try:  
        usuario = consultar_usuario(db, id)

        if not usuario: 
            raise HTTPException(status_code=404, detail="Usuário não encontrado")

        return usuario
    finally:
        db.close() 