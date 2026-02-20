# Figma Setup - Building Maintenance App

## **🚀 GETTING STARTED**

### **Prerequisites**
1. **Figma Account** (Free tier works)
2. **Figma Desktop App** (recommended) or Web
3. **Design System Files** (provided in this folder)

### **Setup Steps**

#### **Step 1: Create New Figma File**
1. Open Figma
2. Create new file: "Building Maintenance App"
3. Set up pages:
   - `00-Design-System`
   - `01-Components`
   - `02-Screens`
   - `03-Prototypes`
   - `04-Assets`

#### **Step 2: Import Design System**
1. Go to `00-Design-System` page
2. Create Color Styles (use `00-Design-System.md`)
3. Create Text Styles (typography scale)
4. Create Effect Styles (shadows)
5. Set up Layout Grids

#### **Step 3: Build Component Library**
1. Go to `01-Components` page
2. Create components from `01-Component-Library.md`
3. Use Auto Layout for consistency
4. Create variants for different states
5. Organize with frames and sections

#### **Step 4: Create First Screen**
1. Go to `02-Screens` page
2. Create frame: 393×852px (iPhone 14 Pro)
3. Build T3 - Issue Submission using `02-T3-Issue-Submission-Screen.md`
4. Use components from library
5. Add interactions for prototype

#### **Step 5: Create Prototype**
1. Go to `03-Prototypes` page
2. Connect screens with interactions
3. Set up user flows
4. Add animations and transitions
5. Test on device preview

## **📁 FILE STRUCTURE**

### **Design System (`00-Design-System.md`)**
```
Colors: Primary, Secondary, Status, Neutral, Miami
Typography: Scale, weights, styles
Spacing: 4px base unit, scale
Icons: Action, Category, Status, Miami
Animations: Durations, easing, common animations
Shadows: Elevation levels
Accessibility: Contrast, touch targets
```

### **Component Library (`01-Component-Library.md`)**
```
Buttons: Primary, Secondary, Text, Emergency
Inputs: Text, Dropdown, Checkbox, Radio, Toggle, Photo
Cards: Issue, Stats, Notification, Building
Navigation: Tab bar, App bar, Side nav, FAB
Alerts: Inline, Toast, Badge
Data Display: Progress, Avatar, Empty state
Miami Components: Language toggle, Emergency banner, Weather alert
```

### **First Screen (`02-T3-Issue-Submission-Screen.md`)**
```
Device: iPhone 14 Pro (393×852px)
Sections: Status bar, Navigation, Content areas
Components: Category selector, Description, Photo upload, Urgency, Submit
Interactions: Dropdown, Photo upload, Validation, Submission
Responsive: Keyboard, screen sizes, orientation
Animations: Entrance, focus, upload, submission
Miami: Language, AC-specific, Hurricane mode
```

## **🎨 DESIGN SYSTEM IMPLEMENTATION**

### **Color Styles in Figma**
1. Open Style panel (+ icon)
2. Create Color Style for each color
3. Naming: `Primary/Blue/500`, `Status/Emergency/Red`
4. Use HEX values from design system

### **Text Styles in Figma**
1. Create Text Style for each typography
2. Naming: `Display/Large/Bold`, `Body/Medium/Regular`
3. Include line height and letter spacing

### **Component Creation**
1. Use Auto Layout for spacing
2. Create Base component first
3. Add Variants for states
4. Use Component Properties
5. Organize in frames

## **🔗 SHARING & COLLABORATION**

### **Share for Feedback**
1. Click Share button in Figma
2. Set to "Anyone with link can view"
3. Copy link and share
4. Use Comments for feedback

### **Version History**
1. Figma auto-saves versions
2. Name important versions
3. Use for iteration tracking

### **Export Assets**
1. Select component or screen
2. Click Export in right panel
3. Choose formats: PNG, JPG, SVG
4. Set scales: 1x, 2x, 3x

## **🎯 QUICK START CHECKLIST**

### **Day 1: Design System**
- [ ] Create Color Styles
- [ ] Create Text Styles
- [ ] Set up Layout Grids
- [ ] Create basic icons

### **Day 2: Component Library**
- [ ] Create Button components
- [ ] Create Input components
- [ ] Create Card components
- [ ] Create Navigation components

### **Day 3: First Screen**
- [ ] Create T3 - Issue Submission screen
- [ ] Use components from library
- [ ] Add interactions
- [ ] Test prototype

### **Day 4: Feedback & Iteration**
- [ ] Share link for feedback
- [ ] Gather comments
- [ ] Make revisions
- [ ] Create next screen

## **📱 SCREENS PRIORITY ORDER**

### **Phase 1 (Week 1)**
1. **T3:** Issue Submission (Current)
2. **T4:** Status Tracking
3. **M1:** Manager Dashboard

### **Phase 2 (Week 2)**
4. **T5:** Scheduling/Coordination
5. **M3:** Issue Detail View
6. **S1:** Task List (Staff)

### **Phase 3 (Week 3)**
7. **T2:** Dashboard/Home
8. **M7:** Emergency Mode
9. **T6:** Repair History

## **🔧 TECHNICAL INTEGRATION**

### **Design Handoff**
1. Use Figma Dev Mode
2. Export assets at correct scales
3. Provide spacing measurements
4. Include interaction specifications

### **Developer Resources**
1. Color values (HEX, RGB)
2. Typography details (font, size, weight)
3. Spacing scale (4px multiples)
4. Component specifications
5. Screen flows and interactions

## **📊 SUCCESS METRICS**

### **Design Quality**
- Consistency across screens
- Accessibility compliance
- Miami context integration
- User feedback positive

### **Development Readiness**
- Clear specifications
- Exportable assets
- Component reusability
- Responsive considerations

### **User Testing**
- Task completion rate > 90%
- Time to complete < 2 minutes
- Error rate < 5%
- Satisfaction score > 4/5

## **🚨 TROUBLESHOOTING**

### **Common Issues**
1. **Colors not matching:** Check HEX values, color modes (RGB vs HSL)
2. **Spacing inconsistent:** Use 4px grid, Auto Layout
3. **Components not updating:** Check if instance vs master
4. **Export issues:** Check scale, format, naming

### **Figma Tips**
1. Use `Shift + R` for rulers
2. Use `Ctrl + G` to group
3. Use `Ctrl + Alt + K` for Auto Layout
4. Use `Ctrl + Shift + E` to export selection

## **📚 RESOURCES**

### **Figma Documentation**
- [Figma Help Center](https://help.figma.com)
- [Figma Community](https://www.figma.com/community)
- [Figma YouTube Channel](https://www.youtube.com/c/figmadesign)

### **Design Resources**
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design](https://material.io/design)
- [Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)

### **Miami Context**
- Miami-Dade County design standards
- Bilingual design patterns
- Hurricane/emergency UI patterns

## **🎯 NEXT STEPS AFTER SETUP**

1. **Create screen in Figma** using specifications
2. **Share for feedback** with team/users
3. **Iterate based on feedback**
4. **Create next screen** in priority order
5. **Build interactive prototype**
6. **Conduct user testing**
7. **Hand off to development**

---

**Start with:** `00-Design-System.md` → Create styles in Figma  
**Then:** `01-Component-Library.md` → Build components  
**Finally:** `02-T3-Issue-Submission-Screen.md` → Create first screen

**Ready to begin!** 🚀