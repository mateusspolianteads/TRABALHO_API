from fastapi import APIRouter, UploadFile, File, HTTPException
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

""" 
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
 """

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
        

@router.post("/importar-planilha")
async def importar_planilha(file: UploadFile = File(...)):

    db = SessionLocal()

    try:
        conteudo = await file.read()

        if file.filename.endswith(".xlsx"):
            df = pd.read_excel(BytesIO(conteudo))

        elif file.filename.endswith(".xls"):
            df = pd.read_excel(BytesIO(conteudo))

        else:
            return {"erro": "Formato inválido"}

        df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")

        clientes_importados = []

        for _, row in df.iterrows():

            cliente = Cliente(
                nome=str(row["nome"]),
                cpf=str(row["cpf"]),
                email=str(row.get("email", "")),
                telefone=str(row.get("telefone_do_comprador", "")),
                data_nascimento=pd.to_datetime(
                    row.get("data_de_nascimento")
                ).date() if pd.notna(row.get("data_de_nascimento")) else None
            )

            db.add(cliente)

            clientes_importados.append({
                "nome": cliente.nome,
                "cpf": cliente.cpf
            })

        db.commit()

        return {
            "mensagem": "Importação finalizada",
            "total_importados": len(clientes_importados),
            "clientes_importados": clientes_importados
        }

    finally:
        db.close()