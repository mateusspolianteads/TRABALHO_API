from fastapi import HTTPException
from models.usuario import Usuario


def criar_usuario(db, dados):

    email_existente = db.query(Usuario).filter(
        Usuario.email == dados.email
    ).first()

    if email_existente:
        raise HTTPException(
            status_code=400,
            detail="Email já cadastrado"
        )

    cpf_existente = db.query(Usuario).filter(
        Usuario.cpf_cnpj == dados.cpf_cnpj
    ).first()

    if cpf_existente:
        raise HTTPException(
            status_code=400,
            detail="CPF/CNPJ já cadastrado"
        )

    novo_usuario = Usuario(
        nome=dados.nome,
        cpf_cnpj=dados.cpf_cnpj,
        email=dados.email,
        senha=dados.senha
    )

    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)

    return novo_usuario