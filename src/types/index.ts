export type UserRole = 'admin' | 'manager' | 'staff'

export interface User {
  id: string
  username: string
  role: UserRole
  name?: string
}

export interface CashData {
  copyOfNic?: string
  photographOne?: string
  photographTwo?: string
  paymentReceipt?: string
  mta2?: string
  slip?: string
  chequeNumber?: string
}

export interface LeaseData {
  companyName?: string
  purchaseOrderNumber?: string
  copyOfNic?: string
  photographOne?: string
  photographTwo?: string
  paymentReceipt?: string
  mta2?: string
  mta3?: string
  chequeNumber?: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  bikeNumber?: string
  address?: string
  // Customer Data Sheet fields
  nameInFull?: string
  province?: string
  district?: string
  occupation?: string
  dateOfBirth?: string
  religion?: string
  whatsAppNumber?: string
  nicOrBusinessRegNo?: string
  createdAt?: string
  // Vehicle & payment
  model?: string
  chassisNumber?: string
  motorNumber?: string
  colourOfVehicle?: string
  dateOfPurchase?: string
  aimaCareLoyaltyCardNo?: string
  dateOfDeliveryToCustomer?: string
  sellingPrice?: number
  registrationFee?: number
  advancePaymentAmount?: number
  advancePaymentDate?: string
  balancePaymentAmount?: number
  balancePaymentDate?: string
  paymentType?: string
  // Delivery
  documentSentDate?: string
  receivedDate?: string
  courierDetails?: string
  receiverName?: string
  receiverIcNumber?: string
  transfer?: string
  deliveryAddress?: string
  orderedBy?: string
  handedBy?: string
  deliveryDetail?: string
  // Cash or Lease
  paymentOption?: 'cash' | 'lease'
  cashData?: CashData
  leaseData?: LeaseData
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

export type PaymentType = 'cash' | 'bank_draft' | 'cheque' | 'online' | 'credit_card' | 'card' | 'bank' | 'credit'

export interface BikeOrderDetails {
  model: string
  colourOfVehicle: string
  chassisNumber?: string
  motorNumber?: string
  dateOfPurchase: string
  dateOfDeliveryToCustomer?: string
  aimaCareLoyaltyCardNo?: string
  documentSentDate?: string
  receivedDate?: string
  courierDetails?: string
  receiverName?: string
  receiverIcNumber?: string
  transfer?: string
  deliveryAddress?: string
  orderedBy?: string
  handedBy?: string
  deliveryDetail?: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  orderNo?: string
  customerId: string
  customer?: Customer
  items: InvoiceItem[]
  subtotal: number
  discount: number
  tax: number
  grandTotal: number
  paymentType: PaymentType
  paidAmount?: number
  balance?: number
  dueDate?: string
  createdAt: string
  bikeImages?: BikeImage[]
  bikeOrderDetails?: BikeOrderDetails
  sellingPrice?: number
  registrationFee?: number
  advancePaymentAmount?: number
  advancePaymentDate?: string
  balancePaymentAmount?: number
  balancePaymentDate?: string
}
