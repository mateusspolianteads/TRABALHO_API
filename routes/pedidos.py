from fastapi import APIRouter, UploadFile, File
from database import SessionLocal
import pandas as pd
from io import BytesIO

from models.pedido import Pedido

router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"]
)

@router.get("/listar")
def listar():
    db = SessionLocal()
    try:
        return db.query(Pedido).all()
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

        pedidos_importados = []

        for _, row in df.iterrows():

            pedido = Pedido(
                cliente_id=int(row["cliente_id"]),
                evento_id=int(row["evento_id"]),
                data_venda=row.get("data_venda"),
                status_pedido=str(row.get("status_pedido", "")),
                status_ingresso=str(row.get("status_ingresso", "")),
                lote=row.get("lote"),
                valor_lote=row.get("valor_lote"),
                categoria_preco=row.get("categoria_preco"),
                canal_venda=row.get("canal_venda"),
                metodo_pagamento=row.get("metodo_pagamento"),
                transferido=bool(row.get("transferido", False)),
                aprovado=bool(row.get("aprovado", False))
            )

            db.add(pedido)

            pedidos_importados.append({
                "cliente_id": pedido.cliente_id,
                "evento_id": pedido.evento_id
            })

        db.commit()

        return {
            "mensagem": "Importação de pedidos finalizada",
            "total_importados": len(pedidos_importados),
            "pedidos_importados": pedidos_importados
        }

    finally:
        db.close()