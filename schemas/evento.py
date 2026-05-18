from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class EventoBase(BaseModel):
    nome: str
    categoria_id: int
    data_evento: datetime
    local: str
    valor_passagem: float
    imagem: Optional[str] = None


class EventoCreate(EventoBase):
    pass


class EventoUpdate(BaseModel):
    nome: Optional[str] = None
    categoria_id: Optional[int] = None
    data_evento: Optional[datetime] = None
    local: Optional[str] = None
    valor_passagem: Optional[float] = None
    imagem: Optional[str] = None


class Evento(EventoBase):
    id: int

    class Config:
        from_attributes = True