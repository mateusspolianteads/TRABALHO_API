from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from database import Base


class Evento(Base):
    __tablename__ = "eventos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)

    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=False)

    data_evento = Column(DateTime, nullable=False)

    local = Column(String, nullable=False)

    valor_passagem = Column(Float, nullable=False)

    imagem = Column(String, nullable=True)