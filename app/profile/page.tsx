import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <main className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-4xl font-bold">👤 Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <p><strong>Name:</strong> Demo User</p>
          <p><strong>Email:</strong> demo@superdimm.com</p>
          <p><strong>Role:</strong> User</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Stack</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <p>⚡ Next.js</p>
          <p>🎨 Tailwind CSS</p>
          <p>🧩 Shadcn UI</p>
          <p>🗄️ Prisma ORM</p>
          <p>💾 SQLite Database</p>
        </CardContent>
      </Card>
    </main>
  );
}