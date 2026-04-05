"""
ML Model Drift Detection module.
Monitors performance of predictive models by comparing predictions with actual sensor outcomes.
"""
import logging
from datetime import datetime, timedelta, timezone
from ..ingestion.influx_client import INFLUX_BUCKET, INFLUX_ORG, query_api
from ..work_orders.database import SessionLocal
from ..work_orders.models import Audit

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def detect_drift():
    """Calculates Mean Absolute Error (MAE) for the predictive model.

    Compares historical predictions from InfluxDB with actual maintenance
    completion events from the PostgreSQL audit logs to monitor model drift.
    MAE is calculated based on the difference between predicted RUL and actual
    time to failure/maintenance.

    Returns:
        None. Logs drift summary and warnings if thresholds are exceeded.
    """
    logger.info("Running Real Model Drift Detection...")
    
    db = SessionLocal()
    try:
        # 1. Fetch recently completed work orders (Actual Events)
        # We assume completedAt is when the failure/maintenance actually occurred
        recent_events = db.query(Audit).filter(
            Audit.status == "COMPLETED",
            Audit.completedAt >= datetime.now(timezone.utc) - timedelta(days=30)
        ).all()
        
        if not recent_events:
            logger.info("No completed maintenance events in the last 30 days. Skipping drift calculation.")
            return

        total_error = 0.0
        match_count = 0
        
        for event in recent_events:
            # 2. Fetch predictions made for this asset BEFORE the event
            # We look for predictions made in the 24h window before completion
            asset_id = event.assetId
            actual_time = event.completedAt.replace(tzinfo=timezone.utc)
            
            # Query InfluxDB for predictions for this asset
            start_range = (actual_time - timedelta(days=1)).isoformat()
            stop_range = actual_time.isoformat()
            
            pred_query = f'''
                from(bucket: "{INFLUX_BUCKET}")
                |> range(start: {start_range}, stop: {stop_range})
                |> filter(fn: (r) => r["_measurement"] == "predictive_results")
                |> filter(fn: (r) => r["device_id"] == "{asset_id}")
                |> filter(fn: (r) => r["_field"] == "predicted_rul_hours")
                |> last()
            '''
            tables = query_api.query(pred_query, org=INFLUX_ORG)
            
            if tables and tables[0].records:
                record = tables[0].records[0]
                predicted_rul = record.get_value()
                pred_time = record.get_time().replace(tzinfo=timezone.utc)
                
                # Actual RUL at the time of prediction was (Actual Time - Prediction Time)
                actual_rul_hours = (actual_time - pred_time).total_seconds() / 3600.0
                
                error = abs(predicted_rul - actual_rul_hours)
                total_error += error
                match_count += 1
                
                logger.info(f"Asset {asset_id}: Predicted RUL={predicted_rul:.1f}h, Actual RUL={actual_rul_hours:.1f}h, Error={error:.1f}h")

        if match_count > 0:
            mae = total_error / match_count
            threshold = 24.0 # 24 hour error threshold
            
            logger.info(f"Drift Summary: MAE={mae:.2f}h over {match_count} events.")
            
            if mae > threshold:
                logger.warning(f"⚠️ MODEL DRIFT DETECTED: MAE is {mae:.2f}h, exceeding threshold of {threshold:.2f}h")
                logger.warning("Action Required: Retrain XGBoost model with recent failure data.")
            else:
                logger.info("Model performance is stable.")
        else:
            logger.info("No matching predictions found for recent maintenance events.")

    except Exception as e:
        logger.error(f"Error during drift detection: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    detect_drift()
