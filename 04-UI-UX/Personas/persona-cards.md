# Building Maintenance App - Persona Cards

## Overview
These personas represent the primary user groups for the Building Maintenance App. Each persona includes demographics, goals, frustrations, and typical scenarios.

---

## Persona 1: The Tenant (Primary User)

### 🏠 Maria Rodriguez (Updated with Research Data)
**Demographics:**
- **Age:** 35-44 (most common tenant age range)
- **Occupation:** Various (based on survey: professionals, retirees, students)
- **Location:** Miami, FL (apartment complex or condominium)
- **Tech Comfort:** Very comfortable (80% of surveyed tenants use apps for everything)
- **Building Type:** 60% in 200+ unit apartments, 30% condominiums, 10% townhouses

**Quote:** *"I just want my leaky faucet fixed without having to be home all day waiting."*

**Goals (Based on Survey Data):**
- Report issues with photos (8/10 tenants want this)
- Real-time status tracking (5/10 specifically requested)
- Schedule repairs via app time slots (7/10 prefer this)
- Receive SMS notifications (7/10 prefer SMS over other methods)
- See photos of completed repairs (6/10 say this is "very important")

**Frustrations (Validated by Research):**
- **#1:** Having to be home for maintenance visits (6/10 tenants)
- **#2:** Slow response time (4/10 tenants)
- **#3:** Poor communication (2/10 tenants)
- No updates on repair status
- Multiple visits required for same issue
- Repairs not done correctly

**Typical Scenario (Miami-Specific):**
Maria notices her AC isn't cooling properly during Miami's summer heat. She takes photos of the thermostat and unit, submits through the app with "URGENT" flag. System automatically categorizes as emergency (AC failure in summer). She receives SMS confirmation and real-time updates. Maintenance arrives within 2 hours (9/10 tenants expect this for urgent issues). Repair completed with before/after photos sent to her phone.

**Tech Usage (From Survey):**
- 80% "very comfortable" with smartphone apps
- 70% have already used photos for maintenance issues
- Prefers SMS (70%) over other communication methods
- Expects 2-hour response for urgent issues (90% of tenants)

---

## Persona 2: The Building Manager (Updated with Interview Data)

### 🏢 Robert Chen (Miami Property Manager)
**Demographics:**
- **Age:** 45
- **Occupation:** Property Manager (12 years experience)
- **Location:** Miami, FL - Manages 4 buildings (220 units total)
- **Tech Comfort:** Medium (uses Excel, AppFolio, QuickBooks, Outlook, WhatsApp)
- **Tools Used:** Excel (tracking), AppFolio (apartments), QuickBooks (accounting), Outlook (email), WhatsApp (communication)

**Quote:** *"I need visibility into open requests, overdue tasks, and completion confirmation across all my buildings."*

**Goals (From Interview):**
- Centralized request intake (currently fragmented across email, phone, WhatsApp)
- Automatic urgency categorization (emergency vs. routine)
- Real-time status tracking for all open requests
- Cost history per unit for budgeting
- Preventive maintenance tracking (especially AC in Miami)
- Hurricane/emergency mode workflow
- Insurance documentation (water leaks, mold prevention)

**Frustrations (Validated by Interview):**
- **Lack of visibility:** Can't see open/overdue tasks at a glance
- **Fragmented information:** Data spread across Excel, email, QuickBooks
- **Manual emergency handling:** Hurricane season overload with no structured workflow
- **Missing historical data:** No AC service history, cost trends, or repair patterns
- **Communication gaps:** Lost email threads, staff forgetting updates
- **Language barriers:** English/Spanish communication challenges

**Typical Scenario (Miami-Specific):**
Robert starts hurricane season preparation. He needs to track: storm shutter inspections, roof checks, garage pump testing. During a storm, he gets 15 emergency calls (water intrusion, AC failures, elevator issues). He manually prioritizes via phone, then tries to document later. He needs insurance records for water damage claims and wants to track recurring AC issues across buildings.

**Tech Usage (From Interview):**
- Desktop for management tasks (Windows/Mac)
- Mobile for on-the-go updates (WhatsApp for photos/texts)
- Needs integration with QuickBooks for cost tracking
- Requires bilingual support (English/Spanish)
- Hurricane season requires emergency dashboard view

---

## Persona 3: The Maintenance Technician

### 🔧 James "Jim" Wilson
**Demographics:**
- **Age:** 52
- **Occupation:** Maintenance Supervisor
- **Location:** Covers 5 buildings in downtown area
- **Tech Comfort:** Low-medium (learning)
- **Experience:** 30 years in building maintenance

**Quote:** *"Just tell me what needs fixing and where. I'll get it done."*

**Goals:**
- Clear instructions for each job
- Access to building schematics/plans
- Ability to order parts on the go
- Track time spent on each job
- Document work with photos
- Communicate with tenants when needed

**Frustrations:**
- Vague work orders ("something's broken")
- No access to building plans on site
- Can't update status without calling office
- Paperwork after every job
- Language barriers with some tenants

