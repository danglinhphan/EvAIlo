from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# NOTE: ORM models are NOT imported here to avoid circular imports.
# Alembic env.py imports them explicitly.
