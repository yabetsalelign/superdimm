# Ethio Telecom Admin Dashboard

An internal administration dashboard built with **Next.js** that helps telecom operators monitor customers, service activity, and operational data in one place.

## Features

* 📊 Dashboard overview with real-time system metrics
* 👥 Customer management
* 📋 Service request tracking
* 💳 Payment and transaction monitoring
* 👤 Admin profile management
* 📈 Operational insights through dashboard statistics

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

The application will automatically update as you edit files.

## Tech Stack

* **Next.js** - React framework for full-stack web applications
* **TypeScript** - Type-safe JavaScript development
* **Tailwind CSS** - Utility-first styling
* **Prisma ORM** - Database management
* **SQLite** - Local development database
* **shadcn/ui** - Reusable UI components

## Project Structure

```
app/
 ├── page.tsx        # Dashboard overview
 ├── profile/        # Admin profile page
 ├── about/          # Application information
components/          # Reusable UI components
prisma/              # Database schema and migrations
```

## Database

The system uses Prisma to manage application data.

Main entities include:

* Customers
* Service Requests
* Transactions
* Admin Users

Dashboard statistics are generated from stored database records rather than static placeholder data.

## Development

To check the application:

```bash
npm run lint
```

To build the application:

```bash
npm run build
```

## Learn More

To learn more about the technologies used:

* [Next.js Documentation](https://nextjs.org/docs)
* [TypeScript Documentation](https://www.typescriptlang.org/docs/)
* [Prisma Documentation](https://www.prisma.io/docs)
* [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deployment

This application can be deployed using platforms that support Next.js applications, such as Vercel.

For more information, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
