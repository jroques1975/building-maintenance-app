# User Stories & Requirements

## Personas

### Tenant (Maria)
- **Role:** Resident in a 50‑unit apartment building
- **Goal:** Report a leak quickly, get estimated time of repair
- **Frustrations:** Calling office during business hours, no updates, repeating details
- **Tech Comfort:** Uses smartphone daily, prefers apps over phone calls

### Building Manager (David)
- **Role:** Manages 3 residential buildings (200 units total)
- **Goal:** Prioritize issues, track vendor performance, maintain compliance
- **Frustrations:** Paper tickets get lost, missed preventive maintenance, tenant complaints
- **Tech Comfort:** Comfortable with spreadsheets, open to automation

### Maintenance Technician (Carlos)
- **Role:** In‑house handyman, also coordinates with external vendors
- **Goal:** Receive clear work orders with photos/location, update status easily
- **Frustrations:** Vague descriptions, wrong unit numbers, no history of past repairs
- **Tech Comfort:** Uses phone for photos/messaging, prefers simple interfaces

### Property Owner (Linda)
- **Role:** Owns portfolio of 10 mixed‑use buildings
- **Goal:** Reduce operational costs, maintain asset value, ensure regulatory compliance
- **Frustrations:** Lack of visibility into maintenance spending, surprise capital expenses
- **Tech Comfort:** Reviews dashboards, wants PDF reports

---

## Stories (MoSCoW Prioritization)

### Must Have (MVP)
1. **Tenant Reporting**
   - As a tenant, I can submit a repair request with photo, description, and unit/location
   - As a tenant, I can choose priority (Emergency, High, Routine)
   - As a tenant, I receive confirmation my request was received

2. **Manager Dashboard**
   - As a manager, I can see all open requests sorted by priority/date
   - As a manager, I can assign a request to a technician/vendor
   - As a manager, I can update request status (Received, Assigned, In Progress, Completed)

3. **Basic Notifications**
   - As a tenant, I get an SMS/email when my request status changes
   - As a technician, I get notified when assigned a new work order

### Should Have (Phase 2)
4. **Maintenance Calendar**
   - As a manager, I can schedule recurring preventive maintenance (HVAC, elevator, roof)
   - As a manager, I can assign scheduled tasks to specific vendors
   - As a manager, I get reminders for upcoming scheduled maintenance

5. **Digital Logbook**
   - As a manager, I can view repair history for any unit or system
   - As a manager, I can attach invoices/warranty documents to completed work
   - As a manager, I get alerts when warranties are about to expire

### Could Have (Phase 3)
6. **Vendor Portal**
   - As a vendor, I can view assigned work orders, update status, upload photos
   - As a vendor, I can submit invoices electronically
   - As a manager, I can rate vendor performance

7. **Analytics Dashboard**
   - As an owner, I can see maintenance costs per building/month
   - As a manager, I can identify frequently failing systems
   - As an owner, I can generate compliance reports for inspections

### Won't Have (Now)
- IoT sensor integration (leak detection, HVAC monitoring)
- Predictive maintenance AI
- Multi‑language translation (beyond English/Spanish)
- Mobile app for Apple Watch

---

## Acceptance Criteria
### For "Submit Repair Request"
- **Given** a tenant is logged in
- **When** they fill out the form with photo, description, and priority
- **Then** the request appears in the manager dashboard within 30 seconds
- **And** the tenant receives a confirmation SMS/email with tracking number

### For "Assign Work Order"
- **Given** a manager views an open request
- **When** they select a technician/vendor and click "Assign"
- **Then** the technician receives a push notification with request details
- **And** the request status changes to "Assigned"

---
*Document version: 1.0. Updated: 2026‑02‑13*