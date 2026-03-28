from fastapi import APIRouter, HTTPException, Header
from models.schemas import SignupRequest, LoginRequest, UserResponse
from supabase_client import supabase
from typing import Optional

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup")
async def signup(request: SignupRequest):
    try:
        # Sign up user with Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Signup failed")
        
        # Create profile in database
        profile_response = supabase.table("profiles").insert({
            "id": auth_response.user.id,
            "email": request.email,
            "name": request.name,
            "role": request.role,
        }).execute()
        
        return {
            "message": "Signup successful",
            "user_id": auth_response.user.id,
            "email": auth_response.user.email
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(request: LoginRequest):
    try:
        # Sign in with Supabase Auth
        auth_response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password,
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Fetch user profile
        profile = supabase.table("profiles").select("*").eq("id", auth_response.user.id).single().execute()
        
        return {
            "message": "Login successful",
            "user": {
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "name": profile.data.get("name"),
                "role": profile.data.get("role")
            },
            "session": {
                "access_token": auth_response.session.access_token,
                "refresh_token": auth_response.session.refresh_token
            }
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Login failed")

@router.get("/me")
async def get_current_user(authorization: Optional[str] = Header(None)):
    try:
        if not authorization:
            raise HTTPException(status_code=401, detail="Missing authorization header")
        
        # Extract token from "Bearer <token>"
        token = authorization.replace("Bearer ", "")
        
        # Get user from token
        user = supabase.auth.get_user(token)
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Fetch profile
        profile = supabase.table("profiles").select("*").eq("id", user.user.id).single().execute()
        
        return {
            "id": user.user.id,
            "email": user.user.email,
            "name": profile.data.get("name"),
            "role": profile.data.get("role")
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Unauthorized")

@router.get("/employees")
async def get_employees(authorization: Optional[str] = Header(None)):
    try:
        if not authorization:
            raise HTTPException(status_code=401, detail="Missing authorization header")
        
        # We can just fetch all profiles with role="employee"
        response = supabase.table("profiles").select("id, name, email").eq("role", "employee").execute()
        return {"employees": response.data or []}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to fetch employees")
