# Sentry Design System Analysis

> Source: https://sentry.io/  
> Measured: May 16, 2026  
> Analysis by DesignMD

---

## 1. Visual Theme & Atmosphere
Sentry's design system establishes a developer-first, "dark mode by default" atmosphere that is both energetic and highly functional. The aesthetic is built on a foundation of deep, muted purples like `#150f23`, which serves as a canvas for extremely vibrant, almost neon, accent colors. Key information and calls-to-action pop with a hot pink (`#fd44b0`) and bright purple (`#7553ff`), creating a high-contrast, visually engaging experience. This is not a sterile, corporate dark theme; it's a dynamic environment that feels alive with color and custom typography.

The brand's personality is further defined by its use of quirky, flat-vector illustrations and a distinctive, slightly condensed headline font, `Dammit Sans`, used at large sizes like 60px and 88px. This contrasts with the clean, readable `Rubik` used for body text. The overall feeling is one of confidence and expertise, aimed squarely at a technical audience that appreciates both aesthetic detail and information density. Subtle CSS transitions on interactive elements provide smooth feedback without being distracting, reinforcing the theme of a polished, high-performance tool.

### Key Characteristics
*   **High-Contrast Dark Mode:** The entire interface is built on a dark purple base (`#150f23`), making text and UI elements exceptionally clear. All text contrast ratios like `#d4d4d4` on `#150f23` are well above WCAG AA standards.
*   **Vibrant Accent Palette:** A deliberate use of electric pink (`#fd44b0`), magenta (`#f97583`), and purple (`#7553ff`) for highlighted text, links, and UI chrome creates a strong visual identity.
*   **Expressive Typography:** A dual-font strategy pairs the unique, character-rich `Dammit Sans` for headlines with the highly legible sans-serif `Rubik` for all body and UI copy.
*   **Code as a Visual Element:** Code snippets are a primary component, styled with rich syntax highlighting using colors like `#569cd6` (blue) and `#dcdcaa` (yellow) to treat code as a first-class design element.
*   **Vector Illustration Style:** The brand avoids photography in favor of colorful, character-driven vector illustrations that add personality and visually explain complex concepts.
*   **Subtle Interactivity:** Motion is handled with simple, fast CSS transitions (e.g., `background-color 0.2s`) on buttons and links, prioritizing responsiveness over elaborate animation.
*   **Consistent Radii and Spacing:** A predictable 4px-based spacing scale and a clear border-radius system (`8px` for buttons, `12px` for cards) create a structured and cohesive layout.

## 2. Color Palette & Roles
The palette is defined by a dark, purple-toned base with a set of vivid, high-energy accents for highlights and interaction.

### Primary
*   `#150f23` (Deep Space) — The primary background color for the entire application and marketing site.
*   `#fd44b0` (Hot Pink) — Used for emphasized words within headlines and key marketing messages.

### Accent Colors
*   `#7553ff` (Bright Purple) — A secondary accent used for UI elements like form containers and interactive highlights.
*   `#f97583` (Light Pink) — A softer accent, often used for secondary buttons or highlights.
*   `#1f1633` (Deep Purple Accent) — A slightly lighter purple used for card backgrounds and subtle section differentiation from the main `#150f23` background.

### Interactive
*   `#c73852` (`rgb(199, 56, 82)`) — Hover state for primary pink buttons.
*   `#5a4fb1` (`rgb(90, 79, 177)`) — Hover state for primary purple/dark buttons.
*   `#ececf1` (`--text-secondary`) — Hover/active color for links and navigation elements.

### Neutral Scale
*   `#ffffff` (White) — The primary color for all heading and body text.
*   `#d4d4d4` (Light Gray) — Used for secondary or descriptive text to create a subtle hierarchy.
*   `#79628c` (Muted Purple) — A low-contrast neutral, used for subtle dividers or placeholder text.

### Surface & Borders
*   `#362d59` (`--border-color`) — The standard color for borders on cards and inputs.

### Code Syntax
*   `#569cd6` (Blue) — Used for keywords and operators in code blocks.
*   `#dcdcaa` (Yellow) — Used for functions and variables.
*   `#6a9955` (Green) — Used for comments and strings.
*   `#ce9178` (Orange) — Used for parameters and attributes.

