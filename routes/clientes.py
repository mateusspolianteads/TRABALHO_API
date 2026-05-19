from fastapi import APIRouter, UploadFile, File, Form
from database import SessionLocal
import pandas as pd
from io import BytesIO

from models.cliente import Cliente
from schemas.cliente import ClienteUpdate
from services.cliente_service import (
    listar_clientes,
    atualizar_cliente
)

router = APIRouter(
    prefix="/clientes",
    tags=["Clientes"]
)

@router.get("/listar")
def listar():
    db = SessionLocal()

    try:
        return listar_clientes(db)

    finally:
        db.close()


@router.put("/atualizar/{id}")
def atualizar(id: int, cliente: ClienteUpdate):

    db = SessionLocal()

    try:
        cliente_atualizado = atualizar_cliente(
            db,
            id,
            cliente
        )

        return {
            "mensagem": "Cliente atualizado com sucesso",
            "cliente": cliente_atualizado
        }

    finally:
        db.close()


@router.post(
    "/importar-planilha",
    status_code=201
)
async def importar_planilha(
    evento_id: int = Form(...),
    file: UploadFile = File(...)
    ):

    db = SessionLocal()

    try:

        conteudo = await file.read()

        if file.filename.endswith(".xlsx"):

            df = pd.read_excel(BytesIO(conteudo))

        elif file.filename.endswith(".xls"):

            df = pd.read_excel(BytesIO(conteudo))

        else:

            return {
                "erro": "Formato inválido"
            }

        df.columns = (
            df.columns
            .str.strip()
            .str.lower()
            .str.replace(" ", "_")
        )

        clientes_importados = []
        clientes_duplicados = []

        # pega todos cpfs do banco uma vez só
        cpfs_existentes = set(
            cpf[0]
            for cpf in db.query(Cliente.cpf).all()
        )

        for _, row in df.iterrows():

            cpf = str(row["cpf"]).strip()

            # verifica duplicado
            if cpf in cpfs_existentes:

                clientes_duplicados.append({
                    "nome": str(row["nome"]),
                    "cpf": cpf
                })

                continue

            cliente = Cliente(
                nome=str(row["nome"]),
                cpf=cpf,
                email=str(row.get("email", "")),
                telefone=str(
                    row.get("telefone_do_comprador", "")
                ),
                data_nascimento=(
                    pd.to_datetime(
                        row.get("data_de_nascimento")
                    ).date()
                    if pd.notna(
                        row.get("data_de_nascimento")
                    )
                    else None
                ),
                evento_id=evento_id
            )

            db.add(cliente)

            # adiciona no set pra não repetir
            cpfs_existentes.add(cpf)

            clientes_importados.append({
                "nome": cliente.nome,
                "cpf": cliente.cpf
            })

        db.commit()

        return {

            "mensagem": "Importação finalizada",

            "total_importados":
                len(clientes_importados),

            "total_duplicados":
                len(clientes_duplicados),

            "clientes_importados":
                clientes_importados,

            "clientes_duplicados":
                clientes_duplicados
        }

    finally:
        db.close()

@router.get("/evento/{evento_id}")
def listar_clientes_evento(
    evento_id: int,
    pagina: int = 1,
    limite: int = 10
):

    db = SessionLocal()

    try:

        offset = (pagina - 1) * limite

        clientes = (
            db.query(Cliente)
            .filter(Cliente.evento_id == evento_id)
            .offset(offset)
            .limit(limite)
            .all()
        )

        total = (
            db.query(Cliente)
            .filter(Cliente.evento_id == evento_id)
            .count()
        )

        return {
            "clientes": clientes,
            "total": total,
            "pagina": pagina,
            "limite": limite
        }

    finally:
        db.close()