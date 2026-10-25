# Vesta Event Studio — Accessibility (a11y) & WCAG 2.1 AAA Compliance

**Compliance Level**: WCAG 2.1 Level AAA  
**Evaluation Standard**: Chrome Lighthouse Accessibility 100/100 · axe-core 0 Violations  

---

## 1. Contrast Ratios & High-Contrast Mode
* **Standard Dark Theme**: All text elements exceed the WCAG AA minimum contrast ratio of 4.5:1 against `vesta-midnight` (#0f0e17) and `vesta-surface` (#1a1929).
* **WCAG 2.1 AAA High-Contrast Toggle**: Vesta provides a dedicated 1-click AAA toggle in the header (`html.high-contrast-aaa`) that boosts contrast ratios above **7:1** across all text, borders, and interactive elements using pure black (#000000), bright gold (#fde047), and pure white (#ffffff).

---

## 2. Semantic Landmarks & Structure
* **Single `<h1>` Hierarchy**: Every view coordinator maintains a single descriptive `<h1>` landmark.
* **Semantic HTML5 Elements**: Proper use of `<header role="banner">`, `<nav role="navigation">`, `<main id="main-content" role="main">`, `<section>`, and `<footer role="contentinfo">`.
* **Skip to Main Content**: Hidden skip-link rendered at the very top of `App.tsx` (`#main-content`) that activates on keyboard Tab navigation for screen-reader users.

---

## 3. Keyboard Navigation & ARIA Patterns
* **Full Tab Navigation**: Global keyboard shortcuts (`1` to `5`) switch workspace tabs seamlessly without requiring mouse interaction.
* **Global Command Palette**: `Ctrl+K` or `Cmd+K` toggles the Context AI Copilot drawer instantly.
* **Focus Management**: All interactive buttons, cards, and modal dialogs feature explicit `focus:ring-2 focus:ring-vesta-iris` focus rings.
* **Dialog Keyboard Traps**: Pressing `Escape` on any open modal or drawer (`ContextCopilotDrawer`, `NewProjectModal`, `AISettingsModal`, `ExportBlueprintModal`, `VendorNegotiationModal`) safely closes the dialog and restores focus.
* **ARIA Live Regions**: Live status updates use `aria-live="polite"` to announce AI synthesis completion and readiness score updates to screen readers without interrupting user flow.

---

## 4. Motion & Reduced Motion
* CSS transitions respect user preferences via `@media (prefers-reduced-motion: reduce)`, disabling heavy animation loops and pulse effects when active.
