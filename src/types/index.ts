export type UserRole = 'admin' | 'manager' | 'staff'

export interface User {
  id: string
  username: string
  role: UserRole
  name?: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  bikeNumber?: string
  address?: string
}

export interface InvoiceItem {
  id: string
  productOrService: string
  quantity: number
  price: number
  total: number
}

export interface BikeImage {
  id: string
  url: string
  label?: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customer?: Customer
  items: InvoiceItem[]
  subtotal: number
  discount: number
  tax: number
  grandTotal: number
  paymentType: 'cash' | 'card' | 'bank' | 'credit'
  paidAmount?: number
  balance?: number
  dueDate?: string
  createdAt: string
  bikeImages?: BikeImage[]
}
