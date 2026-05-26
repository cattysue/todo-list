from datetime import date, datetime
from typing import Optional
from sqlalchemy import Boolean, Date, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column
from core.database import Base


class Todo(Base):
    __tablename__ = "todos"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    due_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    priority: Mapped[str] = mapped_column(String, default="medium", server_default="medium", nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
