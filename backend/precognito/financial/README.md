# Precognito - Module 5: Admin & Executive Reporting Engine

This folder acts as the **Executive Brain & Oversight Engine** for your entire Precognito IoT system. It is designed to take raw data and turn it into actionable money-saving business intelligence.

---

## 🚀 Core Capabilities

### 1. The 6-Phase Recommendation & Cost Engine (`/recommendations`)
Instead of just telling an admin "Your machine is failing", this engine:
- Evaluates the **Remaining Useful Life (RUL)** and combined risk of failure.
- Computes dynamic **Labour Costs** based on the specific specialized skills required.
- Applies real-world logistics multipliers (e.g., parts out of stock, high-urgency penalties).
- Automatically decides if it's cheaper to **Repair** or completely **Replace** the part, assigns the exact available mechanic, and provides a clear text **Explanation**.

### 2. System Health Monitoring (`/health`)
A live dashboard backend that monitors the overall status of the IoT application infrastructure. It tracks:
- Global Uptime and "Healthy/Degraded" status.
- Live resource consumption (System CPU and Memory Usage Percentages).
- Number of active user sessions.

### 3. Audit & Compliance Logs (`/audit`)
A security and accountability capability critical for industrial environments:
- Tracks the specific User, their Role, and their IP Address.
- Records critical actions (e.g., *Approved Work Order WO-102*).
- Aggregates these actions into a compliance report over a given date range.

---

## 📂 Folder Structure

- **`routes.py`**: Contains the FastAPI router and endpoints (e.g., `GET /admin-reporting/recommendations`).
- **`services.py`**: The core execution hub containing the `AdminReportingService`. It houses the robust 6-Phase logic engine.
- **`models.py`**: Pydantic models for strict API response formatting (e.g., `EngineRecommendationReport`, `EngineRecommendationRow`).
- **`dataset.py`**: Contains the local static databases (`MACHINE_PARTS_DB`, `LABOUR_MAPPING_DB`, and `MECHANIC_DB`) used to simulate the actual company databases.
- **`FRONTEND_INTEGRATION.md`**: Guide for frontend developers on how to render UI components (like DataTables and KPIs) using the data from this module.

---

## ⚙️ The 6-Phase Recommendation Engine

Whenever the `/recommendations` API is called, `services.py` executes the following sequential logic pipeline across all machine components:

### Phase 1: Database Extraction
Extracts parameters from `dataset.py` such as the core component data (like replacement and baseline repair costs).

### Phase 2: Action Merging
Cross-references the specific component with `LABOUR_MAPPING_DB` to determine if fixing this component is a *Time-Based* job (charged hourly) or a flat *Job-Based* fee. 

### Phase 5: Mechanic Assignment (Runs before cost modeling for accuracy)
Evaluates the component to determine specialization required (e.g., "Pumps & Valves" or "Rotating Equipment").
- Checks `MECHANIC_DB` for available technicians matching the skill.
- Intelligently assigns the most cost-effective technician available.
- If no specialist is available, attempts to fallback to a General contractor, otherwise flags the job status as **Delayed**.

### Phase 3: Cost Engine
Calculates the dynamic cost of action using real-world unpredictability:
- **Base Labour:** Extracts the hourly or job rate from the actually assigned mechanic.
- **Skill Multipliers:** A Junior mechanic might increase the cost by 20% (due to slower work or errors), while a Senior might decrease the base cost expectation.
- **Urgency & Availability Multipliers:** Adds randomness (multipliers up to 1.5x) to simulate real-world logistics (e.g., needing to overnight a part).
- **Repair vs Replace Threshold:** Compares the final simulated Repair Cost against a total Replacement Cost.

### Phase 4: Recommendation Engine (Predictive Core)
Mock-integrates with the **RUL (Predictive inference)** and **Anomaly Modules**.
- Converts standard Remaining Useful Life (RUL) limits to actionable status (Healthy, Monitor, Plan, Immediate).
- **Smart Overrides:** If the external Anomaly score dictates a Failure Probability > 80%, the system overrides all cost logic and issues an **Immediate Action** flag. Additionally overrides if parts are out of stock.

### Phase 6: Engine Output Generation
Transforms all the generated metrics, exact costs, matched mechanic details, and intelligent decision explanations into the `EngineRecommendationRow` Model. 

This model enforces a strict, massive array mapping containing fields like `RUL`, `failure_probability`, `decision`, and a human-readable `explanation` string, returning it seamlessly as JSON for the React Datatables.
