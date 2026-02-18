# Wireframe: M1 - Manager Dashboard

**Priority:** 2 (MVP Core - Manager's Primary View)  
**User:** Robert Chen (Building Manager)  
**Research Basis:** Manager's biggest pain point = "Lack of visibility into open requests"

---

## Screen Purpose
Provide building managers with real-time visibility into all maintenance activities across their portfolio.

## User Story
"As a building manager, I need to see all open maintenance requests, their status, and aging at a glance, so I can prioritize and assign work effectively."

## Research Insights Applied
1. **Visibility gap:** Manager's #1 frustration = no real-time view
2. **Documentation chaos:** Info scattered across Excel, email, QuickBooks
3. **Miami-specific:** Need AC tracking, hurricane workflows
4. **Communication:** Lost email threads, delayed updates
5. **Success metrics:** Reduction in tenant complaints, faster resolution

---

## Wireframe Description

### **Layout (Desktop-First, Responsive)**
```
┌─────────────────────────────────────────────────────┐
│  GLOBAL NAVIGATION                                  │
│ [Logo] BMA Dashboard  [Search]  [Alerts(3)] [User] │
├─────────────────────────────────────────────────────┤
│  QUICK STATS BAR                                    │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│ │ Open    │ │ Urgent  │ │ Today   │ │ Aging   │    │
│ │ 24      │ │ 8       │ │ 12      │ │ >3 days │    │
│ │ issues  │ │ issues  │ │ due     │ │ 6       │    │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘    │
├─────────────────────────────────────────────────────┤
│  MAIN DASHBOARD (Two-Column Layout)                 │
│                                                     │
│  LEFT COLUMN (60%)              RIGHT COLUMN (40%)  │
│  ┌─────────────────────────┐   ┌─────────────────┐ │
│  │ ISSUE QUEUE             │   │ QUICK ACTIONS   │ │
│  │                         │   │                 │ │
│  │ FILTERS:                │   │ [New Issue]     │ │
│  │ [All] [Urgent] [Mine]   │   │ [Assign Bulk]   │ │
│  │ Building: [All ▼]       │   │ [Send Update]   │ │
│  │ Category: [All ▼]       │   │ [Generate Report]│
│  │                         │   │                 │ │
│  │ ISSUE LIST:             │   │                 │ │
│  │ ┌─────────────────────┐ │   │ EMERGENCY MODE  │ │
│  │ │ ⚠️ #304 AC Failed   │ │   │ [ ] Activate    │ │
│  │ │ Unit 304 • 2h ago   │ │   │ Hurricane Prep  │ │
│  │ │ 🔴 URGENT • No AC   │ │   │                 │ │
│  │ └─────────────────────┘ │   │ ACTIVITY FEED   │ │
│  │                         │   │ ┌─────────────┐ │ │
│  │ ┌─────────────────────┐ │   │ │ J. assigned │ │ │
│  │ │ #205 Leaky Faucet   │ │   │ │ #304 to Tech│ │ │
│  │ │ Unit 205 • 1d ago   │ │   │ │ 10:30 AM    │ │ │
│  │ │ 🟡 URGENT • Wet floor│ │   │ └─────────────┘ │ │
│  │ └─────────────────────┘ │   │ │ M. completed │ │ │
│  │                         │   │ │ #201 repair  │ │ │
│  │ ┌─────────────────────┐ │   │ │ 9:45 AM      │ │ │
│  │ │ #102 Paint peeling  │ │   │ └─────────────┘ │ │
│  │ │ Unit 102 • 3d ago   │ │   │                 │ │
│  │ │ 🟢 ROUTINE • Exterior│ │   │ MIAMI ALERTS   │ │
│  │ └─────────────────────┘ │   │ ┌─────────────┐ │ │
│  │                         │   │ │ 🌡️ Heat Wave│ │ │
│  │ [Load More...]          │   │ │ Expect AC   │ │ │
│  │                         │   │ │ issues       │ │ │
│  │                         │   │ └─────────────┘ │ │
│  └─────────────────────────┘   └─────────────────┘ │
│                                                     │
│  BOTTOM SECTION (Full Width)                       │
│  ┌───────────────────────────────────────────────┐ │
│  │ PERFORMANCE METRICS                           │ │
│  │                                               │ │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────┐ │ │
│  │ │ Avg Resp│ │ Avg Comp│ │ Tenant  │ │ Cost │ │ │
│  │ │ Time    │ │ Time    │ │ Sat.    │ │ /Unit│ │ │
│  │ │ 4.2h    │ │ 1.8d    │ │ 92%     │ │ $45  │ │ │
│  │ │ (Goal:6h)│ │ (Goal:2d)│ │ (Goal:90%)│ │ (Budget:$50)│ │
│  │ └─────────┘ └─────────┘ └─────────┘ └──────┘ │ │
│  │                                               │ │
│  │ TRENDING ISSUES (This Month)                  │ │
│  │ • AC Repairs: 12 (↑ 20%)                      │ │
│  │ • Plumbing: 8 (↓ 10%)                         │ │
│  │ • Electrical: 5 (steady)                      │ │
│  │                                               │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### **Key Components**

#### **1. Global Navigation**
- **Logo/Branding:** "BMA" (Building Maintenance App)
- **Search:** Global search across issues, units, tenants
- **Alerts badge:** Real-time count of urgent items
- **User menu:** Profile, settings, logout

#### **2. Quick Stats Bar (Always Visible)**
**Critical metrics at a glance:**
- **Open issues:** Total unresolved (color-coded by aging)
- **Urgent issues:** Require immediate attention (red badge)
- **Today due:** Scheduled for completion today
- **Aging >3 days:** Risk of tenant complaints

#### **3. Issue Queue (Left Column - Primary Workspace)**
**Filters (Based on manager interview needs):**
- **Status:** All / Urgent / Mine (assigned to me)
- **Building:** Dropdown for portfolio (4 buildings in interview)
- **Category:** AC, Plumbing, Electrical, etc.
- **Custom filters:** Save frequent filter combinations

**Issue Cards (Each shows):**
- **Urgency indicator:** 🔴 URGENT / 🟡 URGENT / 🟢 ROUTINE
- **Issue #:** Clickable to detail view
- **Unit & building:** Quick location context
- **Time since report:** "2h ago", "1d ago", "3d ago"
- **Brief description:** First line of issue
- **Visual cue:** Color border matches urgency

#### **4. Quick Actions (Right Column)**
**Frequent tasks:**
- **New Issue:** Quick report (bypasses tenant submission)
- **Assign Bulk:** Select multiple, assign to staff
- **Send Update:** Broadcast to multiple tenants
- **Generate Report:** Quick PDF for building owners

#### **5. Emergency Mode (Miami-specific)**
- **Toggle:** Activate hurricane/storm mode
- **Changes workflow:** Simplified reporting, priority overrides
- **Research insight:** Hurricane season overload management

#### **6. Activity Feed (Real-time)**
**Shows:**
- Staff assignments
- Status updates
- Completion notifications
- **Auto-refresh:** Every 30 seconds
- **Click to view:** Jump to relevant issue

#### **7. Miami Alerts**
**Contextual warnings:**
- **Heat wave:** Expect increased AC issues
- **Storm warning:** Prepare for water leaks
- **Seasonal:** Pool maintenance reminders
- **Research insight:** Proactive management reduces emergencies

#### **8. Performance Metrics**
**Success metrics from interview:**
- **Avg Response Time:** Goal < 6 hours
- **Avg Completion Time:** Goal < 2 days
- **Tenant Satisfaction:** Goal > 90%
- **Cost per Unit:** Goal < $50/month
- **Visual:** Green/red indicators vs goals

#### **9. Trending Issues**
**Pattern recognition:**
- **This month vs last month:** Percentage changes
- **Building-specific trends:** Which building has most issues
- **Category analysis:** What types of issues are increasing
- **Research insight:** AC repairs spike in Miami summer

---

## Interaction Flow

### **Primary Workflow:**
1. **Login →** Dashboard loads with real-time stats
2. **Scan Quick Stats →** Identify problem areas
3. **Filter Issue Queue →** Focus on urgent/aging items
4. **Click Issue Card →** Opens detail view (M3)
5. **Assign/Update →** From detail view or bulk actions
6. **Monitor Activity Feed →** Track progress in real-time

### **Emergency Mode Activation:**
1. **Toggle Emergency Mode →** Interface changes:
   - **Stats bar:** Shows only emergency metrics
   - **Issue queue:** Filters to emergency only
   - **Quick actions:** Simplified emergency workflow
   - **Color scheme:** Red accent throughout
2. **Emergency resolved →** Toggle off, generate post-emergency report

### **Bulk Operations:**
1. **Select multiple issues →** Checkboxes appear
2. **Click "Assign Bulk" →** Staff assignment modal
3. **Select staff + priority →** Apply to all selected
4. **Confirmation →** Shows count of updated issues

### **Real-time Updates:**
- **WebSocket connection:** Live updates without refresh
- **Visual cues:** Subtle highlights on changed items
- **Sound optional:** Gentle notification for urgent updates
- **Badge updates:** Alert count changes in real-time

---

## Data Visualization

### **Color Coding System:**
- **🔴 Red:** Emergency (immediate response needed)
- **🟠 Orange:** Urgent (< 24 hours)
- **🟡 Yellow:** High priority (< 3 days)
- **🟢 Green:** Routine (scheduled)
- **🔵 Blue:** Completed/Closed
- **⚫ Gray:** On hold/Cancelled

### **Aging Indicators:**
- **Fresh:** < 24 hours (normal border)
- **Aging:** 1-3 days (subtle pulse animation)
- **Stale:** > 3 days (red border, warning icon)
- **Critical:** > 7 days (blinking alert, auto-escalation)

### **Performance Charts (Future Enhancement):**
- **Response time trend:** Weekly/Monthly view
- **Category distribution:** Pie chart of issue types
- **Cost analysis:** Bar chart by building/category
- **Staff performance:** Completion times by technician

---

## Mobile Adaptation

### **Mobile Layout (Priority Information):**
```
[Header: Stats Bar]
[Emergency Toggle]
[Issue Queue - Simplified]
[Quick Actions - Horizontal Scroll]
[Activity Feed - Collapsible]
```

### **Mobile Interactions:**
- **Swipe actions:** Swipe issue left = assign, right = view
- **Pull to refresh:** Manual update of queue
- **Bottom navigation:** Quick jump to key sections
- **Offline mode:** Cache recent data, sync when connected

---

## Miami-Specific Features

### **Seasonal Dashboard Variations:**
- **Summer (May-Oct):** AC tracking prominent, heat warnings
- **Hurricane Season (Jun-Nov):** Emergency mode always visible
- **Rainy Season:** Water intrusion alerts
- **Winter:** Heating system monitoring (less critical in Miami)

### **Local Integration:**
- **Weather API:** Real-time weather alerts on dashboard
- **Miami-Dade alerts:** Building code compliance reminders
- **Local vendor status:** Integrated vendor availability
- **Bilingual toggle:** English/Español interface switch

### **Regulatory Compliance:**
- **Insurance tracking:** Flag issues affecting insurance
- **Mold documentation:** Special tracking for mold complaints
- **Accessibility compliance:** ADA issue tracking
- **Hurricane preparedness:** Shutter inspection scheduling

---

## Success Metrics

### **Manager Efficiency Goals:**
- **Time to triage:** < 5 minutes for new issues
- **Assignment speed:** < 2 minutes from review to assignment
- **Daily review time:** < 30 minutes for entire portfolio
- **Emergency response:** < 15 minutes notification to action

### **Business Impact Metrics:**
- **Tenant complaint reduction:** Goal: 40% decrease in 3 months
- **Resolution time improvement:** Goal: 25% faster average
- **Cost reduction:** Goal: 15% lower maintenance costs
- **Owner satisfaction:** Quarterly survey score improvement

### **System Performance:**
- **Dashboard load time:** < 3 seconds
- **Real-time update latency:** < 2 seconds
- **Offline functionality:** Core features available
- **Mobile responsiveness:** Seamless phone/tablet experience

---

## Technical Considerations

### **Data Requirements:**
- **Real-time sync:** WebSocket for live updates
- **Caching strategy:** Recent issues, staff lists, building info
- **Offline storage:** Local database for mobile
- **API optimization:** Paginated issue loading, lazy metrics

### **Performance Optimizations:**
- **Virtual scrolling:** For large issue queues
- **Progressive loading:** Stats first, then details
- **Background sync:** Periodic data refresh
- **Image optimization:** Thumbnails only, lazy load

### **Security:**
- **Role-based access:** Manager vs staff vs owner views
- **Building segregation:** Can't see other manager's buildings
- **Audit logging:** All actions recorded
- **Data encryption:** In transit and at rest

---

## Next Iteration Ideas

### **Based on Manager Feedback:**
1. **Predictive alerts:** "Based on history, expect AC issues this week"
2. **Automated assignments:** AI suggests optimal staff assignments
3. **Voice commands:** "Hey BMA, show me urgent plumbing issues"
4. **Integration:** QuickBooks sync for cost tracking

### **Advanced Analytics:**
1. **Predictive maintenance:** Flag units/buildings needing preventive work
2. **Cost forecasting:** Predict monthly maintenance budgets
3. **Vendor performance:** Track response times and quality
4. **Tenant risk scoring:** Identify frequently complaining tenants

### **Miami-Specific Enhancements:**
1. **Hurricane tracker:** Integrated storm path monitoring
2. **AC efficiency scoring:** Track units with frequent AC issues
3. **Mold risk assessment:** Humidity + leak history analysis
4. **Pool maintenance scheduler:** Seasonal automation

---

## Related Screens
- **M3:** Issue Detail View (drill-down from dashboard)
- **M2:** Issue Queue/List View (alternative view)
- **M7:** Emergency Mode (specialized workflow)
- **M6:** Reporting & Analytics (detailed metrics)

---

## File References
- **Research:** `../../Personas/research-findings-summary.md`
- **Persona:** `../../Personas/persona-cards.md#robert-chen`
- **Design System:** `../wireframe-specifications.md#design-system-guidelines`
- **Interview Insights:** `../../Personas/interview_manager.md`

---

**Status:** Ready for manager review and usability testing  
**Next Step:** Create interactive prototype for manager feedback session