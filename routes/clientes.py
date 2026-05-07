from fastapi import APIRouter, HTTPException
from database import SessionLocal

from schemas.cliente import ClienteCreate, ClienteUpdate
from services.cliente_service import (
    criar_cliente,
    consultar_cliente,
    listar_clientes
)

router = APIRouter(
    prefix="/clientes",
    tags=["Clientes"]
)

@router.post("/cadastrar")
def cadastrar(cliente: ClienteCreate):
    db = SessionLocal()
    try:
        novo_cliente = criar_cliente(db, cliente)

        return {
            "mensagem": "Cliente cadastrado com sucesso",
            "cliente": {
                "id": novo_cliente.id,
                "nome": novo_cliente.nome,
                "email": novo_cliente.email
            }
        }
    finally:
        db.close()


@router.get("/listar")
def listar():
    db = SessionLocal()
    try:
        return listar_clientes(db)
    finally:
        db.close()