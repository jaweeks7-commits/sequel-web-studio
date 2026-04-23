# Handoff: Sequel Web Studio — Website Redesign (v2)

## Overview

This is a complete visual redesign of the Sequel Web Studio marketing website (sequelwebstudio.com). The current live site uses a plain system-font stack and a fairly flat, utilitarian design. This redesign transforms it into a bold, confident design-studio aesthetic that proves the company's capabilities on first impression.

The redesign covers four pages: **Home**, **Services**, **About**, and **Contact**.

---

## About the Design Files

The files in this bundle are **design references created in HTML** — high-fidelity interactive prototypes showing intended look, layout, copy, and behavior. They are **not production code to copy directly**.

Your task is to **recreate these HTML designs in the existing Astro + Tailwind codebase** at `github.com/jaweeks7-commits/sequel-web-studio`, using its established patterns, components, and configuration. Where Tailwind utilities don't cover a value exactly, use `tailwind.config.mjs` to extend the theme or use inline styles.

**Fidelity: High-fidelity.** The prototypes use final colors, typography, spacing, animations, and copy. Recreate them pixel-accurately.

---

## Design Tokens

These are the canonical values. They are already partially defined in `tailwind.config.mjs` — extend that file rather than inventing new ones.

### Colors

| Token | Hex | Tailwind name | Usage |
|---|---|---|---|
| Navy dark | `#0F1F3D` | `brand-navy-dark` (add this) | Hero bg, dark sections, headings |
| Navy | `#1F3864` | `brand-navy` (exists) | Gradient start, borders |
| Blue | `#2E75B6` | `brand-blue` (exists) | Gradient end, links, accents |
| Blue light | `#4B9FD4` | `brand-blue-light` (add) | Gradient text end, dark-bg labels |
| Purple | `#8E44AD` | `brand-purple` (exists) | Gradient text end, dividers, accent |
| Grey | `#595959` | `brand-grey` (exists) | Body text |
| Grey muted | `#8892A0` | `brand-grey-muted` (add) | Marquee, subtle labels |
| BG | `#F4F6FB` | `brand-bg` (update from `#F7F8FA`) | Page background, card bg |
| BG card | `#FAFBFE` | — | Form input backgrounds |

### Typography

| Token | Family | Size | Weight | Tracking | Usage |
|---|---|---|---|---|---|
| Display | Space Grotesk | clamp(44px, 6vw, 80px) | 700 | -2px | Hero H1 |
| H1 section | Space Grotesk | clamp(36px, 5vw, 64px) | 700 | -1.5px | Page heroes |
| H2 | Space Grotesk | clamp(30px, 4vw, 52px) | 700 | -1px | Section headings |
| H3 | Space Grotesk | 20px | 700 | -0.3px | Card titles |
| Lead | Space Grotesk | 17–18px | 400 | 0 | Hero subtext |
| Body | Space Grotesk | 15–16px | 400 | 0 | General copy |
| Label | Space Grotesk | 11px | 700 | 2px | Section eyebrows (ALL CAPS) |
| Mono | Space Mono | 12px | 400 | 1px | Step numbers, domain fields |
| Badge | Space Grotesk | 11px | 600 | 1.5px | Pills (ALL CAPS) |

**Font loading:** Add to Astro layout `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
```
Update `tailwind.config.mjs` font stack:
```js
fontFamily: {
  sans: ["'Space Grotesk'", '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
  mono: ["'Space Mono'", 'Consolas', 'monospace'],
},
```

### Spacing

Use Tailwind defaults. Key values used in this design:
- Section padding: `py-24` (96px)
- Inner max-width: `max-w-[1160px] mx-auto px-8`
- Card padding: `p-10` (40px)
- Gap between cards: `gap-6` (24px)

### Border Radius

| Usage | Value | Tailwind |
|---|---|---|
| Cards | 20px | `rounded-[20px]` |
| Buttons | 10px | `rounded-[10px]` |
| Badge/pill | 9999px | `rounded-full` |
| Logo mark | 9px | `rounded-[9px]` |
| Input fields | 9px | `rounded-[9px]` |
| Section cards | 16px | `rounded-2xl` |

### Shadows

```css
/* Card */
box-shadow: 0 8px 32px rgba(15, 31, 61, 0.08);
/* Card featured */
box-shadow: 0 20px 56px rgba(15, 31, 61, 0.28);
/* Card hover */
box-shadow: 0 24px 56px rgba(15, 31, 61, 0.18);
/* Button primary */
box-shadow: 0 8px 24px rgba(46, 117, 182, 0.35);
/* Hero button */
box-shadow: 0 8px 24px rgba(46, 117, 182, 0.4);
```

