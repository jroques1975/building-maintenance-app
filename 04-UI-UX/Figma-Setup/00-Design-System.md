# Figma Design System - Building Maintenance App

## **🎨 COLOR PALETTE**

### **Primary Colors (Blue - Trust, Professionalism)**
```
Primary Blue: #2E86AB
  - Light: #5AA9C9
  - Dark: #1C5A7A
  - Background: #E8F4F9
```

### **Secondary Colors (Green - Success, Completion)**
```
Success Green: #28A745
  - Light: #5CDB7A
  - Dark: #1E7E34
  - Background: #E8F7EC
```

### **Status Colors**
```
Warning Orange: #FF6B35
  - Light: #FF9B6B
  - Dark: #CC552A
  - Background: #FFF0E8

Emergency Red: #D7263D
  - Light: #E55C6F
  - Dark: #AB1E31
  - Background: #FCE8EA

Routine Gray: #6C757D
  - Light: #ADB5BD
  - Dark: #495057
  - Background: #F8F9FA
```

### **Neutral Colors**
```
Black: #212529
White: #FFFFFF
Gray 100: #F8F9FA
Gray 200: #E9ECEF
Gray 300: #DEE2E6
Gray 400: #CED4DA
Gray 500: #ADB5BD
Gray 600: #6C757D
Gray 700: #495057
Gray 800: #343A40
Gray 900: #212529
```

### **Miami-Specific Accents**
```
Ocean Blue: #00A8E8
Sunset Orange: #FF9A3C
Palm Green: #4CAF50
Sand Beige: #F5E6CA
```

## **🔤 TYPOGRAPHY**

### **Font Family: SF Pro (Apple System Font)**
- **iOS:** SF Pro
- **Android:** Roboto (fallback)
- **Web:** System font stack

### **Type Scale**
```
Display Large: 32px / 40px (Bold)
Display Medium: 28px / 36px (Bold)
Display Small: 24px / 32px (Bold)

Title Large: 22px / 28px (Semibold)
Title Medium: 18px / 24px (Semibold)
Title Small: 16px / 22px (Semibold)

Body Large: 17px / 24px (Regular)
Body Medium: 16px / 22px (Regular)
Body Small: 14px / 20px (Regular)

Caption: 12px / 16px (Regular)
Label: 11px / 14px (Medium)
```

### **Font Weights**
```
Regular: 400
Medium: 500
Semibold: 600
Bold: 700
```

## **📐 SPACING & GRID**

### **Base Unit: 4px**
All spacing multiples of 4px

### **Spacing Scale**
```
0px: 0
4px: xs
8px: sm
12px: base
16px: md
24px: lg
32px: xl
48px: 2xl
64px: 3xl
96px: 4xl
```

### **Layout Grids**
```
Mobile: 375px width
  - Columns: 4
  - Gutter: 16px
  - Margin: 16px

Tablet: 768px width
  - Columns: 8
  - Gutter: 24px
  - Margin: 24px

Desktop: 1440px width
  - Columns: 12
  - Gutter: 32px
  - Margin: 80px
```

### **Breakpoints**
```
Mobile: 320px - 767px
Tablet: 768px - 1023px
Desktop: 1024px+
```

## **🎯 ICON SET**

### **Action Icons**
```
🏠: Home/Building
📝: Report/Write
📸: Camera/Photo
📅: Calendar/Schedule
🔔: Notifications
👤: Profile/User
⚙️: Settings
🔍: Search
📱: Mobile/Phone
✉️: Message/Email
```

### **Category Icons**
```
💧: Plumbing/Water
⚡: Electrical
❄️: HVAC/AC
🔧: General Repair
🍳: Appliances
🐜: Pest Control
🚪: Doors/Windows
🔒: Locks/Security
```

### **Status Icons**
```
✅: Completed
⏳: In Progress
📋: Submitted
👥: Assigned
⚠️: Warning/Urgent
🚨: Emergency
📊: Dashboard/Stats
📈: Trends/Analytics
```

### **Miami-Specific Icons**
```
🌴: Palm Tree/Miami
🌡️: Temperature/Heat
🌀: Hurricane/Storm
🏊: Pool
🌊: Water/Beach
☀️: Sun/Heat
🌧️: Rain/Water
```

## **🔄 ANIMATIONS & TRANSITIONS**

