import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { CustomerProvider } from '@/context/CustomerContext'
import { InvoiceProvider } from '@/context/InvoiceContext'
import { ProductProvider } from '@/context/ProductContext'
import { ShopDetailProvider } from '@/context/ShopDetailContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ShopDetailProvider>
          <ProductProvider>
            <CustomerProvider>
              <InvoiceProvider>
                <App />
              </InvoiceProvider>
            </CustomerProvider>
          </ProductProvider>
        </ShopDetailProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
