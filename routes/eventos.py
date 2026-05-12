from fastapi import APIRouter, HTTPException
from database import SessionLocal
from schemas.evento import EventoCreate, EventoUpdate
from services import eventos_service

router = APIRouter(
    prefix="/eventos",
    tags=["Eventos"]
)


@router.post("/cadastrar")
def criar_evento(evento: EventoCreate):
    db = SessionLocal()
    try:
        novo_evento = eventos_service.criar_evento(db, evento)

        return {
            "mensagem": "Evento cadastrado com sucesso",
            "evento": novo_evento
        }
    finally:
        db.close()


@router.get("/listar")
def listar_eventos():
    db = SessionLocal()
    try:
        return eventos_service.listar_eventos(db)
    finally:
        db.close()


@router.get("/consultar/{evento_id}")
def buscar_evento(evento_id: int):
    db = SessionLocal()
    try:
        evento = eventos_service.buscar_evento_por_id(db, evento_id)

        if not evento:
            raise HTTPException(
                status_code=404,
                detail="Evento não encontrado"
            )

        return evento
    finally:
        db.close()


@router.put("/atualizar/{evento_id}")
def atualizar_evento(evento_id: int, evento_update: EventoUpdate):
    db = SessionLocal()
    try:
        evento = eventos_service.atualizar_evento(
            db,
            evento_id,
            evento_update
        )

        if not evento:
            raise HTTPException(
                status_code=404,
                detail="Evento não encontrado"
            )

        return {
            "mensagem": "Evento atualizado com sucesso",
            "evento": evento
        }
    finally:
        db.close()


@router.delete("/deletar/{evento_id}")
def deletar_evento(evento_id: int):
    db = SessionLocal()
    try:
        deletado = eventos_service.deletar_evento(
            db,
            evento_id
        )

        if not deletado:
            raise HTTPException(
                status_code=404,
                detail="Evento não encontrado"
            )

        return {
            "mensagem": "Evento deletado com sucesso"
        }
    finally:
        db.close()