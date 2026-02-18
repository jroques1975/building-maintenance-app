# Wireframe: T3 - Issue Submission Screen

**Priority:** 1 (Top Priority - MVP Core)  
**User:** Maria Rodriguez (Tenant)  
**Research Basis:** 80% already take photos, need to solve "having to be home" frustration

---

## Screen Purpose
Allow tenants to quickly report maintenance issues with photo documentation and scheduling options.

## User Story
"As a tenant, I want to report maintenance issues with photos and schedule repairs at my convenience, so I don't have to be home during work hours."

## Research Insights Applied
1. **Photo documentation:** 80% of tenants already do this
2. **Scheduling frustration:** "Having to be home" is top complaint (60%)
3. **Communication preference:** SMS notifications (70%)
4. **Tech comfort:** 100% comfortable with smartphone apps

---

## Wireframe Description

### **Layout (Mobile-First)**
```
┌─────────────────────────────────┐
│  NAVIGATION BAR                 │
│ [Back] Report Issue     [Help]  │
├─────────────────────────────────┤
│  SCREEN TITLE                   │
│  What needs repair?             │
│                                 │
│  ISSUE CATEGORY (Dropdown)      │
│  [Select category ▼]            │
│                                 │
│  DESCRIPTION (Text Area)        │
│  [Describe the issue...]        │
│  (Character counter: 0/500)     │
│                                 │
│  LOCATION (Auto-filled)         │
│  [Unit 304 - 123 Main St]       │
│  [Edit location]                │
│                                 │
│  PHOTO SECTION                  │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐       │
│  │ + │ │   │ │   │ │   │       │
│  └───┘ └───┘ └───┘ └───┘       │
│  Add photos (0/4)               │
│  Tap + to take or upload        │
│                                 │
│  URGENCY SELECTOR               │
│  ○ Routine - Within 3 days      │
│  ● Urgent - Within 24 hours     │
│  ○ Emergency - Immediate        │
│                                 │
│  SCHEDULING (Optional)          │
│  [ ] I'd like to schedule       │
│      ┌─────────────────────┐    │
│      │ Preferred dates/times│    │
│      │ [Select...]         │    │
│      └─────────────────────┘    │
│                                 │
│  NOTIFICATION PREFERENCE        │
│  [✓] Text me updates (SMS)      │
│  [ ] App notifications          │
│                                 │
│  SUBMIT BUTTON                  │
│  [ REPORT ISSUE ]               │
│                                 │
│  EMERGENCY NOTE                 │
│  For water leaks or AC failure, │
│  call (305) 555-1234 immediately│
└─────────────────────────────────┘
```

### **Key Components**

#### **1. Navigation Bar**
- **Back button:** Returns to dashboard
- **Title:** "Report Issue"
- **Help icon:** Contextual help for each section

#### **2. Issue Category (Dropdown)**
**Options based on research:**
- Plumbing (leaks, drains, toilets)
- Electrical (outlets, lights, circuit breakers)
- HVAC (AC, heating, thermostat)
- Appliances (refrigerator, oven, dishwasher)
- General repair (doors, windows, locks)
- Pest control
- Other

#### **3. Description Text Area**
- Placeholder: "Describe the issue in detail..."
- Character limit: 500
- Real-time counter
- **Smart suggestions:** Based on category selection

#### **4. Location (Auto-filled)**
- Pre-filled from user profile
- Editable for multiple units or specific locations
- **Research insight:** Miami buildings often have complex unit numbering

#### **5. Photo Section (CRITICAL - 80% usage)**
- **Max 4 photos** (balance between documentation and upload time)
- **Tap + to:** Take photo or choose from gallery
- **Photo preview:** Thumbnails with delete option
- **Optimization:** Automatic compression for faster upload
- **Guidance:** "Clear, well-lit photos help us fix it faster"

