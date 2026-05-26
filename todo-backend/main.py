from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models.todo_model  # noqa: F401 — registers Todo with Base.metadata
from routers.todo_router import router as todo_router

app = FastAPI(title="Todo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)


app.include_router(todo_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
