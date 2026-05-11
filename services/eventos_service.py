from sqlalchemy.orm import Session
from models.evento import Evento

from schemas.evento import EventoCreate, EventoUpdate


def criar_evento(db: Session, evento: EventoCreate):
    db_evento = Evento(**evento.model_dump())
    db.add(db_evento)
    db.commit()
    db.refresh(db_evento)
    return db_evento


def listar_eventos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Evento).offset(skip).limit(limit).all()


def buscar_evento_por_id(db: Session, evento_id: int):
    return db.query(Evento).filter(Evento.id == evento_id).first()


def atualizar_evento(db: Session, evento_id: int, evento_update: EventoUpdate):
    db_evento = db.query(Evento).filter(Evento.id == evento_id).first()

    if not db_evento:
        return None

    update_data = evento_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_evento, key, value)

    db.commit()
    db.refresh(db_evento)

    return db_evento


def deletar_evento(db: Session, evento_id: int):
    db_evento = db.query(Evento).filter(Evento.id == evento_id).first()

    if not db_evento:
        return False

    db.delete(db_evento)
    db.commit()

    return True