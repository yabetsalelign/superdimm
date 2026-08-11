# Ethio Telecom Admin Dashboard

An internal administration dashboard built with **Next.js** that helps telecom operators monitor customers, service activity, transactions, and operational data through a centralized web application.

## Features

* 📊 Dashboard overview with dynamic system metrics
* 👥 Customer management
* 📋 Service request tracking
* 💳 Transaction and payment monitoring
* 👤 Admin profile management
* 📈 Operational insights generated from database records

## Getting Started

First, install the project dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 with your browser to view the application.

The application automatically updates as changes are made during development.

## Tech Stack

* **Next.js** - React framework for building full-stack web applications
* **TypeScript** - Type-safe JavaScript development
* **Tailwind CSS** - Utility-first CSS framework
* **Prisma ORM** - Database management and queries
* **SQLite** - Development database (can be replaced with a production database)
* **shadcn/ui** - Reusable UI components

## Project Structure

```
app/
 ├── page.tsx          # Dashboard overview
 ├── profile/          # Admin profile page
 ├── about/            # Application information
components/            # Reusable UI components
prisma/                # Database schema and migrations
```

## Database

The application uses **Prisma ORM** to manage communication between the application and the database.

The system manages:

* Customers
* Service Requests
* Transactions
* Admin Users

Dashboard statistics are generated from stored database records rather than static placeholder values, allowing the interface to reflect real system activity.

## Development

Run lint checks:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

## Deployment

This application is designed to be deployed as a full-stack web application and accessed through a browser.

For production deployment:

* The Next.js application can be hosted on platforms such as Vercel.
* The database can be migrated to a production database provider such as PostgreSQL or MySQL.
* Required environment variables should be configured before deployment.

## Learn More

Learn more about the technologies used:

* [Next.js Documentation](https://nextjs.org/docs)
* [TypeScript Documentation](https://www.typescriptlang.org/docs/)
* [Prisma Documentation](https://www.prisma.io/docs)
* [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deployment Resources

For more information about deploying Next.js applications, see the official [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
