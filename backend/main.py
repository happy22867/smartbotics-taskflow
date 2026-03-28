from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth_routes import router as auth_router
from routes.task_routes import router as task_router

# redirect_slashes=False avoids POST /auth/signup → redirect → GET (405 Method Not Allowed) in some clients
app = FastAPI(title="Task Management API", version="1.0.0", redirect_slashes=False)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://smartbotics-taskflow-2tym.vercel.app", "https://smartbotics-taskflow-1.onrender.com"],  # Vite dev server + Vercel frontend + Backend self
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(task_router)

@app.get("/")
async def root():
    return {"message": "Task Management API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
