from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from precognito.work_orders.api import router as workorder_router
from precognito.predictive.router import router as predictive_router

app = FastAPI(title="Precognito API")

# CORS (needed for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(workorder_router)
app.include_router(predictive_router, prefix="/api/predictive")

# Root API
@app.get("/")
def read_root():
    return {"message": "Welcome to Precognito Analytics Backend"}

# Run server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)