## 3. Typography Rules
Sentry uses a two-font system to balance personality and readability. `Dammit Sans` provides a unique voice for headlines, while `Rubik` ensures body copy is clear and functional. Code is set in `Monaco` or `IBM Plex Mono`.

*   **Primary Font Family**: `"Rubik", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`
*   **Heading Font Family**: `"Dammit Sans", "Rubik", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`
*   **Monospace Font Family**: `"Monaco", "IBM Plex Mono", Consolas, "Courier New", monospace`

### Hierarchy
| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Large** | Dammit Sans | 88px | 400 | 1.1 | -1.5px | For primary, page-level hero headlines. |
| **Display** | Dammit Sans | 60px | 400 | 1.1 | -1px | For secondary hero headlines and large section titles. |
| **H1 / H2** | Dammit Sans | 30px | 400 | 1.2 | -0.5px | Major section headings. |
| **H3 / H4** | Rubik | 24px | 500 | 1.3 | Normal | Sub-headings and large component titles. |
| **Body** | Rubik | 16px | 400 | 1.5 | Normal | Default text for all paragraphs and long-form content. |
| **Small / Label** | Rubik | 14px | 400/500 | 1.4 | Normal | UI labels, navigation links, and captions. |
| **Caption** | Rubik | 12px | 400 | 1.4 | Normal | Helper text, legal copy, and tertiary information. |
| **Code** | Monaco | 14px | 400 | 1.5 | Normal | For all inline and block-level code snippets. |

### Principles
*   **Headlines as Graphics:** Large `Dammit Sans` headlines are treated as core visual elements, often with a single word highlighted in `#fd44b0` for emphasis.
*   **Clarity in Body:** `Rubik` is used exclusively for multi-line text to ensure maximum readability against the dark background.
*   **Weight for Emphasis, Not Hierarchy:** Font size is the primary determinant of hierarchy. Weight is used more sparingly, with `500` used to add emphasis to UI elements like navigation links, rather than for headings.
*   **Generous Line Height:** A line height of 1.5 for body copy ensures comfortable reading in a dark environment.

## 4. Component Stylings

### Buttons
Buttons are a key interactive element, with clear primary, secondary, and ghost variants. They use an 8px border-radius.

#### Primary Button
Used for the main call to action. Typically a light background with dark text.

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background-color: #ffffff;
  color: #1f1633;
  font-family: "Rubik", sans-serif;
  font-size: 14px;
  font-weight: 700;
  border: 1px solid transparent;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #d4d4d4; /* Inferred from general theme */
}

.btn-primary:focus {
  outline: 2px solid #6a5fc1;
  outline-offset: 2px;
}
```


<details>
<summary>Secondary / Outline Button</summary>

Used for secondary actions, providing a less prominent alternative to the primary button.

```css
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background-color: transparent;
  color: #ffffff;
  font-family: "Rubik", sans-serif;
  font-size: 14px;
  font-weight: 700;
  border: 1px solid #ffffff;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.btn-secondary:focus {
  outline: 2px solid #6a5fc1;
  outline-offset: 2px;
}
```

</details>

<details>
<summary>Ghost / Text Button</summary>

Used for tertiary actions, such as navigation links, where a button shape is not required.

```css
.btn-ghost {
  display: inline-flex;
  align-items: center;
  padding: 12px 16px;
  background-color: transparent;
  color: #ffffff;
  font-family: "Rubik", sans-serif;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-ghost:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}
