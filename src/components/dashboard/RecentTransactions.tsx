import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Transaction } from '@/types'
import { format } from 'date-fns'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No transactions yet. Add your first transaction to get started!
            </p>
          ) : (
            transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                      {transaction.type}
                    </Badge>
                    <span className="font-medium">{transaction.category}</span>
                  </div>
                  {transaction.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {transaction.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className={`text-lg font-semibold ${
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
  )
}