#### **6. Urgency Selector**
**Based on manager interview categories:**
- **Routine:** Within 3 business days (painting, minor repairs)
- **Urgent:** Within 24 hours (partial AC, drain issues)
- **Emergency:** Immediate response (water leaks, AC failure, electrical hazards)
- **Visual indicators:** Color-coded (green/yellow/red)

#### **7. Scheduling (Optional - Solves #1 frustration)**
- **Checkbox:** "I'd like to schedule a repair time"
- **Expands to show:** Date picker + time slots
- **Smart suggestions:** Based on maintenance staff availability
- **Flexible options:** "Morning (8-12)", "Afternoon (12-4)", "Evening (4-7)"
- **Research insight:** Tenants want control over timing

#### **8. Notification Preference**
- **Default checked:** "Text me updates (SMS)" - 70% preference
- **Option:** "App notifications"
- **Note:** "You can change this in settings anytime"

#### **9. Submit Button**
- **State management:** Disabled until minimum info provided
- **Progress indicator:** After submission
- **Confirmation:** Immediate feedback with ticket number

#### **10. Emergency Note (Miami-specific)**
- Visible for all users
- Prominent warning for critical issues
- Direct phone number for immediate assistance
- **Research insight:** AC failure in Miami summer is emergency

---

## Interaction Flow

### **Primary Flow (Standard Issue):**
1. User selects category → Description field gets smart suggestions
2. User adds 1-4 photos → Thumbnails appear, upload begins in background
3. User selects urgency → Scheduling options adjust (emergency hides scheduling)
4. User optionally schedules → Date/time selection
5. User reviews notification preference → Default SMS checked
6. User submits → Immediate confirmation with ticket # and next steps

### **Emergency Flow:**
1. User selects "Emergency" urgency → Scheduling section disappears
2. Red warning appears: "For immediate assistance, call (305) 555-1234"
3. Submit button changes to "REPORT EMERGENCY" (red)
4. Upon submission: "Emergency reported. Maintenance has been notified."

### **Photo Upload Flow:**
1. Tap + → Options: "Take Photo" or "Choose from Gallery"
2. Camera opens → Take photo → Auto-crop suggestion
3. Photo added → Thumbnail appears, upload starts
4. Bad photo? → Tap thumbnail → Options: Retake, Delete, Replace
5. Upload progress → Subtle indicator, continues in background

---

## Error States & Validation

### **Validation Rules:**
- **Minimum:** Category + Description (50 chars) OR 1 photo
- **Maximum:** 4 photos, 500 character description
- **Required for emergency:** Phone number on file

### **Error Messages:**
- **No category:** "Please select what needs repair"
- **No description/photos:** "Please describe the issue or add a photo"
- **Poor photo quality:** "Photo is blurry. Try again in better light?"
- **Scheduling conflict:** "That time is unavailable. Try another slot."

### **Success State:**
```
✅ Issue Reported! #BMA-304-2026-001

Your maintenance request has been submitted.

Next steps:
1. Manager will review within 2 hours
2. You'll receive a text when assigned
3. Track progress in the app

[ VIEW STATUS ] [ DONE ]
```

---

## Accessibility Considerations

### **Screen Reader:**
- **Category dropdown:** "Issue category, select plumbing, electrical, HVAC..."
- **Photo buttons:** "Add photo, button, tap to take or upload"
- **Urgency selector:** "Urgency level, radio buttons, routine, urgent, emergency"

### **Color & Contrast:**
- **Emergency red:** Meets WCAG AA contrast requirements
- **Photo thumbnails:** Clear border for visibility
- **Form fields:** High contrast labels

### **Touch Targets:**
- **All buttons:** Minimum 44x44px
- **Photo thumbnails:** Easy tap targets
- **Radio buttons:** Large touch area

### **Text Size:**
- **Supports dynamic type** (up to 200%)
- **Labels remain visible** at largest sizes
- **Layout adapts** to text size changes

---

## Technical Considerations

### **Performance:**
- **Photo optimization:** Automatic compression (max 2MB each)
- **Background upload:** Doesn't block form submission
- **Progressive enhancement:** Works with poor connectivity

