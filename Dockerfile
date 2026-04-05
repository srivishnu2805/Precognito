# Syntax=docker/dockerfile:1

# --- Base Backend Stage ---
FROM python:3.12-slim AS backend-base
WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uv/bin/
ENV PATH="/uv/bin:${PATH}"

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1
# Copy only dependency files first for caching
COPY pyproject.toml uv.lock ./
# Install dependencies
RUN uv sync --frozen --no-dev --no-install-project

# --- Backend Runtime Stage ---
FROM backend-base AS backend
WORKDIR /app
# Copy source code
COPY backend/ /app/backend/
COPY main.py /app/
# Re-sync to include the project itself
RUN uv sync --frozen --no-dev
# Set Python path to include the backend folder
ENV PYTHONPATH=/app/backend
EXPOSE 8000
CMD ["uv", "run", "python", "main.py"]

# --- Frontend Build Stage ---
FROM oven/bun:latest AS frontend-builder
WORKDIR /app/frontend
# Copy dependency files
COPY frontend/package.json frontend/bun.lock ./
# Install dependencies
RUN bun install --frozen-lockfile
# Copy source and build
COPY frontend/ .
RUN bun run build

# --- Frontend Runtime Stage ---
FROM oven/bun:latest AS frontend
WORKDIR /app/frontend
# Copy only necessary files from builder
COPY --from=frontend-builder /app/frontend/package.json /app/frontend/bun.lock ./
COPY --from=frontend-builder /app/frontend/.next ./.next
COPY --from=frontend-builder /app/frontend/public ./public
# Install production dependencies only
RUN bun install --production --frozen-lockfile

EXPOSE 3000
CMD ["bun", "run", "start"]
