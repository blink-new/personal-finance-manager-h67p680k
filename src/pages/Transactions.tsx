import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal'
import { Transaction } from '@/types'
import { format } from 'date-fns'
import { Search, Filter } from 'lucide-react'

interface TransactionsProps {
  transactions: Transaction[]
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
  onDeleteTransaction?: (transactionId: string) => void
  loading?: boolean
}

export function Transactions({ transactions, onAddTransaction, onDeleteTransaction, loading = false }: TransactionsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Get unique categories
  const categories = Array.from(new Set(transactions.map(t => t.category)))

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || transaction.type === filterType
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory

    return matchesSearch && matchesType && matchesCategory
  })

  // Sort by date (newest first)
  const sortedTransactions = filteredTransactions.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-muted-foreground">
            Manage and track all your financial transactions.
          </p>
        </div>
        <AddTransactionModal onAddTransaction={onAddTransaction} />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={(value: 'all' | 'income' | 'expense') => setFilterType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Transactions ({sortedTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedTransactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {transactions.length === 0 
                    ? "No transactions yet. Add your first transaction to get started!"
                    : "No transactions match your current filters."
                  }
                </p>
                {transactions.length === 0 && (
                  <div className="mt-4">
                    <AddTransactionModal onAddTransaction={onAddTransaction} />
                  </div>
                )}
              </div>
            ) : (
              sortedTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                        {transaction.type}
                      </Badge>
                      <span className="font-medium text-lg">{transaction.category}</span>
                    </div>
                    {transaction.description && (
                      <p className="text-muted-foreground mt-1">
                        {transaction.description}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(transaction.date), 'EEEE, MMMM dd, yyyy')}
                    </p>
                  </div>
                  <div className={`text-xl font-bold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}