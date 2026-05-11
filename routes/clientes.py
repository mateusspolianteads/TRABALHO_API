from fastapi import APIRouter, UploadFile, File
from database import SessionLocal
import pandas as pd
from io import BytesIO

from models.cliente import Cliente
from schemas.cliente import ClienteCreate
from services.cliente_service import (
    criar_cliente,
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


@router.post("/importar-planilha")
async def importar_planilha(file: UploadFile = File(...)):

    db = SessionLocal()

    try:
        conteudo = await file.read()

        # Detecta tipo de arquivo
        if file.filename.endswith(".xlsx"):
            df = pd.read_excel(BytesIO(conteudo), engine="openpyxl")

        elif file.filename.endswith(".xls"):
            df = pd.read_excel(BytesIO(conteudo), engine="xlrd")

        else:
            return {"erro": "Formato inválido. Use .xls ou .xlsx"}

        # Normaliza colunas
        df.columns = (
            df.columns
            .str.strip()
            .str.lower()
            .str.replace(" ", "_")
        )

        clientes_importados = []
        erros = []

        # CPFs já existentes no banco
        cpfs_existentes = {
            c.cpf for c in db.query(Cliente).all()
        }

        cpfs_planilha = set()
        novos_clientes = []

        for index, row in df.iterrows():
            try:
                nome = str(row.get("nome", "")).strip()
                cpf = str(row.get("cpf", "")).strip()
                email = str(row.get("email", "")).strip()
                telefone = str(row.get("telefone_do_comprador", "")).strip()

                data_raw = row.get("data_de_nascimento")

                # trata data vazia corretamente
                data_nascimento = None
                if pd.notna(data_raw):
                    try:
                        data_nascimento = pd.to_datetime(data_raw).date()
                    except:
                        data_nascimento = None

                # validações
                if not nome or not cpf:
                    erros.append({
                        "linha": index + 2,
                        "erro": "Nome ou CPF vazio"
                    })
                    continue

                if cpf in cpfs_existentes:
                    erros.append({
                        "linha": index + 2,
                        "erro": f"CPF {cpf} já cadastrado"
                    })
                    continue

                if cpf in cpfs_planilha:
                    erros.append({
                        "linha": index + 2,
                        "erro": f"CPF {cpf} duplicado na planilha"
                    })
                    continue

                cpfs_planilha.add(cpf)

                novo_cliente = Cliente(
                    nome=nome,
                    cpf=cpf,
                    email=email,
                    telefone=telefone,
                    data_nascimento=data_nascimento
                )

                novos_clientes.append(novo_cliente)

            except Exception as e:
                erros.append({
                    "linha": index + 2,
                    "erro": str(e)
                })

        # salva em lote
        if novos_clientes:
            db.add_all(novos_clientes)
            db.commit()

        for c in novos_clientes:
            clientes_importados.append({
                "nome": c.nome,
                "cpf": c.cpf
            })

        return {
            "mensagem": "Importação finalizada",
            "total_importados": len(clientes_importados),
            "total_erros": len(erros),
            "clientes_importados": clientes_importados,
            "erros": erros
        }

    finally:
        db.close()