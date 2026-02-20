# Aimatech POS - Frontend

Bike/Electronics Shop POS & Service Management System - React Frontend

## Tech Stack

- **React 18** + **Vite** - Build tool
- **TypeScript** - Type safety
- **ShadCN UI** - Component library (Button, Input, Card, etc.)
- **Bootstrap 5** - Layout, grid, utilities
- **Tailwind CSS** - ShadCN component styling
- **React Router** - Navigation
- **Lucide React** - Icons

## Folder Structure

```
AIMA-BIKE-FE/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable components
│   │   ├── layout/         # Layout components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   └── ui/             # ShadCN UI components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       └── card.tsx
│   ├── context/            # React Context
│   │   └── AuthContext.tsx
│   ├── hooks/              # Custom hooks
│   │   └── useAuth.ts
│   ├── lib/                # Utilities
│   │   └── utils.ts
│   ├── pages/              # Page components (based on requirements)
│   │   ├── Login.tsx       # Login Screen
│   │   ├── Dashboard.tsx   # Today Sales, Credit Pending, Customers, Recent Invoices
│   │   ├── NewInvoice.tsx  # Main POS - Invoice Creation
│   │   ├── InvoiceHistory.tsx
│   │   ├── InvoiceView.tsx # Full invoice details, Bike images, Reprint
│   │   ├── Customers.tsx   # Customer Management
│   │   ├── CreditManagement.tsx
│   │   ├── Reports.tsx     # Reports & Analytics
│   │   └── Settings.tsx    # Admin - System Settings
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── components.json         # ShadCN config
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Features (from Requirements)

- **Login** - Username/Password, Role-based (Admin/Manager/Staff)
- **Dashboard** - Today Sales, Credit Pending, Total Customers, Recent Invoices, Quick Search
- **Sidebar** - Role-based menu (Dashboard, New Invoice, Customers, Credit, Reports, Settings)
- **New Invoice** - Customer search, Add products/services, Payment (Cash/Card/Bank/Credit)
- **Invoice History** - Search, QR support
- **Invoice View** - Customer details, Items, Bike images, Reprint/Download
- **Credit Management** - Pending list, Overdue filter
- **Reports** - Daily/Monthly sales, Item-wise, Staff-wise, Profit
- **Settings** - Admin only

## Mock Login Credentials (Development)

| Role   | Email                      | Password   |
|--------|----------------------------|------------|
| Admin  | admin@aimashowroom.com    | admin123   |
| Manager| manager@aimashowroom.com  | manager123 |
| Staff  | staff@aimashowroom.com     | staff123   |

- **Admin:** Full access - Dashboard, Invoice, Customers, Credit, Reports, Settings
- **Manager:** Dashboard, Invoice, Customers, Credit, Reports (no Settings)
- **Staff:** Dashboard, New Invoice, Invoice History only

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
