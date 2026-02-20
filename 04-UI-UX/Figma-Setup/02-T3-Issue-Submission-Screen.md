# Screen: T3 - Issue Submission (Mobile)

## **📱 SCREEN SPECIFICATIONS**

### **Device & Layout**
```
Device: iPhone 14 Pro (393×852px)
Safe Area: Top 59px, Bottom 34px
Content Area: 393×759px
Grid: 4 columns, 16px gutter, 16px margin
```

### **Screen Structure**
```
┌─────────────────────────────────┐
│ STATUS BAR (59px)               │
│ ┌─────────────────────────────┐ │
│ │ 9:41 AM      ○ ○ ○         │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ NAVIGATION BAR (56px)           │
│ ┌─────────────────────────────┐ │
│ │ ← Back    Report Issue   ?  │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ MAIN CONTENT (Scrollable)       │
│                                 │
│ 1. Screen Title (24px)          │
│ 2. Category Selector (96px)     │
│ 3. Description Field (144px)    │
│ 4. Photo Upload (112px)         │
│ 5. Urgency Selector (120px)     │
│ 6. Emergency Note (72px)        │
│ 7. Submit Button (56px)         │
│ 8. Footer Note (40px)           │
│                                 │
│ Total Height: ~704px            │
│ (Scrolls if needed)             │
└─────────────────────────────────┘
```

## **🎨 VISUAL DESIGN**

### **1. Status Bar (System)**
```
Height: 59px
Background: Transparent
Content: System time, battery, signal
```

### **2. Navigation Bar**
```
Height: 56px
Background: White
Border Bottom: 1px #E9ECEF

Left: Back Button
  - Icon: ← (24×24px)
  - Color: #2E86AB
  - Tap Area: 44×44px

Center: Title
  - Text: "Report Issue"
  - Typography: Title Medium (18px, Semibold)
  - Color: #212529

Right: Help Button
  - Icon: ? (24×24px)
  - Color: #6C757D
  - Tap Area: 44×44px
```

### **3. Screen Title**
```
Text: "What needs repair?"
Typography: Display Small (24px, Bold)
Color: #212529
Margin Top: 24px
Margin Bottom: 16px
Alignment: Left
```

### **4. Category Selector**
```
Container: 96px height
Background: White
Border: 1px #DEE2E6
Border Radius: 12px
Padding: 16px

Label: "Category"
  - Typography: Body Small (14px, Medium)
  - Color: #495057
  - Margin Bottom: 8px

Dropdown:
  - Height: 48px
  - Background: #F8F9FA
  - Border: 1px #CED4DA
  - Border Radius: 8px
  - Padding: 0 16px
  - Typography: Body Medium (16px, Regular)
  - Color: #212529
  - Icon: Chevron down (right, 20×20px, #6C757D)

Dropdown Options:
  - Plumbing 💧
  - Electrical ⚡
  - HVAC (AC/Heating) ❄️
  - Appliances 🍳
  - General Repair 🔧
  - Pest Control 🐜
  - Other 📝
```

### **5. Description Field**
```
Container: 144px height
Background: White
Border: 1px #DEE2E6
Border Radius: 12px
Padding: 16px

Label: "Describe the issue"
  - Typography: Body Small (14px, Medium)
  - Color: #495057
  - Margin Bottom: 8px

Text Area:
  - Height: 96px (auto-expanding)
  - Background: #F8F9FA
  - Border: 1px #CED4DA
  - Border Radius: 8px
  - Padding: 12px
  - Typography: Body Medium (16px, Regular)
  - Color: #212529
  - Placeholder: "Describe the problem in detail..."
  - Character Counter: "0/500" (Caption, #6C757D, right)
```

### **6. Photo Upload Section**
```
Container: 112px height
Background: White
Border: 1px #DEE2E6
Border Radius: 12px
Padding: 16px

Label: "Add photos (optional)"
  - Typography: Body Small (14px, Medium)
  - Color: #495057
  - Margin Bottom: 8px

Photo Grid:
  - Layout: 4 columns
  - Spacing: 12px
  - Item Size: 64×64px

Photo Item States:
  Empty:
    - Border: 2px dashed #CED4DA
    - Border Radius: 8px
    - Background: #F8F9FA
    - Icon: + (24×24px, #6C757D)
    - Label: "Add" (Caption, #6C757D)

  With Photo:
    - Border: 1px solid #E9ECEF
    - Border Radius: 8px
    - Background: Cover photo
    - Overlay: Delete icon (top right, 16×16px, White with shadow)

Helper Text:
  - Text: "Up to 4 photos. Clear photos help us fix it faster."
  - Typography: Caption (12px, Regular)
  - Color: #6C757D
  - Margin Top: 8px
```

