# Swapnil Mukherjee – Identity and Access Management (IAM) Portfolio

This repository hosts the personal portfolio of **Swapnil Mukherjee**, an experienced Identity and Access Management (IAM) and CIAM Engineer.  
It is a fast, fully static Single Page Application (SPA) built with React and Tailwind CSS, designed to highlight professional experience, technical skills, and project work.

---

## Highlights

- **Aesthetic and High Performance Interface**  
  Modern dark-theme UI with smooth animations for a fast and polished experience.

- **Zero-Trust Identity Focus**  
  Content prioritized to highlight hands-on expertise with Okta, Auth0, Ping, Azure AD, SAML, OIDC, MFA, and CI/CD IAM pipelines.

- **Detailed Experience Section**  
  Vertical timeline with expandable modals supporting comprehensive job descriptions.

- **Filterable Project Gallery**  
  Projects grouped by domain (Cybersecurity, Web Engineering, etc.) for easy review.

- **Direct Access Tools**  
  Built-in features for profile photo rendering and downloadable résumé.

---

## Technology Overview

| Layer      | Technology                |
|------------|----------------------------|
| Frontend   | React (SPA)               |
| Styling    | Tailwind CSS v4 (Zero-Config) |
| Build Tool | Vite                       |
| Icons      | Lucide-React               |
| Deployment | GitHub Pages (gh-pages)    |

---

## Project Structure

A quick reference for maintaining and updating the portfolio:

```
src/
   App.jsx            # Main application logic and components
   assets/            # Logos, icons, and other media
public/
   Resume.pdf         # Publicly served résumé
   image.png          # Profile image or branding asset
index.html            # Core HTML entry point
vite.config.js        # Build + Tailwind v4 plugin configuration
package.json          # Dependencies and deploy scripts
```

---

## Deployment

This project is deployed using **GitHub Pages**.

Deployment scripts in `package.json`:

```
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```

To deploy manually:

```bash
npm run deploy
```

---

## Important Notices

**Repository Status**  
This repository is maintained exclusively for professional portfolio use.

**Contributions**  
External contributions are not accepted.

**Copyright**  
All code, assets, and content in this repository are protected and may not be reused without permission.

---
