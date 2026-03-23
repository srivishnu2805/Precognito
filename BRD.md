**Document Control**

> **Team Name:** Story Point
>
> **Document Version:** 0.9
>
> **Status:** Draft (WIP)

**  **

**Table of Contents**

| **Section** |            **Topic**             | **Page No.** |
|:-----------:|:--------------------------------:|:------------:|
|    **1**    |        Executive Summary         |      4       |
|    **2**    |          Project Vision          |      4       |
|    **3**    |         Project Mission          |      4       |
|    **4**    |        Project Objectives        |      5       |
|    **5**    |   Current System (As Is State)   |      6       |
|    **6**    | Challenges in the Current System |      7       |
|    **7**    |  Proposed Solution (High Level)  |      8       |
|    **8**    |             Mind Map             |      8       |
|    **9**    |       Competitor Analysis        |      9       |
|   **10**    |          SWOT Analysis           |      9       |
|   **11**    |          Project Scope           |      10      |
|   **12**    |        Stakeholder Matrix        |      12      |
|   **13**    |      Team Members & Modules      |      13      |
|   **14**    |          User Personas           |      13      |
|   **15**    |           User Stories           |      17      |
|   **16**    |           User Journey           |              |
|   **17**    |     Functional Requirements      |      20      |
|   **18**    |   Non-Functional Requirements    |      23      |
|   **19**    |  Risks & Mitigation Strategies   |      23      |
|   **20**    |        High Level Design         |      24      |
|   **21**    |         Low Level Design         |      25      |
|   **22**    |           UML Diagrams           |      26      |
|   **23**    |       Proposed Tech Stack        |      30      |
|   **24**    |      Proposed Architecture       |      31      |
|   **25**    |         Testing Strategy         |      32      |
|   **26**    |   Deliverables and Milestones    |      45      |
|   **27**    |         Release Timeline         |      46      |
|   **28**    |         Success Criteria         |      46      |
|   **29**    |   Assumptions and Constraints    |      46      |
|   **30**    |       Approval & Sign-Off        |      47      |
|   **31**    |         Version History          |      48      |
|   **32**    |  Appendix: Glossary & Acronyms   |      49      |

**  **

**1. Executive Summary**

This project aims to develop an IoT-enabled Predictive Maintenance
System designed for manufacturing environments. The system automates the
process of monitoring machine health, detecting early-stage anomalies,
and predicting potential equipment failures using AI-driven analytics.

The solution replaces reactive and manual maintenance practices—which
often lead to unexpected breakdowns and production downtime—with a
proactive and data-driven strategy supported by real-time sensor
monitoring.

**Problem Statement:** Manufacturing industries face significant
production delays and financial losses due to unexpected machinery
breakdowns and inefficient manual maintenance scheduling. There is a
need for an IoT-enabled predictive maintenance system capable of
monitoring machine parameters, detecting anomalies, and predicting
potential failures, thereby optimizing maintenance cycles and reducing
downtime.

**2. Project Vision**

To revolutionize the manufacturing floor by eliminating unplanned
downtime and creating a "zero-breakdown" ecosystem through intelligent,
real-time machine health monitoring.

**3. Project Mission**

To deliver a cost-effective, accessible, and robust predictive
maintenance solution that empowers manufacturers of all sizes to
transition from reactive repairs to data-driven proactive maintenance,
thereby maximizing operational efficiency and asset longevity.

**4. Project Objectives**

- Monitor real-time machine parameters (vibration, temperature) using
  IoT sensors.

- Detect anomalies automatically using baseline comparison and DSP
  filters.

- Predict Remaining Useful Life (RUL) of critical components using AI
  models.

- Transition from reactive to predictive maintenance to minimize
  downtime.

- Ensure data accuracy by eliminating manual error-prone logging.

- Provide centralized dashboards for technicians, maintenance leads, and
  managers.

- Optimize maintenance schedules based on severity, priority, and
  availability.

- Generate financial justification reports by comparing cost of inaction
  vs. cost of repair.

- Provide remote monitoring capability for 24/7 visibility into machine
  health.

**5. Current System (As Is State)**

Currently, the maintenance process is largely **Reactive** or
**Preventive (Time-Based)**:

- **Reactive:** Machines are run until failure. Repairs are initiated
  only after a breakdown occurs, leading to panic, high emergency repair
  costs, and significant production halts.

- **Preventive:** Maintenance is performed on a fixed schedule (e.g.,
  every month) regardless of the machine's actual condition. This leads
  to unnecessary part replacements and labor costs, while still missing
  random failures that occur between intervals.

Data collection is manual, consisting of paper logs or basic
spreadsheets filled out by technicians during shift changes.

**6. Challenges in the Current System**

- **Unexpected Downtime:** Breakdowns occur without warning, causing
  cascading delays in production schedules.

- **Inefficiency:** Manual inspections are prone to human error and
  inconsistency.

- **Data Silos:** Maintenance history is trapped in paper logs, making
  it impossible to analyze long-term trends or train predictive models.

- **Blind Spots:** There is no real-time visibility into machine health;
  managers only know a machine is down when production stops.

- **Subjective Decision Making:** Maintenance actions are based on "gut
  feeling" rather than quantifiable data.

**7. Proposed Solution (High Level)**

The proposed solution is a cyber-physical system integrating IoT
sensors, edge computing, and cloud-based analytics.

- **IoT Layer:** Sensors (Vibration, Temperature) attached to motors and
  critical components collect raw data.

- **Edge Layer:** Microcontrollers (ESP32/RPi) perform **Edge Feature Extraction (FFT/RMS)** to compress high-frequency data (1kHz) into actionable metadata, then transmit it securely via MQTT.

- **Cloud/Server Layer:** A central server ingests the stream, runs
  anomaly detection algorithms, and executes predictive models (RUL
  estimation).

- **Application Layer:** A web-based dashboard visualizes machine
  health, alerts staff of critical issues, and recommends maintenance
  work orders.

**8. Mind Map**

![](./assets/media/image1.jpeg)

