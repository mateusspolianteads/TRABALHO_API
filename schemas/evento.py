from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class EventoBase(BaseModel):
    nome: str = Field(..., min_length=3)
    categoria: str = Field(..., min_length=2)
    data_evento: datetime
    local: str = Field(..., min_length=3)
    cidade_saida: str = Field(..., min_length=3)
    valor_ingresso: float = Field(..., ge=0)
    capacidade: int = Field(..., ge=1)


class EventoCreate(EventoBase):
    pass


class EventoUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=3)
    categoria: Optional[str] = None
    data_evento: Optional[datetime] = None
    local: Optional[str] = None
    cidade_saida: Optional[str] = None
    valor_ingresso: Optional[float] = Field(None, ge=0)
    capacidade: Optional[int] = Field(None, ge=1)


class Evento(EventoBase):
    id: int

    class Config:
        from_attributes = True