# Kuota — Style Reference
> Mission control under open skies

**Theme:** light (single theme — no dark mode)

Source measurements are normalized; roles and recommendations are interpreted. Font summary lists are independent, not paired by position. HTML examples are reconstructions, not source components.

Kuota lives on a pale-sky canvas — a bright, airy blue field where Crayola Blue type reads like clear instrument labels and one vivid Dodger Blue acts as the signal accent. The system is deliberately sparse: hairline navy-tinted borders define structure instead of heavy shadows, product UI is shown as white cards resting on the sky, and code blocks are treated as first-class content in JetBrains Mono. Plus Jakarta Sans at weight 300 gives headlines a whisper-quiet authority that lets the subject matter do the talking, while weight 500–600 carries operational UI. The overall feel is mission control under open skies — minimal chrome, maximal legibility, one accent doing all the semantic work. There is only one theme: light. Dark surfaces and dark mode are not part of the system.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Pale Sky | `#CBE5FE` | `--color-pale-sky` | Page background, hero canvas, section bands — the bright base on which all other UI rests |
| Dodger Blue | `#0391FD` | `--color-dodger-blue` | Accent for links, icon strokes, tags, and emphasized short phrases. Do not promote it to the primary CTA color |
| Crayola Blue | `#2F7AEF` | `--color-crayola-blue` | All text (headings, body, labels, nav, code base), outlined-button borders, and hover/active states for buttons and interactive elements |
| Deep Navy | `#00235C` | `--color-deep-navy` | Primary CTA fill, logo wordmark, badge fills, and the base for hairline borders (at 15% opacity) |
| Hairline | `rgba(0, 35, 92, 0.15)` | `--color-hairline` | Borders on cards and panels, dividers between sections — the dominant structural line color |
| Text Muted | `rgba(47, 122, 239, 0.7)` | `--color-text-muted` | Helper text, captions, tertiary metadata — Crayola Blue at 70% so it drops below the primary read |
| Pure White | `#ffffff` | `--color-pure-white` | Card surfaces, text on filled buttons, product screenshot cards — a bright layer lifted off the sky |
| Status Green | `#4ade80` | `--color-status-green` | Background for 'passing/available' pills and status dots, with Deep Navy text. Do not use as text color on light surfaces |

## Tokens — Typography

### Plus Jakarta Sans — Primary UI and heading typeface. Weight 300 for display headlines creates whisper-quiet authority; weight 400 for body; weight 500–600 for nav, buttons, and labels. · `--font-plus-jakarta-sans`
- **Substitute:** Plus Jakarta Sans (Google Fonts)
- **Weights:** 300, 400, 500, 600, 700
- **Sizes:** 10, 12, 14, 16, 18, 20, 24, 30, 32, 48, 60
- **Line height:** 1.20–1.63 (display 1.20, body 1.50, small 1.43)
- **Letter spacing:** -0.0400em at 60px, -0.0250em at 48px, 0.0500em at 10–12px (tracked-out micro-labels)
- **Role:** Primary UI and heading typeface. Weight 300 for display headlines creates whisper-quiet authority; weight 400 for body; weight 500–600 for nav, buttons, and labels.

### JetBrains Mono — Code blocks, terminal output, CLI commands like `npx kuota init`. The custom font signal 'this is executable'. · `--font-jetbrains-mono`
- **Substitute:** JetBrains Mono (JetBrains), or Fira Code
- **Weights:** 400
- **Sizes:** 10, 12, 16
- **Line height:** 1.50–1.63
- **Role:** Code blocks, terminal output, CLI commands like `npx kuota init`. The custom font signal 'this is executable'.

### ui-monospace — System monospace fallback for inline code, tab indicators, secondary code contexts · `--font-ui-monospace`
- **Substitute:** SF Mono, Menlo, Consolas, monospace
- **Weights:** 400, 500
- **Sizes:** 11, 12, 14
- **Line height:** 1.33–1.63
- **Role:** System monospace fallback for inline code, tab indicators, secondary code contexts

### Consolas — Consolas — detected in extracted data but not described by AI · `--font-consolas`
- **Weights:** 400
- **Sizes:** 10px
- **Line height:** 1.5
- **Role:** Consolas — detected in extracted data but not described by AI

### Type Scale

