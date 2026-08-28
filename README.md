# Ethio Telecom Admin Dashboard

An internal operations and customer-service CRM for telecom environments, built as a dual-sided web application.

SuperDimm connects **telecom subscribers** with **operations staff** through separate customer and internal workflows. Customers can manage their account, report service problems, and track support cases, while operations staff can manage customers, triage service requests, review transactions, and monitor operational performance.

## Overview

SuperDimm is designed around two connected experiences:

### Customer Portal

Subscribers can:

* Sign in to their customer portal
* View account and subscription information
* View account references and contact information
* Report telecom service problems
* Provide required details when reporting follow-up issues
* Track submitted service cases
* View case status and case history
* Access relevant billing and transaction context

### Operations CRM

Authorized staff can:

* View the operations dashboard
* Manage and review customer records
* Access Customer 360-style customer information
* Review and manage service cases
* Search and filter the case directory
* View case history and related previous cases
* Update case status, priority, category, and assignment
* Review transaction and billing records
* Review staff accounts and roles
* Monitor operational analytics
* Access system/workspace information

The customer and operations experiences use separate authentication entry points and role-based access controls.

---

## Features

### Customer Management

* Customer directory
* Customer detail / Customer 360 view
* Account reference information
* Contact information
* Service/subscription information
* Customer case history
* Billing and transaction context
* Long account IDs handled with intentional truncation and copy functionality

### Service Request & Case Management

* Telecom service problem reporting
* Structured problem categories
* Case status tracking
* Priority levels
* Staff assignment
* Case references
* Customer-to-case relationships
* Related/follow-up case context
* Recently resolved case references
* Case detail views
* Search and filtering
* Operational triage workflows

### Transactions

* Transaction ledger
* Customer/account association
* Billing type categorization
* Transaction amounts
* Transaction descriptions
* Record dates
* Processed-by information
* Customer links for billing context

### Operations Analytics

The analytics dashboard uses database records rather than static placeholder metrics.

Current analytics include:

* Total Cases
* Open Cases
* In Progress Cases
* Resolved / Closed Cases
* High and Critical priority cases
* Cases by status
* Cases by category
* Priority distribution
* Queue ownership
* Data-driven visual charts and distributions
* Additional performance metrics where the underlying database contains sufficient information

Analytics are intentionally limited to metrics that can be supported by the application's available data.

### Staff Administration

* Read-only staff directory
* Staff roles
* Account information
* Administrative access separation
* Role-based access control

### Authentication

The application maintains separate entry points for subscribers and operations staff:

* `/signin` — Customer Portal authentication
* `/operations/login` — Operations Staff authentication

Role-based routing prevents customer accounts from entering the Operations CRM and prevents staff accounts from entering the customer portal through the wrong authentication flow.

Authenticated routes are also protected against direct cross-access.

---

## Tech Stack

* **Next.js 16** — Full-stack React framework
* **React 19** — UI library
* **TypeScript** — Type-safe development
* **Tailwind CSS v4** — Styling and responsive UI
* **Prisma 7** — ORM and database access
* **SQLite** — Current development database
* **Better SQLite3 / Prisma Driver Adapter** — Database connectivity
* **NextAuth** — Authentication and sessions
* **shadcn/ui** — Reusable UI components
* **Radix UI** — Accessible component primitives

---

## Project Structure

```text
app/
├── page.tsx                    # Public landing page
├── about/                      # Application information
├── signin/                     # Customer authentication
├── register/                   # Customer registration
├── portal/                     # Customer portal
│   └── requests/[id]/          # Customer case detail
│
├── operations/
│   └── login/                  # Operations staff authentication
│
├── dashboard/                  # Operations dashboard
├── customers/                  # Customer directory and details
│   └── [id]/
├── requests/                   # Operations case directory and details
│   └── [id]/
├── transactions/               # Transaction ledger
├── analytics/                  # Operations analytics
├── users/                      # Staff directory
├── profile/                    # Staff profile
├── settings/                   # System/workspace information
│
└── api/
    ├── auth/                   # NextAuth authentication
    ├── customers/              # Customer API
    ├── requests/               # Service request API
    ├── transactions/           # Transaction API
    ├── users/                  # User API
    └── register/               # Registration API

components/
├── admin-shell.tsx
├── customers-table.tsx
├── requests-table.tsx
├── transactions-table.tsx
├── customer-request-prototype.tsx
├── request-form.tsx
├── transaction-form.tsx
├── password-input.tsx
├── copy-reference.tsx
└── ui/                         # Shared UI primitives

prisma/
└── schema.prisma               # Database schema

prisma.config.ts                # Prisma configuration
```

