# 🧠 Team Development Process - Printverse

## 🧩 Team Overview
Our development process emphasizes collaboration, accountability, and transparency across all tasks — from ideation to production deployment.  
We use GitHub Issues, branches, and pull requests as the core of our communication and workflow.

---

## 🔄 Workflow Summary
**Main Branches:**
- `main` → Production (Google Cloud)
- `dev` → Staging (Render)
- `feature/*` → Individual task branches

**Rules:**
- No direct pushes to `main`
- All code must go through a Pull Request (PR)
- Every PR must reference its related Issue (e.g., “Closes #26”)

---

## 💬 Team Communication Flow
| Activity | Platform | Frequency | Purpose |

| Daily Standups | GroupMe| Every class or workday | Quick updates, blockers, and next steps |
| Planning Meetings | face to face or zoom| Define sprint goals, assign tasks |

---

## 👥 Roles and Division of Labor
| Role | Member | Responsibilities |
|------|---------|------------------|
| **Product Architect** | Garvit | Overall product vision, issue creation, CI/CD structure |
| **Backend Developer** | Shun | REST API, database models, authentication |
| **Frontend Developer** | Garvit] | UI/UX, React integration, front-end testing |
| **NLP Specialist** | [Garvit] | Parsing logic, sentence-to-command mapping |
| **DevOps / QA** | [Shun] | CI/CD workflows, staging/production deployment, testing |

---

## 🧩 Development Lifecycle (Issue → Tested Integration)
1. **Create Issue:** Describe feature/fix with User Story & Acceptance Criteria.  
2. **Create Branch:**  
