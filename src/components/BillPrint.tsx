import { useRef } from 'react'
import { formatCurrency } from '@/lib/utils'
import type { Invoice } from '@/types'

interface BillPrintProps {
  invoice: Invoice
}

export default function BillPrint({ invoice }: BillPrintProps) {
  const printRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={printRef} className="bill-print-content" style={{ width: '80mm', margin: '0 auto', fontFamily: 'monospace', fontSize: '12px' }}>
      <div ref={printRef} className="p-2">
        <div className="text-center border-bottom pb-2 mb-2">
          <h5 className="mb-0">AIMA Showroom</h5>
          <small>Bike Sales</small>
        </div>
        <div className="mb-2">
          <strong>Invoice:</strong> {invoice.invoiceNumber}<br />
          <strong>Date:</strong> {invoice.createdAt}
        </div>
        <div className="border-bottom pb-2 mb-2">
          <strong>Customer:</strong><br />
          {invoice.customer?.name}<br />
          {invoice.customer?.phone}
        </div>
        <table className="w-100 mb-2" style={{ fontSize: '11px' }}>
          <thead>
            <tr>
              <th className="text-start">Item</th>
              <th className="text-center">Qty</th>
              <th className="text-end">Price</th>
              <th className="text-end">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td>{item.productOrService}</td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-end">{formatCurrency(item.price)}</td>
                <td className="text-end">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-top pt-2">
          <div className="d-flex justify-content-between">
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Discount</span>
            <span>{formatCurrency(invoice.discount)}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Tax</span>
            <span>{formatCurrency(invoice.tax)}</span>
          </div>
          <div className="d-flex justify-content-between fw-bold mt-1">
            <span>Grand Total</span>
            <span>{formatCurrency(invoice.grandTotal)}</span>
          </div>
          <div className="mt-2">
            <span>Payment: </span>
            <span className="text-capitalize">{invoice.paymentType}</span>
            {invoice.balance ? (
              <div>
                <span>Balance: {formatCurrency(invoice.balance)}</span><br />
                <span>Due: {invoice.dueDate}</span>
              </div>
            ) : null}
          </div>
        </div>
        <div className="text-center mt-3 pt-2 border-top">
          <small>Thank you!</small>
        </div>
      </div>
    </div>
  )
}
