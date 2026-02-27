import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { getAllShopDetails } from '@/lib/shopDetailsApi'
import type { ShopDetailDto } from '@/lib/shopDetailsApi'

interface ShopDetailContextType {
  shopDetail: ShopDetailDto | null
  refreshShopDetail: () => void
}

const ShopDetailContext = createContext<ShopDetailContextType | null>(null)

export function ShopDetailProvider({ children }: { children: ReactNode }) {
  const [shopDetail, setShopDetail] = useState<ShopDetailDto | null>(null)

  const refreshShopDetail = useCallback(() => {
    getAllShopDetails()
      .then((list) => {
        const first = list && list.length > 0 ? list[0] : null
        setShopDetail(first)
      })
      .catch(() => setShopDetail(null))
  }, [])

  useEffect(() => {
    refreshShopDetail()
  }, [refreshShopDetail])

  return (
    <ShopDetailContext.Provider value={{ shopDetail, refreshShopDetail }}>
      {children}
    </ShopDetailContext.Provider>
  )
}

export function useShopDetail() {
  const ctx = useContext(ShopDetailContext)
  return ctx ?? { shopDetail: null, refreshShopDetail: () => {} }
}
