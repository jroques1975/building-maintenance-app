# Component Library - Building Maintenance App

## **🎯 BUTTONS**

### **Primary Button**
```
Size: 48px height
Padding: 16px horizontal, 12px vertical
Border Radius: 8px
Typography: Body Medium, Semibold

States:
- Default: Primary Blue background, White text
- Hover: Primary Blue Dark background
- Active: Primary Blue Darker background
- Disabled: Gray 300 background, Gray 500 text, 50% opacity
- Focus: 2px Primary Blue outline

Variants:
- Full Width: 100% container width
- Icon Left: Icon + 8px spacing + Text
- Icon Right: Text + 8px spacing + Icon
- Icon Only: 48px × 48px square
```

### **Secondary Button**
```
Size: 48px height
Padding: 16px horizontal, 12px vertical
Border Radius: 8px
Typography: Body Medium, Semibold

States:
- Default: White background, Primary Blue text, 1px Gray 300 border
- Hover: Gray 100 background
- Active: Gray 200 background
- Disabled: Gray 100 background, Gray 500 text, 50% opacity
- Focus: 2px Primary Blue outline
```

### **Text Button**
```
Size: Auto height
Padding: 8px horizontal, 4px vertical
Border Radius: 4px
Typography: Body Medium, Semibold

States:
- Default: Transparent background, Primary Blue text
- Hover: Gray 100 background
- Active: Gray 200 background
- Disabled: Gray 500 text, 50% opacity
```

### **Emergency Button**
```
Size: 48px height
Padding: 16px horizontal, 12px vertical
Border Radius: 8px
Typography: Body Medium, Semibold

States:
- Default: Emergency Red background, White text
- Hover: Emergency Red Dark background
- Active: Emergency Red Darker background
- Disabled: Gray 300 background, Gray 500 text, 50% opacity
- Focus: 2px Emergency Red outline
```

### **Button Sizes**
```
Large: 56px height, Title Medium
Medium: 48px height, Body Medium (Default)
Small: 40px height, Body Small
Extra Small: 32px height, Caption
```

## **📝 INPUTS & FORMS**

### **Text Input**
```
Height: 48px
Padding: 16px horizontal
Border Radius: 8px
Border: 1px Gray 300
Background: White
Typography: Body Medium

States:
- Default: Gray 300 border
- Hover: Gray 400 border
- Focus: 2px Primary Blue border, Level 1 shadow
- Error: 2px Emergency Red border
- Success: 2px Success Green border
- Disabled: Gray 200 background, Gray 500 text

Variants:
- With Label: Label above input
- With Icon: Icon left/right inside input
- With Helper Text: Text below input
- Text Area: Multi-line, auto-expanding
```

### **Dropdown/Select**
```
Height: 48px
Padding: 16px horizontal
Border Radius: 8px
Border: 1px Gray 300
Background: White
Typography: Body Medium
Icon: Chevron down (right side)

States:
- Default: Gray 300 border
- Open: 2px Primary Blue border, Level 1 shadow
- Disabled: Gray 200 background, Gray 500 text

Dropdown Menu:
- Max Height: 200px
- Border Radius: 8px
- Shadow: Level 2
- Item Height: 48px
- Item Padding: 16px
```

### **Checkbox**
```
Size: 24px × 24px
Border Radius: 4px
Border: 2px Gray 400

States:
- Unchecked: Gray 400 border
- Checked: Primary Blue background, White check icon
- Indeterminate: Primary Blue background, White minus icon
- Disabled: Gray 300 border, 50% opacity

With Label:
- Spacing: 12px between checkbox and label
- Label Typography: Body Medium
```

### **Radio Button**
```
Size: 24px × 24px
Border: 2px Gray 400
Background: White

States:
- Unselected: Gray 400 border
- Selected: Primary Blue border, Primary Blue dot (8px)
- Disabled: Gray 300 border, 50% opacity

With Label:
- Spacing: 12px between radio and label
- Label Typography: Body Medium
```

### **Toggle/Switch**
```
Size: 52px × 32px
Track: Gray 300 background, 16px border radius
Thumb: 24px diameter, White, Level 1 shadow

States:
- Off: Gray 300 track, left position
- On: Primary Blue track, right position
- Disabled: Gray 200 track, 50% opacity
```

