from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from precognito.predictive.router import router as predictive_router

app = FastAPI(title="Precognito API")

# Configure CORS for Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predictive_router, prefix="/api/predictive")

@app.get("/")
def read_root():
    return {"message": "Welcome to Precognito Analytics Backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