| Role | Family | Weight | Size | Line Height | Letter Spacing | Token |
|------|--------|--------|------|-------------|----------------|-------|
| caption | — | — | 10px | 1.5 | 0.5px | `--text-caption` |
| body | — | — | 16px | 1.5 | 0px | `--text-body` |
| subheading | — | — | 20px | 1.4 | 0px | `--text-subheading` |
| heading-sm | — | — | 24px | 1.33 | 0px | `--text-heading-sm` |
| heading | — | — | 32px | 1.25 | 0px | `--text-heading` |
| heading-lg | — | — | 48px | 1.2 | -1.2px | `--text-heading-lg` |
| display | — | — | 60px | 1 | -2.4px | `--text-display` |

## Tokens — Spacing & Shapes

**Base unit:** 4px

**Density:** comfortable

### Spacing Scale

| Name | Value | Token |
|------|-------|-------|
| 4 | 4px | `--spacing-4` |
| 8 | 8px | `--spacing-8` |
| 12 | 12px | `--spacing-12` |
| 16 | 16px | `--spacing-16` |
| 20 | 20px | `--spacing-20` |
| 24 | 24px | `--spacing-24` |
| 32 | 32px | `--spacing-32` |
| 40 | 40px | `--spacing-40` |
| 48 | 48px | `--spacing-48` |
| 56 | 56px | `--spacing-56` |
| 64 | 64px | `--spacing-64` |
| 72 | 72px | `--spacing-72` |
| 80 | 80px | `--spacing-80` |
| 96 | 96px | `--spacing-96` |
| 104 | 104px | `--spacing-104` |
| 144 | 144px | `--spacing-144` |

### Border Radius

| Element | Value |
|---------|-------|
| tags | 9999px |
| cards | 12px |
| inputs | 8px |
| buttons | 8px |
| code-blocks | 12px |

### Shadows

| Name | Value | Token |
|------|-------|-------|
| md | `rgba(0, 35, 92, 0.10) 0px 10px 15px -3px, rgba(0, 35, 92, 0.10) 0px 4px 6px -4px` | `--shadow-md` |
| xl | `rgba(0, 35, 92, 0.20) 0px 25px 50px -12px` | `--shadow-xl` |
| xl-2 | `rgb(3, 145, 253) 0px 25px 50px -12px` | `--shadow-xl-2` |
| md-2 | `rgba(0, 35, 92, 0.15) 0px 4px 12px 0px, rgba(0, 35, 92, 0.10) 0px 1px 3px 0px` | `--shadow-md-2` |
| subtle | `rgba(0, 35, 92, 0.05) 0px 1px 2px 0px` | `--shadow-subtle` |

### Layout

- **Page max-width:** 1200px
- **Section gap:** 80px
- **Card padding:** 24px
- **Element gap:** 12px

## Components

### Primary CTA Button (Deep Navy Filled)
**Role:** Main conversion action — 'Start for free', 'Book a demo'

