from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.student_routes import router as student_router
from routes.parent_routes import router as parent_router
from routes.login_routes import router as login_router


app = FastAPI(title="Parent & Student API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(student_router)
app.include_router(parent_router)
app.include_router(login_router) 

@app.get("/")
def root():
    return {"message": "API is running!"}
