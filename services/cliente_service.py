from fastapi import HTTPException
from models.cliente import Cliente


def criar_cliente(db, dados):
    cpf_existente = db.query(Cliente).filter(Cliente.cpf == dados.cpf).first()

    if cpf_existente:
        raise HTTPException(status_code=400, detail="CPF já cadastrado")

    novo_cliente = Cliente(
        nome=dados.nome,
        data_nascimento=dados.data_nascimento,
        cpf=dados.cpf,
        email=dados.email,
        telefone=dados.telefone
    )

    db.add(novo_cliente)
    db.commit()
    db.refresh(novo_cliente)

    return novo_cliente


def consultar_cliente(db, cliente_id):
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()

    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    return cliente


def listar_clientes(db):
    return db.query(Cliente).all()


def get_customers_by_name(db, cliente_nome):
    cliente = db.query(Cliente).filter(Cliente.nome == cliente_nome).first()

    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    return cliente