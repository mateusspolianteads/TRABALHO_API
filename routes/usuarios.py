from fastapi import APIRouter
from database import SessionLocal
from schemas.usuario import UsuarioCreate
from services.usuario_service import criar_usuario

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuários"]
)


@router.post("/cadastrar")
def cadastrar(usuario: UsuarioCreate):
    db = SessionLocal()

    novo_usuario = criar_usuario(db, usuario)

    return {
        "mensagem": "Usuário cadastrado com sucesso",
        "usuario": {
            "id": novo_usuario.id,
            "nome": novo_usuario.nome,
            "email": novo_usuario.email
        }
    }