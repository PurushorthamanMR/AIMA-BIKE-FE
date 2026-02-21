import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { Customer } from '@/types'
import { MOCK_CUSTOMERS } from '@/data/mockData'

const STORAGE_KEY = 'aima_pos_customers'

interface CustomerContextType {
  customers: Customer[]
  addCustomer: (customer: Omit<Customer, 'id'>) => Customer
}

const CustomerContext = createContext<CustomerContextType | null>(null)

function loadCustomers(): Customer[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Customer[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // ignore
  }
  return MOCK_CUSTOMERS
}

function saveCustomers(customers: Customer[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers))
}

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(loadCustomers)

  const addCustomer = useCallback((data: Omit<Customer, 'id'>): Customer => {
    const id = `c-${Date.now()}`
    const newCustomer: Customer = { ...data, id }
    setCustomers((prev) => {
      const next = [...prev, newCustomer]
      saveCustomers(next)
      return next
    })
    return newCustomer
  }, [])

  return (
    <CustomerContext.Provider value={{ customers, addCustomer }}>
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomers() {
  const ctx = useContext(CustomerContext)
  if (!ctx) throw new Error('useCustomers must be used within CustomerProvider')
  return ctx
}