### **7. Urgency Selector**
```
Container: 120px height
Background: White
Border: 1px #DEE2E6
Border Radius: 12px
Padding: 16px

Label: "How urgent is this?"
  - Typography: Body Small (14px, Medium)
  - Color: #495057
  - Margin Bottom: 12px

Options (Vertical Radio Group):
  Routine:
    - Color: #28A745
    - Icon: ○ → ● (when selected)
    - Text: "Routine - Within 3-5 days"
    - Subtext: "Painting, minor repairs, general maintenance"

  Urgent:
    - Color: #FF6B35
    - Icon: ○ → ● (when selected)
    - Text: "Urgent - Within 24 hours"
    - Subtext: "Partial AC, drain issues, non-critical"

  Emergency:
    - Color: #D7263D
    - Icon: ○ → ● (when selected)
    - Text: "Emergency - Immediate response"
    - Subtext: "Water leaks, AC failure, electrical hazards"
```

### **8. Emergency Note (Conditional)**
```
Visibility: Only when Emergency selected
Container: 72px height
Background: #FCE8EA (Emergency Red 10%)
Border: 1px #D7263D
Border Radius: 12px
Padding: 12px
Margin Top: 16px

Content:
  Icon: ⚠️ (20×20px, #D7263D)
  Text: "For water leaks or AC failure, call (305) 555-HELP immediately"
  Typography: Body Small (14px, Medium)
  Color: #D7263D
  Phone Number: Tap to call, underlined
```

### **9. Submit Button**
```
Position: Fixed bottom (above keyboard)
Height: 56px
Width: 100% (393px)
Background: #2E86AB
Border Radius: 0 (full width)
Typography: Body Medium (16px, Semibold)
Color: White
Text: "Submit Issue"

States:
  Enabled: #2E86AB background
  Disabled: #ADB5BD background, 50% opacity
  Loading: Spinner + "Submitting..."
  Success: "Submitted!" → Fade out
```

### **10. Footer Note**
```
Text: "By submitting, you agree to maintenance staff entry for repairs during business hours"
Typography: Caption (12px, Regular)
Color: #6C757D
Alignment: Center
Padding: 16px 32px
Line Height: 16px
```

## **🎯 INTERACTIVE STATES**

### **Category Dropdown Open**
```
Dropdown expands downward
Max Height: 200px
Shadow: Level 2
Scrollable if more than 4 options
Backdrop dims rest of screen
Tap outside to close
```

### **Photo Upload Flow**
```
Tap Empty Slot:
  1. Action Sheet appears:
     - "Take Photo" (Camera icon)
     - "Choose from Gallery" (Photo icon)
     - "Cancel"

  Photo Taken/Selected:
    1. Preview appears in slot
    2. Upload progress indicator (circular)
    3. Success checkmark
    4. Delete button appears on hover

Tap Photo Slot (with photo):
  1. Full-screen preview
  2. Options: Replace, Delete, Cancel
```

### **Urgency Selection**
```
Tap Radio Button:
  1. Selected state animates (scale 0.8→1)
  2. Color fills from center
  3. Emergency note appears/disappears with fade
```

### **Form Validation**
```
Real-time validation:
  - Minimum: Category OR Description (50 chars) OR 1 Photo
  - Submit button enabled/disabled accordingly

Error States:
  - No category: Red border on dropdown
  - No description/photos: Red border on both fields
  - Error message below field: "Please provide at least one of these"
```

### **Submission Flow**
```
Tap Submit:
  1. Button shows loading spinner
  2. Form fields disabled
  3. Photos upload in background
  4. Success: Confirmation screen slides in
  5. Error: Red alert appears, form re-enabled

Success Confirmation:
  Screen slides up showing:
    - Checkmark animation
    - Ticket number: #BMA-304-2026-001
    - "Issue reported successfully!"
    - Next steps bullet points
    - "View Status" and "Done" buttons
```

## **📱 RESPONSIVE BEHAVIOR**

