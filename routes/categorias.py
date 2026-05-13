from fastapi import APIRouter
from database import SessionLocal
from schemas.categoria import CategoriaCreate
from services.categoria_service import criar_categoria, consultar_categoria

router = APIRouter(
    prefix="/categorias",
    tags=["Categorias"]
)

@router.post("/cadastrar")
def cadastrar(categoria: CategoriaCreate):
    db = SessionLocal()
    try:
        nova_categoria = criar_categoria(db, categoria)

        return {
            "mensagem": "Categoria criada com sucesso",
            "categoria": {
                "id": nova_categoria.id,
                "nome": nova_categoria.nome
            }
        }
    finally:
        db.close()

def consultar_por_id(id: int):
    db = SessionLocal()
    try:
        categoria = consultar_categoria(db, id)

        return {
            "categoria": {
                "id": categoria.id,
                "nome": categoria.nome
            }
        }
    finally:
        db.close()