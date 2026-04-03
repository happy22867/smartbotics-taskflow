from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth_routes import router as auth_router
from routes.task_routes import router as task_router

# redirect_slashes=False avoids POST /auth/signup → redirect → GET (405 Method Not Allowed) in some clients
app = FastAPI(title="Task Management API", version="1.0.0", redirect_slashes=False)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://smartbotics-taskflow-xtf9-beta.vercel.app",
        "https://smartbotics-taskflow-xtf9-b8sgfkcym-saumya-gairolas-projects.vercel.app",
        "https://smartbotics-taskflow-cj8x.vercel.app",
        "https://smartbotics-taskflow-cj8x-9jaxjmldn-saumya-gairolas-projects.vercel.app",
        "https://smartbotics-taskflow-ly8l.vercel.app",
        "https://smartbotics-taskflow-ly8l-r945eoovd-saumya-gairolas-projects.vercel.app",
        "https://smartbotics-taskflow-etff.vercel.app",
        "https://smartbotics-taskflow-etff-doe5k0lss-saumya-gairolas-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
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
