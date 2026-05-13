from fastapi import APIRouter, HTTPException
from database import SessionLocal
from schemas.pedido import PedidoCreate
from services.pedido_service import criar_pedido, consultar_pedido
from pydantic import BaseModel
from models.pedido import Pedido

router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"]
)

@router.post("/cadastrar")
def cadastrar(pedido: PedidoCreate):
    db = SessionLocal()
    try:  
        novo_pedido = criar_pedido(db, pedido)

        return {
            "mensagem": "Pedido criado com sucesso",
            "pedido": {
                "id": novo_pedido.id,
                "cliente_id": novo_pedido.cliente_id,
                "evento_id": novo_pedido.evento_id
            }
        }
    finally:
        db.close()

@router.get("/consultar/{id}")
def consultar_por_id(id: int):
    db = SessionLocal()
    try:
        pedido = consultar_pedido(db, id)

        return {
            "pedido": {
                "id": pedido.id,
                "cliente_id": pedido.cliente_id,
                "evento_id": pedido.evento_id,
                "data_venda": pedido.data_venda,
                "status_pedido": pedido.status_pedido,
                "status_ingresso": pedido.status_ingresso,
                "lote": pedido.lote,
                "valor_lote": pedido.valor_lote,
                "categoria_preco": pedido.categoria_preco,
                "canal_venda": pedido.canal_venda,
                "metodo_pagamento": pedido.metodo_pagamento,
                "transferido": pedido.transferido,
                "aprovado": pedido.aprovado
            }
        }
    finally:
        db.close()