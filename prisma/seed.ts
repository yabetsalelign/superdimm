import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await hash("admin123", 10);
  const managerPassword = await hash("manager123", 10);
  const supportPassword = await hash("support123", 10);
  const userPassword = await hash("user123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@superdimm.local" },
    update: {},
    create: {
      email: "admin@superdimm.local",
      name: "Admin User",
      role: "admin",
      hashedPassword: adminPassword,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@superdimm.local" },
    update: {},
    create: {
      email: "manager@superdimm.local",
      name: "Manager User",
      role: "manager",
      hashedPassword: managerPassword,
    },
  });

  const support = await prisma.user.upsert({
    where: { email: "support@superdimm.local" },
    update: {},
    create: {
      email: "support@superdimm.local",
      name: "Support User",
      role: "support",
      hashedPassword: supportPassword,
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: "user@superdimm.local" },
    update: {},
    create: {
      email: "user@superdimm.local",
      name: "Regular User",
      role: "user",
      hashedPassword: userPassword,
    },
  });

  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { id: "cust-acme" },
      update: {},
      create: {
        id: "cust-acme",
        name: "Acme Logistics",
        email: "ops@acme.logistics",
        phone: "+1 555 0101",
        status: "active",
        userId: admin.id,
      },
    }),
    prisma.customer.upsert({
      where: { id: "cust-nova" },
      update: {},
      create: {
        id: "cust-nova",
        name: "Nova Retail",
        email: "support@novaretail.io",
        phone: "+1 555 0102",
        status: "active",
        userId: manager.id,
      },
    }),
    prisma.customer.upsert({
      where: { id: "cust-helio" },
      update: {},
      create: {
        id: "cust-helio",
        name: "Helio Telecom",
        email: "admin@heliotelco.com",
        phone: "+1 555 0103",
        status: "pending",
        userId: support.id,
      },
    }),
  ]);

  const customerA = customers[0];
  const customerB = customers[1];

  await prisma.serviceRequest.createMany({
    data: [
      {
        customerId: customerA.id,
        title: "Network latency investigation",
        description: "Customer reports reduced latency on edge links.",
        status: "open",
        priority: "high",
        assignedUserId: support.id,
        createdByUserId: manager.id,
      },
      {
        customerId: customerB.id,
        title: "Access control review",
        description: "Review permissions and security changes for customer staff.",
        status: "in_progress",
        priority: "medium",
        assignedUserId: manager.id,
        createdByUserId: admin.id,
      },
      {
        customerId: customerA.id,
        title: "Billing report cleanup",
        description: "Prepare a reconcile report for the last billing cycle.",
        status: "closed",
        priority: "low",
        assignedUserId: admin.id,
        createdByUserId: admin.id,
      },
    ],
  });

  await prisma.transaction.createMany({
    data: [
      {
        userId: admin.id,
        customerId: customerA.id,
        description: "Monthly network package",
        type: "expense",
        amount: 1250,
      },
      {
        userId: manager.id,
        customerId: customerB.id,
        description: "New client onboarding",
        type: "income",
        amount: 4200,
      },
      {
        userId: regularUser.id,
        customerId: customerA.id,
        description: "Support invoice",
        type: "expense",
        amount: 680,
      },
      {
        userId: support.id,
        customerId: customerB.id,
        description: "Maintenance retainer",
        type: "income",
        amount: 1500,
      },
    ],
  });

  console.log("Seeded admin, manager, support, and demo users.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
