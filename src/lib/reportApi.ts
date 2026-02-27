/**
 * Report API - fetches aggregated sales report from backend (daily / monthly / yearly)
 */

import { apiGet } from './api'

export type ReportPeriod = 'daily' | 'monthly' | 'yearly'

export interface ReportSummary {
  totalSales: number
  totalCount: number
  avgPerSale: number
}

export interface ReportChartPoint {
  label: string
  sales: number
  count: number
}

export interface ReportPaymentPoint {
  name: string
  value: number
}

export interface ReportItemWise {
  name: string
  qty: number
  total: number
}

export interface ReportCustomerRow {
  name: string
  count: number
  total: number
}

export interface ReportSalesResponse {
  summary: ReportSummary
  chartData: ReportChartPoint[]
  paymentData: ReportPaymentPoint[]
  itemWiseList: ReportItemWise[]
  customerData: ReportCustomerRow[]
}

/** Get sales report by period (daily = last 30 days, monthly = last 12 months, yearly = all) */
export async function getReportSales(period: ReportPeriod): Promise<ReportSalesResponse | null> {
  const res = await apiGet<ReportSalesResponse>(`/report/sales?period=${period}`)
  if (res.status && res.responseDto) return res.responseDto
  return null
}
