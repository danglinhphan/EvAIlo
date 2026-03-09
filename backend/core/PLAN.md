# Backend — `core/` Plan

## Purpose
Cross-cutting concerns: configuration, security, and dependency injection.

---

## Files

### `config.py` ← NEW
**Task**: Centralized settings loaded from `.env`

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "evailodb"
    DB_USER: str = "evailouser"
    DB_PASSWORD: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    class Config:
        env_file = ".env"

settings = Settings()
```

**Checklist**:
- [ ] Create file
- [ ] Add all DB fields
- [ ] Add JWT fields (SECRET_KEY, expiry)
- [ ] Import `settings` wherever hardcoded values currently exist

---

### `security.py` ← MODIFY
**Current issues**:
- Hardcoded `SECRET_KEY = "evAIlo-super-secret-key-change-in-production"` — security risk
- Hardcoded `ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24`

**Checklist**:
- [ ] Import `settings` from `core.config`
- [ ] Replace `SECRET_KEY` literal → `settings.SECRET_KEY`
- [ ] Replace `ACCESS_TOKEN_EXPIRE_MINUTES` literal → `settings.ACCESS_TOKEN_EXPIRE_MINUTES`
- [ ] Keep all crypto logic (bcrypt + JWT) as-is

---

### `deps.py` ← MODIFY
**Current issues**:
- `from data.mock import USERS_DB` — must be replaced with DB query

**Checklist**:
- [ ] Remove `USERS_DB` import
- [ ] Add `AsyncSession` dependency from `db.session.get_db`
- [ ] Rewrite `get_current_user()` to query `users` table by email
- [ ] Raise 401 if user not found in DB
- [ ] Ensure dependency works with `Depends(get_db)` injection chain
