# Research Findings Summary - Building Maintenance App

**Date:** February 17, 2026  
**Research Methods:** 1 Building Manager Interview + 10 Tenant Surveys

---

## Executive Summary

Based on combined research with a Miami building manager and 10 tenants, we have validated core assumptions and identified critical features for MVP development. The research confirms strong market need for a solution that addresses visibility gaps, communication breakdowns, and scheduling frustrations in building maintenance.

---

## Research Methodology

### 1. Building Manager Interview
- **Participant:** Miami Residential Property Manager
- **Experience:** 12 years, manages 4 buildings (220 units)
- **Duration:** 30-45 minutes
- **Focus:** Current workflow, pain points, ideal solution

### 2. Tenant Survey
- **Responses:** 10 complete responses
- **Demographics:** Mixed building types, all age ranges represented
- **Focus:** Current experience, frustrations, feature preferences

---

## Key Findings

### 🎯 **Validated Personas**

#### **Maria Rodriguez (Tenant) - CONFIRMED**
- **Tech Comfort:** 100% of tenants comfortable with smartphone apps
- **Top Frustration:** "Having to be home" for repairs (60% mention)
- **Current Behavior:** 80% already take photos of maintenance issues
- **Communication Preference:** SMS/Text messages (70% preference)
- **Feature Demand:** Real-time status tracking, photo submission, scheduling

#### **Robert Chen (Building Manager) - CONFIRMED**
- **Current Tools:** Excel, AppFolio, QuickBooks, WhatsApp, Outlook
- **Biggest Pain Point:** Lack of visibility into open requests and overdue tasks
- **Communication Challenges:** Lost email threads, delayed updates
- **Miami-Specific Needs:** AC tracking, hurricane workflows, bilingual support
- **Ideal System:** Centralized intake, real-time tracking, photo documentation

### 📊 **Quantitative Insights (Tenant Survey)**

#### **Demographics:**
- **Building Types:** 60% Apartment complex, 30% Condominium, 10% Townhouse
- **Age Distribution:** 50% 35-44, 20% 45-54, 10% each: 18-24, 25-34, 65+
- **Tech Comfort:** 80% "Very comfortable", 20% "Comfortable" with smartphone apps

#### **Current Practices:**
- **Reporting Methods:** Mixed (text, phone, email, in-person, building portals)
- **Photo Documentation:** 80% already take photos, 10% would if possible
- **Follow-up Frequency:** Varies, but common due to lack of updates

#### **Pain Points (Ranked):**
1. **Having to be home** for repairs (60%)
2. **Slow response time** (40%)
3. **Poor communication** (20%)
4. **Repairs not done correctly** (20%)
5. **Lack of status updates** (10%)

#### **Feature Requests:**
1. **Real-time status tracking** (most requested)
2. **Photo submission capability** (high demand)
3. **SMS/Text notifications** (70% preference)
4. **Scheduling/coordination tools**
5. **Chat/messaging with staff**
6. **Repair history access**

### 🏢 **Qualitative Insights (Manager Interview)**

#### **Current Workflow Issues:**
- **Fragmented Systems:** Information scattered across Excel, email, QuickBooks
- **Communication Breakdowns:** Lost email threads, verbal updates forgotten
- **Visibility Gaps:** No real-time view of open requests or aging tickets
- **Documentation Chaos:** Manual entry leads to delays and errors

#### **Miami-Specific Challenges:**
- **AC Failures:** Year-round issue requiring urgent attention
- **Hurricane Season:** Overload of emergency requests
- **Bilingual Needs:** Spanish/English support essential
- **Environmental Factors:** Salt air corrosion, pool maintenance, mold

#### **Success Metrics (Manager Perspective):**
- Reduction in tenant complaints
- Faster resolution times
- Budget adherence
- Reduced insurance claims
- Owner satisfaction

---

## Feature Prioritization

