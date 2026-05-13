from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from database import Base

class categoria(Base):
    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)