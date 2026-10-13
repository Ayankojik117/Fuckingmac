# MaC Foundation Website

Official website for **Make A Change (MaC) Foundation** — "Empowering Change Through Every Step."

Plain HTML/CSS/JS, no build step, no dependencies. Works directly on GitHub Pages.
(Fonts — Instrument Serif and Hanken Grotesk — load from Google Fonts, with system fallbacks.)

## Pages
- `index.html` — Home (hero, philosophy, five pillars, our work, skills, call to action)
- `about.html` — About / how we work
- `programs.html` — The five pillars (each has an anchor, e.g. `programs.html#education`)
- `get-involved.html` — Benefits + volunteer registration
- `contact.html` — Email + social links
- `donate.html` — Donation info, QR placeholder, and bank details

## Launching on GitHub Pages
1. Create a new repository on GitHub (e.g. `mac-foundation-website`).
2. Upload all files in this folder, keeping the `assets/` folder structure intact.
3. Go to the repo's **Settings → Pages**.
4. Under "Build and deployment", set **Source: Deploy from a branch**, branch: `main`, folder: `/ (root)`.
5. Save. GitHub will give you a live URL within a minute or two.

## Editing content
- Text lives directly in each `.html` file. The header and footer are repeated in every page; if you change a nav label or contact detail, change it in all six files.
- Colours, fonts, spacing and section rhythm live in `assets/style.css` (see the `:root` tokens at the top).
- Behaviour (menu, pillar and skill accordions, scroll reveals) lives in `assets/script.js`.
- The logo is `assets/logo.jpg` — replace this file (keep the same name) to swap it everywhere.
- The registration form link appears on `index.html`, `get-involved.html` and `contact.html`. Social links are in `contact.html` and the footer of every page.

## Adding project photographs (Home → Our work)
The five frames in the "Our work" section are tasteful placeholders — no photographs were supplied with the project.
To use a real photo, open `index.html`, find a `<div class="ph ph-a" …>` block and replace everything inside it with:

```html
<img src="assets/your-photo.jpg" alt="Describe the photo" loading="lazy">
```

Add `width`/`height` attributes if you can. The frame crops it automatically and keeps the reveal animation.
Remove the `role="img" aria-label="…"` attributes from the `.ph` div once it contains a real `<img>`.

## Donate page
Open `donate.html`, replace the placeholder `.qr-box` with an `<img>` of your QR code (a comment shows the exact tag),
and fill in the bank detail rows (account name, number, IFSC, UPI ID), which currently show "—".

## Accessibility and motion
Visible keyboard focus, a skip link, accessible accordions (arrow keys, Home/End) and a focus-trapped mobile menu are built in.
All scroll animation is switched off for visitors who set "reduce motion" in their operating system.
