from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base

class Evento(Base):
    __tablename__ = "eventos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    categoria = Column(String, nullable=False)
    data_evento = Column(DateTime, nullable=False)
    local = Column(String, nullable=False)
    cidade_saida = Column(String, nullable=False)
    valor_ingresso = Column(Float, nullable=False)
    capacidade = Column(Integer, nullable=False)