**9. Competitor Analysis**

| **Feature** | **Traditional Manual Maint.** | **Commercial SCADA Systems** | **Amazon Monitron** | **Proposed Solution** |
|----|----|----|----|----|
| **Cost** | Low (Initial) / High (Long Term) | Very High (\$\$\$\$) | High (HW + Subscription) | **Moderate / Affordable** |
| **Real-time Monitoring** | No | Yes | Yes | **Yes** |
| **Predictive Capability** | None | Limited (Rule-based) | Yes (ML-driven) | **Advanced (AI/ML Driven)** |
| **Deployment Complexity** | None | High (Requires Specialists) | Low (Plug & Play) | **Low (Plug & Play modules)** |
| **Customization** | N/A | Low (Vendor Lock-in) | Low (Closed Ecosystem) | **High (Open Architecture)** |

**10. SWOT Analysis**

**Strengths**

- Real-time data acquisition and analysis.

- Proactive alerting significantly reduces downtime.

- User-friendly dashboard for non-technical staff.

- Low-cost hardware implementation compared to SCADA.

**Weaknesses**

- Dependence on consistent network connectivity for real-time updates.

- Initial requirement for historical data to train accurate ML models.

- Hardware durability challenges in extreme industrial environments
  (dust/heat).

**Opportunities**

- High demand for Industry 4.0 solutions in Small and Medium Enterprises
  (SMEs).

- Potential to expand features into energy monitoring and efficiency
  analysis.

- Scalability to multi-factory deployments and fleet management.

**Threats**

- Rapidly changing sensor technology making hardware obsolete.

- Security vulnerabilities inherent in IoT devices.

- Resistance to change from traditional maintenance staff accustomed to
  manual methods.

**11. Project Scope**

**11.1 In-Scope (Phase 1)**

- IoT sensor data acquisition using vibration and temperature sensors
  (e.g., MEMS accelerometers, thermocouples).

- **Edge Layer Feature Extraction:** Processing high-frequency signals at the source to minimize network congestion.

- Edge device integration using MQTT/Modbus for real-time telemetry.

- Real-time anomaly detection using DSP-based feature extraction.

- Predictive inference using machine learning models for RUL prediction.

- Automated work order recommendation and maintenance scheduling.

- Cost estimation module comparing downtime cost vs. repair cost.

- Web-based dashboard for machine status, alerts, and decision support.

- Role-based access for Admin, Maintenance Lead, and Technician.

- Alerts/notifications (SMS/Email) for critical machine conditions.

**11.2 Out-of-Scope (Future Phases)**

- Automated machine shutdown or actuation control.

- Robotic or automated physical repair execution.

- AR/VR interfaces for technician training.

- Multi-factory deployment and fleet-wide analytics.

**11.3 Exclusions**

- Integration with legacy PLCs (pre-2000) that lack standard industrial communication ports (RS232/485 or Ethernet).

- Hardware design of custom sensors (COTS sensors will be used).

- Legal liability for machine failures that occur despite system
  predictions (the system is decision-support, not fail-safe).

**12. Stakeholder Matrix**

| **Stakeholder / Persona** | **Organizational Role** | **System Access Level** | **Key Expectations** |
|----|----|----|----|
| **Anita (Plant Manager)** | Project Sponsor / Business Owner | **Executive (View-Only)** | High-level ROI reports, OEE improvements, and reduced annual maintenance budget. |
| **Sanjay (Reliability Analyst)** | Maintenance Lead / Strategy | **Lead / Admin** | Early warning signs, accurate RUL predictions, and data-backed insights for planning. |
| **Arjun (Monitor Tech)** | Control Room / OT Operator | **OT Specialist** | Continuous, reliable sensor readings and distinguishing between machine faults and sensor glitches. |
| **Raj (Field Technician)** | Maintenance Execution | **Technician** | Clear instructions via mobile, digital checklists, and lists of required spare parts. |
| **Vikram (Store Manager)** | Procurement & Supply Chain | **Reporting / Inventory** | "Just-in-Time" inventory levels and automated purchase orders based on wear forecasts. |
| **Karthik (IT/OT Admin)** | System Admin / Security | **Superuser (Admin)** | Secure network traffic (TLS), RBAC management, and 24/7 server/data availability. |
| **Professor / Guide** | Project Supervisor | **Auditor (View-Only)** | Timely milestones, functional prototype, and high-quality technical documentation. |
| **IT/OT Security Officer** | Compliance / Risk | **Auditor (View-Only)** | Zero interference with existing PLCs and strictly encrypted IoT data streams. |
| **Finance / Audit Team** | Financial Verification | **Reporting (View-Only)** | Validation of "Cost of Inaction" formulas and verification of quarterly cost savings. |
| **EHS Officer** | Environmental Health & Safety | **Safety Auditor** | Ensuring IoT hardware (sensors/edge devices) meets factory safety standards and fire codes. |

**13. Team Members & Modules**

| **Name**           | **Roll Number**  | **Module**                            |
|--------------------|------------------|---------------------------------------|
| **Elaina H**       | CH.SC.U4CSE23215 | IoT Sensor Data Acquisition           |
| **Pavan Aditya S** | CH.SC.U4CSE23247 | Anomaly Detection Engine              |
| **Srivishnu T**    | CH.SC.U4CSE23249 | Predictive Inference (RUL Estimation) |
| **Elakkiya S**     | CH.SC.U4CSE23216 | Maintenance Scheduling & Work Orders  |
| **Yatin Ch**       | CH.SC.U4CSE23210 | Cost Estimation & Financial Analysis  |
| **Aryan M**        | CH.SC.U4CSE23207 | Dashboard, Alerts & Reporting         |

**14. User Personas**

### **Persona 1: Reliability Analyst**

Name: Sanjay

Role: He is a 30-year-old Reliability Analyst in the plant.

Daily work:

Reviews machine logs, tracks health trends across the fleet, and
supports maintenance planning with long-term data analysis.

Goals:

- Detect early warning signs weeks before a breakdown.

