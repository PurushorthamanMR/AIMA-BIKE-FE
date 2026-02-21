import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { Invoice } from '@/types'
import { MOCK_INVOICES, MOCK_CUSTOMERS } from '@/data/mockData'

const STORAGE_KEY = 'aima_pos_invoices'

interface InvoiceContextType {
  invoices: Invoice[]
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => Invoice
}

const InvoiceContext = createContext<InvoiceContextType | null>(null)

function loadInvoices(): Invoice[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Invoice[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // ignore
  }
  return MOCK_INVOICES
}

function saveInvoices(invoices: Invoice[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices))
}

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>(loadInvoices)

  const addInvoice = useCallback((data: Omit<Invoice, 'id' | 'invoiceNumber'>): Invoice => {
    const count = invoices.length + 1
    const invoiceNumber = `INV-2024-${String(count).padStart(3, '0')}`
    const id = `inv-${Date.now()}`
    const customer = MOCK_CUSTOMERS.find((c) => c.id === data.customerId) ?? data.customer

    const newInvoice: Invoice = {
      ...data,
      id,
      invoiceNumber,
      customer,
    }
    const updated = [newInvoice, ...invoices]
    setInvoices(updated)
    saveInvoices(updated)
    return newInvoice
  }, [invoices])

  return (
    <InvoiceContext.Provider value={{ invoices, addInvoice }}>
      {children}
    </InvoiceContext.Provider>
  )
}

export function useInvoices() {
  const context = useContext(InvoiceContext)
  if (!context) throw new Error('useInvoices must be used within InvoiceProvider')
  return context
}