---

## Data Model

The application uses Prisma to manage communication between the application and its database.

The current system models core operational entities including:

* Customers
* Users / Operations Staff
* Service Requests / Cases
* Transactions

Relationships between these entities allow the application to connect:

```text
Customer
   │
   ├── Service Cases
   │      ├── Status
   │      ├── Priority
   │      ├── Category
   │      └── Assigned Staff
   │
   └── Transactions
          ├── Billing Type
          ├── Amount
          └── Processed By
```

This shared data model allows customer-facing activity to become operational data for support staff and analytics.

---

## Authentication & Access Control

SuperDimm uses role-based access control to separate subscriber and operations experiences.

### Customer

Customer accounts are intended to access:

```text
/signin
/portal
/portal/requests/[id]
```

### Operations Staff

Staff accounts are intended to access:

```text
/operations/login
/dashboard
/customers
/requests
/transactions
/analytics
/users
/profile
/settings
```

The application validates the authenticated user's role when entering protected areas.

Examples:

* Unauthenticated users attempting to access `/portal` are redirected to customer sign-in.
* Unauthenticated users attempting to access `/dashboard` are redirected to operations login.
* Customer accounts attempting to access staff areas are redirected back to the customer experience.
* Staff accounts attempting to access customer-only areas are redirected to the Operations CRM.
* Staff credentials entered through customer authentication are rejected from the customer flow.
* Customer credentials entered through operations authentication are rejected from the operations flow.

This prevents the two application experiences from being treated as interchangeable simply because they share the same underlying application.

---

## Getting Started

Install the project dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The application will automatically reload as changes are made during development.

---

## Database Setup

The development environment currently uses SQLite with Prisma.

After configuring the required environment variables, synchronize the database schema with:

```bash
npx prisma db push
```

Prisma Studio can be used to inspect the development database:

```bash
npx prisma studio
```

---

## Development

Run TypeScript validation:

```bash
npx tsc --noEmit
```

Run linting:

```bash
npm run lint
```

Check the Git diff for whitespace errors:

```bash
git diff --check
```

Create a production build:

```bash
npm run build
```

---

## Environment Variables

The application requires environment configuration for authentication and database access.

Typical configuration includes:

```env
DATABASE_URL=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...
```

Do not commit secrets or production credentials to the repository.

---

## Production Considerations

SQLite is currently used as the development database.

For production deployment, the database layer can be migrated to a production-supported relational database such as PostgreSQL or MySQL, subject to Prisma adapter and deployment requirements.

Before production deployment, the following should be reviewed:

* Production database configuration
* Authentication secrets
* HTTPS configuration
* Session security
* Database backups
* Role and permission policies
* Error handling and logging
* Audit logging
* Case/SLA data requirements
* Production environment variables

---

## Current Product Direction

SuperDimm is being developed as a **dual-sided telecom customer-service and operations platform** rather than a generic administrative dashboard.

The intended workflow is:

```text
SUBSCRIBER
    │
    │ Reports service problem
    ▼
CUSTOMER PORTAL
    │
    │ Creates service case
    ▼
OPERATIONS CRM
    │
    ├── Triage
    ├── Categorization
    ├── Priority
    ├── Assignment
    ├── Investigation
    └── Resolution
    │
    ▼
CUSTOMER PORTAL
    │
    └── Case status / history
```

The Operations CRM provides the internal visibility required to turn customer-reported problems into actionable service workflows.

---

## Future Development

Potential future improvements include:

* Expanded telecom-specific problem categories
* More structured customer problem-reporting flows
* SLA tracking
* Average resolution-time analytics
* First-response metrics
* Historical case trends
* Audit logs
* Transaction exports
* Date-based analytics filtering
* More detailed customer communication workflows
* Production database migration
* Expanded administrative configuration

These features should be implemented only when the underlying data model and operational workflows can support them accurately.

---

## Learn More

Official documentation:

* Next.js — https://nextjs.org/docs
* TypeScript — https://www.typescriptlang.org/docs/
* Prisma — https://www.prisma.io/docs
* Tailwind CSS — https://tailwindcss.com/docs
* shadcn/ui — https://ui.shadcn.com/