```

</details>
### Cards & Containers
Cards are used to group related content, often with a subtle background and border to lift them from the main page.

```css
.card {
  background-color: var(--bg-primary, #1f1633);
  border: 1px solid var(--border-color, #362d59);
  border-radius: 12px;
  padding: 24px;
  box-shadow: rgba(0, 0, 0, 0.08) 0px 2px 8px 0px;
}

/* Variant with a colored top border for emphasis */
.card-highlight-pink {
  border-top: 2px solid #fd44b0;
}

.card-highlight-green {
  border-top: 2px solid #6a9955;
}
```

### Inputs & Forms
Form elements maintain the dark theme with clear focus states.

```css
.form-label {
  display: block;
  font-family: "Rubik", sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #d4d4d4;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.text-input {
  width: 100%;
  padding: 12px 16px;
  background-color: #150f23;
  color: #ffffff;
  font-family: "Rubik", sans-serif;
  font-size: 16px;
  border: 1px solid #362d59;
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.text-input::placeholder {
  color: #79628c;
}

.text-input:focus {
  outline: none;
  border-color: #7553ff;
  box-shadow: 0 0 0 3px rgba(117, 83, 255, 0.3);
}
```

### Navigation
The main site navigation is clean and simple, prioritizing content discovery.

```css
.main-nav {
  display: flex;
  align-items: center;
  padding: 16px 0;
  background-color: transparent; /* Sits on page background */
}

.nav-link {
  padding: 12px 16px;
  font-family: "Rubik", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  text-decoration: none;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  font-weight: 700;
  color: #ffffff;
}
```

### Links
Standard text links are clearly differentiated from body copy.

```css
a.link {
  color: #d4d4d4;
  text-decoration: underline;
  text-decoration-color: #79628c;
  transition: color 0.2s, text-decoration-color 0.2s;
}

a.link:hover {
  color: #ffffff;
  text-decoration-color: #ffffff;
}
```

## 5. Layout Principles

### Spacing System
The layout is governed by a 4px base unit, creating a consistent and rhythmic vertical and horizontal flow.
*   **Base Unit:** 4px
*   **Scale:** `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `40px`, `48px`, `64px`

#### Usage Context
*   **4px:** Micro-spacing within components, like between an icon and its text.
*   **8px:** Gaps between small, related elements, like form labels and inputs.
*   **12px-16px:** Standard padding within components like buttons and cards.
*   **24px:** Gaps between distinct UI elements, like items in a list.
*   **32px-48px:** Spacing between larger components, such as cards in a grid.
*   **64px:** Vertical spacing between major page sections.

### Grid & Container
The content is typically housed in a central container that expands at larger breakpoints.
*   **Max Width:** ~1152px
*   **Columns:** 12-column grid for complex layouts.
*   **Gutter:** 24px
*   **Section Padding:** 64px (vertical) and 24px (horizontal).

### Whitespace Philosophy
Whitespace is used generously to reduce cognitive load and create focus. The dark background makes content "pop," and ample spacing between sections guides the user's eye down the page, creating clear information hierarchy without relying on excessive dividers or borders.

### Border Radius Scale
A simple and consistent radius scale is applied to all components.
*   **4px:** Small UI elements like tags or inline highlights.
*   **8px:** Standard radius for all interactive elements, including buttons and inputs.
*   **12px:** Larger radius for containers like cards and modals.
*   **9999px:** Used for pill-shaped elements.

## 6. Depth & Elevation
Depth is used sparingly, primarily to elevate interactive elements like dropdowns and the sticky navigation bar above the main content. The primary "shadow" is often a glow effect rather than a traditional drop shadow.

| Level | z-index | Treatment | Use |
| :--- | :--- | :--- | :--- |
| **Below** | -1 | `z-index: -1;` | Background decorative elements. |
| **Flat** | 0 | `box-shadow: none;` | Default state for all base-level content. |
| **Interactive** | 10 | `box-shadow: rgba(0, 0, 0, 0.08) 0px 2px 8px 0px;` | Cards, interactive UI panels. |
| **Sticky** | 50 | `box-shadow: rgb(21, 15, 35) 0px 0px 8px 6px;` | Sticky navigation header. This is a purple glow. |
| **Dropdown** | 1000 | `box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 3px 0px;` | Navigation dropdown menus. |
| **Modal** | 9999 | `box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 12px 0px;` | Modals, overlays, and critical dialogs. |

### Shadow Philosophy
Sentry's approach to depth is subtle. Instead of heavy, dark shadows that can get lost on a dark background, the system prefers either very light, diffuse shadows for cards or a colored "glow" effect (`rgb(21, 15, 35) 0px 0px 8px 6px`) for the sticky header. This creates a sense of elevation that feels native to the dark, vibrant environment.

## 7. Do's and Don'ts

### Do
*   Use `Dammit Sans` at 60px or larger for hero headlines.
*   Highlight a single, impactful word in headlines with `#fd44b0`.
*   Use `Rubik` at 16px/400 for all paragraph text.
*   Apply an `8px` border-radius to all Buttons and Inputs.
*   Use the 4px-based spacing scale, especially `24px` and `64px` for layout.
*   Ensure text on `#150f23` is `#ffffff` or `#d4d4d4` for AAA contrast.
*   Use `#1f1633` for Card backgrounds to create subtle depth.
*   Set borders on dark elements using `--border-color` (`#362d59`).
*   Use the Primary Button with a `#ffffff` background for the most important action.
*   Use syntax highlighting colors like `#569cd6` only within code blocks.

### Don't
*   Do not use `Dammit Sans` for body copy or paragraphs.
*   Do not apply shadows to standard text or icons.
*   Avoid inventing spacing values; stick to the `4px` scale.
*   Never use colors like `#79628c` for body text due to low contrast.
*   Do not use a border-radius other than `4px`, `8px`, or `12px` on components.
*   Avoid using more than one highlighted `#fd44b0` word per headline.
*   Do not make the Primary Button background any color other than `#ffffff`.
*   Do not use yellow (`#dcdcaa`) outside of code syntax highlighting.
*   Do not use borders thicker than `1px` on Cards or Inputs.
*   Avoid using gradients on text or button backgrounds.

## 8. Responsive Behavior
The following breakpoints are measured directly from the site's CSS.

*   **Breakpoints**
| Breakpoint Name | Width | Key Changes |
| :--- | :--- | :--- |
| **Mobile** | < 576px | Single-column layout. Typography scales down. Nav collapses to a hamburger menu. |
| **Phablet** | ≥ 576px | Content remains in a single column but with more generous horizontal padding. |
| **Tablet** | ≥ 768px | Two-column grids emerge for feature lists. Font sizes increase slightly. |
| **Desktop** | ≥ 992px | Main content area widens. Complex multi-column layouts are used. Full nav is visible. |
| **Desktop Large** | ≥ 1152px | Content is constrained to a max-width of `1152px` with whitespace margins. |

*   **Touch Targets**
    *   All buttons and interactive links should have a minimum tap area of 44x44px.
    *   Ensure at least 8px of space between tappable elements.

*   **Collapsing Strategy**
    *   **Navigation:** The primary navigation links collapse into a hamburger menu on mobile. The "Get Started" CTA remains visible.
    *   **Cards:** Card grids stack vertically into a single column on screens narrower than 768px.
    *   **Typography:** Display headlines scale down significantly. An 88px headline might become 48px on mobile.
    *   **Padding:** Section padding is reduced from 64px to 32px on mobile to preserve screen real estate.
    *   **Forms:** Inputs remain full-width to be easily tappable.
    *   **Illustrations:** Illustrations may be simplified or hidden on the smallest screens to prioritize content.

## 9. Agent Prompt Guide
Use this guide for quick reference when generating components or layouts.

*   **Quick Color Reference**
    *   **Primary Background:** `#150f23`
    *   **Card/Surface Background:** `#1f1633`
    *   **Primary Text:** `#ffffff`
    *   **Secondary Text:** `#d4d4d4`
    *   **Headline Accent:** `#fd44b0`
    *   **Interactive Accent:** `#7553ff`
    *   **Border:** `#362d59`

*   **Iteration Guide**
    1.  **Always** use a dark background (`#150f23`) and light text (`#ffffff` or `#d4d4d4`).
    2.  **Always** set headlines in `Dammit Sans` and body text in `Rubik`.
    3.  **Always** use the spacing scale: `4, 8, 12, 16, 24, 32, 48, 64px`. Default gap is `24px`.
    4.  **Always** use a border-radius of `8px` for buttons/inputs and `12px` for cards.
    5.  **Always** make the primary CTA a `font-weight: 700` button with a `#ffffff` background and `#1f1633` text.
    6.  **Always** make secondary buttons transparent with a `1px` solid `#ffffff` border.
    7.  **Always** give text inputs a `#362d59` border and a `#7553ff` focus ring.
    8.  **Always** stack grid columns vertically on viewports under `768px`.
    9.  **Always** use subtle, diffuse shadows (`rgba(0, 0, 0, 0.08) 0px 2px 8px 0px`) for cards.
    10. **Always** ensure text contrast is AA or higher. `#d4d4d4` on `#150f23` is a safe choice for secondary text.