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

  // Fetch transactions
  useEffect(() => {
    async function loadTransactions() {
      try {
        const res = await fetch('/api/transactions');
        const data = await res.json();

        if (Array.isArray(data)) {
          setTransactions(data);
        } else {
          console.error('API returned:', data);
          setTransactions([]);
        }
      } catch (err) {
        console.error(err);
        setTransactions([]);
      }
    }

    loadTransactions();
  }, []);

  // Add transaction
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
        console.error(data);
        alert(data.error ?? 'Failed to add transaction');
        return;
      }

      setTransactions((prev) => [data, ...prev]);
      setAmount('');
      setDescription('');
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        💰 SuperDimm Dashboard
      </h1>

      <Card className="p-6 mb-8">
        <div className="flex gap-4">
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1"
          />

          <Input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-32"
          />

          <Button onClick={addTransaction}>
            Add
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          Recent Transactions
        </h2>

        {transactions.length === 0 ? (
          <p className="text-gray-500">
            No transactions yet. Add one above!
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
                    tx.type === 'income'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {tx.amount} birr
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </main>
  );
}