Deep Navy (#00235C) background, white (#ffffff) text, 8px radius, Plus Jakarta Sans weight 500 at 14–16px, padding 10px 20px. Hover/active state fills with Crayola Blue (#2F7AEF). The strongest-contrast element on the pale-sky canvas.

### Secondary CTA Button (Outlined)
**Role:** Alternative action alongside primary CTA

Transparent background, 1px border in Crayola Blue (#2F7AEF), Crayola Blue text, 8px radius, padding 10px 20px. Hover fills with white (#ffffff). Low-emphasis companion that defers to the filled button.

### Pill Badge / Status Tag
**Role:** Environment labels, status indicators, inline tags

9999px radius, 4–8px vertical padding, 10–12px horizontal padding. Background varies: green (#4ade80) with Deep Navy text for 'passing/available', Deep Navy with white text for 'test/staging/prod', white with a hairline border and Crayola Blue text for category labels. Plus Jakarta Sans at 10–12px weight 500, letter-spacing 0.05em.

### Code Block / CLI Block
**Role:** Code snippets, install commands, config examples

White (#ffffff) background, 1px hairline border, 12px radius, padding 16–24px. JetBrains Mono at 12–16px, line-height 1.63. Base text in Crayola Blue with syntax accents (see Code Syntax Token). Often prefixed with a copy icon in Dodger Blue.

### Embedded Product Screenshot Card
**Role:** Dashboard previews, feature demonstrations, product evidence

White (#ffffff) background, 12–16px radius, 1px hairline border, shadow rgba(0,35,92,0.20) 0px 25px 50px -12px. Rests on the pale-sky canvas as a bright window into the product. Contains light-themed UI (charts, tables, status badges in green/red).

### Navigation Bar
**Role:** Top-level site navigation

Pale Sky (#CBE5FE) background with a 1px hairline bottom border, Plus Jakarta Sans weight 500 at 14px, Crayola Blue text, 24px horizontal padding on nav items, 8px vertical padding. Logo left in Deep Navy, links center, auth actions right. Sticky on scroll.

### Section Heading with Blue Accent Words
**Role:** Display-level section titles

Plus Jakarta Sans weight 300 at 48–60px, Crayola Blue (#2F7AEF), letter-spacing -0.025em to -0.04em. Select words rendered in Dodger Blue (#0391FD) to create semantic emphasis without underlining. Line-height 1.00–1.20.

### Feature Card
**Role:** Three-column feature highlights, capability summaries

White (#ffffff) background, 12px radius, 24px padding, 1px hairline border. Heading in Crayola Blue weight 500 at 20–24px, body in Crayola Blue at 16px (secondary lines in Text Muted).

### Trust Logo Bar
**Role:** Social proof — customer/partner logos

Single row or two-row grid of company logos rendered as monochrome Deep Navy (or Crayola Blue) on the pale-sky background. Logos desaturated to a single color. No borders or containers — logos float directly on the section.

### Code Syntax Token
**Role:** Inline and block code highlighting

Colored tokens within code blocks, tuned for a white background: keywords in #7c3aed (purple), strings in #15803d (green), numbers in #b45309 (amber), function names in #00235C (Deep Navy), comments in #6094c1 (muted blue). Base text in Crayola Blue.

### Command Input Pill
**Role:** CLI install command display in hero

White rounded container with a copy affordance, monospace text showing the install command. Centered below hero CTAs as a secondary call-to-action. 12px radius, 1px hairline border.

### Chat Widget Bubble
**Role:** Support chat launcher (bottom-right)

Dodger Blue (#0391FD) circular button with white icon and a blue glow shadow rgb(3,145,253) 0px 25px 50px -12px. Fixed position bottom-right corner.

## Do's and Don'ts

### Do
- Use weight 300 Plus Jakarta Sans at 48–60px for display headlines — the whisper-weight is the signature
- Use Crayola Blue #2F7AEF for all text; use Text Muted (Crayola at 70%) for tertiary information
- Use Dodger Blue #0391FD exclusively for accent words, icon strokes, and interactive links — never for backgrounds (the chat bubble is the single exception)
- Use 9999px radius for all status pills, environment tags, and inline badges
- Use 8px radius for all buttons and 12px for cards — the 8/12 split is consistent across the system
- Use Deep Navy at 15% opacity (--color-hairline) for borders instead of heavy shadows
- Use JetBrains Mono for any code, CLI commands, or terminal output — never let Plus Jakarta Sans render code
- Use Deep Navy filled buttons as the primary CTA on the pale-sky canvas — they read as the 'switched on' control
- Use white cards to lift content off the Pale Sky background

### Don't
- Don't ship a dark theme or dark surfaces — the system is light only
- Don't use shadows as the primary structural method — use hairline borders instead
- Don't use Dodger Blue as a large filled background — it's an accent, not a surface
- Don't use weight 700 or 800 for headlines — the system speaks at weight 300, not weight 900
- Don't use rounded radii above 16px on cards or panels — the 8/12/16 progression is the system
- Don't introduce new chromatic colors beyond the four palette blues, Status Green, and syntax-token colors
- Don't use Plus Jakarta Sans for code — always JetBrains Mono or system monospace
- Don't add gradients to UI surfaces — the system is flat with one subtle white-to-blue wash as the only gradient

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Sky | `#CBE5FE` | Page and section background — the bright base |
| 1 | Card | `#ffffff` | Cards, code blocks, product screenshot cards, input pills |
| 2 | Panel | `rgba(203, 229, 254, 0.4)` over white | Nested panels inside cards, tab content backgrounds |

## Elevation

- **Embedded product card:** `rgba(0, 35, 92, 0.20) 0px 25px 50px -12px`
- **Standard surface card:** `rgba(0, 35, 92, 0.10) 0px 10px 15px -3px, rgba(0, 35, 92, 0.10) 0px 4px 6px -4px`
- **Chat widget:** `rgb(3, 145, 253) 0px 25px 50px -12px`
- **Inset card:** `rgba(0, 35, 92, 0.15) 0px 4px 12px 0px, rgba(0, 35, 92, 0.10) 0px 1px 3px 0px`

## Imagery

The visual language is predominantly iconographic and abstract rather than photographic. The hero features a stylized Kuota brand illustration at the center of a network of curved connection lines radiating outward to floating tool/tech icons (integration and browser logos). Customer logos appear as monochrome Deep Navy wordmarks in a trust bar. Product evidence comes from embedded light-themed dashboard screenshots that rest as white cards on the pale-sky canvas. No lifestyle photography, no human faces, no real-world environments — the aesthetic is diagrammatic and infrastructural.

## Layout

The page is full-bleed Pale Sky with max-width 1200px content containers centered within sections. The hero is a centered text stack (headline → subhead → dual CTA → CLI command) with the Kuota illustration radiating connection lines as the visual anchor. Below the hero, sections alternate between text-left/visual-right 2-column patterns and 3-column feature card grids. Product screenshots are embedded as white cards spanning 2/3 to full width. The trust logo bar sits as a full-width band. Navigation is a top bar with logo left, links center, auth actions right. The overall rhythm is generous vertical breathing room (80px section gaps) with dense information packed into each section. Sections are separated by slight shifts between Pale Sky and white bands, or by a hairline, rather than hard dividers.

## Agent Prompt Guide

**Quick Color Reference**
- text: #2F7AEF (primary), rgba(47,122,239,0.7) (muted), #ffffff (on filled buttons)
- background: #CBE5FE (page), #ffffff (card), rgba(203,229,254,0.4) (nested panel)
- border: rgba(0,35,92,0.15) (hairline)
- accent: #0391FD
- primary action: #00235C (filled action, white text)

**Example Component Prompts**
1. *Hero section*: #CBE5FE background. Display headline at 60px Plus Jakarta Sans weight 300, #2F7AEF, letter-spacing -2.4px, with one or two accent words in #0391FD. Subhead at 18px Plus Jakarta Sans weight 400, rgba(47,122,239,0.7). Deep Navy filled button (8px radius, 10px 20px padding, #00235C background, #ffffff text) beside an outlined button (1px #2F7AEF border, #2F7AEF text). CLI command in a white pill below using JetBrains Mono 14px.

2. *Feature card grid*: 3-column grid on #CBE5FE background. Each card: #ffffff background, 12px radius, 24px padding, 1px rgba(0,35,92,0.15) border. Heading at 20px Plus Jakarta Sans weight 500, #2F7AEF. Body at 16px Plus Jakarta Sans weight 400, #2F7AEF.

3. *Code block*: #ffffff background, 1px rgba(0,35,92,0.15) border, 12px radius, 16px padding. JetBrains Mono 12px, line-height 1.63. Keywords in #7c3aed, strings in #15803d, function names in #00235C, base text #2F7AEF.

4. *Embedded product screenshot card*: #ffffff background, 16px radius, 1px hairline border, shadow rgba(0,35,92,0.20) 0px 25px 50px -12px. Contains light-themed dashboard UI with green (#4ade80) status bars and gray data tables.

5. *Status pill badge*: 9999px radius, 4px 10px padding, #4ade80 background with #00235C text for 'passing' or #00235C background with #ffffff text for 'test/staging/prod'. Plus Jakarta Sans 10px weight 500, letter-spacing 0.5px.

## Gradient System

The system uses exactly one gradient: a subtle white-to-blue wash (linear-gradient(rgb(255,255,255), rgba(47,122,239,0.2))) applied as a soft atmospheric overlay. No other gradients are used in UI surfaces. Dodger Blue (#0391FD) is always rendered as a solid color, never as a gradient fill. This restraint is intentional — the pale-sky canvas should feel open and airy, not decorated.

## Quick Start

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-pale-sky: #CBE5FE;
  --color-dodger-blue: #0391FD;
  --color-crayola-blue: #2F7AEF;
  --color-deep-navy: #00235C;
  --color-hairline: rgba(0, 35, 92, 0.15);
  --color-text-muted: rgba(47, 122, 239, 0.7);
  --color-pure-white: #ffffff;
  --color-status-green: #4ade80;

  /* Syntax tokens (light) */
  --color-syntax-keyword: #7c3aed;
  --color-syntax-string: #15803d;
  --color-syntax-number: #b45309;
  --color-syntax-function: #00235C;
  --color-syntax-comment: #6094c1;

  /* Typography — Font Families */
  --font-plus-jakarta-sans: 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-jetbrains-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --font-ui-monospace: 'ui-monospace', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --font-consolas: 'Consolas', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* Typography — Scale */
  --text-caption: 10px;
  --leading-caption: 1.5;
  --tracking-caption: 0.5px;
  --text-body: 16px;
  --leading-body: 1.5;
  --tracking-body: 0px;
  --text-subheading: 20px;
  --leading-subheading: 1.4;
  --tracking-subheading: 0px;
  --text-heading-sm: 24px;
  --leading-heading-sm: 1.33;
  --tracking-heading-sm: 0px;
  --text-heading: 32px;
  --leading-heading: 1.25;
  --tracking-heading: 0px;
  --text-heading-lg: 48px;
  --leading-heading-lg: 1.2;
  --tracking-heading-lg: -1.2px;
  --text-display: 60px;
  --leading-display: 1;
  --tracking-display: -2.4px;

  /* Typography — Weights */
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Spacing */
  --spacing-unit: 4px;
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-20: 20px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-40: 40px;
  --spacing-48: 48px;
  --spacing-56: 56px;
  --spacing-64: 64px;
  --spacing-72: 72px;
  --spacing-80: 80px;
  --spacing-96: 96px;
  --spacing-104: 104px;
  --spacing-144: 144px;

  /* Layout */
  --page-max-width: 1200px;
  --section-gap: 80px;
  --card-padding: 24px;
  --element-gap: 12px;

  /* Border Radius */
  --radius-md: 4px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-full: 9999px;

  /* Named Radii */
  --radius-tags: 9999px;
  --radius-cards: 12px;
  --radius-inputs: 8px;
  --radius-buttons: 8px;
  --radius-code-blocks: 12px;

  /* Shadows */
  --shadow-md: rgba(0, 35, 92, 0.10) 0px 10px 15px -3px, rgba(0, 35, 92, 0.10) 0px 4px 6px -4px;
  --shadow-xl: rgba(0, 35, 92, 0.20) 0px 25px 50px -12px;
  --shadow-xl-2: rgb(3, 145, 253) 0px 25px 50px -12px;
  --shadow-md-2: rgba(0, 35, 92, 0.15) 0px 4px 12px 0px, rgba(0, 35, 92, 0.10) 0px 1px 3px 0px;
  --shadow-subtle: rgba(0, 35, 92, 0.05) 0px 1px 2px 0px;

  /* Surfaces */
  --surface-sky: #CBE5FE;
  --surface-card: #ffffff;
  --surface-panel: rgba(203, 229, 254, 0.4);
}
```

### Tailwind v4

```css
@theme {
  /* Colors */
  --color-pale-sky: #CBE5FE;
  --color-dodger-blue: #0391FD;
  --color-crayola-blue: #2F7AEF;
  --color-deep-navy: #00235C;
  --color-hairline: rgba(0, 35, 92, 0.15);
  --color-text-muted: rgba(47, 122, 239, 0.7);
  --color-pure-white: #ffffff;
  --color-status-green: #4ade80;

  /* Syntax tokens (light) */
  --color-syntax-keyword: #7c3aed;
  --color-syntax-string: #15803d;
  --color-syntax-number: #b45309;
  --color-syntax-function: #00235C;
  --color-syntax-comment: #6094c1;

  /* Typography */
  --font-plus-jakarta-sans: 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-jetbrains-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --font-ui-monospace: 'ui-monospace', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --font-consolas: 'Consolas', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* Typography — Scale */
  --text-caption: 10px;
  --leading-caption: 1.5;
  --tracking-caption: 0.5px;
  --text-body: 16px;
  --leading-body: 1.5;
  --tracking-body: 0px;
  --text-subheading: 20px;
  --leading-subheading: 1.4;
  --tracking-subheading: 0px;
  --text-heading-sm: 24px;
  --leading-heading-sm: 1.33;
  --tracking-heading-sm: 0px;
  --text-heading: 32px;
  --leading-heading: 1.25;
  --tracking-heading: 0px;
  --text-heading-lg: 48px;
  --leading-heading-lg: 1.2;
  --tracking-heading-lg: -1.2px;
  --text-display: 60px;
  --leading-display: 1;
  --tracking-display: -2.4px;

  /* Spacing */
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-20: 20px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-40: 40px;
  --spacing-48: 48px;
  --spacing-56: 56px;
  --spacing-64: 64px;
  --spacing-72: 72px;
  --spacing-80: 80px;
  --spacing-96: 96px;
  --spacing-104: 104px;
  --spacing-144: 144px;

  /* Border Radius */
  --radius-md: 4px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-md: rgba(0, 35, 92, 0.10) 0px 10px 15px -3px, rgba(0, 35, 92, 0.10) 0px 4px 6px -4px;
  --shadow-xl: rgba(0, 35, 92, 0.20) 0px 25px 50px -12px;
  --shadow-xl-2: rgb(3, 145, 253) 0px 25px 50px -12px;
  --shadow-md-2: rgba(0, 35, 92, 0.15) 0px 4px 12px 0px, rgba(0, 35, 92, 0.10) 0px 1px 3px 0px;
  --shadow-subtle: rgba(0, 35, 92, 0.05) 0px 1px 2px 0px;
}
```