### **Photo Upload Area**
```
Size: 80px × 80px
Border: 2px dashed Gray 300
Border Radius: 12px
Background: Gray 100

States:
- Default: Gray 300 dashed border
- Hover: Gray 400 dashed border
- Active: Primary Blue dashed border
- Has Photo: Solid border, photo thumbnail

Grid Layout:
- Max 4 photos per row
- 12px spacing between photos
- Delete icon overlay on hover
```

## **🃏 CARDS**

### **Issue Card**
```
Size: Auto height
Padding: 16px
Border Radius: 12px
Border: 1px Gray 200
Background: White
Shadow: Level 1

Content:
- Urgency Indicator (left border: 4px color)
- Issue Number + Title (Title Small)
- Unit + Time (Caption, Gray 600)
- Brief Description (Body Small, 2 lines max)
- Status Badge (right aligned)
- Assignee Avatar (optional)

Urgency Colors:
- Emergency: Red left border
- Urgent: Orange left border
- Routine: Green left border
```

### **Stats Card**
```
Size: 120px × 120px (square)
Padding: 16px
Border Radius: 12px
Background: White
Shadow: Level 1
Alignment: Center

Content:
- Icon (48px × 48px, centered)
- Number (Display Small, centered)
- Label (Caption, Gray 600, centered)

Variants:
- Primary: Primary Blue icon/text
- Success: Success Green icon/text
- Warning: Warning Orange icon/text
- Emergency: Emergency Red icon/text
```

### **Notification Card**
```
Size: Auto height
Padding: 12px
Border Radius: 8px
Background: Gray 100
Border: 1px Gray 200

Content:
- Icon (left, 24px × 24px)
- Message (Body Small, 3 lines max)
- Time (Caption, Gray 600, right)
- Unread dot (Primary Blue, 8px)

States:
- Unread: Gray 100 background, bold text
- Read: White background, regular text
- Important: Primary Blue background, White text
```

### **Building Card**
```
Size: 160px × 120px
Padding: 16px
Border Radius: 12px
Background: White
Shadow: Level 1

Content:
- Building Icon (left, 40px × 40px)
- Building Name (Title Small)
- Unit Count (Body Small, Gray 600)
- Open Issues (Caption, color-coded)
- Quick Actions (2 buttons below)
```

## **🧭 NAVIGATION**

### **Bottom Tab Bar**
```
Height: 56px
Background: White
Border Top: 1px Gray 200
Shadow: Level 1 (top shadow)

Tab Item:
- Icon: 24px × 24px
- Label: Caption
- Spacing: 4px between icon and label
- Active: Primary Blue icon/text
- Inactive: Gray 500 icon/text

Tabs (5 max):
- Home/Dashboard
- Report Issue
- Notifications
- History
- Profile
```

### **Top App Bar**
```
Height: 56px
Padding: 16px horizontal
Background: White
Border Bottom: 1px Gray 200

Content:
- Back Button (left, 24px × 24px)
- Title (Title Medium, centered)
- Actions (right, 24px × 24px icons)

Variants:
- Regular: White background
- Emergency: Emergency Red background, White text
- Search: With search input instead of title
```

### **Side Navigation (Desktop)**
```
Width: 240px
Background: White
Border Right: 1px Gray 200

Sections:
- Logo/Header (64px height)
- Primary Navigation (auto)
- Secondary Navigation (auto)
- User Profile (bottom)

Nav Item:
- Height: 48px
- Padding: 16px
- Icon: 24px × 24px (left)
- Label: Body Medium
- Active: Primary Blue background/text
- Hover: Gray 100 background
```

### **Floating Action Button (FAB)**
```
Size: 56px × 56px
Border Radius: 28px (circle)
Background: Primary Blue
Shadow: Level 2
Position: Bottom right, 16px from edges

Content:
- Plus icon (24px × 24px, White)

States:
- Default: Primary Blue
- Hover: Primary Blue Dark
- Active: Primary Blue Darker
- Extended: 56px height, auto width with label
```

## **⚠️ ALERTS & NOTIFICATIONS**

