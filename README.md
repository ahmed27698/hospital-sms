# 🏥 Hospital Standards Management System (HMS)

A production-ready hospital accreditation and standards management system built with Next.js 16, TypeScript, Tailwind CSS, Prisma ORM, and Auth.js.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui components |
| Database | PostgreSQL via Prisma ORM |
| Auth | Auth.js (NextAuth v5) with RBAC |
| Forms | React Hook Form + Zod validation |
| Tables | TanStack Table v8 |
| Charts | Recharts |
| i18n | next-intl (Arabic RTL + English LTR) |

## 📁 Project Structure

```
hospital-sms/
├── app/
│   ├── [locale]/
│   │   ├── (auth)/           # Login, Register, Forgot Password
│   │   └── (dashboard)/      # Protected pages
│   │       ├── dashboard/    # KPIs, Charts, Activity
│   │       ├── standards/    # Standards CRUD + Hierarchy
│   │       ├── requirements/ # Requirements with Kanban/Table
│   │       ├── documents/    # Document Repository
│   │       ├── responsibilities/ # Dept/Section/Owner management
│   │       ├── reports/      # PDF/Excel exports
│   │       ├── notifications/ # Alert center
│   │       ├── users/        # User management + RBAC
│   │       ├── audit-logs/   # Full audit trail
│   │       └── settings/     # System configuration
│   ├── api/
│   │   ├── auth/[...nextauth]/ # Auth.js handler
│   │   └── upload/           # File upload endpoint
│   └── globals.css
├── components/
│   ├── auth/                 # LoginForm, RegisterForm, etc.
│   ├── dashboard/            # KPICard, Charts
│   ├── layout/               # Sidebar, Header, Breadcrumb
│   ├── providers/            # ThemeProvider, SessionProvider
│   ├── shared/               # DataTable, Pagination, SearchFilter
│   └── ui/                   # Radix UI primitives
├── lib/
│   ├── actions/              # Server Actions (CRUD)
│   │   ├── dashboard.ts
│   │   ├── standards.ts
│   │   ├── requirements.ts
│   │   ├── documents.ts
│   │   ├── users.ts
│   │   ├── notifications.ts
│   │   └── audit.ts
│   ├── auth/                 # Auth config + permissions
│   ├── db/                   # Prisma client
│   ├── utils/                # Helpers, formatters
│   └── validations/          # Zod schemas
├── prisma/
│   ├── schema.prisma         # Full database schema
│   └── seed.ts               # Demo data seeder
├── messages/
│   ├── en.json               # English translations
│   └── ar.json               # Arabic translations
├── i18n/
│   ├── routing.ts
│   ├── navigation.ts
│   └── request.ts
├── types/index.ts
└── middleware.ts             # i18n + auth routing
```

## 🗄️ Database Schema

**Models:** User · Role · Permission · RolePermission · Department · Section · Standard · Requirement · Document · DocumentVersion · DocumentLink · Attachment · Team · TeamMember · Notification · AuditLog · Report

## 👥 Roles & Permissions

| Role | Standards | Requirements | Documents | Users | Reports |
|------|-----------|-------------|-----------|-------|---------|
| Super Admin | Full | Full | Full | Full | Full |
| Quality Manager | Read/Edit/Approve | Full | Full | Read | Full |
| Department Manager | Read | Create/Edit | Upload | Read | Read |
| Section Head | Read | Edit | Upload | Read | Read |
| Responsible User | Read | Edit own | Upload | Read | Read |
| Internal Auditor | Read/Export | Read/Export | Read/Export | Read | Full |
| Read Only | Read | Read | Read | Read | Read |

## ⚡ Quick Start

### 1. Prerequisites

```bash
node >= 18
postgresql running
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your DATABASE_URL and secrets
```

### 4. Setup database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with demo data
npm run db:seed
```

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔐 Demo Credentials

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | admin@hospital.org | Admin@123 | Super Admin |
| Quality Mgr | quality@hospital.org | User@1234 | Quality Manager |
| Dept Head | em.dept@hospital.org | User@1234 | Department Manager |

## 🌐 i18n Support

- **English** (LTR) — `/en/dashboard`
- **Arabic** (RTL) — `/ar/dashboard`

Language switcher available in the header. All UI strings, status labels, and navigation items are translated.

## 🚀 Production Deployment

```bash
# Build
npm run build

# Start
npm run start
```

### Environment Variables (Production)

```bash
DATABASE_URL=postgresql://user:pass@host:5432/hospital_sms
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://your-domain.com
AUTH_SECRET=$(openssl rand -base64 32)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=noreply@your-domain.com
SMTP_PASS=your-smtp-password
```

## 📋 Features Checklist

### Authentication
- [x] Login with credentials
- [x] User registration
- [x] Forgot password flow
- [x] Session management (JWT)
- [x] Role-based access control (7 roles)
- [x] Protected routes via middleware

### Standards Module
- [x] Standards CRUD
- [x] Hierarchical structure (parent-child)
- [x] Progress tracking per standard
- [x] Owner/backup owner assignment
- [x] Department/section linking
- [x] Chapter grouping

### Requirements Module
- [x] Requirements CRUD
- [x] Status workflow (6 statuses)
- [x] Priority levels (Low/Medium/High)
- [x] Due date tracking
- [x] Overdue detection
- [x] Owner assignment
- [x] Filter by status/department

### Documents Module
- [x] File upload (PDF, DOCX, images)
- [x] Document types (Policy/Procedure/Form/Guideline/Circular)
- [x] Status workflow (Draft → Review → Approved)
- [x] Version tracking
- [x] Link to standards/requirements
- [x] Download functionality

### Dashboard
- [x] KPI cards (4 metrics)
- [x] Compliance donut chart
- [x] Trend line chart
- [x] Department progress bars
- [x] Overdue items panel
- [x] Upcoming deadlines
- [x] Recent activity feed

### Notifications
- [x] In-app notification center
- [x] Overdue alerts
- [x] Due date reminders
- [x] Document updates
- [x] Mark as read / mark all read
- [x] Unread badge counter

### Reports
- [x] Accreditation readiness
- [x] Missing documents
- [x] Delayed requirements
- [x] Department report
- [x] PDF export
- [x] Excel export

### Audit Logs
- [x] All user actions tracked
- [x] Resource + action type
- [x] Timestamp + user attribution
- [x] Filterable log table

### User Management
- [x] User CRUD
- [x] Role assignment
- [x] Department assignment
- [x] Status management
- [x] Password management
- [x] Permissions matrix

### System
- [x] Dark/Light/System theme
- [x] Arabic RTL + English LTR
- [x] Responsive (mobile/tablet/desktop)
- [x] Breadcrumb navigation
- [x] Loading states / skeletons
- [x] Error boundaries
- [x] TypeScript throughout
