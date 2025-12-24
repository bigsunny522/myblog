# README.md Consolidation Plan

## Goal
Consolidate all site documentation into `README.md`, covering site operation, content updates, available commands, and design customization parameters.

## Proposed Changes

### [Docs] README.md
Example structure:
1.  **Project Overview**: Brief intro.
2.  **Getting Started**: `npm install`, `npm run dev`.
3.  **Content Management**:
    *   **Articles**: How to add MDX in `content/posts`. Explaining frontmatter.
    *   **My Gear**: How to add MDX in `content/my-gear`. Explaining frontmatter.
4.  **Available Commands**:
    *   **Development**: `dev`, `build`, `start`, `lint`.
    *   **Site Features**: List of commands available in the 404 Terminal (help, dir, type, etc.).
5.  **Design Customization**:
    *   **Global Theme**: Colors & Fonts in `app/globals.css`.
    *   **Hero Section**: Text and Slideshow images in `components/Hero.tsx`.
    *   **Footer**: Social links in `components/Footer.tsx`.
    *   **Terminal 404**: Messages and secrets in `app/not-found.tsx`.
    *   **Other Components**: Where to find them.

## Verification Plan
1.  **Manual Review**: Read the generated `README.md` to ensure all requested information is present and accurate based on the file analysis.
