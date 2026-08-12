#!/usr/bin/env python3
import sqlite3
import sys
from pathlib import Path

# Find dev.db by searching parent folders and common locations
DB = None
for p in Path(__file__).resolve().parents:
    candidate = p / 'prisma' / 'dev.db'
    if candidate.exists():
        DB = candidate
        break
# fallback: look for dev.db directly in parent folders
if DB is None:
    for p in Path(__file__).resolve().parents:
        candidate = p / 'dev.db'
        if candidate.exists():
            DB = candidate
            break
if DB is None:
    print('Dev DB not found in expected locations')
    sys.exit(2)

conn = sqlite3.connect(str(DB))
cur = conn.cursor()

name_to_find = 'Yabets Alelign'
# Try exact match first
cur.execute('SELECT id,email,name,role FROM User WHERE name = ?', (name_to_find,))
rows = cur.fetchall()
if len(rows) == 0:
    # try case-insensitive or partial match
    cur.execute('SELECT id,email,name,role FROM User WHERE lower(name) LIKE ?', (f'%{name_to_find.lower()}%',))
    rows = cur.fetchall()

if len(rows) == 0:
    print('No user found matching name:', name_to_find)
    conn.close()
    sys.exit(3)

if len(rows) > 1:
    print('Multiple users found matching name:', name_to_find)
    for r in rows:
        print(r)
    conn.close()
    sys.exit(4)

user = rows[0]
uid, email, name, role = user
print('Found user:')
print(' id=', uid)
print(' email=', email)
print(' name=', name)
print(' role(before)=', role)

if role == 'admin':
    print('User already has role=admin; no changes made.')
    conn.close()
    sys.exit(0)

# Update role to admin
cur.execute('UPDATE User SET role = ? WHERE id = ?', ('admin', uid))
conn.commit()

cur.execute('SELECT id,email,name,role FROM User WHERE id = ?', (uid,))
updated = cur.fetchone()
print('Updated user:')
print(' id=', updated[0])
print(' email=', updated[1])
print(' name=', updated[2])
print(' role(after)=', updated[3])

conn.close()
print('Done.')
