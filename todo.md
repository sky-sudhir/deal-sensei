# 📋 DealSensei CRM – To-Do List (Phase-Wise Breakdown)

This file lists **all implementation tasks** derived from product, backend, frontend, and journey specifications.

---

## ✅ Phase 1: Company Onboarding + Auth

### Backend

- [x] Create `/api/v1/companies/signup` endpoint
- [x] Create `/api/v1/auth/login`, `/logout`, `/verify-email`
- [x] Setup JWT auth + bcrypt encryption
- [x] Add email verification token system
- [x] Configure RBAC middleware (admin, sales_rep)
- [x] Setup MongoDB indices for user and company

### Frontend

- [x] Landing Page UI with CTA
- [x] Signup Page (`/signup`)
- [x] Verify Email Sent (`/verify-email-sent`)
- [x] Verify Email Redirect (`/verify-email/:token`)
- [x] Login Page (`/login`)
- [x] Dashboard Shell with Sidebar + Checklist
- [x] Redux user slice for authentication
- [x] Protected routes setup
- [x] API service for backend communication

---

## 📂 Phase 2: Team & Pipeline Setup

### Backend

- [x] API for `POST /api/v1/pipelines/` and `GET/PUT/DELETE`
- [x] API for `POST /api/v1/users/` (admin only)
- [x] RBAC for user listing/editing by role

### Frontend

- [x] Pipeline Form + List View + Edit/Delete Actions
- [x] Team Management Page (`/team`)
- [x] Invite Team Modal
- [x] Update Sidebar navigation for Pipelines and Team Management
- [x] Refactor API calls to use custom useQuery and useMutation hooks

---

## 📇 Phase 3: Contacts + Deals

### Backend

- [x] Contacts CRUD (`/api/v1/contacts/`)
- [x] Deals CRUD (`/api/v1/deals/`)
- [x] Contact ↔ Deal linking
- [x] Ownership checks (sales rep vs admin)
- [x] Search endpoints

### Frontend

- [x] Contacts Modal + Page
- [x] Deals Create Page + List Page
- [x] Deal Detail View (Tabs: Overview, Activities, Files)
- [x] Transfer Deal Owner UI

---

## 📝 Phase 4: Activities + Files

### Backend

- [x] Activities CRUD (`/api/v1/activities/`)
- [x] File upload endpoint + S3 integration
- [x] Activity sentiment + insights storage
- [x] MongoDB vector search enabled
- [x] Migrate AWS SDK from v2 to v3

### Frontend

- [x] Activity Feed + Filters
- [x] Log Activity Modal (Type, Notes, Duration)
- [x] File Upload Component in Deal View
- [x] File List Component
- [x] Activities Page
- [x] Files Page
- [x] Integration with Deal and Contact Detail pages

---

## 🤖 Phase 5: AI Capabilities

### Backend

- [x] Deal Coach Endpoint (`/ai/deal-coach/:deal_id`)
- [x] Persona Builder Endpoint (`/ai/persona-builder/:contact_id`)
- [x] Objection Handler Endpoint (`/ai/objection-handler`)
- [x] Win-Loss Explainer Endpoint (`/ai/win-loss-explainer/:deal_id`)
- [x] Embedding on-create & on-update
- [x] Cold start logic

### Frontend

- [x] AI Tabs in Deal/Contact Detail Pages
- [x] Objection Handler UI Tool
- [x] Persona Refresh Button
- [x] Error Screens (503, cold start)

---

## 🔐 Phase 6: Security + Logs

### Backend

- [ ] Middleware to prevent unauthorized access
- [ ] Audit Logs CRUD
- [ ] Security headers config
- [ ] Rate limiting

### Frontend

- [ ] Error fallback UI (Unauthorized / Forbidden)
- [ ] Admin view for logs (later)

---

## 🧰 Phase 7: DevOps + Docs

- [ ] Swagger/OpenAPI documentation
- [ ] Daily vector update job
- [ ] ENV setup for Mongo, S3, Gemini
- [ ] Rate limiter config

---

_Created: 2025-05-31_
