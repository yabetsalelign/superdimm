export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto p-8 space-y-4">
      <h1 className="text-4xl font-bold">About SuperDimm</h1>

      <p>
        SuperDimm is a simple finance dashboard built during my internship.
      </p>

      <ul className="list-disc ml-6 space-y-2">
        <li>Add transactions</li>
        <li>Store them in SQLite</li>
        <li>Manage data using Prisma ORM</li>
        <li>Built with Next.js App Router</li>
      </ul>
    </main>
  );
}