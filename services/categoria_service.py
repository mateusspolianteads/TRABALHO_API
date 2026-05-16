from fastapi import HTTPException
from models.categoria import Categoria


def criar_categoria(db, dados):
    categoria_existente = (
        db.query(Categoria)
        .filter(Categoria.nome == dados.nome)
        .first()
    )

    if categoria_existente:
        raise HTTPException(
            status_code=400,
            detail="Categoria já existe"
        )

    nova_categoria = Categoria(
        nome=dados.nome
    )

    db.add(nova_categoria)
    db.commit()
    db.refresh(nova_categoria)

    return nova_categoria


def listar_categorias(db):
    categorias = db.query(Categoria).all()

    return [
        {
            "id": categoria.id,
            "nome": categoria.nome
        }
        for categoria in categorias
    ]


def consultar_categoria(db, categoria_id):
    categoria = (
        db.query(Categoria)
        .filter(Categoria.id == categoria_id)
        .first()
    )

    if not categoria:
        raise HTTPException(
            status_code=404,
            detail="Categoria não encontrada"
        )

    return categoria


def atualizar_categoria(db, categoria_id, dados):
    categoria = (
        db.query(Categoria)
        .filter(Categoria.id == categoria_id)
        .first()
    )

    if not categoria:
        raise HTTPException(
            status_code=404,
            detail="Categoria não encontrada"
        )

    if dados.nome is not None:
        categoria_existente = (
            db.query(Categoria)
            .filter(
                Categoria.nome == dados.nome,
                Categoria.id != categoria_id
            )
            .first()
        )

        if categoria_existente:
            raise HTTPException(
                status_code=400,
                detail="Já existe uma categoria com esse nome"
            )

        categoria.nome = dados.nome

    db.commit()
    db.refresh(categoria)

    return categoria


def deletar_categoria(db, categoria_id):
    categoria = (
        db.query(Categoria)
        .filter(Categoria.id == categoria_id)
        .first()
    )

    if not categoria:
        raise HTTPException(
            status_code=404,
            detail="Categoria não encontrada"
        )

    db.delete(categoria)
    db.commit()