# Tewodros Haymanot — Developer Portfolio

A responsive portfolio website built with plain HTML, CSS, and JavaScript.

## Files
- `index.html` — portfolio content, dialogs, forms, and dashboard markup.
- `styles.css` — responsive design, light/dark themes, project mockups, and animations.
- `script.js` — navigation, theme switching, scroll effects, filtering, form validation, and local demo account/admin interactions.

## Run
Open `index.html` in a modern browser, or use the VS Code Live Server extension for local development.

## Add your portrait
1. Create an `images` folder beside `index.html`.
2. Copy your own portrait photo into that folder and name it `tewodros.jpg`.
3. The hero section will display the photo on the right on desktop and stack it beneath the introduction on mobile. If the photo is missing, a styled initials placeholder appears.

## Customize
Search `index.html` for `Tewodros Haymanot`, `hello@example.com`, the social links, project descriptions, education, and experience. Replace these sample details with your own. Project artwork is created with CSS, so no local image assets are required. Google Fonts are loaded from Google Fonts; a system font fallback is included.

## Important production notes
- The contact form validates and stores demo messages in the current browser's `localStorage`. It does **not** send email. Connect it to a backend endpoint or form service to deliver messages.
- The login and registration interface is a front-end demo. It stores demo account details locally and is **not secure authentication**. Never use real passwords. Production authentication requires a server, password hashing, session management, rate limiting, and appropriate CSRF protections.
- The admin dashboard edits a local demo project list. It is not access-controlled and does not yet update the portfolio's static project cards. For production, implement server-side authorization and connect CRUD operations to a database.
- Replace all sample profile information and social links before publishing.