### **MUST HAVE (MVP)**
1. **Real-time Status Tracking** - Addresses #1 frustration for both tenants and managers
2. **Photo Submission & Documentation** - 80% of tenants already do this
3. **SMS/Text Notifications** - Preferred by 70% of tenants
4. **Remote Scheduling/Coordination** - Solves "having to be home" problem
5. **Urgent/Emergency Categorization** - Critical for Miami-specific needs

### **SHOULD HAVE (Phase 2)**
6. **Chat/Messaging System** - Direct communication between tenants and staff
7. **Repair History per Unit** - Valuable for both tenants and managers
8. **Cost Tracking & Reporting** - Manager need for budgeting
9. **Preventive Maintenance Scheduling** - Manager request
10. **Bilingual Support (English/Spanish)** - Miami requirement

### **COULD HAVE (Future)**
11. **Vendor Management & Ratings**
12. **Insurance Documentation**
13. **Predictive Maintenance (AI)**
14. **Voice-based Reporting**
15. **Integration with Accounting Software**

---

## Design Implications

### **For Tenants:**
- **Mobile-first design** - 100% comfortable with apps
- **Simple photo upload** - 80% already doing this
- **Clear status indicators** - Address communication gap
- **SMS integration** - Preferred communication method
- **Flexible scheduling** - Solve "having to be home" frustration

### **For Managers:**
- **Dashboard visibility** - Real-time view of all requests
- **Aging ticket alerts** - Prevent overdue issues
- **Photo documentation** - Better issue understanding
- **Cost tracking** - Budget management
- **Emergency workflow** - Hurricane/urgent issue handling

### **Technical Requirements:**
- **Bilingual interface** - English/Spanish support
- **Offline capability** - Useful for maintenance staff in buildings
- **Photo storage** - Secure, organized documentation
- **SMS integration** - Real-time notifications
- **Role-based access** - Tenant vs manager vs maintenance views

---

## Miami-Specific Considerations

### **Seasonal Workflows:**
- **Hurricane Season (June-November):** Emergency request surge
- **Summer Heat:** AC failure emergencies
- **Rainy Season:** Water intrusion and mold issues

### **Environmental Factors:**
- Salt air corrosion (coastal buildings)
- Pool maintenance (year-round in Miami)
- Balcony concrete spalling (older buildings)
- Elevator maintenance (high-rise buildings)

### **Cultural/Language Needs:**
- Bilingual support (English/Spanish)
- Cultural understanding of tenant expectations
- Local vendor relationships

---

## Next Steps

### **Immediate (Sprint 2):**
1. **Update wireframes** based on research findings
2. **Prioritize MVP features** for development
3. **Create user stories** for MUST HAVE features
4. **Begin UI/UX design** for core flows

### **Development Priorities:**
1. **Tenant Issue Submission** with photo upload
2. **Real-time Status Tracking** dashboard
3. **SMS Notification System**
4. **Manager Dashboard** with aging alerts
5. **Emergency Workflow** for urgent issues

### **Validation:**
- Create prototype for manager feedback
- Conduct usability testing with tenants
- Validate bilingual interface with Spanish speakers
- Test emergency workflows with Miami-specific scenarios

---

## Conclusion

The research validates a strong market need for a building maintenance app that addresses the visibility, communication, and scheduling gaps in current processes. The combination of tenant frustrations ("having to be home") and manager pain points (lack of visibility) creates a clear value proposition.

**Key Opportunity:** A mobile-first platform that provides real-time status tracking, photo documentation, and SMS notifications can significantly improve the maintenance experience for both tenants and managers while addressing Miami-specific needs like AC tracking and bilingual support.

The foundation is solid for moving into detailed design and development of the MVP.

---

**Research Files:**
- `interview_manager.md` - Full building manager interview transcript
- `Survey_tenants.xlsx` - Raw survey data (10 responses)
- `interview-guide-building-managers.md` - Interview protocol
- `persona-cards.md` - Updated personas with research insights

**Next Review:** After wireframing completion, conduct usability testing with 3-5 users from each persona group.