### Gradients

```css
/* Primary button */
background: linear-gradient(135deg, #2E75B6, #8E44AD);

/* Navy gradient (button on light) */
background: linear-gradient(135deg, #1F3864, #2E75B6);

/* Hero background */
background: #0F1F3D;

/* Gradient text (key phrases) */
background: linear-gradient(135deg, #4B9FD4 0%, #8E44AD 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;

/* Footer accent bar */
background: linear-gradient(to right, #2E75B6, #8E44AD);

/* Hero glow blobs */
/* Left:  radial-gradient(circle, rgba(46,117,182,0.25) 0%, transparent 70%) */
/* Right: radial-gradient(circle, rgba(142,68,173,0.2) 0%, transparent 70%) */
```

---

## Screens & Layout

### 1. Shared: Navigation (`src/components/Nav.astro`)

**Behavior:** Transparent over the dark hero. On scroll > 40px, transitions to frosted white.

**Layout:** `position: fixed; top: 0; left: 0; right: 0; z-index: 200; height: 68px`  
Inner: `max-w-[1160px] mx-auto px-8 flex items-center justify-between`

**Transparent state:**
- Background: `transparent`
- Logo text: `white`
- Nav links: `rgba(255,255,255,0.8)`

**Scrolled state (add `scrolled` class via Alpine.js or a script):**
- Background: `rgba(255,255,255,0.95)`
- Backdrop filter: `blur(16px)`
- Box shadow: `0 2px 20px rgba(15,31,61,0.08)`
- Logo text: `#0F1F3D`
- Nav links: `#595959`

**Logo mark:**
- 38×38px, `border-radius: 9px`
- `background: linear-gradient(135deg, #1F3864, #2E75B6)`
- White "S" in Georgia serif, 18px weight 700
- Box shadow: `0 4px 12px rgba(31,56,100,0.3)`
- Wordmark: 16px, weight 700, letter-spacing -0.3px

**Nav links:** 14px, weight 500, `padding: 6px 14px`, `border-radius: 6px`

**CTA button ("Get a Free Quote"):**
- `background: white; color: #1F3864`
- `padding: 9px 20px; border-radius: 8px`
- 13px, weight 700
- `box-shadow: 0 4px 14px rgba(15,31,61,0.2)`
- `margin-left: 10px`

---

### 2. Homepage (`src/pages/index.astro`)

#### Hero Section

**Container:** `position: relative; background: #0F1F3D; min-height: 100vh; display: flex; align-items: center; overflow: hidden`

**Dot grid background:**
```css
background-image: radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px);
background-size: 32px 32px;
```
Applied as absolute overlay covering full section.

**Glow blobs (absolute, pointer-events: none):**
- Left: `top: 10%; left: -10%; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(46,117,182,0.25) 0%, transparent 70%)`
- Right: `bottom: 5%; right: -5%; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(142,68,173,0.2) 0%, transparent 70%)`

**Inner layout:** `max-w-[1160px] mx-auto px-8 pt-[120px] pb-20 flex items-center gap-16 flex-wrap`

**Left column** (`flex: 1 1 480px`):

*Eyebrow badge:*
- `display: inline-flex; align-items: center; gap: 8px`
- `background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 9999px; padding: 6px 14px; margin-bottom: 32px`
- Blue dot: `7×7px; border-radius: 50%; background: #4B9FD4`
- Text: 11px, weight 600, tracking 1.5px, UPPERCASE, `rgba(255,255,255,0.7)`
- Copy: `Web Design · Northern Tarrant County, TX`

*H1:* `font-size: clamp(44px, 6vw, 80px); font-weight: 700; color: white; line-height: 1.05; letter-spacing: -2px; margin-bottom: 24px`
```
Your next website
should make people
[gradient text] stop scrolling.
```

*Lead paragraph:* 18px, `rgba(255,255,255,0.65)`, line-height 1.7, max-width 480px, margin-bottom 40px  
Copy: `Sequel Web Studio builds hand-crafted websites for small businesses in the DFW area. Clean code, fast loads, and a design that turns visitors into customers.`

