from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from schemas.evento import Evento, EventoCreate, EventoUpdate
from services import eventos_service

router = APIRouter(
    prefix="/eventos",
    tags=["Eventos"]
)

@router.post("/", response_model=Evento, status_code=status.HTTP_201_CREATED)
def criar_evento(evento: EventoCreate, db: Session = Depends(get_db)):
    return eventos_service.criar_evento(db=db, evento=evento)

@router.get("/", response_model=list[Evento])
def listar_eventos(db: Session = Depends(get_db)):
    return eventos_service.listar_eventos(db)

@router.get("/{evento_id}", response_model=Evento)
def buscar_evento(evento_id: int, db: Session = Depends(get_db)):
    db_evento = eventos_service.buscar_evento_por_id(db, evento_id)

    if not db_evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    return db_evento

@router.put("/{evento_id}", response_model=Evento)
def atualizar_evento(evento_id: int, evento_update: EventoUpdate, db: Session = Depends(get_db)):
    db_evento = eventos_service.atualizar_evento(db, evento_id, evento_update)

    if not db_evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    return db_evento

@router.delete("/{evento_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_evento(evento_id: int, db: Session = Depends(get_db)):
    if not eventos_service.deletar_evento(db, evento_id):
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    return None