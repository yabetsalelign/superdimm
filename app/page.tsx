'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: string;
  createdAt: string;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    async function loadTransactions() {
      try {
        const res = await fetch('/api/transactions');
        const data = await res.json();

        if (Array.isArray(data)) {
          setTransactions(data);
        } else {
          setTransactions([]);
        }
      } catch {
        setTransactions([]);
      }
    }

    loadTransactions();
  }, []);

  const totalRequests = transactions.length;
  const openRequests = transactions.filter((t) => t.type === 'expense').length;
  const resolvedRequests = transactions.filter((t) => t.type === 'income').length;

  const addTransaction = async () => {
    if (!description.trim() || !amount) return;

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(amount),
          description: description.trim(),
          type: 'expense',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? 'Failed to add transaction');
        return;
      }

      setTransactions((prev) => [data, ...prev]);
      setAmount('');
      setDescription('');
    } catch {
      alert('Something went wrong.');
    }
  };

  return (
    <main className="max-w-5xl mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">SuperDimm Admin Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">

        <Card className="p-6">
          <h2 className="text-sm text-gray-500 mb-2">
            Total Requests
          </h2>

          <p className="text-3xl font-bold text-green-600">
            {totalRequests}
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm text-gray-500 mb-2">
            Open Requests
          </h2>

          <p className="text-3xl font-bold text-red-600">
            {openRequests}
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm text-gray-500 mb-2">
            Resolved Requests
          </h2>

          <p className="text-3xl font-bold">
            {resolvedRequests}
          </p>
        </Card>

      </div>

      <Card className="p-6">
        <div className="flex gap-4 flex-wrap">

          <Input
            placeholder="Service Request"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 min-w-[220px]"
          />

          <Input
            type="number"
            placeholder="Reference ID"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-32"
          />

          <Button onClick={addTransaction}>
            Create Request
          </Button>

        </div>
      </Card>

      <Card className="p-6">

        <h2 className="text-xl font-semibold mb-4">
          Recent Service Requests
        </h2>

        {transactions.length === 0 ? (
          <p className="text-gray-500">
            No service requests found.
          </p>
        ) : (
          <ul className="space-y-2">

            {transactions.map((tx, i) => (
              <li
                key={tx.id ?? `tx-${i}-${tx.createdAt ?? ""}`}
                className="flex justify-between border-b py-2"
              >
                <span>{tx.description}</span>

                <span className="text-muted-foreground font-medium">
                  #{tx.amount}
                </span>

              </li>
            ))}

          </ul>
        )}

      </Card>

    </main>
  );
}