from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, field_validator


class TodoCreate(BaseModel):
    title: str
    due_date: Optional[date] = None
    priority: Literal['low', 'medium', 'high'] = 'medium'

    @field_validator('title')
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('title cannot be empty')
        return v


class TodoUpdate(BaseModel):
    title: str
    due_date: Optional[date] = None
    priority: Literal['low', 'medium', 'high'] = 'medium'

    @field_validator('title')
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('title cannot be empty')
        return v


class TodoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    due_date: Optional[date] = None
    priority: str
    is_completed: bool
    created_at: datetime