*Button row:* `display: flex; gap: 14px; flex-wrap: wrap; align-items: center`
- **Primary:** `background: linear-gradient(135deg, #2E75B6, #8E44AD); color: white; padding: 14px 28px; border-radius: 10px; font-size: 15px; font-weight: 700; box-shadow: 0 8px 24px rgba(46,117,182,0.4)` — Copy: `Start Your Project →`
- **Ghost:** `background: rgba(255,255,255,0.08); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 14px 24px; border-radius: 10px; font-size: 15px; font-weight: 600` — Copy: `See Pricing`

*Stats strip:* `margin-top: 48px; display: flex; gap: 32px; flex-wrap: wrap`
| Value | Label |
|---|---|
| 95+ | Lighthouse score |
| < 1s | Load time |
| 100% | Hand-built code |
- Value: 28px, weight 700, white, tracking -1px
- Label: 12px, `rgba(255,255,255,0.45)`, margin-top 4px

**Right column — Audit Card** (`flex: 0 0 320px`):
- Container: `background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; padding: 28px; backdrop-filter: blur(12px)`
- Header: flex, space-between, margin-bottom 20px
  - Label: 13px, weight 600, `rgba(255,255,255,0.5)`, uppercase, tracking 1px — `Site Audit Report`
  - Live badge: 11px, weight 600, `#4B9FD4`, `background: rgba(75,159,212,0.15)`, padding `3px 10px`, `border-radius: 9999px`
- Domain: `mysmallbusiness.com` — `Space Mono`, 12px, `rgba(255,255,255,0.5)`, margin-bottom 16px
- Score bars (4 items):
  | Label | Score | Color |
  |---|---|---|
  | Performance | 94 | `#16A34A` |
  | SEO Score | 87 | `#2E75B6` |
  | Accessibility | 91 | `#16A34A` |
  | Mobile-Ready | 78 | `#D97706` |
  - Label: 12px, `rgba(255,255,255,0.6)`; Score: 12px, weight 700, colored
  - Bar track: `height: 4px; background: rgba(255,255,255,0.1); border-radius: 9999px`
  - Bar fill: colored, width = score%, `border-radius: 9999px`
- CTA button: full-width, `background: linear-gradient(to right, #1F3864, #2E75B6)`, white text, 13px weight 700, `border-radius: 8px`, `padding: 11px`, margin-top 20px — `Audit My Site for Free`

**Bottom wave divider:** SVG path between dark hero and white section:
```html
<svg viewBox="0 0 1440 60" fill="none" style="position:absolute;bottom:-1px;left:0;right:0;display:block;width:100%">
  <path d="M0 60 L0 30 Q720 -10 1440 30 L1440 60 Z" fill="white" />
</svg>
```

---

#### Marquee Strip

`background: white; padding: 28px 0; border-bottom: 1px solid #eaeff8; overflow: hidden`

Scrolling items (CSS animation `translateX(-50%)`, 18s linear infinite):
`Fast-Loading Sites · Hand-Built Code · Northern Tarrant County · No Page Builders · Honest Pricing · WCAG Accessible · SEO-Optimized · Google-Ready · Mobile-First`

Item style: 13px, weight 600, `#8892A0`, tracking 0.5px, UPPERCASE, `padding: 0 32px`  
Separator: 5×5px purple dot (`#8E44AD`) between items.

**CSS:**
```css
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.marquee-track {
  display: flex;
  animation: marquee 18s linear infinite;
  white-space: nowrap;
}
```
Duplicate the item list twice inside `.marquee-track` to create seamless loop.

---

#### Value Props Section

`padding: 96px 0; background: white`

*Eyebrow:* 11px, weight 700, tracking 2px, UPPERCASE, `#2E75B6` — `Why Sequel`  
*H2:* `clamp(32px, 4vw, 52px)`, weight 700, `#0F1F3D`, tracking -1.5px, line-height 1.1, margin-top 12px
```
Built for results.
Not for awards.
```

**4-card grid:** `display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px`

Each card: `background: #F4F6FB; border-radius: 16px; padding: 32px 28px; border: 1px solid #e4eaf5; box-shadow: 0 4px 16px rgba(15,31,61,0.06)`  
Hover: `transform: translateY(-6px); box-shadow: 0 24px 56px rgba(15,31,61,0.18)` — transition 0.25s ease

