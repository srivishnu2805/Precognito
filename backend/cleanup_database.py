#!/usr/bin/env python3
"""
Database cleanup script - cleans Postgres and InfluxDB data.
Run with: python cleanup_database.py
"""

import os
import sys
from datetime import datetime, timezone, timedelta

# Add backend to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from sqlalchemy import text
from precognito.work_orders.database import engine
from precognito.ingestion.influx_client import client, INFLUX_BUCKET, INFLUX_ORG


def cleanup_postgres():
    """Clean all tables in Postgres."""
    print("Cleaning Postgres database...")

    tables = [
        "model_feedback",
        "audit_log",
        "audits",
        "part_reservations",
        "inventory",
        "roster",
        "assets",
    ]

    with engine.connect() as conn:
        for table in tables:
            try:
                result = conn.execute(text(f'DELETE FROM "{table}"'))
                conn.commit()
                print(f"  Deleted {result.rowcount} rows from {table}")
            except Exception as e:
                print(f"  Warning: {table} - {e}")

    print("Postgres cleanup complete.\n")


def cleanup_influxdb():
    """Clean all measurements in InfluxDB using flux queries."""
    print("Cleaning InfluxDB...")

    try:
        # Use query API to delete data by running a dummy query that returns nothing
        # then we can use the delete API with proper predicates
        from influxdb_client import Point
        from influxdb_client.client.write_api import SYNCHRONOUS

        write_api = client.write_api(write_options=SYNCHRONOUS)

        # Get current time as stop, and 30 days ago as start
        stop = datetime.now(timezone.utc)
        start = stop - timedelta(days=30)

        # Try without predicate first (delete all in time range)
        for measurement in [
            "machine_telemetry",
            "anomaly_results",
            "predictive_results",
            "safety_alerts",
        ]:
            try:
                delete_api = client.delete_api()
                # Empty predicate deletes everything in time range
                delete_api.delete(
                    start=start.strftime("%Y-%m-%dT%H:%M:%SZ"),
                    stop=stop.strftime("%Y-%m-%dT%H:%M:%SZ"),
                    predicate=f'_measurement="{measurement}"',
                    bucket=INFLUX_BUCKET,
                    org=INFLUX_ORG,
                )
                print(f"  Deleted data from {measurement}")
            except Exception as e:
                print(f"  Warning: {measurement} - {e}")

        print("InfluxDB cleanup complete.\n")
    except Exception as e:
        print(f"  Error cleaning InfluxDB: {e}\n")


def main():
    print("=" * 50)
    print("Database Cleanup Script")
    print("=" * 50 + "\n")

    cleanup_postgres()
    cleanup_influxdb()

    print("=" * 50)
    print("All cleanup complete!")
    print("=" * 50)


if __name__ == "__main__":
    main()
