---
trigger: always_on
---

# DealSensei - User Journey Specification (Compressed)

## Priority Order

1. **P1**: New company onboarding → first deal
2. **P2**: Admin: Team + Pipeline setup
3. **P3**: Sales Rep: Daily workflow

## Roles

- **Admin**: Full access
- **Sales Rep**: Own data only

---

## P1: Onboarding → First Deal

### 1. **Landing** (`/`)

- Branding, hero ("AI-Powered CRM"), CTAs: Start Trial, Sign In
- Actions → Start Trial → Signup | Sign In → Login

### 2. **Signup** (`/signup`)

- Fields: Company, Admin, Email, Password, T\&C checkbox
- POST `/api/v1/companies/signup` → Success → Email Sent

### 3. **Verify Email Sent** (`/verify-email-sent`)

- Message with resend + Back to Sign In

### 4. **Verify Email** (`/verify-email?token=...`)

- Success → "Continue to Dashboard"

### 5. **Dashboard (First-Time)** (`/dashboard`)

- Sidebar + Checklist: ✅ Account → ⏳ Pipeline → ⏳ Contact → ⏳ Deal
- Actions → Set Up Pipeline, Add Contact, Invite Team

### 6. **Pipeline Setup** (`/pipelines/new`)

- Fields: Name, Stages (min 3), Default?, Win Rate
- POST `/api/v1/pipelines/` → Success → Confirmation

### 7. **Pipeline Created** (`/pipelines/created`)

- CTA: Add First Contact | Skip to Dashboard

### 8. **Add Contact** (`/contacts` modal)

- Fields: Name, Email, Phone, Company, Role, Notes
- POST `/api/v1/contacts/`

### 9. **Contacts List** (`/contacts`)

- Contact cards: Name, Email, Phone, Last interaction, Create Deal
- Admin: all | Rep: own only

### 10. **Create Deal** (`/deals/new`)

- Fields: Title, Value, Pipeline/Stage, Contacts, Close Date, Notes, Owner
- POST `/api/v1/deals/`

### 11. **Deal Detail** (`/deals/[deal_id]`)

- Tabs: Overview, Activities, Files, AI Insights
- AI Coach button

---

## P2: Admin - Team & Pipeline

### 12. **Team Management** (`/team`)

- List: Name, Email, Role, Status | Actions: Edit, Deactivate

### 13. **Invite Member** (`/team` modal)

- Fields: Name, Email, Role, Send Email
- POST `/api/v1/users/`

### 14. **Pipeline Management** (`/pipelines`)

- Cards: Name, Stages, Default
- Admin: Edit/Delete/Create | Rep: View only

---

## P3: Sales Rep Workflow

### 15. **Login** (`/login`)

- Email, Password, Remember, Forgot Password
- POST `/api/v1/auth/login`

### 16. **Sales Rep Dashboard** (`/dashboard`)

- Metrics: My Deals, Monthly Activities, Deals Closing
- Quick actions: Contact, Deal, Activity

### 17. **My Deals** (`/deals`)

- Filters: Stage, Value, Date | Cards: Title, Value, Stage
- Admin: all | Rep: own only

### 18. **Activity Feed** (`/activities`)

- Feed: Type, Preview, Deal/Contact, Date
- Filters + Log Activity button

### 19. **Log Activity** (`/activities` modal)

- Fields: Type, Title, Notes, Duration, Deal, Contact, Follow-up Date
- POST `/api/v1/activities/`

---

## AI Features

### 20. **Deal Coach AI** (`/deals/[id]/ai-coach`)

- Summary + Recommendations + Health Score

### 21. **Persona Builder** (`/contacts/[id]/persona`)

- Insights: Style, Motivators, Pain, Confidence + Refresh

### 22. **Objection Handler** (`/ai/objection-handler`)

- Input objection → Get tone + effective responses

### 23. **Win-Loss Explainer** (`/deals/[id]/win-loss-analysis`)

- Outcome → Factor breakdown → Lessons → Similar deals

---

## UI & Navigation

### Top Nav

- Logo, Avatar (Profile, Logout), Dark Mode

### Sidebar

- **Admin**: Dashboard, Deals, Contacts, Activities, Pipelines, Team, Settings, AI Tools
- **Rep**: Dashboard, My Deals, Contacts, Activities, AI Tools

### Mobile

- Hamburger nav + bottom tab bar + swipe to update stage

---

## Error Screens

### 24. **AI Unavailable**

- AI 503 → Retry / Continue without AI

### 25. **Not Enough Data**

- AI cold start → Add more data CTA

---

## Responsive Design

- Mobile: 44px buttons, swipe, sticky buttons
- Tablet: Split view
- Desktop: Hover, keyboard shortcuts, multi-panel

---

_End of Compressed User Journey Spec_
