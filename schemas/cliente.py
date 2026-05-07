from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional

class ClienteBase(BaseModel):
    nome: str
    data_nascimento: date
    cpf: str
    email: EmailStr
    telefone: str
    
class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[str] = None
    telefoe: Optional[str] = None
    
class ClienteResponse(ClienteBase):
    id: int
    
    class Config:
        from_attributes = True