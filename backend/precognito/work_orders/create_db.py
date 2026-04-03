from precognito.work_orders.database import engine
from precognito.work_orders.models import Base
from precognito.work_orders import models

Base.metadata.create_all(bind=engine)