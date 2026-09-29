"""Password hashing (pwdlib/Argon2) and JWT helpers."""

from datetime import UTC, datetime, timedelta

import jwt
from pwdlib import PasswordHash

from app.config import settings

# ── Password hashing ────────────────────────────────────

pwd_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """Return an Argon2id hash of *password*."""
    return pwd_hash.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Check *plain* against *hashed*. Returns ``True`` on match."""
    return pwd_hash.verify(plain, hashed)


# ── JWT tokens ──────────────────────────────────────────


def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None,
) -> str:
    """Create a signed JWT containing *data*."""
    to_encode = data.copy()
    expire = datetime.now(UTC) + (
        expires_delta
        or timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_access_token(token: str) -> dict:
    """Decode and verify a JWT. Raises ``jwt.PyJWTError`` on failure."""
    return jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )
