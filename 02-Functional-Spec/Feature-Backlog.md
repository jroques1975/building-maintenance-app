# Feature Backlog

## Legend
- **Priority:** P0 (Critical), P1 (High), P2 (Medium), P3 (Low)
- **Status:** Not Started, In Progress, Review, Done
- **Phase:** MVP, Phase 2, Phase 3, Future

---

## MVP (Weeks 1‑6)

### P0 – Core Reporting & Dashboard
| ID  | Feature | Description | Priority | Status | Phase | Est. (days) |
|-----|---------|-------------|----------|--------|-------|-------------|
| F‑01 | Tenant Registration | Email/password, phone verification | P0 | Not Started | MVP | 3 |
| F‑02 | Issue Submission Form | Photo upload, description, location picker, priority | P0 | Not Started | MVP | 5 |
| F‑03 | Manager Dashboard | List of open issues, sort by priority/date | P0 | Not Started | MVP | 4 |
| F‑04 | Issue Assignment | Manager can assign issue to technician | P0 | Not Started | MVP | 2 |
| F‑05 | Basic Notifications | SMS/email on status change (Twilio/SendGrid) | P0 | Not Started | MVP | 3 |
| F‑06 | Authentication | JWT, role‑based routes (tenant/manager/tech) | P0 | Not Started | MVP | 4 |

### P1 – Essential Workflow
| ID  | Feature | Description | Priority | Status | Phase | Est. (days) |
|-----|---------|-------------|----------|--------|-------|-------------|
| F‑07 | Technician View | Assigned work orders, update status | P1 | Not Started | MVP | 3 |
| F‑08 | Issue History | Closed issues archive with notes | P1 | Not Started | MVP | 2 |
| F‑09 | Photo Gallery | View all photos attached to an issue | P1 | Not Started | MVP | 2 |
| F‑10 | Search & Filter | Search by unit, date range, status | P1 | Not Started | MVP | 3 |

---

## Phase 2 (Weeks 7‑10)

### P1 – Preventive Maintenance
| ID  | Feature | Description | Priority | Status | Phase | Est. (days) |
|-----|---------|-------------|----------|--------|-------|-------------|
| F‑11 | Maintenance Calendar | Schedule recurring tasks (UI) | P1 | Not Started | Phase 2 | 4 |
| F‑12 | Calendar Notifications | Email reminders for upcoming tasks | P1 | Not Started | Phase 2 | 2 |
| F‑13 | Digital Logbook | Record of completed maintenance per unit/system | P1 | Not Started | Phase 2 | 3 |
| F‑14 | Warranty Tracking | Alert when warranties near expiration | P1 | Not Started | Phase 2 | 2 |

### P2 – Enhanced Management
| ID  | Feature | Description | Priority | Status | Phase | Est. (days) |
|-----|---------|-------------|----------|--------|-------|-------------|
| F‑15 | Vendor Management | CRUD for external vendors, contact info | P2 | Not Started | Phase 2 | 3 |
| F‑16 | Cost Tracking | Log labor/material costs per work order | P2 | Not Started | Phase 2 | 3 |
| F‑17 | PDF Reports | Generate monthly maintenance reports | P2 | Not Started | Phase 2 | 4 |
| F‑18 | Bulk Operations | Assign multiple issues to same technician | P2 | Not Started | Phase 2 | 2 |

---

## Phase 3 (Weeks 11‑14)

### P2 – Analytics & Insights
| ID  | Feature | Description | Priority | Status | Phase | Est. (days) |
|-----|---------|-------------|----------|--------|-------|-------------|
| F‑19 | Analytics Dashboard | Charts: issues by type, resolution time, costs | P2 | Not Started | Phase 3 | 5 |
| F‑20 | Predictive Alerts | Flag frequently failing systems | P2 | Not Started | Phase 3 | 4 |
| F‑21 | Compliance Checklist | Building‑code inspection templates | P2 | Not Started | Phase 3 | 3 |
| F‑22 | API for Integrations | Webhooks, Zapier/IFTTT connectors | P2 | Not Started | Phase 3 | 4 |

### P3 – Polish & Scale
| ID  | Feature | Description | Priority | Status | Phase | Est. (days) |
|-----|---------|-------------|----------|--------|-------|-------------|
| F‑23 | Multi‑Building Support | Manager oversees multiple properties | P3 | Not Started | Phase 3 | 3 |
| F‑24 | Tenant Portal Web View | Basic reporting via browser (no app needed) | P3 | Not Started | Phase 3 | 4 |
| F‑25 | Dark Mode | UI theme preference | P3 | Not Started | Phase 3 | 2 |
| F‑26 | Offline Mode | Cache submissions when network lost | P3 | Not Started | Phase 3 | 3 |

---

## Future (Post‑Phase 3)

### P3 – Advanced Features
| ID  | Feature | Description | Priority | Status | Phase | Est. (days) |
|-----|---------|-------------|----------|--------|-------|-------------|
| F‑27 | IoT Integration | Leak sensors, HVAC monitoring alerts | P3 | Not Started | Future | 10+ |
| F‑28 | AI‑Powered Prioritization | ML model predicts emergency vs routine | P3 | Not Started | Future | 8+ |
| F‑29 | Multi‑Language | Spanish translation (UI + notifications) | P3 | Not Started | Future | 5 |
| F‑30 | Voice Reporting | "Hey Siri, report a leak in apartment 3B" | P3 | Not Started | Future | 6 |

---

## Dependencies
- **F‑01 → F‑02:** Must have registration before submission
- **F‑02 → F‑03:** Issues must exist before dashboard can show them
- **F‑03 → F‑04:** Dashboard needed for assignment UI
- **F‑11 → F‑12:** Calendar must exist before notifications
- **F‑13 → F‑21:** Logbook data feeds compliance checklists

---

## Total Estimates
- **MVP:** 23 days (≈ 4.5 weeks with testing/deployment)
- **Phase 2:** 17 days (≈ 3.5 weeks)
- **Phase 3:** 21 days (≈ 4 weeks)
- **Future:** 29+ days (≈ 6+ weeks)

**Note:** Estimates assume 1‑2 full‑stack developers. Add 20‑30% for QA, documentation, and unexpected scope.

---
*Backlog version: 1.0. Updated: 2026‑02‑13*