- Give clear, data-backed insights to management.

- Help avoid emergency maintenance situations by planning ahead.

Frustrations:

- Data scattered across different Excel sheets and legacy tools.

- No clear estimate of *when* a machine will fail (RUL).

- Extra pressure when unexpected failures stop production.

How he uses the system:  
Checks the "Predictive Insights" tab, reviews RUL predictions, and
creates maintenance requests for the upcoming week.  
Devices:  
Laptop (Desktop Web App).  
Scenario:  
The system predicts that Compressor B is likely to fail within 200
hours. Sanjay informs the team, plans maintenance for the weekend, and
prevents unexpected downtime on Tuesday.

### **Persona 2: Sensor Monitoring Technician**

Name: Arjun

Role: He is a 29-year-old floor technician with 5 years of industrial
experience working in the control room.

Daily work:

Monitors machine health through the system’s sensor data; ensures that
sensor readings are accurate, reliable, and ready for downstream
analysis.

Goals:

- Needs continuous, reliable machine sensor readings (vibration,
  temperature, pressure).

- Wants to distinguish between a machine fault and a sensor glitch.

- Wants data presented clearly to quickly identify problem areas.

Frustrations:

- Sensor data that is missing or "flatlining" causing false alarms.

- Lack of timestamping makes it difficult to trace data.

- Panic from management over "ghost alerts" caused by bad wiring.

How he uses the system:  
Watches the Live Dashboard. If a sensor alerts, he validates it. If it's
a sensor error, he flags it for calibration. If it's real, he escalates
to Sanjay.

Devices:  
Tablet or Multi-monitor Desktop setup.

Scenario:  
When a machine starts showing unusual vibration patterns, Arjun verifies
the reading via the dashboard, confirms the sensor is connected
properly, and validates the alert so the model can process it.

### **Persona 3: Maintenance Technician**

Name: Raj

Role: He is a 32-year-old floor technician with 5 years of industrial
experience.

Daily work:

Performs physical machine inspections and executes maintenance work
orders given by the system.

Goals:

- Needs clear instructions (What tool? What part?) before arriving at
  the machine.

- Wants to complete repairs efficiently without running back and forth
  to the store.

Frustrations:

- Sudden machine failures increase stress.

- Arriving at a job site only to realize he doesn't have the right spare
  part.

- Paperwork and manual data entry after a shift.

How he uses the system:  
Receives push notifications on his phone, checks the digital checklist,
and scans a QR code to close the ticket.

Devices:  
Mobile Phone (Ruggedized).

Scenario:  
When alerted in advance of a motor failure, he checks the app, sees
exactly which belt is needed, picks it up from the store, and completes
the maintenance in record time.

### **Persona 4: Inventory & Store Manager**

Name: Vikram

Role: He is a 45-year-old Store Manager responsible for supply chain and
spare parts.

Daily work:

Manages inventory levels, orders spare parts, and issues materials to
technicians.

Goals:

- Maintain "Just-in-Time" inventory (no shortages, no overstocking).

- Automate the purchasing process based on actual machine needs.

Frustrations:

- Paying for express shipping when a part is needed urgently.

- Technicians get upset at him when parts are out of stock.

- Dead stock (parts buying dust) taking up warehouse space.

How he uses the system:  
Checks the "Parts Forecast" report. If the system predicts high wear on
bearings, he approves a purchase order automatically generated by the
system.  
Devices:  
Desktop PC.  
Scenario:  
The system flags that 3 machines will need new filters next month.
Vikram receives an alert, checks stock and orders the filters today, so
they arrive before Raj needs them.

### **Persona 5: Plant Manager**

Name: Anita

Role: She is a 50-year-old Plant Manager focusing on operations and
budget.

Daily work:

Reviews high-level reports, manages the plant budget, and reports to
stakeholders/board members.

Goals:

- Maximize Overall Equipment Effectiveness (OEE).

- Minimize the annual maintenance budget.

- Justify the ROI of the predictive maintenance software.

Frustrations:

- Unexplained production delays causing missed delivery dates.

- High overtime costs for emergency repairs done at night.

How she uses the system:  
Views the Executive Dashboard to see "Downtime Avoided" and "Cost
Savings." She does not look at raw sensor graphs.  
Devices:  
Laptop or iPad.

Scenario:  
At the quarterly review, she presents a chart from the system showing
that unplanned downtime dropped by 15% since installing the software,
justifying the cost.

### **Persona 6: System Administrator**

Name: Karthik

Role: He is a 28-year-old IT Systems Administrator.

Daily work:

Manages user accounts, ensures server uptime, and handles data security.

Goals:

- Ensure the platform is secure and accessible 24/7.

- Manage user roles so unauthorized people don't delete data.

Frustrations:

- Users forgetting passwords.

- Accidental data deletion by non-admin staff.

