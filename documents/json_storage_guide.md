# Local JSON Storage Guide for Budgeting App

## Purpose
This guide explains how we use local JSON data as the core storage method in our mobile budgeting app. All app data (transactions, accounts, settings, etc.) is saved locally on the user's device—no backend or remote sync is used in v1.

## Storage Engine
- **Primary Option:** `AsyncStorage`
- **Alternative (faster):** `react-native-mmkv`
- Data is either stored under one composite object (e.g. `@app_data`) or under separate keys (`@accounts`, `@transactions`, etc.)

---

## JSON Schema Overview
The structure is composed of six logical collections:
- `settings`
- `accounts`
- `categories`
- `transactions`
- `budgets`
- `goals` *(future feature)*

---

## Schema Definitions

### 1. `settings`
```json
{
  "currency": "EUR",
  "theme": "system",
  "startOfMonth": 1
}
```

### 2. `accounts`
```json
[
  {
    "id": "wallet",
    "name": "Wallet",
    "type": "cash",
    "balance": 141.10,
    "archived": false,
    "sortOrder": 0
  }
]
```

### 3. `categories`
```json
[
  {
    "id": "groceries",
    "name": "Groceries",
    "type": "expense",
    "color": "#F44336",
    "archived": false,
    "sortOrder": 0
  }
]
```

### 4. `transactions`
```json
[
  {
    "id": "tx001",
    "type": "expense",
    "amount": 20.00,
    "accountId": "wallet",
    "toAccountId": null,
    "categoryId": "groceries",
    "date": "2025-05-07T10:00:00Z",
    "note": "Supermarket",
    "description": "",
    "imageUri": "",
    "createdAt": "2025-05-07T10:00:00Z",
    "updatedAt": "2025-05-07T10:00:00Z"
  }
]
```

### 5. `budgets`
```json
[
  {
    "id": "budget001",
    "categoryId": "groceries",
    "amount": 200.00,
    "month": "2025-05",
    "reset": "monthly"
  },
  {
    "id": "budget_global",
    "categoryId": "all",
    "amount": 1000.00,
    "month": "2025-05",
    "reset": "monthly"
  }
]
```

### 6. `goals`
```json
[
  {
    "id": "goal001",
    "name": "New Laptop",
    "targetAmount": 1000.00,
    "savedAmount": 450.00,
    "deadline": "2025-09-01",
    "notes": ""
  }
]
```

---

## Basic Data Access Logic (Pseudo-code)

```ts
const data = JSON.parse(await AsyncStorage.getItem('@app_data'))

// Add a new transaction
const newTx = { id: 'tx999', ... }
data.transactions.push(newTx)

// Save it back
await AsyncStorage.setItem('@app_data', JSON.stringify(data))
```

You may also separate each collection:
```ts
await AsyncStorage.setItem('@transactions', JSON.stringify([...]))
```

---

## Notes
- IDs should be unique strings (can use timestamp or `uuid` library)
- Always back up full JSON structure before major changes
- Validate the structure on app load to prevent corrupt data issues
