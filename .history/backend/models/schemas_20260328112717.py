from pydantic import BaseModel, field_validator
from typing import Optional

class SignupRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

class TaskCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: Optional[str] = None

class TaskUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    status: Optional[str] = None

class TaskCompleteRequest(BaseModel):
    status: str = "completed"

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str

class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    status: str
    assigned_to: Optional[str]
    created_by: str
    created_at: str
