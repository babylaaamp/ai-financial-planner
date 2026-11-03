import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
if not DATABASE_URL:
    if os.getenv("RENDER"):
        raise RuntimeError("DATABASE_URL is not set (Render > Environment)")
    DATABASE_URL = "sqlite:///./local.db"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Neon/Postgres ทั่วไปต้องการ sslmode=require บางกรณี SQLAlchemy จัดการให้อัตโนมัติผ่าน connection string
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
