/**
 * AIMA Showroom - Bike Sales POS
 * AIMA Brand Showroom - Electric Bike/Scooter Sales
 * Reference: https://lk.aimatech.com/
 */

import type { Customer, Invoice, InvoiceItem } from '@/types'

export interface Product {
  id: string
  name: string
  category: 'bike' | 'parts' | 'service' | 'accessory'
  price: number
  stock: number
  sku?: string
  description?: string
  color?: string
}

// AIMA Showroom - Bikes (Primary Sales) - stock: -1 = unlimited (services)
export const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'AIMA Maverick', category: 'bike', price: 385000, stock: 5, sku: 'AIMA-MAV', description: 'Unleash the Power', color: 'Black/Red' },
  { id: '2', name: 'AIMA Mana', category: 'bike', price: 325000, stock: 4, sku: 'AIMA-MAN', description: 'Inspire Endless Possibilities', color: 'White/Blue' },
  { id: '3', name: 'AIMA Liberty', category: 'bike', price: 275000, stock: 6, sku: 'AIMA-LIB', description: 'Embrace Liberty', color: 'Grey' },
  { id: '4', name: 'AIMA Breezy', category: 'bike', price: 245000, stock: 8, sku: 'AIMA-BRZ', description: 'Easy & Breezy - 72V 26AH', color: 'Blue/White' },
  { id: '5', name: 'AIMA Aria', category: 'bike', price: 295000, stock: 3, sku: 'AIMA-ARIA', description: 'Journey in Elegant Style', color: 'Pearl White' },
  { id: '6', name: 'AIMA JoyBean', category: 'bike', price: 185000, stock: 10, sku: 'AIMA-JB', description: 'Easy and Secure', color: 'Red' },
  { id: '7', name: 'AIMA Graphene Battery 72V', category: 'parts', price: 65000, stock: 15, sku: 'BAT-72V' },
  { id: '8', name: 'AIMA Azure Controller', category: 'parts', price: 18500, stock: 20, sku: 'CTRL-AZ' },
  { id: '9', name: 'Brake Pad Set', category: 'parts', price: 2500, stock: 50, sku: 'BRK-001' },
  { id: '10', name: 'Tyre - Front', category: 'parts', price: 4500, stock: 30, sku: 'TYR-F' },
  { id: '11', name: 'Tyre - Rear', category: 'parts', price: 5200, stock: 30, sku: 'TYR-R' },
  { id: '12', name: 'Charger 72V', category: 'parts', price: 12500, stock: 25, sku: 'CHG-72' },
  { id: '13', name: 'Full Service', category: 'service', price: 3500, stock: -1, sku: 'SRV-FULL' },
  { id: '14', name: 'Battery Replacement', category: 'service', price: 2500, stock: -1, sku: 'SRV-BAT' },
  { id: '15', name: 'Brake Service', category: 'service', price: 1500, stock: -1, sku: 'SRV-BRK' },
  { id: '16', name: 'Tyre Change', category: 'service', price: 800, stock: -1, sku: 'SRV-TYR' },
  { id: '17', name: 'Helmet', category: 'accessory', price: 4500, stock: 40, sku: 'ACC-HLM' },
  { id: '18', name: 'Rain Cover', category: 'accessory', price: 2500, stock: 35, sku: 'ACC-RC' },
  { id: '19', name: 'Phone Mount', category: 'accessory', price: 1200, stock: 60, sku: 'ACC-PM' },
  { id: '20', name: 'Bike Cover', category: 'accessory', price: 3500, stock: 25, sku: 'ACC-BC' },
]

// Showroom Customers - Bike Buyers
export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Kumar Perera', phone: '0771234567', bikeNumber: 'AIMA-BRZ-4521', address: 'Colombo 03' },
  { id: 'c2', name: 'Nimal Silva', phone: '0712345678', bikeNumber: 'AIMA-MAV-1203', address: 'Kandy' },
  { id: 'c3', name: 'Sunil Fernando', phone: '0723456789', bikeNumber: 'AIMA-LIB-7890', address: 'Galle' },
  { id: 'c4', name: 'Chamari Jayawardena', phone: '0764567890', bikeNumber: 'AIMA-ARIA-3345', address: 'Negombo' },
  { id: 'c5', name: 'Dilshan Rajapaksa', phone: '0785678901', bikeNumber: 'AIMA-JB-1122', address: 'Matara' },
  { id: 'c6', name: 'Anura Wickramasinghe', phone: '0756789012', address: 'Jaffna' },
  { id: 'c7', name: 'Sampath Gunasekara', phone: '0777890123', bikeNumber: 'AIMA-MAN-5566', address: 'Gampaha' },
  { id: 'c8', name: 'Priya Nandasena', phone: '0767890123', address: 'Colombo 07' },
]

