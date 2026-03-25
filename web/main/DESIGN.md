# Design System Strategy: Kinetic Precision

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"Kinetic Precision."** 

Bicycles are the ultimate intersection of human energy and mechanical engineering. This design system reflects that duality by pairing an expansive, airy canvas (representing the freedom of the road) with high-intensity technical accents (the vibrant primary tokens). We move beyond the flat, utilitarian grid seen in early prototypes by introducing a "High-End Editorial" layout. This means breaking symmetry to lead the eye, utilizing exaggerated typography scales, and layering surfaces to create a sense of tactile premium quality. This is not just a shop; it is a curated gallery of performance.

## 2. Colors: Tonal Depth & Energy
Our color strategy relies on high-contrast pairings and sophisticated layering rather than structural lines.

### The Palette Logic
*   **Primary (`#006d35`) & Primary Container (`#00e676`):** These serve as the "Electric" energy. Use the vibrant `primary_container` for high-impact CTAs and the deep `primary` for refined status indicators.
*   **Neutral Foundation:** We utilize a "Pure Surface" approach. The background is nearly white (`#faf9f9`), but the depth comes from nesting `surface_container` tiers.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections or cards. 
Boundaries must be defined exclusively through:
1.  **Background Shifts:** A `surface_container_low` card sitting on a `surface` background.
2.  **Tonal Transitions:** Using the `surface_container` hierarchy to separate the "Header" from the "Hero."

### The "Glass & Gradient" Rule
To elevate the experience from "standard web" to "premium digital," floating elements (like Navigation Bars or Detail Overlays) must use **Glassmorphism**. 
*   **Implementation:** Use semi-transparent surface colors with a `backdrop-blur` of 20px–40px.
*   **Signature Textures:** For Hero backgrounds or main Call-to-Actions, use a subtle linear gradient transitioning from `primary` to `primary_container` at a 135-degree angle. This adds "visual soul" and a sense of movement.

## 3. Typography: The Editorial Voice
We utilize **Inter** across the entire system, but we treat it with editorial weight.

*   **Display (`display-lg`):** Reserved for product categories and hero headlines. Use tight letter-spacing (-0.02em) to give it an authoritative, technical feel.
*   **Headline (`headline-lg`):** Used for storytelling sections. These should often be placed with intentional asymmetry—left-aligned with significant white space to the right.
*   **Labels (`label-md`, `label-sm`):** These are our "Technical Specs." Use these for stock levels or bike weight. They should always be in uppercase with a slight letter-spacing increase (+0.05em) to mimic engineering blueprints.

The hierarchy is designed to allow the user to "scan the energy" (Headlines) before "digging into the specs" (Labels).

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are often a crutch for poor layout. In this design system, depth is earned through stacking.

*   **The Layering Principle:** Depth is achieved by "stacking" the surface tiers. A Product Card should be `surface_container_lowest` (#ffffff) placed on a `surface_container_low` (#f5f3f3) page background. This creates a natural, soft lift.
*   **Ambient Shadows:** Where floating effects are required (e.g., a "Compare" drawer), use an extra-diffused shadow: `blur: 40px`, `y: 20px`, `opacity: 6%`. The shadow color must be a tinted version of `on_surface` (deep charcoal), never pure black.
*   **The "Ghost Border" Fallback:** If containment is required for accessibility, use a **Ghost Border**. Apply `outline_variant` at 15% opacity. Never use 100% opaque borders.
*   **Glassmorphism Depth:** When a card hovers over an image, the `surface_variant` with 70% opacity and backdrop-blur creates a "frosted" look that feels integrated into the environment.

## 5. Components: Engineered Elements

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`), `xl` roundedness (0.75rem), white text.
*   **Secondary:** `surface_container_high` background with `on_surface` text. No border.
*   **Interaction:** On hover, the primary button should "glow" by increasing the shadow spread, mimicking a machine powering up.

### Cards (The Product Engine)
*   **Layout:** Forbid divider lines. Use `spacing-6` (2rem) of vertical white space to separate the product image from the product title.
*   **Price Tags:** Use `title-lg` in a `primary` color token to ensure the "value" is the first thing the eye catches after the image.
*   **Image Handling:** Product images must be shot on clean, neutral backgrounds, using the `xl` corner radius to match the component container.

### Chips & Filters
*   **Selection Chips:** Use `full` rounding (pill-shaped). Active states use the `primary_fixed` color with `on_primary_fixed` text. This provides a "technical apparel" aesthetic.

### Input Fields
*   **Visual Style:** Ghost Borders only. The active state should be indicated by a `2px` bottom-bar in `primary` color, rather than a full box highlight, maintaining the minimalist, "no-box" philosophy.

## 6. Do’s and Don’ts

### Do:
*   **Embrace Asymmetry:** Place a `display-lg` headline on the left and leave the right 50% of the screen empty to create a premium, editorial feel.
*   **Use Spacing as a Tool:** Use `spacing-20` (7rem) between major sections to let the high-end bike photography breathe.
*   **Layer Surfaces:** Use `surface_container_highest` for "Technical Data" blocks to make them feel like modular inserts.

### Don’t:
*   **No Dividers:** Never use a horizontal rule (`<hr>`) or a 1px border to separate list items. Use white space (`spacing-4`) or a subtle background shift.
*   **No Generic Shadows:** Avoid the "fuzzy grey" shadow. If it doesn't look like ambient light hitting a physical surface, it’s too heavy.
*   **No Crowding:** If you feel the need to shrink the text to fit more on the screen, you are including too much. Edit the content, don't sacrifice the "Kinetic Precision" of the typography.