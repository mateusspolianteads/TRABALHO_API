from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class EventoBase(BaseModel):
    nome: str
    categoria: int
    data_evento: datetime
    local: str
    valor_passagem: float
    capacidade: int


class EventoCreate(EventoBase):
    pass


class EventoUpdate(BaseModel):
    nome: Optional[str] = None
    id_categoria: Optional[int] = None
    data_evento: Optional[datetime] = None
    local: Optional[str] = None
    valor_passagem: Optional[float] = None
    capacidade: Optional[int] = None


class Evento(EventoBase):
    id: int

    class Config:
        from_attributes = True