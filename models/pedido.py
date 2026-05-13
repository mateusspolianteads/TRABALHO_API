from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from database import Base


class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)

    data_venda = Column(DateTime, nullable=False)
    status_pedido = Column(String, nullable=False)
    status_ingresso = Column(String, nullable=False)

    lote = Column(String, nullable=False)
    valor_lote = Column(Float, nullable=False)
    categoria_preco = Column(String)

    canal_venda = Column(String, nullable=False)
    metodo_pagamento = Column(String, nullable=False)

    transferido = Column(String)
    aprovado = Column(String, nullable=False)