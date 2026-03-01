# App Layout Documentation

## Overview

A sleek, draw.io-inspired layout for the FSM Tool with:
- Fixed header and footer
- Collapsible left sidebar (components)
- Large canvas area (main workspace)
- Collapsible right sidebar (properties)
- Comprehensive CSS variable system

## Files

### 1. public/layout.html
Complete HTML structure with:
- Header with logo, mode selector, and action buttons
- Left sidebar with component library
- Canvas area with toolbar
- Right sidebar with properties panel
- Footer with status information

### 2. public/layout-styles.css
Comprehensive CSS with:
- 50+ CSS variables for colors, spacing, typography
- Responsive design
- Smooth transitions
- Grid background for canvas
- Scrollbar styling

## CSS Variables

### Colors
- Primary: #2563eb
- Secondary: #64748b
- Success: #10b981
- Warning: #f59e0b
- Danger: #ef4444
- Info: #0ea5e9

### Spacing
- xs: 0.25rem
- sm: 0.5rem
- md: 1rem
- lg: 1.5rem
- xl: 2rem
- 2xl: 3rem
- 3xl: 4rem

### Typography
- Font sizes: xs to 3xl
- Font weights: light to bold
- Line heights: tight to loose

### Layout
- Header height: 56px
- Footer height: 40px
- Sidebar width: 280px
- Toolbar height: 48px

## Features

✅ Sleek, modern design  
✅ Draw.io-like layout  
✅ Responsive sidebars  
✅ Grid background canvas  
✅ Smooth animations  
✅ Comprehensive CSS variables  
✅ Accessible components  
✅ Dark mode ready  

## Usage

1. Replace public/index.html with layout.html
2. Replace public/styles.css with layout-styles.css
3. Update app.js to handle new layout
4. Customize colors via CSS variables

## Customization

All styling is controlled via CSS variables in `:root`:

```css
:root {
  --color-primary: #2563eb;
  --spacing-md: 1rem;
  --font-size-base: 1rem;
  /* ... more variables ... */
}
```

Change any variable to customize the entire app appearance.
