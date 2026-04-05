"""
Authentication and Authorization dependencies and utilities.
"""

from datetime import datetime, timezone
from fastapi import Request, HTTPException, Depends
from typing import List
import asyncpg


async def get_db_pool(request: Request) -> asyncpg.Pool:
    """Dependency that returns the global database connection pool from the app state.

    Args:
        request (Request): The incoming FastAPI request.

    Returns:
        asyncpg.Pool: The database connection pool.
    """
    if not hasattr(request.app, "db_pool"):
        raise HTTPException(status_code=500, detail="Database pool not initialized")
    return request.app.db_pool


async def get_current_user(request: Request, pool: asyncpg.Pool = Depends(get_db_pool)):
    """Authenticates the user based on session tokens or Bearer tokens.

    Args:
        request (Request): The incoming FastAPI request.
        pool (asyncpg.Pool): Database connection pool dependency.

    Raises:
        HTTPException: If authentication fails or session is invalid/expired.

    Returns:
        asyncpg.Record: The authenticated user record.
    """
    session_token = request.cookies.get(
        "better-auth.session_token"
    ) or request.cookies.get("__better-auth-session-token")

    import logging

    logger = logging.getLogger(__name__)

    if not session_token:
        # Check Authorization header too
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]

    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Better Auth tokens are often composite (token.signature)
    # We only need the first part for the database lookup
    lookup_token = session_token.split(".")[0]

    async with pool.acquire() as conn:
        query = 'SELECT "userId", "expiresAt", token FROM session WHERE token = $1 OR id = $1'
        session = await conn.fetchrow(query, lookup_token)

        if not session:
            raise HTTPException(status_code=401, detail="Invalid session")

        # Robust expiry check
        expires_at = session["expiresAt"]
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at < datetime.now(timezone.utc):
            logger.warning(f"Session expired: {expires_at}")
            raise HTTPException(status_code=401, detail="Session expired")

        user = await conn.fetchrow(
            'SELECT * FROM "user" WHERE id = $1', session["userId"]
        )
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return user


class RoleChecker:
    """Dependency for performing Role-Based Access Control (RBAC).

    Attributes:
        allowed_roles (list[str]): List of roles permitted to access the resource.
    """

    def __init__(self, allowed_roles: List[str]):
        """Initializes the RoleChecker with allowed roles.

        Args:
            allowed_roles (list[str]): Roles that have access.
        """
        self.allowed_roles = allowed_roles

    def __call__(self, user=Depends(get_current_user)):
        """Check if the authenticated user has one of the allowed roles.

        Args:
            user (asyncpg.Record): The authenticated user.

        Raises:
            HTTPException: If the user's role is not authorized.

        Returns:
            asyncpg.Record: The authorized user record.
        """
        if user["role"] not in self.allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Role '{user['role']}' does not have permission to access this resource",
            )
        return user


# Role dependencies for easy reuse
admin_only = Depends(RoleChecker(["ADMIN"]))
manager_above = Depends(RoleChecker(["ADMIN", "MANAGER"]))
lead_above = Depends(RoleChecker(["ADMIN", "MANAGER", "OT_SPECIALIST"]))
store_manager_above = Depends(RoleChecker(["ADMIN", "STORE_MANAGER"]))
technician_above = Depends(
    RoleChecker(["ADMIN", "MANAGER", "OT_SPECIALIST", "TECHNICIAN"])
)
authenticated_user = Depends(get_current_user)
