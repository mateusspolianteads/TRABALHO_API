from pydantic import BaseModel
from typing import Optional

class CategoriaBase(BaseModel):
    nome: str


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(BaseModel):
    nome: Optional[str] = None


class Categoria(CategoriaBase):
    id: int

    class Config:
        from_attributes = True