CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    "userId" TEXT,
    action TEXT,
    resource TEXT,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS model_feedback (
    id SERIAL PRIMARY KEY,
    "anomalyId" TEXT,
    "deviceId" TEXT,
    "isReal" BOOLEAN,
    "userId" TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    "assetId" TEXT UNIQUE,
    "assetName" TEXT,
    "assetType" TEXT,
    manual TEXT,
    mttr TEXT
);

CREATE TABLE IF NOT EXISTS audits (
    id SERIAL PRIMARY KEY,
    "assetId" TEXT,
    status TEXT,
    remarks TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "assignedTo" TEXT,
    resolution TEXT,
    "partId" INTEGER,
    "quantityUsed" INTEGER DEFAULT 0,
    "actualCost" NUMERIC(10, 2) DEFAULT 0.00,
    "completedAt" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    "partName" TEXT NOT NULL,
    "partNumber" TEXT UNIQUE NOT NULL,
    quantity INTEGER DEFAULT 0,
    "minThreshold" INTEGER DEFAULT 5,
    "leadTimeDays" INTEGER DEFAULT 7,
    "costPerUnit" NUMERIC(10, 2) DEFAULT 0.00,
    category TEXT,
    "lastRestocked" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS part_reservations (
    id SERIAL PRIMARY KEY,
    "partId" INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
    "workOrderId" INTEGER,
    quantity INTEGER NOT NULL,
    status TEXT DEFAULT 'RESERVED',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roster (
    id SERIAL PRIMARY KEY,
    "userId" TEXT,
    status TEXT DEFAULT 'AVAILABLE',
    shift TEXT,
    skills TEXT,
    "lastAssigned" TIMESTAMP WITH TIME ZONE
);
