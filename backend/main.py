from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, courses, modules, assignments, analytics, discussions
from db.session import engine
from db.base import Base
import models.orm  # noqa: F401 — register ORM models with Base metadata


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables if they don't exist (dev convenience)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(title="EvAIlo LMS API", version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(courses.router, prefix="/api/courses", tags=["courses"])
app.include_router(modules.router, prefix="/api/modules", tags=["modules"])
app.include_router(assignments.router, prefix="/api/assignments", tags=["assignments"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(discussions.router, prefix="/api/discussions", tags=["discussions"])


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
