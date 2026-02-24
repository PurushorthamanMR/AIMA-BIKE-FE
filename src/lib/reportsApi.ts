/**
 * Reports API - fetches real sales data from Customer API
 * Each completed customer = 1 bike sale (sellingAmount, dateOfPurchase, model, payment)
 */

import { getCustomersByStatus, type CustomerDto } from './customerApi'

export interface ReportSaleRecord {
  id: number
  date: string
  amount: number
  customerName: string
  model: string
  paymentType: string
}

/** Fetch all completed customers (sales) - paginates through all pages */
export async function fetchAllCompletedCustomers(): Promise<CustomerDto[]> {
  const all: CustomerDto[] = []
  let page = 1
  const pageSize = 100
  let hasMore = true

  while (hasMore) {
    const res = await getCustomersByStatus('complete', page, pageSize, true)
    const content = res.content ?? []
    all.push(...content)
    hasMore = page < res.totalPages
    page += 1
  }

  return all
}

/** Transform customers to report sale records */
export function customersToSaleRecords(customers: CustomerDto[]): ReportSaleRecord[] {
  return customers.map((c) => ({
    id: c.id,
    date: c.dateOfPurchase ?? c.dateOfDelivery ?? '',
    amount: c.sellingAmount ?? 0,
    customerName: c.name ?? '',
    model: c.modelDto?.name ?? '-',
    paymentType: c.paymentDto?.name ?? '-',
  }))
}
