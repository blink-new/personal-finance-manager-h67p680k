export interface Transaction {
  id: string
  userId: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description?: string
  date: string
  createdAt: string
  updatedAt: string
}

export interface Budget {
  id: string
  userId: string
  category: string
  amount: number
  period: 'monthly' | 'yearly'
  createdAt: string
  updatedAt: string
}

export interface Goal {
  id: string
  userId: string
  title: string
  targetAmount: number
  currentAmount: number
  targetDate?: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  userId: string
  name: string
  type: 'income' | 'expense'
  color: string
  createdAt: string
}

export interface User {
  id: string
  email: string
  displayName?: string
}