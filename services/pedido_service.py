from models.pedido import Pedido
from fastapi import HTTPException

def criar_pedido(db, dados):
    
    pedido_existente = db.query(Pedido).filter(Pedido.id == dados.id).first()

    if pedido_existente:
        raise HTTPException(status_code=400, detail="Já existe um Pedido com esse ID")
    
    novo_pedido = Pedido(
        cliente_id=dados.cliente_id,
        evento_id=dados.evento_id,
        data_venda=dados.data_venda,
        status_pedido=dados.status_pedido,
        status_ingresso=dados.status_ingresso,
        lote=dados.lote,
        valor_lote=dados.valor_lote,
        categoria_preco=dados.categoria_preco,
        canal_venda=dados.canal_venda,
        metodo_pagamento=dados.metodo_pagamento,
        transferido=dados.transferido,
        aprovado=dados.aprovado
    )

    db.add(novo_pedido)
    db.commit()
    db.refresh(novo_pedido)

    return novo_pedido

def consultar_pedido(db, pedido_id):
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()

    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    return pedido