**Typical Scenario:**
Jim receives a push notification about a clogged toilet in Apartment 415. The work order includes photos from the tenant, the apartment number, and notes about previous plumbing issues in that unit. He accepts the job, drives to the building, fixes the issue in 30 minutes, takes an "after" photo, marks it complete, and moves to the next job.

**Tech Usage:**
- Smartphone user (Android, company-provided)
- Uses basic apps (maps, camera, messaging)
- Prefers voice notes over typing
- Needs offline capability (some buildings have poor reception)

---

## Persona 4: The Building Owner/Investor

### 💼 Sarah Johnson
**Demographics:**
- **Age:** 58
- **Occupation:** Real Estate Investor
- **Location:** Owns 8 residential buildings
- **Tech Comfort:** Medium-high (business apps)
- **Focus:** ROI, property value, tenant retention

**Quote:** *"I need to see the big picture - what's costing me money and what's keeping tenants happy."*

**Goals:**
- Monitor maintenance costs across portfolio
- Identify recurring/expensive issues
- Track tenant satisfaction
- Ensure compliance with regulations
- Make data-driven decisions about capital improvements
- Maximize property value

**Frustrations:**
- Getting surprise repair bills
- No visibility into maintenance efficiency
- Can't compare performance across buildings
- Difficulty tracking preventive maintenance
- Paper-based records hard to analyze

**Typical Scenario:**
Sarah logs into the owner portal monthly. She sees a dashboard showing maintenance costs per building, most common issues, average repair times, and tenant satisfaction scores. She notices that Building C has unusually high plumbing costs and schedules a capital improvement review. She also approves a budget for HVAC upgrades based on predictive maintenance data.

**Tech Usage:**
- iPad Pro and MacBook user
- Uses financial and property management software
- Reviews reports on tablet
- Makes decisions based on data visualizations
- Values security and data privacy

---

## Secondary Personas

### 👨‍💼 Assistant Manager (Lisa)
- **Role:** Supports Robert (Building Manager)
- **Needs:** Basic issue triage, tenant communication, scheduling
- **Pain Point:** Duplicating work between paper and digital systems

### 👵 Elderly Tenant (Mr. Henderson)
- **Age:** 78, lives alone
- **Tech Comfort:** Low (basic cell phone)
- **Need:** Simple way to report issues, prefers phone call follow-ups
- **Solution:** Family member can submit on their behalf, or voice-based interface

### 🌎 Non-English Speaking Tenant (Carlos)
- **Language:** Spanish primary, limited English
- **Need:** Multi-language support in app
- **Solution:** Spanish interface, photo-based reporting, translation features

### 🛠️ Specialist Contractor (HVAC, Electrician)
- **Role:** External contractor for specialized work
- **Need:** Limited access to submit quotes, upload completion docs
- **Pain Point:** Different systems for every building they work in

---

## Key Insights for Design

### 1. Multi-Platform Needs
- **Tenants:** Mobile-first (iOS/Android)
- **Managers:** Desktop dashboard + mobile notifications
- **Technicians:** Mobile with offline capability
- **Owners:** Tablet-optimized reports

### 2. Communication Preferences
- **Tenants:** Push notifications, in-app messaging
- **Managers:** Email summaries, dashboard alerts
- **Technicians:** Push notifications, voice notes
- **Owners:** Monthly email reports, dashboard access

### 3. Data Needs by Role
- **Tenants:** Status updates, repair history, photos
- **Managers:** Real-time overview, assignment tools, cost tracking
- **Technicians:** Clear instructions, location info, parts needed
- **Owners:** Analytics, cost reports, compliance tracking

### 4. Pain Points to Address
1. **Status transparency** - Everyone wants to know what's happening
2. **Photo documentation** - Visual evidence reduces misunderstandings
3. **Multi-language support** - Diverse tenant populations
4. **Offline capability** - Buildings often have poor reception
5. **Simple interfaces** - Varying tech comfort levels

---

## Validation Questions for Interviews/Surveys

### For Tenants (S1‑09):
1. How do you currently report maintenance issues?
2. What's the most frustrating part of getting repairs done?
3. How important are status updates to you?
4. Would you use photos to document issues? Why/why not?
5. What communication method do you prefer (call, text, app, email)?

### For Building Managers (S1‑08):
1. How do you currently track maintenance requests?
2. What information do you need to prioritize issues?
3. How do you communicate with maintenance staff?
4. What reporting do building owners require?
5. What's your biggest pain point in current process?

### For Maintenance Staff:
1. What information do you need before starting a job?
2. How do you currently receive and update work orders?
3. What would make your job easier?
4. How comfortable are you with using smartphones/apps?
5. What information should be documented after a repair?

---

## Next Steps for Persona Validation

1. **Interview building managers** (S1‑08) - Validate Robert Chen persona
2. **Survey tenants** (S1‑09) - Validate Maria Rodriguez persona  
3. **Update personas** based on real feedback
4. **Create visual persona cards** (Figma/Canva)
5. **Map current workflows** (S1‑11) - As-is process documentation

These personas will guide feature prioritization, UI design, and user experience decisions throughout the project.