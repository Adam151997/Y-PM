# FlowCraft Design System

> Linear/Notion-inspired elite UI/UX design system

## 🎨 Design Principles

1. **Clarity First** - Every element has a purpose
2. **Speed & Performance** - Optimized animations and interactions
3. **Keyboard-first** - Power users love shortcuts
4. **Consistency** - Predictable patterns across the app
5. **Polish** - Attention to micro-interactions

## 📐 Design Tokens

### Colors

#### Semantic Colors
```css
--primary: Purple-500 (#7C3AED) - Primary actions
--success: Green-500 - Success states
--warning: Amber-500 - Warning states
--destructive: Red-500 - Destructive actions
--info: Blue-500 - Informational
```

#### Surface Layers
```css
--surface-base: Base layer
--surface-raised: Elevated components
--surface-overlay: Modals, popovers
```

#### Text Hierarchy
```css
--text-primary: Primary content
--text-secondary: Secondary content
--text-tertiary: Tertiary content
--text-placeholder: Placeholder text
```

### Typography

#### Font Sizes
- **xs**: 12px - Small labels, badges
- **sm**: 14px - Body text, buttons
- **base**: 16px - Default text
- **lg**: 18px - Subheadings
- **xl**: 20px - Headings
- **2xl**: 24px - Page titles
- **3xl**: 30px - Hero text
- **4xl**: 36px - Display text

#### Line Heights
- **tight**: 1.25 - Headings
- **normal**: 1.5 - Body text
- **relaxed**: 1.75 - Long-form content

#### Letter Spacing
- **tight**: -0.02em - Headings
- **normal**: 0 - Body
- **wide**: 0.02em - All caps

### Spacing

Follows a consistent 4px base scale:
```
1  = 4px
2  = 8px
3  = 12px
4  = 16px
5  = 20px
6  = 24px
8  = 32px
10 = 40px
12 = 48px
16 = 64px
```

### Border Radius

```
sm   = 6px  - Tight corners
md   = 8px  - Standard
lg   = 12px - Default (cards, buttons)
xl   = 16px - Larger containers
2xl  = 24px - Hero sections
full = 9999px - Pills, avatars
```

### Shadows

```css
--shadow-sm: Subtle elevation
--shadow-md: Standard elevation
--shadow-lg: Prominent elevation
--shadow-xl: Modal/drawer elevation
```

### Animations

#### Durations
```
instant = 0ms   - Immediate
fast    = 150ms - Quick feedback
normal  = 250ms - Standard
slow    = 350ms - Deliberate
```

#### Easing Functions
```css
--ease-in: Quick start, slow end
--ease-out: Slow start, quick end (most common)
--ease-in-out: Balanced
--ease-spring: Bouncy, playful (use sparingly)
```

## 🧩 Components

### Buttons

#### Variants
- **default**: Primary actions (purple)
- **secondary**: Secondary actions (gray)
- **outline**: Tertiary actions
- **ghost**: Minimal actions
- **destructive**: Delete, remove
- **success**: Confirm, approve
- **warning**: Caution actions

#### Sizes
- **sm**: Compact spaces
- **default**: Standard
- **lg**: Prominent actions
- **xl**: Hero CTAs

#### Usage
```tsx
<Button variant="default" size="default">
  Click me
</Button>
```

### Loading States

Use skeleton loaders instead of spinners:

```tsx
<Skeleton className="h-12 w-full" />
```

### Interactive Effects

#### Hover Lift
```tsx
<div className="hover-lift">Card content</div>
```

#### Hover Scale
```tsx
<button className="hover-scale">Button</button>
```

#### Hover Glow
```tsx
<div className="hover-glow">Interactive element</div>
```

### Text Effects

#### Gradient Text
```tsx
<h1 className="text-gradient">Premium Title</h1>
```

#### Rainbow Gradient
```tsx
<span className="text-gradient-rainbow">Colorful</span>
```

## 🎭 Animations

### Entry Animations

```tsx
// Fade in
<div className="fade-in">Content</div>

// Slide in from bottom (modals, toasts)
<div className="slide-in-from-bottom">Modal</div>

// Slide in from top (notifications)
<div className="slide-in-from-top">Notification</div>

// Scale in (contextual menus)
<div className="scale-in">Menu</div>
```

### Surface Effects

#### Glassmorphism
```tsx
<div className="glass">Premium card</div>
<div className="glass-subtle">Subtle overlay</div>
```

### Border Effects

```tsx
<div className="border-gradient">Fancy border</div>
```

## ♿ Accessibility

### Focus Management
All interactive elements have visible focus rings:
```css
.focus-ring /* Automatic focus styling */
```

### Reduced Motion
Respects user preferences:
```css
@media (prefers-reduced-motion: reduce) {
  /* All animations are instant */
}
```

### Keyboard Navigation
- Use semantic HTML
- Provide `aria-label` for icon buttons
- Ensure tab order is logical
- Support keyboard shortcuts

## 📱 Responsive Design

### Breakpoints (Tailwind defaults)
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Mobile-first Approach
Always design for mobile first, then enhance for larger screens.

## 🎯 Best Practices

### Do's
✅ Use semantic color tokens (primary, success, etc.)
✅ Maintain consistent spacing with the scale
✅ Use skeleton loaders for loading states
✅ Add micro-interactions to enhance UX
✅ Test with keyboard navigation
✅ Optimize for performance

### Don'ts
❌ Use arbitrary colors outside the design system
❌ Mix different animation durations inconsistently
❌ Rely solely on color for information
❌ Forget focus states
❌ Over-animate (less is more)

## 🚀 Performance Tips

1. **Use CSS transitions over JavaScript** when possible
2. **Lazy load components** that aren't immediately visible
3. **Optimize images** and use appropriate formats
4. **Minimize layout shifts** with skeleton loaders
5. **Debounce expensive operations** (search, autocomplete)

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Radix UI Components](https://www.radix-ui.com)
- [Linear Design System](https://linear.app)
- [Notion Design](https://www.notion.so)

---

**Updated**: Phase 1 Complete - Foundation & Design System Enhancement