| # | Title | Body |
|---|---|---|
| 01 | Speed by default | Every site targets 95+ on Lighthouse before launch. Fast sites rank higher and convert better. |
| 02 | Hand-crafted code | No Wix. No WordPress templates. No bloated plugins. Joe writes every line himself. |
| 03 | You own everything | One payment, full ownership. No monthly platform fees. No lock-in. Ever. |
| 04 | Local and reachable | Based in Northern Tarrant County. Call, text, or meet in person — your choice. |

Step number: `Space Mono`, 12px, `#2E75B6`, tracking 1px, margin-bottom 20px  
Title: 20px, weight 700, `#0F1F3D`, tracking -0.3px, margin-bottom 10px  
Body: 14px, `#595959`, line-height 1.65

**Scroll reveal:** Add `data-reveal` to each card and use an IntersectionObserver (or Alpine.js `x-intersect`) to add `.visible` class. Start: `opacity: 0; transform: translateY(28px)`. End: `opacity: 1; transform: none`. Duration 0.65s ease. Delay each card by 0.1s increments.

---

#### Process Section

`background: #0F1F3D; padding: 96px 0; position: relative; overflow: hidden`  
Dot grid overlay (same as hero, opacity 0.5).

*Eyebrow:* `#4B9FD4` — `How It Works`  
*H2:* `clamp(30px, 4vw, 48px)`, white, tracking -1px
```
From call to launched
[gradient text] in 3 weeks.
```

**4-column grid:** `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2px`  
Items separated by `border-left: 1px solid rgba(255,255,255,0.08)` (skip on first).

| Step | Title | Body |
|---|---|---|
| 1 | Discovery call | We talk about your business, goals, and what you need. No pressure, no sales pitch. |
| 2 | Design & build | Joe designs and builds your site by hand. You see progress drafts along the way. |
| 3 | Review & refine | Two rounds of revisions. We tweak until it feels exactly right. |
| 4 | Launch | We deploy to Netlify, configure your domain, and submit to Google. Done. |

Step number: 48px, weight 700, `rgba(255,255,255,0.08)`, `Space Mono`, tracking -2px, line-height 1, margin-bottom 20px  
Title: 18px, weight 700, white  
Body: 14px, `rgba(255,255,255,0.5)`, line-height 1.65  
Item padding: `36px 28px`

---

#### Pricing Section

`background: #F4F6FB; padding: 96px 0`

*Eyebrow:* `#2E75B6` — `Pricing`  
*H2:* `clamp(30px, 4vw, 48px)`, `#0F1F3D`, tracking -1px — `Simple. Honest. One-time.`  
*Subtext:* 16px, `#595959` — `No monthly fees. No surprise invoices. You pay once and own your site.`

**2-card flex:** `display: flex; gap: 24px; justify-content: center; flex-wrap: wrap`

**Starter card:**
- `background: white; border-radius: 20px; padding: 40px 36px; box-shadow: 0 8px 32px rgba(15,31,61,0.08); border: 1px solid #e4eaf5; flex: 1 1 300px; max-width: 380px`

**Premium card (featured):**
- `background: #0F1F3D; border-radius: 20px; padding: 40px 36px; box-shadow: 0 20px 56px rgba(15,31,61,0.28); flex: 1 1 300px; max-width: 380px; position: relative`
- "Most Popular" chip: `position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #2E75B6, #8E44AD); color: white; font-size: 11px; font-weight: 700; padding: 5px 18px; border-radius: 9999px`

Both cards share:
- Plan name: 11px, weight 700, tracking 2px, UPPERCASE — blue (`#4B9FD4` dark / `#2E75B6` light)
- Price: 52px, weight 700, tracking -2px, line-height 1
- Tag: 13px, muted — `One-time fee`
- Description: 14px, line-height 1.6, margin-bottom 24px, padding-bottom 24px, border-bottom
- Feature list: `list-style: none; display: flex; flex-direction: column; gap: 12px`
  - Each item: check icon SVG (16×16, circle bg + checkmark stroke) + 14px text
  - Checkmark color: `#4B9FD4` (dark card) / `#2E75B6` (light card)
- CTA button: `width: 100%; padding: 13px; border-radius: 10px; font-size: 14px; font-weight: 700`
  - Starter: outline `border: 2px solid #1F3864; color: #1F3864; background: transparent`
  - Premium: `background: linear-gradient(135deg, #2E75B6, #8E44AD); color: white; box-shadow: 0 8px 24px rgba(46,117,182,0.35)`

---

#### About Snippet

`padding: 96px 0; background: white`

**2-col grid:** `display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center`