// Showroom Invoices - Bike Sales Focused
const createInvoiceItems = (items: { productId: string; productName: string; qty: number; price: number }[]): InvoiceItem[] =>
  items.map((item, i) => ({
    id: `item-${i + 1}`,
    productOrService: item.productName,
    quantity: item.qty,
    price: item.price,
    total: item.qty * item.price,
  }))

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-2024-001',
    customerId: 'c4',
    customer: MOCK_CUSTOMERS[3],
    items: createInvoiceItems([
      { productId: '4', productName: 'AIMA Breezy', qty: 1, price: 245000 },
      { productId: '17', productName: 'Helmet', qty: 1, price: 4500 },
      { productId: '18', productName: 'Rain Cover', qty: 1, price: 2500 },
    ]),
    subtotal: 252000,
    discount: 5000,
    tax: 24700,
    grandTotal: 271700,
    paymentType: 'credit',
    paidAmount: 150000,
    balance: 121700,
    dueDate: '2024-03-15',
    createdAt: new Date().toISOString().split('T')[0],
    bikeImages: [
      { id: 'img1', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200', label: 'Front' },
      { id: 'img2', url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=200', label: 'Side' },
    ],
  },
  {
    id: 'inv2',
    invoiceNumber: 'INV-2024-002',
    customerId: 'c2',
    customer: MOCK_CUSTOMERS[1],
    items: createInvoiceItems([
      { productId: '1', productName: 'AIMA Maverick', qty: 1, price: 385000 },
      { productId: '17', productName: 'Helmet', qty: 1, price: 4500 },
    ]),
    subtotal: 389500,
    discount: 5000,
    tax: 38450,
    grandTotal: 422950,
    paymentType: 'card',
    paidAmount: 422950,
    createdAt: new Date().toISOString().split('T')[0],
    bikeImages: [
      { id: 'img3', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200', label: 'Front' },
      { id: 'img4', url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=200', label: 'Engine' },
    ],
  },
  {
    id: 'inv3',
    invoiceNumber: 'INV-2024-003',
    customerId: 'c5',
    customer: MOCK_CUSTOMERS[4],
    items: createInvoiceItems([
      { productId: '6', productName: 'AIMA JoyBean', qty: 1, price: 185000 },
      { productId: '17', productName: 'Helmet', qty: 1, price: 4500 },
    ]),
    subtotal: 189500,
    discount: 2000,
    tax: 18750,
    grandTotal: 206250,
    paymentType: 'cash',
    paidAmount: 206250,
    createdAt: new Date().toISOString().split('T')[0],
    bikeImages: [
      { id: 'img5', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200', label: 'Full View' },
    ],
  },
  {
    id: 'inv4',
    invoiceNumber: 'INV-2024-004',
    customerId: 'c1',
    customer: MOCK_CUSTOMERS[0],
    items: createInvoiceItems([
      { productId: '14', productName: 'Battery Replacement', qty: 1, price: 2500 },
      { productId: '9', productName: 'Brake Pad Set', qty: 1, price: 2500 },
    ]),
    subtotal: 5000,
    discount: 250,
    tax: 475,
    grandTotal: 5225,
    paymentType: 'cash',
    paidAmount: 5225,
    createdAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'inv5',
    invoiceNumber: 'INV-2024-005',
    customerId: 'c8',
    customer: MOCK_CUSTOMERS[7],
    items: createInvoiceItems([
      { productId: '5', productName: 'AIMA Aria', qty: 1, price: 295000 },
      { productId: '17', productName: 'Helmet', qty: 1, price: 4500 },
      { productId: '20', productName: 'Bike Cover', qty: 1, price: 3500 },
    ]),
    subtotal: 303000,
    discount: 3000,
    tax: 30000,
    grandTotal: 330000,
    paymentType: 'bank',
    paidAmount: 330000,
    createdAt: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    bikeImages: [
      { id: 'img6', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200', label: 'Front' },
      { id: 'img7', url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=200', label: 'Side' },
    ],
  },
]

export const getBikeSalesWithImages = (invoices: typeof MOCK_INVOICES = MOCK_INVOICES) =>
  invoices.filter((inv) => {
    const hasBike = inv.items.some((i) =>
      ['AIMA Maverick', 'AIMA Mana', 'AIMA Liberty', 'AIMA Breezy', 'AIMA Aria', 'AIMA JoyBean'].includes(i.productOrService)
    )
    return hasBike && (inv.bikeImages?.length ?? 0) > 0
  })

// Showroom Dashboard Stats
export const getDashboardStats = (invoices: typeof MOCK_INVOICES = MOCK_INVOICES) => {
  const today = new Date().toISOString().split('T')[0]
  const todayInvoices = invoices.filter((inv) => inv.createdAt === today)
  const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0)
  const creditPending = invoices.filter((inv) => inv.balance && inv.balance > 0).reduce((sum, inv) => sum + (inv.balance ?? 0), 0)

  return {
    todaySales,
    creditPending,
    totalCustomers: MOCK_CUSTOMERS.length,
    recentInvoicesCount: invoices.length,
    recentInvoices: [...invoices].reverse().slice(0, 5),
  }
}
