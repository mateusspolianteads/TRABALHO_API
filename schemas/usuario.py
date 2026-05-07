from pydantic import BaseModel, EmailStr
from typing import Optional


class UsuarioCreate(BaseModel):
    nome: str
    cpf_cnpj: str
    email: EmailStr
    senha: str


class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    cpf_cnpj: Optional[str] = None
    email: Optional[str] = None
    senha: Optional[str] = None