Left — Photo:
- Wrapper: `position: relative`
- Background tint: `position: absolute; inset: -16px; background: linear-gradient(135deg, rgba(46,117,182,0.12), rgba(142,68,173,0.12)); border-radius: 28px; transform: rotate(-2deg)` — creates tilted glow behind photo
- Photo: `position: relative; width: 100%; border-radius: 20px; box-shadow: 0 24px 64px rgba(15,31,61,0.2)`
- Source: `assets/joe-headshot.png` (in design system)

Right — Copy:
- Eyebrow: `#2E75B6` — `About Joe`
- H2: `clamp(28px, 3.5vw, 44px)`, `#0F1F3D`, tracking -1px
  ```
  One developer.
  Every project.
  ```
- Purple divider: `height: 3px; width: 48px; background: #8E44AD; border-radius: 9999px; margin: 0 0 24px`
- Two body paragraphs, 16px, `#595959`, line-height 1.75
- Button: `border: 2px solid #1F3864; color: #1F3864; background: transparent; padding: 11px 24px; border-radius: 9px; font-size: 14px; font-weight: 700`  
  Copy: `More about Joe →`

---

#### Final CTA Section

`background: linear-gradient(135deg, #0F1F3D 0%, #1F3864 50%, #2E75B6 100%); padding: 96px 32px; position: relative; overflow: hidden`  
Dot grid overlay (opacity 0.3).

Center-aligned, max-width 680px:
- H2: `clamp(32px, 5vw, 58px)`, white, tracking -1.5px, line-height 1.1
  ```
  Ready to build something
  [gradient text] worth showing off?
  ```
- Subtext: 17px, `rgba(255,255,255,0.6)`, line-height 1.7, margin-bottom 36px
- Button: `background: white; color: #1F3864; padding: 16px 36px; border-radius: 12px; font-size: 16px; font-weight: 700; box-shadow: 0 12px 32px rgba(0,0,0,0.3)`  
  Copy: `Start Your Project →`

---

### 3. Services Page (`src/pages/services.astro`)

**Hero:** Same dark navy pattern with dot grid and wave divider. Eyebrow, H1, subtext centered.  
H1: `Clean, fast websites. [gradient] One-time price.`  
Subtext: `No subscriptions. No retainers. Pay once and own your site outright.`

**Plans section:** `background: #F4F6FB; padding: 80px 32px`  
Same two pricing cards as homepage. Below cards, a 2×2 FAQ grid:

| Q | A |
|---|---|
| Do I own my website? | Yes — completely. When the project is done, the site and all its files are yours. No platform lock-in. |
| What about hosting? | We recommend Netlify (free tier covers most small business sites). We'll help you get set up. |
| How long does it take? | Starter sites typically launch in 2–3 weeks. Premium in 3–5 weeks, depending on content availability. |
| Do you do ongoing updates? | Support windows are included (30 or 60 days). After that, we offer update packages — or teach you to make small edits yourself. |

FAQ item: `background: white; border-radius: 14px; padding: 22px 24px; border: 1px solid #e4eaf5`  
Q: 15px, weight 700, `#0F1F3D`  
A: 14px, `#595959`, line-height 1.6

---

### 4. About Page (`src/pages/about.astro`)

**Hero:** Full dark hero with 2-col layout (copy left, photo right). Photo has the tilted glow effect.  
H1: `One developer. [gradient] Every project.`

**Values section:** `padding: 80px 32px; background: white`  
H2: `The Sequel way.` + purple divider  
4-card grid (same grid as value props on homepage):

| Title | Body |
|---|---|
| Transparency first | You'll always know what you're getting, how much it costs, and when it'll be done. |
| Fast by default | Performance isn't an afterthought. Every site targets 95+ on Lighthouse before it ships. |
| Local, not remote | Joe is based in Northern Tarrant County. You can meet in person, call, or text — your choice. |
| You own everything | When the project ships, the code and all assets are yours. No platform lock-in, ever. |

---

### 5. Contact Page (`src/pages/contact.astro`)

**Hero:** Dark hero (same pattern). H1: `Let's build something [gradient] great.`

**Form section:** `background: #F4F6FB; padding: 72px 32px 96px`  
Layout: `display: flex; gap: 40px; align-items: flex-start; flex-wrap: wrap`

