import datetime
import random
from typing import List, Optional
from .models import EngineRecommendationRow, EngineRecommendationReport, SystemHealthResponse, AuditLogEntry, AuditComplianceReport

from .dataset import MACHINE_PARTS_DB, LABOUR_MAPPING_DB, MECHANIC_DB

def fetch_rul_and_prob(machine_id: str, component_id: str) -> tuple[float, float]:
    """
    Mock function simulating the Anomaly and Predictive Modules.
    [PLACEHOLDER] - ACTUAL RUL AND ANOMALY METRICS WILL BE CALLED FROM HERE.
    Returns:
       RUL (Remaining Useful Life): Normalized 0.0 to 1.0 from predictive module
       Failure Probability: 0.0 to 1.0 from anomaly models
    """
    # Deterministic mock based on ids for consistent demonstration
    seed = int(hash(machine_id + component_id) % 100)
    random.seed(seed)
    
    rul = random.uniform(0.05, 0.95)
    # Failure probability is generally inversely proportional to RUL
    prob = 1.0 - rul + random.uniform(-0.1, 0.1)
    
    random.seed() # reset
    return round(max(0.01, rul), 2), round(max(0.0, min(1.0, prob)), 2)

class AdminReportingService:
    def __init__(self):
        pass

    def generate_recommendations(self, period: str, target_machine_id: Optional[str] = None) -> EngineRecommendationReport:
        """
        Runs the 6-Phase Recommendation Engine Logic.
        """
        rows = []
        
        parts_to_process = MACHINE_PARTS_DB
        if target_machine_id:
            parts_to_process = [p for p in parts_to_process if p["machine_id"] == target_machine_id]
            
        for part in parts_to_process:
            machine_id = part["machine_id"]
            component = part["name"]
            replacement_cost = float(part["replacement_cost"])
            repair_cost = float(part["repair_cost"])
            
            # PHASE 2: Data Merge Pipeline
            labour_data = LABOUR_MAPPING_DB.get(component, {"base_labour_cost": 100, "avg_repair_time": 2, "time_based_flag": False})
            
            # PHASE 5: Mechanic Assignment (Mapped to New T001-T020 Datasets)
            specialization_kw = "General Maintenance"
            if "Gearbox" in component:
                specialization_kw = "Gearbox & Transmission"
            elif "Rotor" in component or "Shaft" in component or "Bearing" in component:
                specialization_kw = "Rotating Equipment"
            elif "Pump" in component or "Valve" in component:
                specialization_kw = "Pumps & Valves"
            elif "Sensor" in component:
                specialization_kw = "Sensors & Calibration"
            elif "Coil" in component:
                specialization_kw = "Electrical Systems"
            elif "Seal" in component:
                specialization_kw = "Hydraulics"
            elif "Filtration" in component:
                specialization_kw = "General Maintenance"
                
            candidates = [m for m in MECHANIC_DB if m["specialization"] == specialization_kw and m["availability_status"] == "Available"]
            if not candidates:
                # Fallback to contract or general
                candidates = [m for m in MECHANIC_DB if (m["specialization"] == "General Maintenance" or m["employment_type"] == "Contract") and m["availability_status"] == "Available"]
            
            if candidates:
                mechanic = sorted(candidates, key=lambda x: x["per_hour_rate"])[0]
                assigned_mechanic_name = f"{mechanic['mechanic_id']} - {mechanic['name']} ({mechanic['skill_level']} {mechanic['specialization']})"
                mechanic_hourly = mechanic["per_hour_rate"]
                mechanic_job_rate = mechanic["per_job_rate"]
                mechanic_status = "Assigned"
            else:
                assigned_mechanic_name = "None Available"
                mechanic_hourly = 80.0 
                mechanic_job_rate = 300.0
                mechanic_status = "Delayed"
                mechanic = None
                
            # PHASE 3: Cost Engine (Labour Logic)
            if labour_data["time_based_flag"]:
                base_labour = mechanic_hourly * labour_data["avg_repair_time"]
            else:
                base_labour = mechanic_job_rate
                
            # Apply Real-World Multipliers
            skill_mult = 1.0
            if mechanic:
                if mechanic["skill_level"] == "Junior": 
                    skill_mult = 1.2
                elif mechanic["skill_level"] == "Senior": 
                    skill_mult = 0.9

            urgency_mult = random.choice([1.0, 1.2, 1.5]) 
            spare_availability_mult = random.choice([1.0, 1.2, 1.5])
            
            labour_cost = base_labour * skill_mult
            final_cost = (repair_cost + labour_cost) * urgency_mult * spare_availability_mult
            
            # Repair vs Replace Decision
            if final_cost < replacement_cost:
                decision = "Repair"
            else:
                decision = "Replace"
                # If replacing, recalculate final cost (usually flat cost + heavy labour)
                final_cost = replacement_cost + (labour_cost * 1.5)
                
            # PHASE 4: Recommendation Engine (CORE)
            rul, failure_probability = fetch_rul_and_prob(machine_id, part["component_id"])
            
            # RUL Logic Base
            if rul > 0.4:
                status = "Healthy"
            elif rul > 0.2:
                status = "Monitor"
            elif rul > 0.1:
                status = "Plan Maintenance"
            else:
                status = "Immediate Action"
                
            # Smart Overrides
            timing = "schedule"
            if failure_probability > 0.8:
                timing = "now"
                status = "Immediate Action (Override: High Risk)"
            
            if spare_availability_mult == 1.5: # Simulated out of stock
                timing = "delay_and_order"
                
            if urgency_mult > 1.2 and mechanic_status != "Delayed" and timing != "delay_and_order":
                timing = "delay_if_safe"
                
            if mechanic_status == "Delayed":
                timing = "delay_no_mechanic"
                
            # Final Recommendation Function
            explanation = ""
            if timing == "now":
                recommendation = f"Perform {decision} immediately."
                explanation = "Override: Critical RUL or High Failure Risk (>80%). Required to prevent breakdown."
            elif timing == "delay_and_order":
                recommendation = f"Delay & Order Spares for {decision}."
                explanation = f"{decision} delayed: Parts Out of Stock. Order dispatched."
            elif timing == "delay_if_safe":
                recommendation = f"Delay {decision} if safe."
                explanation = "High urgency multipliers increasing costs. Shift change recommended."
            elif timing == "delay_no_mechanic":
                recommendation = f"Delay {decision}. No tech available."
                explanation = f"{decision} delayed: No {specialization_kw} specialists available. Awaiting scheduling."
            else:
                recommendation = f"Schedule {decision}."
                explanation = f"Routine processing. RUL Status is {status}."
                
            # Append Row
            row = EngineRecommendationRow(
                machine_id=machine_id,
                component=component,
                rul=rul,
                failure_probability=failure_probability,
                repair_cost=round(repair_cost, 2),
                replacement_cost=round(replacement_cost, 2),
                labour_cost=round(labour_cost, 2),
                assigned_mechanic=assigned_mechanic_name,
                final_cost=round(final_cost, 2),
                decision=decision,
                recommendation=recommendation,
                explanation=explanation
            )
            rows.append(row)
            
        return EngineRecommendationReport(
            report_period=period,
            recommendations=rows
        )

    def get_system_health(self) -> SystemHealthResponse:
        """
        Retrieve current system health metrics.
        """
        return SystemHealthResponse(
            status="Healthy",
            uptime_seconds=random.randint(10000, 500000), 
            active_user_sessions=random.randint(5, 45),
            cpu_usage_percent=round(random.uniform(15.0, 55.0), 1),
            memory_usage_percent=round(random.uniform(40.0, 80.0), 1),
            last_check_timestamp=datetime.datetime.now(datetime.timezone.utc)
        )

    def generate_audit_report(self, start_date: datetime.datetime, end_date: datetime.datetime) -> AuditComplianceReport:
        """
        Retrieves user action logs recorded in the system.
        """
        mock_logs = [
            AuditLogEntry(
                log_id="LOG-4491",
                user_id="sanjay_lead",
                role="Maintenance Lead",
                action="Approved Work Order WO-102",
                target_resource="WorkOrder",
                timestamp=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=2),
                ip_address="192.168.1.105"
            ),
            AuditLogEntry(
                log_id="LOG-4492",
                user_id="karthik_admin",
                role="Admin",
                action="Changed Calibrations for Sensor-B2",
                target_resource="CalibrationSettings",
                timestamp=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1),
                ip_address="192.168.1.50"
            )
        ]
        
        return AuditComplianceReport(
            period_start=start_date,
            period_end=end_date,
            total_logs=len(mock_logs),
            unauthorized_attempts=0,
            logs=mock_logs
        )