### **Platform Specifics:**
- **iOS:** Uses native photo picker, supports Live Photos
- **Android:** Uses system file picker, supports multiple selection
- **Web:** Drag-and-drop support, camera access via browser

### **Data Requirements:**
- **Minimum for submission:** Category + (Description OR Photo)
- **Optional:** Scheduling preferences, additional photos
- **Auto-filled:** User location, contact info, notification preferences

### **Integration Points:**
- **Camera/Photo library** (device permissions)
- **Calendar** (for scheduling)
- **SMS gateway** (for notifications)
- **Location services** (for unit auto-fill)

---

## Miami-Specific Adaptations

### **Language Support:**
- **Bilingual toggle:** English/Español switch in navigation
- **Translated categories:** Common Miami maintenance terms
- **Cultural context:** "AC" vs "Aire Acondicionado"

### **Local Context:**
- **Emergency contacts:** Miami-area emergency numbers
- **Seasonal prompts:** "Is this hurricane-related?" during storm season
- **Common issues:** Pre-populated suggestions for Miami-specific problems

### **Regulatory Notes:**
- **Disclosure:** "By submitting, you agree to allow maintenance staff entry"
- **Privacy:** "Photos are stored securely and used only for repairs"
- **Compliance:** Miami-Dade County building code references

---

## Success Metrics

### **Usability Goals:**
- **Time to submit:** < 2 minutes for experienced users
- **First-time success rate:** > 90%
- **Photo upload success:** > 95%
- **Scheduling usage:** > 40% of submissions

### **User Satisfaction:**
- **Post-submission survey:** "How easy was it to report this issue?"
- **Net Promoter Score:** Track over time
- **App store reviews:** Mention of reporting experience

### **Business Metrics:**
- **Submission volume:** Track by category, urgency, time of day
- **Photo attachment rate:** Goal: > 80% (matching current behavior)
- **Scheduling rate:** Goal: > 50% (addressing top frustration)
- **Emergency call reduction:** Fewer phone calls for emergencies

---

## Next Iteration Ideas

### **Based on User Testing:**
1. **Voice input** for description (research shows audio AI advancements)
2. **AR overlay** for photo guidance ("Frame the leak here")
3. **Predictive text** based on building history
4. **Quick report** for repeat issues

### **Technical Enhancements:**
1. **Offline mode** - Save draft, submit when connected
2. **Batch upload** - Multiple issues at once
3. **Template issues** - "Same as last time" functionality
4. **Integration** - Chat with manager during submission

### **Miami-Specific:**
1. **Hurricane mode** - Simplified reporting for storm damage
2. **AC diagnostic** - Guided troubleshooting before submission
3. **Mold reporting** - Specialized form with health warnings
4. **Pool maintenance** - Seasonal scheduling integration

---

## Related Screens
- **T4:** Status Tracking (where user goes after submission)
- **T5:** Scheduling/Coordination (detailed scheduling interface)
- **M3:** Issue Detail View (manager sees this submission)
- **S2:** Task Detail/Update (maintenance staff sees this)

---

## File References
- **Research:** `../../Personas/research-findings-summary.md`
- **Persona:** `../../Personas/persona-cards.md#maria-rodriguez`
- **Design System:** `../wireframe-specifications.md#design-system-guidelines`

---

**Status:** ✅ **Functional prototype completed & ready for SIT testing**  
**Prototype File:** `prototype-clean.html` (Desktop)  
**SIT Documentation:** `Building-App-SIT-Test-Results.md` (23 test cases)  
**Prototype Features:** Category dropdown, description with counter, photo management (max 4), urgency selector, bilingual interface (EN/ES), form validation, emergency handling, test scenarios  
**Research Integration:** Photo-first design (80% usage), SMS notifications (70% preference), scheduling-ready interface (solves "having to be home" frustration), Miami-specific emergency workflows  
**Next Step:** Complete System Integration Testing (SIT), then usability testing with 3-5 Miami tenants