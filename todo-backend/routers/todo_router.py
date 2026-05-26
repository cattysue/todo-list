from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from core.database import get_db
from models.todo_model import Todo
from schemas.todo_schema import TodoCreate, TodoResponse, TodoUpdate

router = APIRouter(prefix="/todos", tags=["todos"])


@router.get("", response_model=list[TodoResponse])
def get_todos(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Todo)
    if status == "completed":
        query = query.filter(Todo.is_completed == True)  # noqa: E712
    elif status == "incomplete":
        query = query.filter(Todo.is_completed == False)  # noqa: E712
    return query.order_by(Todo.id).all()


@router.post("", response_model=TodoResponse, status_code=201)
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    db_todo = Todo(**todo.model_dump())
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo


@router.put("/{todo_id}", response_model=TodoResponse)
def update_todo(todo_id: int, todo: TodoUpdate, db: Session = Depends(get_db)):
    db_todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    for key, value in todo.model_dump().items():
        setattr(db_todo, key, value)
    db.commit()
    db.refresh(db_todo)
    return db_todo


@router.patch("/{todo_id}/toggle", response_model=TodoResponse)
def toggle_todo(todo_id: int, db: Session = Depends(get_db)):
    db_todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    db_todo.is_completed = not db_todo.is_completed
    db.commit()
    db.refresh(db_todo)
    return db_todo


@router.delete("/{todo_id}", status_code=204)
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    db_todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    db.delete(db_todo)
    db.commit()
    return Response(status_code=204)
