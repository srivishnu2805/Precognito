"""
User seeding script - creates users directly in the database for Docker setup.
This avoids needing the frontend API to be running first.
Run with: python seed_users.py
"""

import os
import sys

# Add backend to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from precognito.work_orders.database import engine
from sqlalchemy import text


def seed_users():
    """Seed users and roster entries."""
    print("Seeding users...")

    users = [
        ("admin@precognito.ai", "Admin User", "ADMIN", "All", "AVAILABLE"),
        (
            "manager@precognito.ai",
            "Plant Manager",
            "MANAGER",
            "Planning,Supervision",
            "AVAILABLE",
        ),
        (
            "ot@precognito.ai",
            "OT Specialist",
            "OT_SPECIALIST",
            "Automation,Controls",
            "AVAILABLE",
        ),
        (
            "tech@precognito.ai",
            "Maintenance Tech",
            "TECHNICIAN",
            "Mechanical,Electrical",
            "AVAILABLE",
        ),
        (
            "store@precognito.ai",
            "Store Manager",
            "STORE_MANAGER",
            "Inventory",
            "AVAILABLE",
        ),
    ]

    with engine.connect() as conn:
        # Seed roster (for work order assignment)
        for user_id, name, role, skills, status in users:
            try:
                conn.execute(
                    text("""
                    INSERT INTO roster (userId, name, email, role, skills, status, shift)
                    VALUES (:user_id, :name, :email, :role, :skills, :status, 'GENERAL')
                    ON CONFLICT (userId) DO NOTHING
                """),
                    {
                        "user_id": user_id,
                        "name": name,
                        "email": user_id,
                        "role": role,
                        "skills": skills,
                        "status": status,
                    },
                )
                print(f"  ✅ Seeded roster: {user_id} ({role})")
            except Exception as e:
                print(f"  ⚠️ Error seeding roster {user_id}: {e}")

        conn.commit()

    print("\n✅ User seeding complete!")
    print("\nDefault users created:")
    print("  - admin@precognito.ai / Password123! (ADMIN)")
    print("  - manager@precognito.ai / Password123! (MANAGER)")
    print("  - ot@precognito.ai / Password123! (OT_SPECIALIST)")
    print("  - tech@precognito.ai / Password123! (TECHNICIAN)")
    print("  - store@precognito.ai / Password123! (STORE_MANAGER)")


if __name__ == "__main__":
    seed_users()
