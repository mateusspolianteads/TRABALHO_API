from fastapi import APIRouter, HTTPException
from models.categoria import categoria

def criar_categoria(db, dados):
    nome_existente = db.query(categoria).filter(categoria.nome == dados.nome).first()
    
    if nome_existente:
        raise HTTPException(status_code=400, detail="Categoria já existe")

    nova_categoria = categoria(
        nome=dados.nome
    )

    db.add(nova_categoria)
    db.commit()
    db.refresh(nova_categoria)

    return nova_categoria

def consultar_categoria(db, categoria_id):
    categoria_consultada = db.query(categoria).filter(categoria.id == categoria_id).first()

    if not categoria_consultada:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")

    return categoria_consultada