**Form card** (`flex: 1 1 480px`):
- `background: white; border-radius: 20px; border: 1px solid #e4eaf5; box-shadow: 0 8px 32px rgba(15,31,61,0.08); padding: 40px 36px`
- Fields: Name*, Email*, Business, Website URL (optional), Message*
- Input style: `padding: 11px 14px; border-radius: 9px; border: 1.5px solid #d0d9e8; font-size: 14px; background: #FAFBFE`
- Focus: `border-color: #2E75B6; box-shadow: 0 0 0 3px rgba(46,117,182,0.12)`
- Submit button: full-width, gradient `#1F3864 → #2E75B6`, 15px weight 700, `padding: 14px`, `border-radius: 10px`, shadow
- Below button: 12px muted — `No spam. Joe will reply by email within one business day.`

**Sidebar** (`flex: 0 1 260px`):
- 3 info cards + 1 dark CTA card (same pattern as prototype)
- Info cards: `background: white; border-radius: 14px; border: 1px solid #e4eaf5; padding: 18px 20px`
- Dark card: `background: #0F1F3D` with purple CTA button

**Success state:** On form submit, show success card with green checkmark circle, "Message sent!" heading, confirmation text.

---

### 6. Shared: Footer (`src/components/Footer.astro`)

`background: #0F1F3D; padding-top: 56px`

Layout: `max-w-[1160px] mx-auto px-8 pb-12 flex justify-between flex-wrap gap-8`

- Left: Logo mark + "Sequel Web Studio" + "Northern Tarrant County, TX" (10px, `rgba(255,255,255,0.3)`)
- Center: Nav links in column, 13px, `rgba(255,255,255,0.5)`
- Right: Email link (`#2E75B6`, 14px, weight 600) + copyright (11px, `rgba(255,255,255,0.25)`)

Bottom accent bar: `height: 4px; background: linear-gradient(to right, #2E75B6, #8E44AD)`

---

## Interactions & Behavior

### Scroll-Reveal Animation
All major content blocks animate in on scroll:
- Start state: `opacity: 0; transform: translateY(28px)`
- End state: `opacity: 1; transform: none`
- Duration: `0.65s ease`
- Stagger: 0.1s delay per sibling card

**Implementation:** Use Astro's `<script>` with IntersectionObserver, or Alpine.js `x-intersect` plugin. Add `data-reveal` attribute to elements, trigger `.is-visible` class.

```js
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
```

### Nav Scroll State
Use Alpine.js or a `<script>` tag with `window.addEventListener('scroll', ...)`. Toggle a `scrolled` class/state at > 40px scroll depth.

### Marquee
Pure CSS animation (`translateX(-50%)`). Duplicate content to make seamless. Pause on hover.

### Card Hover
CSS only: `transition: transform 0.25s ease, box-shadow 0.25s ease`. Apply to all feature cards and pricing cards.

### Form Submit
Netlify Function or Netlify Forms. On success response, show the success state (hide form, show confirmation card).

---

## Assets

| Asset | Path in design system | Notes |
|---|---|---|
| Joe's headshot | `assets/joe-headshot.png` | Used on homepage About snippet + About page hero |
| Logo S mark | `assets/logo-mark.svg` | Inline SVG preferred for nav (avoids FOUC) |
| Logo full | `assets/logo-full.svg` | Optional; nav uses inline approach |

---

## Files in This Package

| File | Description |
|---|---|
| `index-v2.html` | Full interactive prototype — Home, Services, About, Contact (single file) |
| `README.md` | This document |

Reference these additional files from the design system root:
| File | Description |
|---|---|
| `colors_and_type.css` | All CSS custom properties |
| `README.md` (root) | Visual foundations, content tone, iconography |
| `ui_kits/website/styles.css` | Shared CSS vars |

---

## Implementation Notes

1. **Start with `tailwind.config.mjs`** — add `brand-navy-dark`, `brand-blue-light`, `brand-grey-muted` color tokens and update font families.
2. **Create a base layout** (`src/layouts/BaseLayout.astro`) with the Google Fonts link, sticky Nav, and Footer.
3. **Build page-by-page** in order: Homepage → Services → About → Contact.
4. **The Nav scroll behavior** is the trickiest part — use Alpine.js `x-data="{ scrolled: false }" @scroll.window="scrolled = window.scrollY > 40"` on the nav element.
5. **Marquee** is pure CSS — no JS needed.
6. **The audit card** in the hero is decorative/static for now (Phase 1). Wire it to the real audit tool in Phase 2.
7. **Wave SVG dividers** between sections: copy the SVG snippet from this README exactly.
