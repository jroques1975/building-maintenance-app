# Research Findings Summary - Building Maintenance App

**Date:** February 16, 2026  
**Research Methods:** 1 Manager Interview + 10 Tenant Surveys  
**Location:** Miami, FL Focus

---

## 📊 Executive Summary

### Key Insights:
1. **Tenants want convenience:** 60% cite "having to be home" as top frustration
2. **Communication is broken:** Slow response and poor updates are major pain points
3. **Tech readiness is high:** 80% of tenants are comfortable with smartphone apps
4. **Photos are already used:** 70% of tenants take photos of maintenance issues
5. **Miami-specific needs:** AC tracking, hurricane workflows, bilingual support

### Business Impact:
- **Managers need visibility** into open/overdue tasks
- **Owners need documentation** for insurance and budgeting
- **Tenants need transparency** and convenience

---

## 👨‍💼 Manager Interview Findings (1 participant)

### Current Process:
- **Communication Channels:** 40% email, 30% phone, 20% in-person, 10% WhatsApp
- **Tracking Methods:** Excel, AppFolio, manual logs + email chains
- **Assignment:** Text/call in-house staff, call licensed vendors
- **Documentation:** Fragmented across Excel, QuickBooks, email, physical files

### Pain Points:
1. **Lack of visibility** into open requests and overdue tasks
2. **Fragmented information** across multiple systems
3. **No real-time status tracking**
4. **Manual emergency handling** (hurricane season critical)
5. **Missing historical data** (AC service history, cost trends)

### Miami-Specific Challenges:
- AC failures (year-round use)
- Water intrusion during heavy rain
- Roof leaks during hurricane season
- Mold complaints
- Salt air corrosion
- Balcony concrete spalling

### Desired Solution:
- Centralized request intake
- Automatic urgency categorization
- Tenant photo uploads
- Technician status tracking
- Full repair history per unit
- Emergency/hurricane mode workflow
- Bilingual support (English/Spanish)

---

## 👥 Tenant Survey Findings (10 participants)

### Demographics:
- **Building Types:** 60% apartments (200+ units), 30% condominiums, 10% townhouses
- **Age Range:** 35-44 (50%), 45-54 (20%), 65+ (10%), 18-24 (10%), 25-34 (10%)
- **Tech Comfort:** 80% "very comfortable" with smartphone apps

### Current Reporting Methods:
- Email (40%)
- In-person at office (40%)
- Phone call to office (40%)
- Text message (30%)
- Mobile app (10%)
- Building portal/website (10%)

### Issue Types Reported:
- Plumbing (50%)
- Cleaning/common areas (40%)
- HVAC (30%)
- Electrical (30%)
- Appliance repair (20%)

### Top Frustrations:
1. **Having to be home** (60% of tenants)
2. **Slow response time** (40%)
3. **Poor communication** (20%)
4. **Repairs not done correctly** (20%)

### Desired App Features:
1. **Submit issues with photos** (80% want this)
2. **Real-time status tracking** (50%)
3. **Schedule appointments** (50%)
4. **Chat with maintenance** (50%)
5. **Video submission** (40%)

### Communication Preferences:
- **SMS:** 70% prefer
- **Push notifications:** 20%
- **Email:** 10%

### Urgency Expectations:
- **Within 2 hours:** 90% expect for urgent issues
- **Same day:** 10% expect

### Photo Importance:
- **Very important:** 60% want to see photos of completed repairs
- **Already taking photos:** 70% have used photos for maintenance issues

---

## 🎯 Feature Prioritization (Based on Research)

### MUST HAVE (Sprint 3):
1. **Real-time status tracking** (Manager #3 need, Tenant #2 request)
2. **Photo submission with issues** (Tenant #1 request, 80% want)
3. **SMS/push notifications** (Tenant preference: 70% SMS)
4. **Urgency categorization** (Manager need for emergencies)

### SHOULD HAVE (Sprint 4):
1. **In-app scheduling with time slots** (70% tenant preference)
2. **Bilingual support** (Manager need for Miami market)
3. **Repair history per unit** (Manager need for tracking)
4. **Chat with maintenance** (50% tenant request)

### COULD HAVE (Future):
1. **Video submission** (40% tenant interest)
2. **Emergency/hurricane mode** (Manager Miami-specific need)
3. **QuickBooks integration** (Manager accounting need)
4. **Preventive maintenance tracking** (Manager need)

### WON'T HAVE (v1):
1. AI repair diagnosis
2. Augmented reality guides
3. Automated vendor bidding
4. Blockchain documentation

---

## 🏗️ Technical Implications

### Architecture Requirements:
1. **Mobile-first design** (React Native - 80% tenant app comfort)
2. **Photo upload/compression** (70% tenant photo usage)
3. **Real-time notifications** (Firebase/Pusher for SMS/push)
4. **Multi-language support** (i18n for English/Spanish)
5. **Offline capability** (Hurricane season connectivity issues)

### Data Model Updates Needed:
1. **Issue entity:** Add photo attachments, urgency level, location photos
2. **User entity:** Add communication preferences (SMS/email/push)
3. **WorkOrder entity:** Add before/after photos, technician updates
4. **Building entity:** Add emergency contacts, hurricane procedures

### Integration Requirements:
1. **SMS gateway** (Twilio or similar for tenant notifications)
2. **Photo storage** (AWS S3 or similar for uploads)
3. **Push notifications** (Firebase Cloud Messaging)
4. **Future:** QuickBooks API for cost tracking

---

## 📈 Success Metrics (From Research)

### Manager Success Metrics:
- Reduction in tenant complaints
- Faster resolution time
- Budget adherence
- Reduced insurance claims
- Owner satisfaction

### Tenant Success Metrics:
- Reduced need to be home for repairs
- Faster response times
- Better communication
- Convenient scheduling
- Photo documentation

### Business Success Metrics:
- Cost per unit tracking
- Vendor performance metrics
- Average resolution time
- Recurring issue identification
- Insurance claim reduction

---

## 🚀 Next Steps

### Immediate (This Week):
1. ✅ Update persona cards with research data
2. ✅ Create this research summary document
3. Schedule Sprint 3 planning meeting
4. Update project backlog with prioritized features

### Short-term (Next 2 Weeks):
1. Create user journey maps based on pain points
2. Begin wireframing core features
3. Technical spike: Photo upload implementation
4. Technical spike: Real-time notifications

### Medium-term (Next Month):
1. Design Sprint 3: UI/UX for core features
2. Develop MVP with MUST HAVE features
3. User testing with Miami property managers
4. Iterate based on feedback

---

## 📁 Research Artifacts

### Files Created:
1. `interview_manager.md` - Full manager interview transcript
2. `Survey_tenants.xlsx` - Raw survey data (10 respondents)
3. `persona-cards.md` - Updated personas with research data
4. `research-findings-summary.md` - This document

### Key Quotes:
- **Manager:** "I need visibility into open requests, overdue tasks, and completion confirmation."
- **Tenant:** "Having to be home all day waiting is the worst part."
- **Tenant:** "I always take photos - it helps explain the problem better."

### Miami-Specific Insights:
- AC maintenance is year-round priority
- Hurricane season requires special workflows
- Bilingual support is essential (English/Spanish)
- Insurance documentation for water damage is critical

---

**Research Completed:** February 16, 2026  
**Next Review:** Sprint 3 Planning (February 20, 2026)