# Personal Portfolio Website

A fast, fully responsive personal portfolio website built with **vanilla HTML, CSS, and JavaScript** and no frameworks, no build tools, no bundlers. Just clean, dependency-light code that anyone can read, fork, and adapt for their own portfolio.

**Live site** ~ [horaira-rezon.github.io](https://horaira-rezon.github.io)

---

## 📖 About This Project

This repository powers my personal portfolio site. It was built from scratch with a focus on **performance, accessibility, and maintainability**, while still delivering a polished, app-like feel through smooth scrolling, subtle motion, and interactive UI components.

I'm open-sourcing the structure and documenting how it's put together so that other developers can use it as a reference or starting point for building their own portfolio. No design tools or frameworks required, just an HTML file, a few stylesheets, and some plain JavaScript.

---

## ✨ Key Features

- **Light / Dark Theme:** Toggle-based theming with automatic detection of system preference.
- **Fully Responsive:** Distinct, purpose-built stylesheets and scripts for desktop and mobile breakpoints rather than a one-size-fits-all layout, keeping each experience clean and intentional.
- **Smooth Scrolling:** Buttery scroll experience powered by Lenis.
- **Typewriter Effect:** Animated typing intro built with plain JavaScript, no external typing library required.
- **Expandable Project Cards:** Click-to-expand project details with a modal/portal system for viewing full write-ups, images, and PDFs without cluttering the main layout.
- **Media Lightbox & Gallery:** Custom lightweight portal system for viewing images and PDFs without leaving the page.
- **Dynamic Link Previews:** Auto-generated Open Graph link preview cards for external references, rendered on the fly.
- **Scroll Reveal Animations:** Section fade-in / slide-up animations driven by the IntersectionObserver API for a smooth, progressive reveal as you scroll.
- **Accessible Mobile Navigation:** Animated hamburger menu with outside-click and keyboard (Esc) handling for a polished mobile experience.

---

## 🛠️ Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Flexbox/Grid, no preprocessor
- **JavaScript (Vanilla, ES6+)** - No frameworks
- **[Lenis](https://github.com/darkroomengineering/lenis)** - Smooth-scroll library
- **[Iconify](https://iconify.design/)** - Icon rendering
- **[Font Awesome](https://fontawesome.com/)** - Icon set
- **Google Fonts** (Poppins) - Typography

---

## 📁 Project Structure

```
horaira-rezon.github.io/
│
├── assets/
│   ├── css/
│   │   ├── desktop-dark.css    # Base styles + dark theme (desktop)
│   │   ├── desktop-light.css   # Light theme overrides (desktop)
│   │   ├── mobile-dark.css     # Base styles + dark theme (mobile)
│   │   └── mobile-light.css    # Light theme overrides (mobile)
│   │
│   ├── js/
│   │   ├── main.js             # Core site logic (theme, nav, scroll,
│   │   │                       #  typewriter, portals, link previews)
│   │   └── mobile.js           # Mobile-only interaction handlers
│   │
│   ├── fonts/                  # Self-hosted font files
│   ├── icons/                  # Icon assets
│   ├── images/                 # Site & profile images
│   └── pdf/                    # Downloadable documents (e.g. CV)
│
├── private-drafts/             # Local working drafts (not deployed)
├── favicon.ico                 # Site favicon
├── .gitignore
├── index.html                  # Single-page site entry point
└── README.md                   # You are here
```

**How theming works:** `desktop-dark.css` and `mobile-dark.css` are loaded by default and define the complete base styling. `desktop-light.css` and `mobile-light.css` are loaded as `disabled` stylesheets and only contain *overrides* — the theme toggle in `main.js` simply enables/disables these stylesheets and remembers the user's choice in `localStorage`.

---

## 🚀 Getting Started

### Prerequisites

- [Git](https://git-scm.com/downloads)

### Clone the Repository
### Using HTTPS:

```bash
git clone https://github.com/horaira-rezon/horaira-rezon.github.io.git
```

### Using SSH:

```bash
git clone git@github.com:horaira-rezon/horaira-rezon.github.io.git
```

Navigate into the project folder:

```bash
cd horaira-rezon.github.io
```

### Run It Locally

Because the site is plain HTML/CSS/JS, you can open `index.html` directly in a browser. However, running it through a local server is recommended so relative asset paths and fetch requests behave exactly as they do in production:

**Option A: Python (built-in, no install needed)**
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

**Option B - VS Code Live Server**
1. Open the project folder in VS Code.
2. Right-click `index.html` → **Open with Live Server**.

### Deploying Your Own Copy

Since this is a static site, it can be deployed anywhere without a build step:

- **GitHub Pages:** Push to a repository named `<your-username>.github.io`, or enable Pages in the repo settings for any repo.
- **Netlify / Vercel:** Drag-and-drop the folder or connect the repository - no build command required.

---

## 📄 License

This project is open for reference and learning purposes. If you reuse the code structure for your own portfolio, please avoid copying personal content (name, bio, projects, CV, images) as-is. A star ⭐ on the repo is always appreciated if this helped you!

---

## 📬 Contact

Feel free to reach out via the contact links on the [live site](https://horaira-rezon.github.io) if you have questions or feedback about the project.