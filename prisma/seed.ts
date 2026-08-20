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
        plan: "Managed Enterprise Fiber (100M)",
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
        plan: "Business Broadband & 4G Failover",
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
        plan: "Dedicated SIP Trunk & Mobile Fleet",
        status: "pending",
        userId: support.id,
      },
    }),
  ]);

  const customerA = customers[0];
  const customerB = customers[1];
  const customerC = customers[2];

  // Clean up and seed service requests
  await prisma.serviceRequest.deleteMany();
  await prisma.serviceRequest.createMany({
    data: [
      {
        customerId: customerA.id,
        title: "Network latency investigation",
        description: "Branch gateway drops fiber sync intermittently. Latency spikes on edge routing links during peak transit hours.",
        category: "network",
        status: "in_progress",
        priority: "high",
        assignedUserId: support.id,
        createdByUserId: manager.id,
      },
      {
        customerId: customerA.id,
        title: "Billing report cleanup",
        description: "Reconcile overage charges on the July managed network statement.",
        category: "billing",
        status: "resolved",
        priority: "low",
        assignedUserId: admin.id,
        createdByUserId: admin.id,
      },
      {
        customerId: customerA.id,
        title: "DNS recursive server query timeout",
        description: "Internal nameservers failing resolving external SIP domains.",
        category: "network",
        status: "closed",
        priority: "medium",
        assignedUserId: support.id,
        createdByUserId: regularUser.id,
      },
      {
        customerId: customerB.id,
        title: "Access control and SIM provisioning review",
        description: "Review permissions, APN settings, and eSIM profiles for 12 incoming warehouse terminals.",
        category: "sim",
        status: "open",
        priority: "critical",
        assignedUserId: manager.id,
        createdByUserId: admin.id,
      },
      {
        customerId: customerB.id,
        title: "Speed tier upgrade inquiry",
        description: "Customer requested pricing and provisioning schedule for upgrading to 200Mbps dedicated link.",
        category: "plan",
        status: "in_progress",
        priority: "medium",
        assignedUserId: support.id,
        createdByUserId: manager.id,
      },
      {
        customerId: customerC.id,
        title: "Initial SIP trunk provisioning",
        description: "Configure trunk gateway and assign DID number ranges for branch deployment.",
        category: "provisioning",
        status: "open",
        priority: "high",
        assignedUserId: null,
        createdByUserId: admin.id,
      },
    ],
  });

  // Clean up and seed transactions
  await prisma.transaction.deleteMany();
  await prisma.transaction.createMany({
    data: [
      {
        userId: admin.id,
        customerId: customerA.id,
        description: "Monthly Managed Fiber Package",
        type: "subscription",
        amount: 1250,
      },
      {
        userId: regularUser.id,
        customerId: customerA.id,
        description: "Enterprise SLA Support Retainer",
        type: "payment",
        amount: 680,
      },
      {
        userId: manager.id,
        customerId: customerB.id,
        description: "New Client Onboarding & Hardware Setup",
        type: "hardware",
        amount: 4200,
      },
      {
        userId: support.id,
        customerId: customerB.id,
        description: "Monthly Broadband & 4G Backup",
        type: "subscription",
        amount: 1500,
      },
      {
        userId: admin.id,
        customerId: customerB.id,
        description: "Billing Credit Adjustment - SLA Waiver",
        type: "adjustment",
        amount: -450,
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
