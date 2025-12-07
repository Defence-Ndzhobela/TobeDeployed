from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.student_routes import router as student_router
from routes.parent_routes import router as parent_router
from routes.auth_routes import router as auth_router
from routes.declaration_routes import router as declaration_router
from routes.school_fees_routes import router as school_fees_router
from routes.user_routes import router as user_router


app = FastAPI(title="Parent Re-Registration API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(student_router)
app.include_router(parent_router)
app.include_router(auth_router)  # Authentication routes
app.include_router(declaration_router)  # Declaration routes
app.include_router(school_fees_router)  # School fees routes
app.include_router(user_router)  # User information routes

@app.get("/")
def root():
    return {"message": "Parent Re-Registration API is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
