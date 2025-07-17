import { useState, useEffect, useCallback } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Dashboard } from '@/pages/Dashboard'
import { Transactions } from '@/pages/Transactions'
import { blink } from '@/blink/client'
import { Transaction, User } from '@/types'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const { toast } = useToast()

  // Auth state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  // Load transactions from database
  useEffect(() => {
    if (user?.id) {
      loadTransactions()
    }
  }, [user?.id, loadTransactions])

  const loadTransactions = useCallback(async () => {
    if (!user?.id) return
    
    setTransactionsLoading(true)
    try {
      const data = await blink.db.transactions.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        limit: 100
      })
      setTransactions(data)
    } catch (error) {
      console.error('Failed to load transactions:', error)
      // If database doesn't exist yet, create sample data
      createSampleData()
    } finally {
      setTransactionsLoading(false)
    }
  }, [user?.id, createSampleData])

  const createSampleData = useCallback(() => {
    if (!user) return

    const sampleTransactions: Transaction[] = [
      {
        id: '1',
        userId: user.id,
        type: 'income',
        amount: 5000,
        category: 'Salary',
        description: 'Monthly salary',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        userId: user.id,
        type: 'expense',
        amount: 1200,
        category: 'Housing',
        description: 'Monthly rent',
        date: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        userId: user.id,
        type: 'expense',
        amount: 300,
        category: 'Food',
        description: 'Groceries',
        date: new Date(Date.now() - 172800000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        userId: user.id,
        type: 'expense',
        amount: 150,
        category: 'Transportation',
        description: 'Gas and parking',
        date: new Date(Date.now() - 259200000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    setTransactions(sampleTransactions)
  }, [user])

  const handleAddTransaction = async (transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return

    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...transactionData
    }

    try {
      // Try to save to database
      await blink.db.transactions.create(newTransaction)
      
      // Update local state optimistically
      setTransactions(prev => [newTransaction, ...prev])
      
      toast({
        title: "Transaction added",
        description: `${transactionData.type === 'income' ? 'Income' : 'Expense'} of $${transactionData.amount} has been recorded.`,
      })
    } catch (error) {
      console.error('Failed to save transaction:', error)
      
      // Fallback to local state only
      setTransactions(prev => [newTransaction, ...prev])
      
      toast({
        title: "Transaction added (locally)",
        description: `${transactionData.type === 'income' ? 'Income' : 'Expense'} of $${transactionData.amount} has been recorded locally.`,
        variant: "default"
      })
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await blink.db.transactions.delete(transactionId)
      setTransactions(prev => prev.filter(t => t.id !== transactionId))
      
      toast({
        title: "Transaction deleted",
        description: "Transaction has been removed successfully.",
      })
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      
      // Fallback to local state only
      setTransactions(prev => prev.filter(t => t.id !== transactionId))
      
      toast({
        title: "Transaction deleted (locally)",
        description: "Transaction has been removed locally.",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">FinanceApp</h1>
            <p className="text-xl text-muted-foreground">Take control of your finances</p>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3 text-left">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-muted-foreground">Track income and expenses</span>
            </div>
            <div className="flex items-center space-x-3 text-left">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-muted-foreground">Set and monitor budgets</span>
            </div>
            <div className="flex items-center space-x-3 text-left">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-muted-foreground">Visualize your financial data</span>
            </div>
          </div>
          
          <button
            onClick={() => blink.auth.login()}
            className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Sign In to Get Started
          </button>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            transactions={transactions} 
            onAddTransaction={handleAddTransaction}
            loading={transactionsLoading}
          />
        )
      case 'transactions':
        return (
          <Transactions 
            transactions={transactions} 
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            loading={transactionsLoading}
          />
        )
      case 'budgets':
        return (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">Budget Management</h2>
              <p className="text-muted-foreground mb-6">
                Set spending limits for different categories and track your progress throughout the month.
              </p>
              <p className="text-sm text-muted-foreground">Coming soon!</p>
            </div>
          </div>
        )
      case 'goals':
        return (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">Financial Goals</h2>
              <p className="text-muted-foreground mb-6">
                Set savings targets and track your progress towards achieving your financial objectives.
              </p>
              <p className="text-sm text-muted-foreground">Coming soon!</p>
            </div>
          </div>
        )
      case 'reports':
        return (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">Financial Reports</h2>
              <p className="text-muted-foreground mb-6">
                Generate detailed reports and insights about your spending patterns and financial trends.
              </p>
              <p className="text-sm text-muted-foreground">Coming soon!</p>
            </div>
          </div>
        )
      case 'settings':
        return (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚙️</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">Settings</h2>
              <p className="text-muted-foreground mb-6">
                Customize your experience, manage categories, and configure your preferences.
              </p>
              <p className="text-sm text-muted-foreground">Coming soon!</p>
            </div>
          </div>
        )
      default:
        return (
          <Dashboard 
            transactions={transactions} 
            onAddTransaction={handleAddTransaction}
            loading={transactionsLoading}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} user={user} />
        
        <main className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8 pt-16 lg:pt-8">
            {renderContent()}
          </div>
        </main>
      </div>
      
      <Toaster />
    </div>
  )
}

export default App