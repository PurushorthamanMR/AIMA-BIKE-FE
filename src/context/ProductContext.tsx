import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { Product } from '@/data/mockData'
import { MOCK_PRODUCTS } from '@/data/mockData'

const STORAGE_KEY = 'aima_pos_products'

interface ProductContextType {
  products: Product[]
  addProduct: (product: Omit<Product, 'id'>) => Product
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  deductStock: (productId: string, qty: number) => void
  addStock: (productId: string, qty: number) => void
}

const ProductContext = createContext<ProductContextType | null>(null)

function loadProducts(): Product[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Product[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // ignore
  }
  return MOCK_PRODUCTS
}

function saveProducts(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
}

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(loadProducts)

  const addProduct = useCallback((data: Omit<Product, 'id'>): Product => {
    const id = `p-${Date.now()}`
    const newProduct: Product = { ...data, id }
    const updated = [...products, newProduct]
    setProducts(updated)
    saveProducts(updated)
    return newProduct
  }, [products])

  const updateProduct = useCallback((id: string, data: Partial<Product>) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...data } : p))
      saveProducts(updated)
      return updated
    })
  }, [])

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id)
      saveProducts(updated)
      return updated
    })
  }, [])

  const deductStock = useCallback((productId: string, qty: number) => {
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== productId || p.stock < 0) return p
        return { ...p, stock: Math.max(0, p.stock - qty) }
      })
      saveProducts(updated)
      return updated
    })
  }, [])

  const addStock = useCallback((productId: string, qty: number) => {
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== productId || p.stock < 0) return p
        return { ...p, stock: p.stock + qty }
      })
      saveProducts(updated)
      return updated
    })
  }, [])

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, deductStock, addStock }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (!context) throw new Error('useProducts must be used within ProductProvider')
  return context
}