### **Duration Scale**
```
Fast: 150ms
Medium: 300ms
Slow: 500ms
```

### **Easing Curves**
```
Standard: cubic-bezier(0.4, 0.0, 0.2, 1)
Decelerate: cubic-bezier(0.0, 0.0, 0.2, 1)
Accelerate: cubic-bezier(0.4, 0.0, 1, 1)
```

### **Common Animations**
```
Fade In: opacity 0→1
Slide Up: translateY(20px)→0
Scale: scale(0.95)→1
Slide In Right: translateX(100%)→0
```

## **🎨 SHADOWS & ELEVATION**

### **Shadow Levels**
```
Level 0: No shadow
Level 1: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)
Level 2: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)
Level 3: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)
Level 4: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)
```

### **Elevation Usage**
```
Level 0: Background surfaces
Level 1: Cards, buttons
Level 2: Modals, dropdowns
Level 3: Navigation, headers
Level 4: Emergency alerts
```

## **📱 COMPONENT STATES**

### **Button States**
```
Default: Primary color, no shadow
Hover: Darker shade, level 1 shadow
Active: Darkest shade, level 0 shadow
Disabled: Gray 300, 50% opacity
Focus: Blue outline, level 1 shadow
```

### **Input States**
```
Default: Gray 300 border
Hover: Gray 400 border
Focus: Primary blue border, shadow
Error: Emergency red border
Success: Success green border
Disabled: Gray 200 background, Gray 400 text
```

## **🌎 MIAMI-SPECIFIC STYLES**

### **Bilingual Text Styles**
```
English: Left-aligned, SF Pro
Spanish: Left-aligned, SF Pro (same font)
Language Toggle: Blue/Green indicator
```

### **Emergency Visual Treatment**
```
Background: Emergency red with 10% opacity
Border: 2px solid Emergency red
Text: White on red background
Icon: White warning icon
```

### **Seasonal Context Styles**
```
Heat Warning: Sunset orange background
Storm Warning: Ocean blue background
Normal: Standard treatment
```

## **🎯 ACCESSIBILITY**

### **Color Contrast Ratios**
```
Normal Text: 4.5:1 minimum
Large Text: 3:1 minimum
UI Components: 3:1 minimum
```

### **Focus Indicators**
```
Outline: 2px solid Primary blue
Offset: 2px from element
Contrast: Meets WCAG AA
```

### **Touch Targets**
```
Minimum: 44px × 44px
Preferred: 48px × 48px
Spacing: 8px between targets
```

## **📐 MEASUREMENTS**

### **Border Radius**
```
Small: 4px
Medium: 8px
Large: 12px
Pill: 999px (for buttons)
Circle: 50% (for avatars)
```

### **Border Widths**
```
Thin: 1px
Medium: 2px
Thick: 4px (emergency only)
```

### **Opacity Levels**
```
Disabled: 50%
Hover overlay: 10%
Background overlay: 20%
Modal backdrop: 40%
```

## **🚀 IMPLEMENTATION NOTES**

### **Figma Setup Steps:**
1. Create Color Styles from palette
2. Create Text Styles from typography scale
3. Create Effect Styles from shadows
4. Create Layout Grids from spacing
5. Create Components from library

### **Naming Convention:**
```
Colors: Primary/Blue/500
Typography: Display/Large/Bold
Components: Button/Primary/Default
Spacing: Spacing/xs (4px)
```

### **Export Settings:**
```
iOS: @1x, @2x, @3x
Android: mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi
Web: 1x, 2x, SVG
Format: PNG, JPG, SVG
```

## **📁 FILE ORGANIZATION**

### **Figma Pages Structure:**
```
1. Design System
   - Colors
   - Typography
   - Icons
   - Grids

2. Components
   - Buttons
   - Inputs
   - Cards
   - Navigation

3. Screens
   - Tenant Flows
   - Manager Flows
   - Staff Flows

4. Prototypes
   - User Flows
   - Interactions
   - Animations

5. Assets
   - Illustrations
   - Photos
   - Logos
   - Icons
```

### **Layer Naming:**
```
Component/State/Variant
Example: Button/Primary/Hover
```

### **Auto Layout Settings:**
```
Direction: Horizontal/Vertical
Spacing: Use spacing scale
Padding: Use spacing scale
Alignment: Start/Center/End
```

---

**Next Step:** Create these styles in Figma, then build the component library.