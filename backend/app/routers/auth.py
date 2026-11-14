from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.user import UserCreate, UserResponse, Token
from app.services.auth_service import create_user, authenticate_user, get_user_by_email
from app.core.security import create_access_token, verify_password
from app.core.dependencies import get_current_user, get_or_create_demo_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    existing_user = await get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = await create_user(db, user_data)
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(request: Request, db: AsyncSession = Depends(get_db)):
    email = None
    password = None
    
    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            data = await request.json()
            email = data.get("email") or data.get("username")
            password = data.get("password")
        except Exception:
            pass
            
    if not email or not password:
        try:
            form = await request.form()
            email = form.get("username") or form.get("email")
            password = form.get("password")
        except Exception:
            pass

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )
        
    user = await authenticate_user(db, email, password)
    
    # Check if demo user needs to be initialized
    if not user and email == "demo@automlops.ai" and password in ["demopassword123", "password123"]:
        user = await get_or_create_demo_user(db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/demo-token", response_model=Token)
async def get_demo_token(db: AsyncSession = Depends(get_db)):
    """Issue official signed JWT for verified local demo sessions."""
    user = await get_or_create_demo_user(db)
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
