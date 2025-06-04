---
trigger: always_on
---

# CRM Platform Backend Specification (v2.0)

_Author: Sudhir | Date: 2025-05-31_

---

## 1. Infra & Integrations

**Database:** MongoDB Atlas (with Vector Search), all collections include `company_id`.

**3rd-Party:**

- Amazon S3 (`/company_id/files/`)
- Gemini SDK (`text-embedding-004`)
- SMTP/SendGrid (no tracking)

---

## 2. Auth & Access

**Auth:** JWT, bcrypt, email verification

**RBAC:**

- Roles: `admin`, `sales_rep`
- Admin sees all; reps see only own
- No cross-company access; admin not deletable

---

## 3. Schema Summary

- All collections include `ai_embedding`, `company_id`, `created_at`, `updated_at`

**Users**

```json
{ email, password, name, role, company_id, is_active, ai_embedding }
```

**Companies**

```json
{ name, email, is_verified, admin_user_id, settings, ai_embedding }
```

**Contacts**

```json
{ name, email, phone, notes, engagement_score, last_interaction_date, ai_embedding }
```

**Deals**

```json
{ title, value, stage, pipeline_id, contact_ids, owner_id, status, stage_duration_days, total_deal_duration_days, ai_embedding }
```

**Pipelines**

```json
{ name, stages, is_default, ai_embedding }
```

**Activities**

```json
{ type, content, subject, duration_minutes, sentiment_score, objections_mentioned, next_steps, ai_embedding }
```

**Email_Templates**

```json
{ name, subject, body, created_by, is_active, ai_embedding }
```

**File_Attachments**

```json
{ filename, file_type, file_size_bytes, s3_url, attached_to_type, attached_to_id, ai_embedding }
```

**Audit_Logs**

```json
{ action, entity_type, entity_id, user_id, old_values, new_values, timestamp }
```

---

## 4. AI Features

**Deal Coach**

- Endpoint: `POST /ai/deal-coach/:deal_id`
- Analyzes: stage time, activity, objections, competitors
- Returns: recommendations, health score, risks

**Persona Builder**

- Endpoint: `POST /ai/persona-builder/:contact_id`
- Analyzes: emails, notes, transcripts
- Returns: persona, motivators, decision pattern

**Objection Handler**

- Endpoint: `POST /ai/objection-handler`
- Input: objection text + deal context
- Returns: objection category, responses, follow-up Qs

**Win-Loss Explainer**

- Endpoint: `POST /ai/win-loss-explainer/:deal_id`
- Evaluates: price, timing, features, rep behavior
- Returns: outcome, key factors, recommendations

---

## 5. Vector Embedding

- Model: `text-embedding-004`
- Strategy: on create/update, daily batch refresh
- Sources: user role, notes, contact summaries, activities, deals, templates, files

---

## 6. API Design

**Base URL:** `/api/v1`, auth required (except `/auth`), rate limit 100/min

**Routes:** (selected)

```
/auth/signup, /auth/login, /auth/logout, /auth/verify-email
/companies/signup, /companies/me
/users/, /users/:id
/contacts/, /contacts/:id/activities
/deals/, /deals/:id/activities
/pipelines/, /activities/, /files/upload
/ai/deal-coach/:id, /ai/persona-builder/:id, /ai/objection-handler, /ai/win-loss-explainer/:id
/analytics/*
```

**Responses:** `200`, `201`, `400`, `401`, `403`, `404`, `500`, `503`

---

## 7. Error Handling

- AI or vector failure → `503`
- Cold start AI warning if insufficient data
- Standard Error:

```json
{ error: { code, message }, timestamp, request_id }
```

---

## 8. Security

- Headers: HSTS, nosniff, DENY frame, XSS protection
- Input: validator, sanitize, file/email checks
- Rate: 100/min general, 20/min AI, 10/min uploads

---

## 9. Rules

- Sales reps: own deals only
- Admins: all data, cannot delete self
- AI: per-company only, real-time generation

---

## 10. Mongo Indexes

```js
db.users.createIndex({ email: 1 }, { unique: true });
db.deals.createIndex({ company_id: 1, status: 1 });
db.activities.createIndex({ contact_id: 1, created_at: -1 });
db.deals.createIndex({ ai_embedding: "vector" });
```

---

## 11. Dev & Env

**Docs:** Swagger at `/api-docs` via `swagger-jsdoc`

**ENV Vars:**

```env
MONGODB_URI=...
JWT_SECRET=...
SMTP_USER=apikey
AWS_ACCESS_KEY_ID=...
GEMINI_API_KEY=...
```
