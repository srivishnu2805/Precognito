from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from precognito.work_orders.api import router as workorder_router

app = FastAPI()  

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workorder_router)