### **Keyboard Appears**
```
When description field focused:
  1. Screen scrolls to keep field visible
  2. Submit button moves above keyboard
  3. Photo grid hides if keyboard covers it
  4. Tap outside to dismiss keyboard
```

### **Different Screen Sizes**
```
iPhone SE (375×667px):
  - Smaller margins (12px)
  - Smaller photo grid (56×56px)
  - Compact spacing

iPhone Pro Max (428×926px):
  - Larger photo grid (72×72px)
  - More vertical spacing
```

### **Orientation Change**
```
Portrait: Standard layout
Landscape: Not supported (lock to portrait)
```

## **🎨 ANIMATIONS & TRANSITIONS**

### **Screen Entrance**
```
From Dashboard:
  - Slide from right (300ms)
  - Fade in content (150ms delay)
```

### **Field Focus**
```
Description field focused:
  - Border color transitions (150ms)
  - Shadow appears (200ms)
  - Field scales slightly (1.0→1.02)
```

### **Photo Upload**
```
Photo added:
  1. Slot scales down (0.9)
  2. Photo fades in (200ms)
  3. Slot scales back up (1.0)
  4. Progress ring animates

Photo deleted:
  1. Photo scales down (1.0→0.8)
  2. Opacity reduces to 0
  3. Slot returns to empty state
```

### **Submission**
```
Successful submission:
  1. Button scales down (0.95)
  2. Checkmark draws (500ms)
  3. Screen slides up to confirmation
  4. Confirmation elements stagger in
```

## **🌎 MIAMI-SPECIFIC FEATURES**

### **Language Toggle**
```
Position: Top right (replaces help icon when enabled)
Toggle: EN/ES
Behavior: Tapping cycles languages
Animation: Slide transition between languages
```

### **AC-Specific Category**
```
When HVAC category selected:
  - Additional field appears: "Is the AC completely not working?"
  - Options: Yes (emergency), No (partial), Don't know
  - Affects urgency auto-selection
```

### **Hurricane Mode**
```
When enabled in app settings:
  - Additional category: "Storm Damage"
  - Urgency defaults to Emergency
  - Special instructions for hurricane prep
```

## **🔧 TECHNICAL SPECIFICATIONS**

### **Form Data Structure**
```json
{
  "category": "hvac",
  "description": "AC not cooling properly",
  "photos": ["base64_or_url1", "base64_or_url2"],
  "urgency": "urgent",
  "unitId": "unit-304",
  "tenantId": "user-123",
  "metadata": {
    "appVersion": "1.0.0",
    "timestamp": "2026-02-17T20:00:00Z",
    "location": {
      "latitude": 25.7617,
      "longitude": -80.1918
    }
  }
}
```

### **API Endpoints**
```
POST /api/issues
  - Creates new issue
  - Returns issue ID and status

POST /api/issues/{id}/photos
  - Uploads photos for existing issue
  - Supports multiple in parallel
```

### **Local Storage**
```
Draft auto-save:
  - Every 30 seconds
  - On app background
  - On field blur

Draft structure:
  - Form fields
  - Photo references (local URIs)
  - Timestamp
```

## **🎯 USER TESTING SCENARIOS**

### **Test 1: Simple Issue Report**
```
Task: Report a leaky faucet
Success: Under 2 minutes, no errors
Metrics: Time, taps, errors
```

### **Test 2: Emergency AC Report**
```
Task: Report AC not working in Miami heat
Success: Emergency selected, note appears
Metrics: Urgency selection accuracy
```

### **Test 3: Photo Documentation**
```
Task: Report issue with 3 photos
Success: Photos uploaded, clear previews
Metrics: Photo upload success rate
```

## **🚀 NEXT STEPS AFTER THIS SCREEN**

### **Immediate Next Screen: T4 - Status Tracking**
```
Shows after successful submission
Real-time updates
Photo gallery
Chat with maintenance
```

### **Related Screens to Design:**
1. **T4:** Status Tracking
2. **T5:** Scheduling/Coordination
3. **M1:** Manager Dashboard
4. **M3:** Issue Detail View

### **Development Parallel Track:**
1. Backend API for issue submission
2. Photo upload service
3. Mobile form implementation
4. Database schema implementation

---

**Ready to build in Figma:** Use the design system and component library to create this screen with proper spacing, colors, and interactive states.