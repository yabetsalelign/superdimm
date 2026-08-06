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

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;

  return (
    <main className="max-w-5xl mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">SuperDimm Admin Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">

        <Card className="p-6">
          <h2 className="text-sm text-gray-500 mb-2">
            Active Users
          </h2>

          <p className="text-3xl font-bold text-green-600">
            124
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm text-gray-500 mb-2">
            Open Requests
          </h2>

          <p className="text-3xl font-bold text-red-600">
            18
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm text-gray-500 mb-2">
            Resolved Requests
          </h2>

          <p className="text-3xl font-bold">
            87
          </p>
        </Card>

      </div>

      <Card className="p-6">
        <div className="flex gap-4">

          <Input
            placeholder="Service Request"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1"
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

                <span
                  className={
                    tx.type === "income"
                      ? "text-green-600 font-medium"
                      : "text-red-600 font-medium"
                  }
                >
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