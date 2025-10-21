# Stack-Specific Tools and Best Practices — Printverse

This document provides setup guides, best practices, and examples for the main tools used in the Printverse project.  
It ensures consistency across the team and helps new members onboard quickly.

---

## 1. Mongoose (Database Layer)

### Connection
- Use a single shared connection inside `/src/server/db.js` to prevent multiple instances.
```js
- import mongoose from "mongoose";

- mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

- export default mongoose;


## 2. Deployment (Render & Google Cloud)
 Render (Staging)
- Branch: dev → auto-deploys to Render
   Environment variables: managed via Render dashboard
- Build command: npm run build
- Start command: npm start


## 3. CI/CD Workflow
- Continuous Integration
- All Pull Requests trigger automated testing.

Branch protection:
- main and dev are protected.
- Reviews are required before merging.

Example GitHub Action snippet:
    name: CI
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm test

## 4. Google Cloud(Production)
- main → deploys automatically to GCP App Engine



## 5. Tools & Versions
/Tool            /Purpose	
Node.js         -Runtime Environment
Mongoose        -MongoDB ODM
Express         -Server Framework
React / Vite    -Frontend Framework
Render	        -Hosting (Staging)
GCP App Engine	-Hosting (Production)
GitHub Actions	-CI/CD Automation	latest


## 6. Best Practices Summary

-- Keep .env files local only, never commit them.
-- Use async/await and proper error handling in all DB operations.
-- Automate builds and tests with GitHub Actions.
-- Verify staging on Render before deploying to production.
-- Maintain version consistency across environments.
-- Monitor health using /healthz.
-- Review logs after each deployment.
