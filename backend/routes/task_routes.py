from fastapi import APIRouter, HTTPException, Header
from models.schemas import TaskCreateRequest, TaskUpdateRequest, TaskCompleteRequest
from supabase_client import supabase
from typing import Optional
from datetime import datetime, timezone

router = APIRouter(prefix="/tasks", tags=["tasks"])

def get_user_from_token(authorization: Optional[str]):
    """Extract user from authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    token = authorization.replace("Bearer ", "")
    user = supabase.auth.get_user(token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return user.user

@router.post("/create")
def create_task(request: TaskCreateRequest, authorization: Optional[str] = Header(None)):
    try:
        user = get_user_from_token(authorization)
        
        task_data = {
            "title": request.title,
            "description": request.description,
            "assigned_to": request.assigned_to or None,
            "created_by": user.id,
            "status": "pending",
            "updated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        }
        
        response = supabase.table("tasks").insert(task_data).execute()
        
        return {
            "message": "Task created successfully",
            "task": response.data[0] if response.data else task_data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/all")
def get_all_tasks(authorization: Optional[str] = Header(None)):
    try:
        user = get_user_from_token(authorization)
        
        response = supabase.table("tasks").select("*").order("created_at", desc=True).execute()
        
        return {
            "tasks": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/my")
def get_my_tasks(authorization: Optional[str] = Header(None)):
    try:
        user = get_user_from_token(authorization)
        
        response = supabase.table("tasks").select("*").eq("assigned_to", user.id).order("created_at", desc=True).execute()
        
        return {
            "tasks": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{task_id}/complete")
def complete_task(task_id: str, request: TaskCompleteRequest, authorization: Optional[str] = Header(None)):
    try:
        user = get_user_from_token(authorization)
        
        # Get task details to credit the assigned user
        task_response = supabase.table("tasks").select("assigned_to").eq("id", task_id).execute()
        task_data = task_response.data[0] if task_response.data else {}
        
        # Credit the assignee in history, otherwise credit the user who clicked complete
        completed_by = task_data.get("assigned_to") or user.id
        
        # Update task status
        now_iso = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        update_response = supabase.table("tasks").update({
            "status": "completed",
            "updated_at": now_iso,
            "completed_at": now_iso
        }).eq("id", task_id).execute()
        
        # Record in task history
        history_data = {
            "task_id": task_id,
            "completed_by": completed_by,
            "completed_at": now_iso,
        }
        
        supabase.table("task_history").insert(history_data).execute()
        
        return {
            "message": "Task completed successfully",
            "task": update_response.data[0] if update_response.data else {},
            "completed_at": now_iso
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/history")
def get_task_history(authorization: Optional[str] = Header(None)):
    try:
        user = get_user_from_token(authorization)
        
        # Get history
        history_response = supabase.table("task_history").select("*").order("completed_at", desc=True).execute()
        
        task_ids = [h["task_id"] for h in history_response.data]
        
        if not task_ids:
            return {"history": []}
        
        # Get task details
        tasks_response = supabase.table("tasks").select("*").in_("id", task_ids).execute()
        
        # Get profile details
        profile_ids = list(set([h["completed_by"] for h in history_response.data]))
        profiles_response = supabase.table("profiles").select("*").in_("id", profile_ids).execute()
        
        # Build maps
        tasks_map = {t["id"]: t for t in tasks_response.data}
        profiles_map = {p["id"]: p for p in profiles_response.data}
        
        # Enrich history
        enriched_history = []
        for h in history_response.data:
            enriched_history.append({
                **h,
                "task": tasks_map.get(h["task_id"]),
                "profile": profiles_map.get(h["completed_by"])
            })
        
        return {
            "history": enriched_history
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{task_id}")
def update_task(task_id: str, request: TaskUpdateRequest, authorization: Optional[str] = Header(None)):
    try:
        user = get_user_from_token(authorization)
        
        update_data = {}
        if request.title:
            update_data["title"] = request.title
        if request.description is not None:
            update_data["description"] = request.description
        if request.assigned_to is not None:
            update_data["assigned_to"] = request.assigned_to or None
        if request.status:
            update_data["status"] = request.status
            if request.status == "completed":
                update_data["completed_at"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        
        # Add updated_at timestamp when task is modified
        if update_data:
            update_data["updated_at"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        
        response = supabase.table("tasks").update(update_data).eq("id", task_id).execute()
        
        # Root level fix: If status is updated to completed, record in history
        if request.status == "completed":
            # Get task details to credit the assigned user
            task_response = supabase.table("tasks").select("assigned_to").eq("id", task_id).execute()
            task_info = task_response.data[0] if task_response.data else {}
            
            # Credit the assignee, otherwise the current user
            completed_by = task_info.get("assigned_to") or user.id
            
            # Record in task history
            history_data = {
                "task_id": task_id,
                "completed_by": completed_by,
                "completed_at": update_data.get("completed_at", update_data["updated_at"]),
            }
            
            # Check if history already exists for this completion
            history_check = supabase.table("task_history").select("id").eq("task_id", task_id).execute()
            if not history_check.data:
                supabase.table("task_history").insert(history_data).execute()
        
        return {
            "message": "Task updated successfully",
            "task": response.data[0] if response.data else {}
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{task_id}")
def delete_task(task_id: str, authorization: Optional[str] = Header(None)):
    try:
        user = get_user_from_token(authorization)
        
        supabase.table("tasks").delete().eq("id", task_id).execute()
        
        return {
            "message": "Task deleted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
