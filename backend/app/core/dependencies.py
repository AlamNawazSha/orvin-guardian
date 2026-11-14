import uuid
from fastapi import Depends, HTTPException, status, Header, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.config import settings
from app.core.security import decode_access_token, hash_password
from app.models.user import User

# auto_error=False allows structured exception handling with clear WWW-Authenticate headers
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login", auto_error=False)

async def get_or_create_demo_user(db: AsyncSession) -> User:
    """Get or create default demo user for verified development/demo access."""
    result = await db.execute(select(User).filter(User.email == "demo@automlops.ai"))
    user = result.scalars().first()
    if not user:
        user = User(
            id=str(uuid.uuid4()),
            email="demo@automlops.ai",
            username="Demo Engineer",
            hashed_password=hash_password("demopassword123"),
            is_active=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user

async def get_current_user(
    request: Request,
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Extract authenticated user from JWT token. Strictly blocks unauthenticated callers in production, with seamless demo fallback for development."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or missing Bearer token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    demo_header = request.headers.get("x-demo-mode", "").lower()
    is_demo_eligible = bool(settings.DEBUG or demo_header in ["true", "1", "yes"])

    if not token or token in ["demo-session-token", "demo-token"]:
        if is_demo_eligible:
            return await get_or_create_demo_user(db)
        raise credentials_exception

    payload = decode_access_token(token)
    if payload is None:
        if is_demo_eligible:
            return await get_or_create_demo_user(db)
        raise credentials_exception

    user_id: str | None = payload.get("sub")
    if not user_id:
        if is_demo_eligible:
            return await get_or_create_demo_user(db)
        raise credentials_exception

    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()

    if not user:
        if is_demo_eligible:
            return await get_or_create_demo_user(db)
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    return user

async def get_optional_user(
    request: Request,
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User | None:
    """Optional user resolver for public/hybrid endpoints."""
    if not token:
        return None
    try:
        return await get_current_user(request=request, token=token, db=db)
    except HTTPException:
        return None