Server outages causing gaps in sensor data.  
How he uses the system:  
Uses the Admin Panel to create users, assign roles (e.g., giving "Read
Only" access to interns), and view audit logs.  
Devices:  
Desktop Workstation.  
Scenario:  
A new technician is hired. Karthik creates their account, assigns them
the "Technician" role, and ensures they have access to the mobile app
but not the deletion settings.

**15. User Stories**

> *Note: Story Points (SP) were estimated using **Planning Poker (Campee)** following the Fibonacci sequence (1, 2, 3, 5, 8, 13) to represent technical complexity, effort, and risk.*

### **Module 1: IoT Data & Monitoring Dashboard**

| **User Persona** | **ID** | **User Story** | **Acceptance Criteria** | **SP** |
|----|----|----|----|----|
| **Arjun** (OT Specialist) | **US-1.1** | As Arjun, I want the **Asset Health Dashboard** to visualize high-frequency vibration data through an **FFT spectrum**, so that I can perform immediate **Root Cause Analysis (RCA)** between bearing wear and structural resonance. | 1. Dashboard displays FFT spectrum for Vibration. <br> 2. Latency between Edge capture and FFT display is < 2 seconds. <br> 3. Historical baselines are overlaid for comparison. | **3** |
| **Arjun** | **US-1.2** | As Arjun, I want the **Real-time Alerting Engine** to trigger visual alerts within the **Failure Horizon**, so that I can identify assets requiring emergency intervention before functional failure. | 1. Status icons turn Red for Critical breaches. <br> 2. Alerts trigger within 2 seconds of detection. <br> 3. System supports color-coded severity levels. | **5** |
| **Arjun** | **US-1.3** | As Arjun, I want the **Edge Connectivity Monitor** to track the "heartbeat" of every Edge device, so that I can distinguish between a network dropout and a critical machine seizure. | 1. System displays "Sensor Not Transmitting" status. <br> 2. Edge device buffers data during outages. <br> 3. Heartbeat loss triggers a High-Priority notification. | **3** |

### **Module 2: Predictive Analytics Engine**

| **User Persona** | **ID** | **User Story** | **Acceptance Criteria** | **SP** |
|----|----|----|----|----|
| **Sanjay** (Reliability Analyst) | **US-2.1** | As Sanjay, I want the AI engine to calculate the **Failure Horizon** (Probability vs. Time) for all Grade-A assets, so that I can shift to **Condition-Based Maintenance** and increase Asset Availability and Uptime. | 1. "Predictive Insights" tab sorts assets by "Risk Level". <br> 2. Failure probability is updated every hour. | **13** |
| **Sanjay** | **US-2.2** | As Sanjay, I want the **Predictive Inference Engine** to provide a confidence level for every failure prediction, so that I can avoid scheduling costly downtime for low-probability events. | 1. RUL predictions include a percentage-based confidence score. <br> 2. Models are retrained if confidence drops below 75%. | **8** |

### **Module 3: Inventory & Supply Chain**

| **User Persona** | **ID** | **User Story** | **Acceptance Criteria** | **SP** |
|----|----|----|----|----|
| **Vikram** (Store Manager) | **US-3.1** | As Vikram, I want the **Inventory Management Module** to trigger a **Just-in-Time Logistics** alert when an asset's RUL falls below the "Lead-Time + 10%" threshold, so that we can prioritize procurement and eliminate emergency shipping costs. | 1. System cross-references RUL with Inventory Lead-Times. <br> 2. Low-Stock Alert is triggered for critical shortages. | **5** |
| **Vikram** | **US-3.2** | As Vikram, I want the **Inventory Management Module** to allocate spare parts to specific Work Order IDs, so that critical inventory is not consumed by lower-priority preventive tasks. | 1. Parts can be "Reserved" in the system. <br> 2. Inventory UI flags multiple tasks competing for the same part. | **13** |

### **Module 4: Work Order Management System**

| **User Persona** | **ID** | **User Story** | **Acceptance Criteria** | **SP** |
|----|----|----|----|----|
| **Raj** (Field Technician) | **US-4.1** | As Raj, I want to access **Digital Asset Documentation** (Schematics and Manuals) and **MTTR benchmarks** via the **PWA Field Interface**, so that I can complete repairs within the predicted downtime window. | 1. PWA provides links to digital schematics. <br> 2. Estimated repair time is displayed on the PWA dashboard. | **8** |
| **Raj** | **US-4.2** | As Raj, I want the **PWA Field Interface** to validate my physical presence via QR-scan, so that the **Compliance Audit Trail** is accurately populated for Safety/ISO standards. | 1. QR code scan required via browser-camera to "Check-In" at asset. <br> 2. Geo-timestamped log is stored in the audit trail. | **5** |

### **Module 5: Admin & Executive Reporting**

| **User Persona** | **ID** | **User Story** | **Acceptance Criteria** | **SP** |
|----|----|----|----|----|
| **Anita** (Plant Manager) | **US-5.1** | As Anita, I want the **Executive Decision Support Dashboard** to provide a financial risk comparison between continued operation and a scheduled repair, so that I can hit my **Monthly Delivery Targets** without risking a catastrophic machine failure. | 1. Dashboard displays "Risk of Failure" in currency (e.g., $5,000/hr). <br> 2. Analytics module compares 'Emergency Repair Cost' vs 'Scheduled Maintenance Cost'. | **8** |
| **Karthik** (IT Admin) | **US-5.2** | As Karthik, I want to enforce **TLS-Encrypted Telemetry** and Role-Based Access Control, so that the IoT data stream is protected from unauthorized modification or interception. | 1. Only TLS-encrypted traffic is accepted by the broker. <br> 2. RBAC prevents unauthorized calibration changes. | **8** |

### **Module 6: EHS, Security & Project Oversight**

| **User Persona** | **ID** | **User Story** | **Acceptance Criteria** | **SP** |
|----|----|----|----|----|
| **EHS Officer** | **US-6.1** | As an EHS Officer, I want the **Thermal Safety Engine** to receive alerts for sustained thermal anomalies, so that I can prevent hazardous fire conditions for floor staff. | 1. Critical visual alerts for T > Baseline for 5+ minutes. <br> 2. Alerts sent via SMS to EHS officer. | **5** |
| **Project Supervisor** | **US-6.2** | As a Project Supervisor, I want the **Model Performance Analytics Suite** to monitor the **False Discovery Rate (FDR)** of the anomaly engine, so that I can validate the prototype against industrial reliability standards. | 1. System tracks "False Alarms" vs "True Positives". <br> 2. Dashboard displays aggregate model accuracy metrics. | **5** |

**16. User Journeys**

![](./assets/ef7b4e027d3dabd17f9712f7a5dbd2f9659b5a9d.png)

**17. Functional Requirements**

**17.1 FR1: IoT Sensor Data Acquisition**

- The **Precognito Platform** shall ingest real-time data from physical sensors installed on machines.

- **Edge devices shall perform FFT and RMS extraction to compress 1kHz vibration data before transmission.**

- MQTT or Modbus protocols shall be supported for data transmission.

- Edge devices shall buffer data during network outages
  (store-and-forward).

- The system shall support calibration settings for different machine
  types.

**17.2 FR2: Anomaly Detection Engine**

- The **Precognito Analytics Suite** shall detect abnormal vibration peaks, temperature spikes, and pattern deviations.

- Baseline “Healthy Machine” models shall be created using historical
  operation data.

- Noise filtering and smoothing (e.g., low-pass filters) shall be
  implemented.

- Anomalies shall be classified by severity (Low, Moderate, High,
  Critical).

**17.3 FR3: Predictive Inference (RUL Estimation)**

- The **Predictive Inference Engine** shall estimate the Remaining Useful Life (RUL) of components based on degradation trends.

- AI models shall classify likely faults (e.g., bearing wear,
  misalignment).

- Each prediction shall include a confidence score and expected
  time-to-failure.

- Predictive insights shall be visualized on the dashboard for decision
  support.

**17.4 FR4: Maintenance Scheduling & Work Orders**

- The **Work Order Management Module** shall generate recommended work orders for machines with anomalies.

- The system shall verify **Technician Labor Rosters** and **Spare Part Lead-Times** before assigning tasks.

- Spare parts availability shall be verified before scheduling.

- Critical machines shall be prioritized automatically during
  scheduling.

- Maintenance Lead shall approve or reject work orders through the
  dashboard.

**17.5 FR5: Cost Estimation & Financial Analysis**

- The system shall compute “Cost of Inaction” using downtime cost ×
  predicted failure time.

- The system shall compute “Cost of Repair” using labor and parts cost.

- Monthly ROI reports shall be generated summarizing savings.

- Comparative financial charts (repair vs. inaction) shall be displayed.

**17.6 FR6: Dashboard, Alerts, Reporting & Security**

- **Dashboard:** The system shall provide a dashboard showing machine
  health (Green/Yellow/Red) with RUL, anomalies, sensor graphs, and work
  order status.

- **Alerts:** Instant alerts shall be triggered when a machine enters a
  critical state.

- **Reporting:** Reports shall include logs, cost summaries, and
  maintenance history, and be exportable to PDF/CSV.

- **User Roles:** The system shall support three roles:

<!-- -->

- **Admins:** Manage system configuration, sensors, users, and
  calibration.

<!-- -->

- **Maintenance Leads:** Review alerts, approve work orders, and access
  all reports.

<!-- -->

- **Technicians:** View assigned tasks and update repair status.

<!-- -->

- **Security:** Role-based visibility shall ensure users only see
  relevant information. Secure login (TLS), RBAC-based access control,
  and full user-action audit logging shall be enforced.

- **Audit Traceability:** The system shall generate immutable audit logs
  for all configuration changes, specifically machine calibration and
  threshold adjustments, accessible to **Admin** and **Security
  Officer** roles.

- **Safety Alerts:** The system shall trigger high-priority visual
  alerts on the dashboard when temperatures exceed safe operating
  baselines for more than 5 minutes, notifying the **EHS Officer**.

- **Export for Compliance:** The system shall allow **Finance** and
  **Auditors** to export raw "Cost of Inaction" data and ROI
  calculations into signed PDF formats for quarterly verification.

User Access Control Matrix

| **Field** | **Admin (Karthik)** | **Maint. Lead (Sanjay)** | **Technician (Raj/Arjun)** | **Manager (Anita)** | **Store/Finance (Vikram)** |
|:--- |:--- |:--- |:--- |:--- |:--- |
| **Username** | karthik_admin | sanjay_lead | raj_tech | anita_exec | vikram_store |
| **View Dashboard** | Yes | Yes | Yes | Yes | Yes |
| **Approve Orders** | Yes | Yes | No | No | No |
| **Edit Calibration** | Yes | No | No | No | No |
| **Close Tickets** | No | No | Yes | No | No |
| **View ROI Reports** | Yes | Yes | No | Yes | Yes |
| **Manage Users** | Yes | No | No | No | No |

**  **

**18. Non-Functional Requirements**

- **Performance:** End-to-end alert latency \< 2 seconds.

- **Availability:** System uptime **≥ 99.9% ("Three Nines")** to ensure mission-critical reliability.

- **Security:** TLS encryption, Role-Based Access Control (RBAC), and Audit Logs.

- **Scalability:** Support up to 500 sensors without performance drop.

- **Reliability:** Edge store-and-forward during network outages.

- **Accuracy:** Anomaly detection accuracy ≥ 90%; **False Discovery Rate (FDR) < 5%** to prevent alert fatigue.

- **Usability:** Dashboard must be simple and intuitive; minimal
  training required.

- **Data Privacy:** Encrypted storage of all sensor and user data.

**19. Risks & Mitigation Strategies**

| **Risk** | **Impact** | **Mitigation** |
|----|----|----|
| **Sensor noise or interference** | High | Implement hardware filtering + software DSP filters |
| **Network instability** | Medium | Use edge buffering and auto-resend |
| **False positives in anomaly detection** | Medium | Add technician feedback loop for model retraining |
| **Hardware failure or sensor dropout** | Medium | Add heartbeat monitoring and sensor health checks |
| **Data breach or unauthorized access** | Critical | Use RBAC, encryption, and secure deployment |

**20. High Level Design**

The High-Level Design (HLD) outlines the data flow from the physical
world to the user interface.

![](./assets/eb8e161d16d37b3f5f1f076e9c60f12372bd42e1.png)

**21. Low Level Design**

The Low-Level Design (LLD) details specific components within the
backend architecture.

![](./assets/e518e4d45a4481eb4cfba2d3c76a8ecf39611adc.png)

**22. UML Diagram**

**Class Diagram:**

![](./assets/media/image3.jpg)

**ER Diagram:**

![](./assets/media/image4.png)

**Sequence Diagram:**

![](./assets/media/image5.png)

**Usecase Diagram:**

![](./assets/media/image6.png)

**23. Proposed Tech Stack**

| **Component** | **Technology** |
|----|----|
| **Hardware** | MEMS Accelerometers (ADXL345), Thermocouples, ESP32/Raspberry Pi |
| **Backend** | Python (FastAPI) |
| **Database** | Influx DB (Time-Series), PostgreSQL (Asset Metadata, User Roles, Labor Rosters, & Inventory) |
| **AI/ML** | Scikit-Learn, TensorFlow, NumPy, Pandas |
| **Frontend** | React.js (**Progressive Web App - PWA**) |
| **Messaging** | MQTT (Mosquitto Broker) |
| **DevOps** | Docker, GitHub Actions |

**24. Proposed Architecture**

The system follows a **Microservices-lite** architecture:

- **Edge Service:** Performs feature extraction (FFT/RMS) on ESP32/RPi.

- **Broker:** Decouples sensors from the backend using the **MQTT** protocol.

- **Core API:** FastAPI backend handling business logic and **HTTPS** requests from the PWA.

- **Frontend:** **PWA Field Interface** providing cross-platform mobile and desktop access.

- **Worker Nodes:** Handle ML inference and data processing asynchronously.

![](./assets/90905c6c3170c92eea935e65ad01b3fb3855923b.png)

**  **

**25. Testing Strategy**

To ensure reliability and accuracy, the system will undergo four levels
of rigorous testing:

**1. Unit Testing (Component Level)**

- **Hardware:** Validate that MEMS and temperature sensors provide
  accurate readings within expected ranges (+/- 2%).

- **Edge Logic:** Verify ESP32 microcontroller reliably connects to
  Wi-Fi and formats JSON payloads correctly.

- **Backend Functions:** Test individual Python functions for data
  normalization, database insertion, and API endpoint responses using
  pytest.

**2. Integration Testing (Module Level)**

- **Data Flow:** Verify that data sent from the Edge device appears
  correctly in the MQTT Broker and subsequently in the Influx DB
  database.

- **Model Integration:** Ensure the AI model receives the correct data
  format from the database and returns a valid RUL score without
  crashing.

- **Frontend-Backend:** Confirm the Dashboard accurately reflects data
  fetched from the REST API in real-time.

**  **

**3. System Testing (End-to-End)**

- **Anomaly Simulation:** Artificially induce vibration (using a shaker
  table) to trigger the "Critical" state and verify that:

1.  The Dashboard turns Red.

2.  The RUL drops significantly.

3.  An SMS/Email alert is received by the Maintenance Lead within 2
    seconds.

- **Load Testing:** Simulate 500 concurrent sensor streams to ensure the
  backend and database do not degrade in performance.

**4. User Acceptance Testing (UAT)**

- **Technician Walkthrough:** Have a real technician perform a repair
  workflow: receive alert -\> check dashboard -\> complete work order.

- **Usability Check:** Verify that the Maintenance Lead can easily
  approve/reject work orders without technical assistance.

**  **

**24.6 Sample Test Cases**

**Module 1 – Parameter Monitoring & Acquisition**

| **Test Case ID** | **Requirement** | **Test Scenario** | **Expected Outcome** |
|----|----|----|----|
| TC_M1_01 | Continuous Parameter Capture | Input continuous live sensor data (vibration, temperature, sound) from an active machine for a defined time period. | System continuously captures and stores real-time parameter data with accurate timestamps and no missing records. |
| TC_M1_02 | High-Frequency Sampling Support | Provide vibration data at a minimum 1 kHz sampling rate. | System successfully ingests high-frequency data without crashes, data drops, or performance degradation. |
| TC_M1_03 | Sensor Communication Monitoring | Simulate one sensor stopping transmission while other sensors remain active. | System detects missing data within the defined timeout period and displays a “Sensor Not Transmitting” alert. |
| TC_M1_04 | Multi-Sensor Synchronization | Send vibration, temperature, and sound readings with slight timing differences. | System correctly aligns sensor readings using timestamps and maps them to the correct asset without mismatch. |
| TC_M1_05 | IoT Protocol Acquisition | Transmit telemetry using supported communication protocols (e.g., MQTT or Modbus). | System successfully receives, processes, and stores data from supported protocols without errors. |
| TC_M1_06 | Edge Buffering & Recovery | Simulate network outage at the edge device, then restore connectivity. | Buffered data is transmitted after reconnection; timestamps remain accurate and no critical data is lost. |

![](./assets/media/image8.png)

**Module 2 – Anomaly Detection**

| **Test Case ID** | **Requirement** | **Test Scenario** | **Expected Outcome** |
|----|----|----|----|
| **TC_M2_01** | Baseline Deviation Detection | Ingest extracted vibration features: **RMS = 6.8 mm/s** (healthy baseline \< 2.0 mm/s). | System detects deviation and classifies anomaly correctly (High severity). |
| **TC_M2_02** | Temperature Spike Detection | Ingest temperature = **92°C** (safe range 40–70°C). | System flags temperature anomaly and stores result in anomaly database. |
| **TC_M2_03** | Normal Condition Validation | Ingest vibration = **1.5 mm/s**, temperature = **60°C**. | System marks machine state as Normal and does not create anomaly record. |
| **TC_M2_04** | Multi-Parameter Anomaly Detection | Ingest vibration = **7.0 mm/s** and temperature = **95°C** together. | System detects both anomalies and logs correct severity for each. |
| **TC_M2_05** | Database Output Validation | Trigger any valid anomaly condition. | Anomaly result stored in database with machine ID, severity, and timestamp within \< 2 sec. |

![](./assets/79950bc26529824c2e016e7ab32657bb792abe98.png)

**Module 3 - Predictive Inference (RUL Estimation)**

| **Test Case ID** | **Requirement** | **Test Scenario** | **Expected Outcome** |
|----|----|----|----|
| **TC_M3_01** | **RUL Estimation** | Input valid degradation telemetry (e.g., increasing vibration over 24h). | System calculates and displays RUL in hours/days (e.g., "14.5 hours"). |
| **TC_M3_02** | **Failure Prediction** | Machine parameters show continuous degradation patterns. | Predicted time-to-failure is generated and displayed before actual breakdown. |
| **TC_M3_03** | **Confidence Scoring** | Generate an RUL prediction via the AI Inference Engine. | A confidence percentage (e.g., "92%") is shown alongside the prediction. |
| **TC_M3_04** | **Fault Classification** | Input abnormal sensor patterns (e.g., specific frequency spikes). | System identifies and displays fault type (e.g., "Bearing Wear" or "Misalignment"). |
| **TC_M3_05** | **Planning Support** | RUL value falls below the defined threshold (e.g., \< 48 hours). | Machine is flagged as **High-Risk**; system recommends immediate maintenance. |
| **TC_M3_06** | **Decision Visualization** | Predictions are finalized by the backend engine. | Graphs, risk level alerts, and RUL details are updated on the web dashboard. |

![](./assets/media/image9.png)

**Module 4: Maintenance Scheduling & Work Orders**

| **Test Case ID** | **Requirement Reference** | **Test Scenario** | **Expected Result** |
|----|----|----|----|
| **TC_M4_01** | FR 4.1: Work Order Generation | Verify automatic work order creation when anomaly severity exceeds threshold. | System generates a recommended work order automatically with machine details. |
| **TC_M4_02** | FR 4.2: Technician Assignment | Validate technician availability and skill check before assignment. | Work order is assigned only to available technicians with required skill set. |
| **TC_M4_03** | FR 4.3: Spare Parts Verification | Verify spare parts availability before scheduling maintenance. | System prevents scheduling if required parts are unavailable and flags inventory issue. |
| **TC_M4_04** | FR 4.4: Critical Machine Priority | Test prioritization of critical machines during scheduling. | Work orders for critical machines are placed at higher priority in the queue. |
| **TC_M4_05** | FR 4.5: Approval Workflow | Validate Maintenance Lead approval before execution. | Work order status changes to “Approved” or “Rejected” and execution is blocked without approval. |
| **TC_M4_06** | FR 4.6: RUL-Based Scheduling | Verify maintenance scheduling occurs before predicted RUL expiry. | Scheduled maintenance date is within safe operational window before RUL expiration. |

![](./assets/media/image10.png)

**Module 5: Admin & Executive Reporting**

| **Test Case ID** | **Requirement Reference** | **Test Scenario** | **Expected Result** |
|----|----|----|----|
| **TC_M5_01** | FR5.1: ROI Analysis | Verify system calculates ROI based on downtime hours and proactive repair costs. | System generates ROI report showing calculated cost savings and efficiency improvements. |
| **TC_M5_02** | FR5.2: System Health Monitoring | Validate system health dashboard using server status and active user sessions. | Dashboard displays system uptime, server status, and active session metrics accurately. |
| **TC_M5_03** | FR5.3: Audit Compliance | Verify audit report generation based on user action logs and role changes. | System produces audit report confirming security checks and detecting unauthorized access attempts. |

![](./assets/media/image11.png)

**Module 6: Dashboard, Alerts, Reporting & Security**

| **Test Case ID** | **Requirement Reference** | **Test Scenario** | **Expected Result** |
|----|----|----|----|
| **TC_M6_01** | FR 6.1: Dashboard | Verify real-time color-coding of machine health (Green/Yellow/Red). | Dashboard status changes to Red within \< 2 seconds of a critical anomaly detection. |
| **TC_M6_02** | FR 6.2: Alerts | Validate instant notification delivery for RUL threshold breaches. | An SMS/Email is successfully sent to the Maintenance Lead via Twilio/SendGrid. |
| **TC_M6_03** | FR 6.5: Cost Analysis | Generate a monthly ROI report comparing "Cost of Inaction" vs "Cost of Repair". | Report accurately calculates savings based on downtime cost × predicted failure time. |
| **TC_M6_04** | FR 6.6: Security | Test Role-Based Access Control (RBAC) for the 'Technician' role. | Technician can update repair status but cannot access system calibration or user management. |
| **TC_M6_05** | FR 6.6: Security | Verify that all user actions are recorded in the audit log. | The Audit Log captures the User ID, timestamp, and specific change made to system data. |

![](./assets/media/image12.png)

**26. Deliverables and Milestones**

**Deliverables:**

1.  **Requirement Documentation:** BRD.

2.  **Hardware Prototype:** Functional sensor rig connected to Edge
    device.

3.  **Software Source Code:** Backend, Frontend, and ML Models hosted on
    GitHub.

4.  **User Manual:** Guide for technicians and admins.

5.  **Final Report:** Comprehensive project report and presentation.

**Milestones:**

- **M1 (Week 1):** BRD Finalization & Requirement Freeze.

- **M2 (Week 2):** Hardware Sourcing & Edge Firmware Alpha (MQTT/Heartbeat).

- **M3 (Week 3):** Edge Layer Feature Extraction (FFT/RMS) Development.

- **M4 (Week 4):** Backend Ingestion Engine & Time-Series DB Schema Setup.

- **M5 (Week 5):** AI Model Training (Baseline Creation & Anomaly Thresholds).

- **M6 (Week 6):** Dashboard UI MVP & Real-time Visualization.

- **M7 (Week 7):** Work Order Module & Inventory Integration.

- **M8 (Week 8):** Financial Analytics & ROI Reporting Engine.

- **M9 (Week 9):** End-to-End System Simulation & Stress Testing (500 sensors).

- **M10 (Week 10):** Security Audit (Encryption Check & Role-Based Access).

- **M11 (Week 11):** UAT with Stakeholders & Bug Remediation.

- **M12 (Week 12):** Final Documentation, Presentation, and Deployment.

**27. Release Timeline Diagram:**

![](./assets/d94cfde0fe5ae5d121837021aac816e5ccceb592.png)

**28. Success Criteria**

- [ ] **Availability Improvement:** Measured 10-15% reduction in unplanned downtime.

- [ ] **Latency:** End-to-end critical alert delivery < 2.0 seconds.

- [ ] **Accuracy:** > 90% Anomaly detection with < 5% False Discovery Rate.

- [ ] **MTTR Reduction:** 20% faster repair times via digital checklists.

- [ ] **Security:** Successful implementation of TLS encryption and RBAC.

- [ ] **Technical Validation:** 100% pass rate on automated unit tests for core analytics logic (FFT, RMS, and RUL).

- [ ] **Project approved during final demonstration.**

**28.1 Success Metrics Matrix (KPIs)**

| **Objective** | **Key Performance Indicator (KPI)** | **Target Metric** | **Measurement Method** |
|:--- |:--- |:--- |:--- |
| **Downtime Reduction** | Unplanned Downtime Percentage | 10-15% Reduction | Historical Comparison (Anita's Dashboard) |
| **System Responsiveness** | End-to-End Alert Latency | < 2.0 Seconds | Processing Logs (Module 6) |
| **Prediction Reliability** | False Discovery Rate (FDR) | < 5% | Model Performance Suite (US-6.2) |
| **Repair Efficiency** | Mean Time To Repair (MTTR) | 20% Improvement | PWA Check-in/Check-out Timestamps |
| **Data Integrity** | Security Compliance | 100% TLS/RBAC | Security Audit (Karthik's Logs) |
| **Technical Validation** | Logic Verification | 100% Unit Test Pass | `pytest` Suite Execution |
| **Final Delivery** | Prototype Acceptance | Approved Sign-off | Final Project Demonstration |

**29. Assumptions and Constraints**

**29.1 Assumptions**

- Stable Wi-Fi/Ethernet connectivity is available.

- Access to machines for sensor installation is allowed.

- Historical maintenance logs are available for training the AI model.

- Technicians will use mobile or desktop dashboards.

**29.2 Constraints**

- Budget limited to cost-effective sensors and hardware.

- Dusty or humid environments require IP65 enclosures.

- Phase 1 deadline: 8 weeks for prototype completion.

- Limited availability of high-quality failure-labelled datasets.

**30. Approval & Sign-Off**

| **Role**               | **Name**                    | **Signature** | **Date** |
|------------------------|-----------------------------|---------------|----------|
| **Project Lead**       | Aryan Madhusudhanan         |               |          |
| **Project Supervisor** |                             |               |          |
| **Stakeholder**        | \[Client/Industry Partner\] |               |          |

**  **

**31. Version History**

| Version | Date | Author | Description of Change |
| --- | --- | --- | --- |
| 0.0 | 04-Dec-2025 | Aryan M | Initial Draft Creation |
| 0.1 | 05-Dec-2025 | Story Point | Added Vision, Mission, Objectives |
| 0.2 | 08-Dec -2025 | Story Point | Added HLD, LLD, SWOT, and Competitor Analysis |
| 0.3 | 10-Dec -2025 | Story Point | Added Mind Map, Added Table of Contents, and reorganized document structure per template |
| 0.4 | 12-Dec-2025 | Story Point | Added Testing Strategy and Appendix |
| 0.5 | 20-Dec-2025 | Story Point | Adding Diagram to Proposed Architecture |
| 0.6 | 23-Feb-2026 | Story Point | Updated HLD diagram |
| 0.7 | 23-Feb-2026 | Story Point | Added User Personas, User Stories, ER Diagram, Sequence Diagram, Use case Diagram, Class Diagram, Release Timeline |
| 0.8 | 28-Feb-2026 | Story Point | Updated Stakeholder Matrix, Appendix. Added new User Stories, Test Cases |
| 0.9 | 15-Mar-2026 | Story Point | Updated Release Timeline, HLD, Architecture Diagram and Added User Journey |

**  **

**32. Appendix: Glossary & Acronyms**

| **Acronym / Term** | **Definition** |
|----|----|
| **BRD** | Business Requirements Document. |
| **COTS** | Commercial Off-The-Shelf (products). |
| **DSP** | Digital Signal Processing (filtering noise from signals). |
| **EHS** | Environmental Health and Safety; a discipline that studies and implements practical aspects of environmental protection and safety at work. |
| **HLD/LLD** | High-Level Design / Low-Level Design. |
| **Influx DB** | A high-performance open-source time-series database used to store sensor telemetry. |
| **IoT** | Internet of Things (network of physical objects with sensors). |
| **IP65** | Ingress Protection rating indicating a device is "dust tight" and protected against water jets from any angle (required for dusty/humid factory environments). |
| **MEMS** | Micro-Electro-Mechanical Systems (technology used in small sensors like accelerometers). |
| **MQTT** | Message Queuing Telemetry Transport (lightweight messaging protocol for IoT). |
| **MVP** | Minimum Viable Product. |
| **OEE** | Overall Equipment Effectiveness; a measure of how well a manufacturing operation is utilized compared to its full potential. |
| **OT** | Operational Technology; hardware and software that detects or causes a change through direct monitoring/control of industrial equipment. |
| **RBAC** | Role-Based Access Control (restricting system access based on user role). |
| **PWA** | Progressive Web App; a web application that provides a native app-like experience on mobile and desktop through a web browser. |
| **RCA** | Root Cause Analysis; a method of problem solving used for identifying the root causes of faults or problems. |
| **ROI** | Return on Investment (the financial benefit of the system compared to its cost). |
| **RUL** | Remaining Useful Life (estimated time before a component fails). |
| **SCADA** | Supervisory Control and Data Acquisition (industrial control systems). |
| **TLS** | Transport Layer Security (cryptographic protocol for providing communications security). |
| **UAT** | User Acceptance Testing; the final phase where actual users (like technicians) test the software in real-world scenarios. |
| **Failure Horizon** | The period between the first detection of an anomaly (P-Point) and functional failure (F-Point). |
| **FDR** | False Discovery Rate; a statistical measure of the frequency of false alerts in anomaly detection. |
| **FFT** | Fast Fourier Transform; a mathematical algorithm that converts time-domain signals (raw vibration) into frequency-domain (spectrum) for Root Cause Analysis. |
| **MTTR** | Mean Time To Repair; the average time required to troubleshoot and repair failed equipment. |