### **Inline Alert**
```
Padding: 12px
Border Radius: 8px
Border: 1px (color based on type)
Background: (color with 10% opacity)

Types:
- Info: Primary Blue border/background
- Success: Success Green border/background
- Warning: Warning Orange border/background
- Error: Emergency Red border/background

Content:
- Icon (left, 20px × 20px)
- Message (Body Small)
- Close button (right, optional)
```

### **Toast Notification**
```
Position: Bottom center, 16px from bottom
Width: 320px max
Padding: 16px
Border Radius: 8px
Background: Gray 800
Color: White
Shadow: Level 3

Content:
- Message (Body Small, White)
- Action button (Text button, Primary Blue text)
- Auto-dismiss: 5 seconds

Animation:
- Slide up from bottom
- Fade in/out
```

### **Badge**
```
Size: Auto, min 20px height
Padding: 4px horizontal, 2px vertical
Border Radius: 10px (pill)
Typography: Caption, Medium

Types:
- Default: Gray 600 background, White text
- Primary: Primary Blue background, White text
- Success: Success Green background, White text
- Warning: Warning Orange background, White text
- Emergency: Emergency Red background, White text

Positions:
- Top right of parent
- Overlap: 50% outside parent
```

## **📊 DATA DISPLAY**

### **Progress Bar**
```
Height: 8px
Border Radius: 4px
Background: Gray 200

Progress Fill:
- Height: 100%
- Border Radius: 4px
- Colors: Primary Blue (default), Success Green, Warning Orange, Emergency Red

With Label:
- Label above: Body Small
- Percentage right: Caption
```

### **Avatar**
```
Size: 40px × 40px
Border Radius: 20px (circle)
Background: Gray 300

Content:
- Initials (Body Medium, White)
- Photo (cover)

Status Indicator:
- Size: 12px × 12px
- Border: 2px White
- Position: Bottom right
- Colors: Success Green (online), Gray 500 (offline), Warning Orange (away)
```

### **Empty State**
```
Padding: 48px 32px
Alignment: Center

Content:
- Illustration (96px × 96px)
- Title (Title Medium, centered)
- Description (Body Small, Gray 600, centered)
- Action button (centered below)
```

## **🎨 MIAMI-SPECIFIC COMPONENTS**

### **Language Toggle**
```
Size: 64px × 32px
Border Radius: 16px
Background: Gray 200
Padding: 4px

Content:
- EN button (left, 28px × 24px)
- ES button (right, 28px × 24px)
- Active: White background, Primary Blue text
- Inactive: Transparent background, Gray 600 text

Animation: Slide toggle
```

### **Emergency Banner**
```
Height: 56px
Background: Emergency Red
Color: White
Typography: Body Medium, Semibold

Content:
- Warning icon (left, 24px × 24px)
- Message (centered)
- Close/Acknowledge button (right)

States:
- Visible: Slide down from top
- Dismissed: Slide up and fade out
```

### **Weather Alert Card**
```
Padding: 16px
Border Radius: 12px
Background: Gradient (based on alert)

Types:
- Heat Warning: Sunset Orange gradient
- Storm Warning: Ocean Blue gradient
- Hurricane: Emergency Red gradient

Content:
- Weather icon (left, 40px × 40px)
- Alert level (Title Small, White)
- Details (Body Small, White)
- Timeframe (Caption, White with 80% opacity)
```

## **🚀 IMPLEMENTATION GUIDE**

### **Figma Component Setup:**
1. **Create Base Components:** Button, Input, Card
2. **Add Variants:** Size, state, type variants
3. **Set Up Auto Layout:** Consistent spacing
4. **Create Component Sets:** Group related components
5. **Add Properties:** Color, size, state properties

### **Naming Convention:**
```
Component/Type/Size/State
Example: Button/Primary/Medium/Hover
```

### **Auto Layout Rules:**
- Use spacing scale (4px multiples)
- Set constraints for responsiveness
- Use frames for complex components
- Nest components for reusability

### **Interactive States:**
1. Create component for each state
2. Use variant properties for states
3. Set up interactive components
4. Create prototype connections

### **Export Settings:**
- iOS: @1x, @2x, @3x
- Android: mdpi to xxxhdpi
- Web: 1x, 2x, SVG
- Format: PNG for images, SVG for icons

---

**Next Step:** Create these components in Figma using the design system, then build the first screen (Issue Submission).