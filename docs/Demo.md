# Printverse — Demo Script

This document serves as a step-by-step demo guide for presentations, onboarding, or grading reviews.  
It walks through the repository, local development, and live deployments.

---

## 0) Prep Checklist (before the demo)
- Repo is **public** and up-to-date (`main` & `dev` protected; PR reviews required).
- `.env` (local only) is configured — **never commit secrets**.
- **MongoDB Atlas** connection is verified (IP allowlist + credentials).
- **Render (staging)** deployed from `dev` branch.
- **Google Cloud (production)** deployed from `main` branch.
- **OpenAPI spec** available at `/api/openapi.yaml`.
- At least **7 screenshots** stored under `docs/screenshots/` for backup reference.
- **A11y check**: color contrast, focus outline, labels are visible.

---

## 1) Start from the Repository

1. Open: **https://github.com/<org-or-user>/printverse**
2. Highlight key points:
   - `README.md`: BLUF (what, who, value) + User Story + links (staging, prod, API).
   - Folder structure: `src/client`, `src/server`, `api`, `docs`, `.github/`.
   - Team docs: `docs/process/TEAM.md`, `PROCESS.md`, `MEETING_NOTES.md`.
   - Show active issues, PRs, and sprint milestones.
3. Mention repo policies:
   - **No direct push to main**
   - **Code review required**
   - **CI workflow runs automatically on PR merge**

---

## 2) Local Dev Quick Run

> Use this only if you need to demo the local setup; otherwise jump to staging/prod.

```bash
# Clone and install
git clone https://github.com/<org-or-user>/printverse.git
cd printverse
pnpm i   # or npm install / yarn

# Create local environment
cp .env.example .env
# Edit .env with local values (do not commit)

# Run in development
pnpm dev   # or npm run dev

