import { DashboardCards } from '@/components/dashboard/DashboardCards'
import { ExpenseChart } from '@/components/dashboard/ExpenseChart'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal'
import { Transaction } from '@/types'

interface DashboardProps {
  transactions: Transaction[]
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
  loading?: boolean
}

export function Dashboard({ transactions, onAddTransaction, loading = false }: DashboardProps) {
  // Calculate dashboard metrics
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const monthlyTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date)
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
  })

  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  // Calculate expense breakdown for chart
  const expensesByCategory = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const chartData = Object.entries(expensesByCategory).map(([category, amount], index) => ({
    category,
    amount,
    color: [
      '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ][index % 10]
  }))

  // Mock goals progress (would come from actual goals data)
  const goalsProgress = 65

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your financial overview.
          </p>
        </div>
        <AddTransactionModal onAddTransaction={onAddTransaction} />
      </div>

      {/* Dashboard Cards */}
      <DashboardCards
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        balance={balance}
        goalsProgress={goalsProgress}
      />

      {/* Charts and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseChart data={chartData} />
        <RecentTransactions transactions={transactions} />
      </div>
    </div>
  )
}