/**
 * Backend Schema / Database Models - AIMA POS
 * Reference for API & Database structure
 */

// ============ CUSTOMER (Customer Data Sheet) ============
export interface CustomerSchema {
  id: string
  // Personal
  nameInFull: string
  address: string
  province: string
  district: string
  occupation: string
  dateOfBirth: string
  religion: string
  contactNumber: string
  whatsAppNumber: string
  nicOrBusinessRegNo: string
  createdAt: string
}

// ============ BIKE MODEL ============
export interface BikeColorVariant {
  id: string
  color: string
  stock: number
  chassisNumber?: string
  motorNumber?: string
}

export interface BikeModelSchema {
  id: string
  name: string
  sku: string
  basePrice: number
  description: string
  imageUrl: string
  colorVariants: BikeColorVariant[]
}

// ============ TRANSACTION / ORDER ============
export interface OrderSchema {
  id: string
  orderNo: string
  customerId: string
  // Vehicle
  model: string
  chassisNumber: string
  motorNumber: string
  colourOfVehicle: string
  dateOfPurchase: string
  aimaCareLoyaltyCardNo?: string
  dateOfDeliveryToCustomer: string
  // Payment
  sellingPrice: number
  registrationFee: number
  advancePaymentAmount: number
  advancePaymentDate: string
  balancePaymentAmount: number
  balancePaymentDate: string
  paymentType: 'cash' | 'bank_draft' | 'cheque' | 'online' | 'credit_card'
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
  createdAt: string
}
