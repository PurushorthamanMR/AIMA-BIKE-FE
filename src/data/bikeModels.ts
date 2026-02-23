/**
 * AIMA Bike Models - https://lk.aimatech.com/
 * Maverick, Mana, Liberty, Breezy, Aria, JoyBean
 */

export interface BikeColorVariant {
  id: string
  color: string
  stock: number
  price: number
}

export interface BikeModel {
  id: string
  name: string
  sku: string
  description: string
  imageUrl: string
  colors: BikeColorVariant[]
}

export const AIMA_BIKE_MODELS: BikeModel[] = [
  {
    id: 'maverick',
    name: 'AIMA Maverick',
    sku: 'AIMA-MAV',
    description: 'Unleash the Power',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    colors: [
      { id: 'mav-black', color: 'Black/Red', stock: 2, price: 385000 },
      { id: 'mav-white', color: 'White', stock: 1, price: 385000 },
      { id: 'mav-blue', color: 'Blue', stock: 2, price: 390000 },
    ],
  },
  {
    id: 'mana',
    name: 'AIMA Mana',
    sku: 'AIMA-MAN',
    description: 'Inspire Endless Possibilities',
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400',
    colors: [
      { id: 'mana-wb', color: 'White/Blue', stock: 2, price: 325000 },
      { id: 'mana-grey', color: 'Grey', stock: 2, price: 328000 },
    ],
  },
  {
    id: 'liberty',
    name: 'AIMA Liberty',
    sku: 'AIMA-LIB',
    description: 'Embrace Liberty',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    colors: [
      { id: 'lib-grey', color: 'Grey', stock: 3, price: 275000 },
      { id: 'lib-black', color: 'Black', stock: 3, price: 278000 },
    ],
  },
  {
    id: 'breezy',
    name: 'AIMA Breezy',
    sku: 'AIMA-BRZ',
    description: 'Easy & Breezy - 72V 26AH',
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400',
    colors: [
      { id: 'brz-bw', color: 'Blue/White', stock: 4, price: 245000 },
      { id: 'brz-red', color: 'Red', stock: 4, price: 248000 },
    ],
  },
  {
    id: 'aria',
    name: 'AIMA Aria',
    sku: 'AIMA-ARIA',
    description: 'Journey in Elegant Style',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    colors: [
      { id: 'aria-pearl', color: 'Pearl White', stock: 2, price: 295000 },
      { id: 'aria-silver', color: 'Silver', stock: 1, price: 298000 },
    ],
  },
  {
    id: 'joybean',
    name: 'AIMA JoyBean',
    sku: 'AIMA-JB',
    description: 'Easy and Secure',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    colors: [
      { id: 'jb-red', color: 'Red', stock: 5, price: 185000 },
      { id: 'jb-blue', color: 'Blue', stock: 5, price: 188000 },
    ],
  },
]
