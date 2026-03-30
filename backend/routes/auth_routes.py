from fastapi import APIRouter, HTTPException, Header
from models.schemas import SignupRequest, LoginRequest, UserResponse
from supabase_client import supabase
from typing import Optional

router = APIRouter(prefix="/auth", tags=["auth"])


def _upsert_profile(user_id: str, email: str, name: str, role: str) -> None:
    supabase.table("profiles").upsert(
        {
            "id": user_id,
            "email": email,
            "name": name,
            "role": role,
        },
        on_conflict="id",
    ).execute()


def _is_email_already_registered_error(exc: Exception) -> bool:
    s = str(exc).lower()
    return (
        "already registered" in s
        or "already been registered" in s
        or "user already registered" in s
    )


@router.post("/signup")
async def signup(request: SignupRequest):
    email = request.email
    password = request.password
    auth_response = None

    try:
        auth_response = supabase.auth.sign_up(
            {
                "email": email,
                "password": password,
            }
        )
    except Exception as e:
        if _is_email_already_registered_error(e):
            try:
                auth_response = supabase.auth.sign_in_with_password(
                    {"email": email, "password": password}
                )
            except Exception:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "This email is already registered. "
                        "Try logging in. To fully reset, delete the user under "
                        "Supabase → Authentication → Users (clearing tables does not remove auth users)."
                    ),
                )
        else:
            raise HTTPException(status_code=400, detail=str(e))

    # Some Supabase configs return no user on duplicate without raising — recover via sign-in
    if not auth_response or not auth_response.user:
        try:
            auth_response = supabase.auth.sign_in_with_password(
                {"email": email, "password": password}
            )
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Signup failed. If the email exists, try logging in with the same password.",
            )

    if not auth_response.user:
        raise HTTPException(status_code=400, detail="Signup failed")

    try:
        _upsert_profile(
            auth_response.user.id,
            email,
            request.name,
            request.role,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {
        "message": "Signup successful",
        "user_id": auth_response.user.id,
        "email": auth_response.user.email,
    }

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
        # Return specific error messages
        error_message = str(e)
        if "Invalid login credentials" in error_message:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        elif "Email not confirmed" in error_message:
            raise HTTPException(status_code=401, detail="Please confirm your email address")
        elif "User not found" in error_message:
            raise HTTPException(status_code=401, detail="User not found")
        else:
            raise HTTPException(status_code=401, detail=error_message)

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
