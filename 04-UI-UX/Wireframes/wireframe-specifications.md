# Wireframe Specifications - Building Maintenance App

## Design Principles (Based on Research)

### **Core User Needs:**
1. **Simplicity** - 100% of tenants comfortable with apps, but need intuitive flows
2. **Clarity** - Address communication gaps with clear status indicators
3. **Efficiency** - Solve "having to be home" frustration with smart scheduling
4. **Documentation** - 80% already take photos, make this seamless
5. **Communication** - SMS preferred (70%), integrate notifications naturally

### **Technical Constraints:**
- **Mobile-first** - Primary use case on smartphones
- **Bilingual** - English/Spanish support for Miami
- **Offline-capable** - Maintenance staff in buildings with poor reception
- **Photo-heavy** - Optimize for image uploads and viewing

### **Miami-Specific Considerations:**
- **Emergency workflows** - AC failures, water leaks, hurricane prep
- **Seasonal patterns** - Summer heat, rainy season, hurricane season
- **Environmental factors** - Salt air, pool maintenance, mold issues

---

## Screen Inventory

### **Tenant-Facing Screens (Primary User: Maria Rodriguez)**
1. **T1:** Login/Registration
2. **T2:** Dashboard/Home
3. **T3:** Issue Submission (with photo upload)
4. **T4:** Issue Status Tracking
5. **T5:** Scheduling/Coordination
6. **T6:** Repair History
7. **T7:** Notifications/Settings

### **Manager-Facing Screens (Primary User: Robert Chen)**
8. **M1:** Manager Dashboard
9. **M2:** Issue Queue/List View
10. **M3:** Issue Detail View
11. **M4:** Assignment & Scheduling
12. **M5:** Staff Management
13. **M6:** Reporting & Analytics
14. **M7:** Emergency Mode

### **Maintenance Staff Screens**
15. **S1:** Task List/Assignments
16. **S2:** Task Detail/Update
17. **S3:** Photo Documentation
18. **S4:** Parts/Inventory

---

## Wireframe Priority Order (MVP)

### **Phase 1: Core MVP (Weeks 1-2)**
1. **T3:** Issue Submission (with photo upload) - *Top priority*
2. **T4:** Issue Status Tracking - *#1 requested feature*
3. **M1:** Manager Dashboard - *Manager's biggest need*
4. **M3:** Issue Detail View - *Critical for visibility*

### **Phase 2: Enhanced Features (Weeks 3-4)**
5. **T5:** Scheduling/Coordination - *Solves "having to be home"*
6. **M2:** Issue Queue/List View - *Workflow management*
7. **S1:** Task List/Assignments - *Staff productivity*
8. **M7:** Emergency Mode - *Miami-specific*

### **Phase 3: Advanced Features (Weeks 5-6)**
9. **T6:** Repair History - *Transparency*
10. **M6:** Reporting & Analytics - *Manager insights*
11. **S3:** Photo Documentation - *Staff workflow*
12. **T2:** Dashboard/Home - *User engagement*

---

## Design System Guidelines

### **Typography:**
- **Primary Font:** System default (San Francisco for iOS, Roboto for Android)
- **Headings:** Bold, clear hierarchy
- **Body:** Readable at small sizes (14-16px minimum)
- **Labels:** Clear, action-oriented language

### **Colors:**
- **Primary:** Blue (trust, professionalism)
- **Secondary:** Green (success, completion)
- **Warning:** Orange (attention needed)
- **Emergency:** Red (urgent action required)
- **Neutral:** Gray scale for backgrounds and text

### **Components:**
- **Buttons:** Clear CTAs, appropriate sizing
- **Forms:** Simple, minimal fields
- **Cards:** Information grouping
- **Lists:** Easy scanning
- **Modals:** Focused actions
- **Notifications:** Non-intrusive but visible

### **Interaction Patterns:**
- **Photo upload:** Drag-and-drop + camera access
- **Status updates:** Real-time indicators
- **Notifications:** SMS integration + in-app
- **Scheduling:** Calendar integration
- **Emergency mode:** Quick access, simplified workflow

---

## User Flow Mapping

### **Tenant Issue Reporting Flow:**
```
Login → Dashboard → Report Issue → 
1. Describe problem → 
2. Add photos → 
3. Select urgency → 
4. Schedule if needed → 
5. Submit → 
Confirmation → Status tracking
```

### **Manager Workflow:**
```
Dashboard → View queue → 
1. Filter by urgency/building → 
2. Select issue → 
3. Review details/photos → 
4. Assign to staff → 
5. Set priority → 
6. Notify tenant → 
Monitor progress
```

### **Emergency Workflow (Miami):**
```
Emergency toggle ON → 
Simplified reporting → 
Automatic high priority → 
Immediate manager notification → 
Staff assignment bypass → 
Direct communication channel → 
Post-emergency documentation
```

---

## Success Metrics for Wireframes

### **Usability Goals:**
1. **Time to report issue:** < 2 minutes
2. **Photo upload success rate:** > 95%
3. **Status understanding:** 100% clarity on current state
4. **Scheduling completion:** < 3 steps
5. **Emergency reporting:** < 1 minute

### **Accessibility Requirements:**
1. **Screen reader compatible**
2. **Color contrast compliant** (WCAG AA)
3. **Touch target sizes** (minimum 44x44px)
4. **Text resizing** (up to 200%)
5. **Keyboard navigation** support

### **Performance Targets:**
1. **Photo upload:** < 5 seconds on 3G
2. **Status updates:** Real-time (< 2 second delay)
3. **Dashboard load:** < 3 seconds
4. **Offline functionality:** Core actions available

---

## Next Steps After Wireframing

1. **Usability testing** with 3-5 users per persona
2. **Iterate designs** based on feedback
3. **Create high-fidelity mockups**
4. **Develop component library**
5. **Handoff to development team**
6. **Continuous user testing** during development

---

## File Structure for Wireframes

```
04-UI-UX/Wireframes/
├── specifications.md (this file)
├── tenant/
│   ├── T3-issue-submission.md
│   ├── T4-status-tracking.md
│   └── T5-scheduling.md
├── manager/
│   ├── M1-dashboard.md
│   ├── M3-issue-detail.md
│   └── M7-emergency-mode.md
├── staff/
│   └── S1-task-list.md
└── assets/
    └── (screenshots, diagrams, etc.)
```

---

## References

1. **Research Findings:** `../Personas/research-findings-summary.md`
2. **Personas:** `../Personas/persona-cards.md`
3. **Feature Prioritization:** Based on survey/interview data
4. **Technical Constraints:** System architecture documentation
5. **Miami Context:** Interview insights on local needs