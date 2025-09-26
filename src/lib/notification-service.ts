import { createClient } from './supabaseClient'
import { emailService } from './email-service'

export class NotificationService {
  private supabase = createClient()

  /**
   * Check for upcoming recurring bills and create notifications
   */
  async checkUpcomingRecurringBills(userId: string, userEmail?: string): Promise<void> {
    try {
      // Get recurring transactions that are due in the next 1-2 days
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const dayAfterTomorrow = new Date()
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)

      const { data: upcomingBills, error } = await this.supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .eq('transaction_type', 'expense')
        .gte('next_due_date', tomorrow.toISOString().split('T')[0])
        .lte('next_due_date', dayAfterTomorrow.toISOString().split('T')[0])

      if (error) {
        console.error('Error fetching upcoming bills:', error)
        return
      }

      if (!upcomingBills || upcomingBills.length === 0) {
        return
      }

      // Create notifications for each upcoming bill
      for (const bill of upcomingBills) {
        const dueDate = new Date(bill.next_due_date)
        const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        
        const message = daysUntilDue === 1 
          ? `Your recurring bill "${bill.title}" (₹${bill.amount.toLocaleString()}) is due tomorrow.`
          : `Your recurring bill "${bill.title}" (₹${bill.amount.toLocaleString()}) is due in ${daysUntilDue} days.`

        await this.createNotification({
          userId,
          title: 'Upcoming Recurring Bill',
          message,
          type: 'warning',
          actionUrl: '/transactions'
        })

        // Send email notification if user email is provided
        if (userEmail) {
          await emailService.sendRecurringBillReminder(
            userEmail,
            bill.title,
            bill.amount,
            bill.next_due_date
          )
        }
      }
    } catch (error) {
      console.error('Error checking upcoming recurring bills:', error)
    }
  }

  /**
   * Check for upcoming recurring transactions (both income and expenses) for the next month
   */
  async checkUpcomingRecurringTransactions(userId: string): Promise<void> {
    try {
      // Get recurring transactions that are due in the next 30 days
      const today = new Date()
      const nextMonth = new Date()
      nextMonth.setDate(today.getDate() + 30)

      const { data: upcomingTransactions, error } = await this.supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gte('next_due_date', today.toISOString().split('T')[0])
        .lte('next_due_date', nextMonth.toISOString().split('T')[0])
        .order('next_due_date', { ascending: true })

      if (error) {
        console.error('Error fetching upcoming recurring transactions:', error)
        return
      }

      if (!upcomingTransactions || upcomingTransactions.length === 0) {
        return
      }

      // Create a summary notification for upcoming transactions
      const incomeTransactions = upcomingTransactions.filter(t => t.transaction_type === 'income')
      const expenseTransactions = upcomingTransactions.filter(t => t.transaction_type === 'expense')
      
      const incomeAmount = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
      const expenseAmount = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)

      let message = `You have ${upcomingTransactions.length} scheduled transactions coming up in the next 30 days:\n`
      
      if (incomeTransactions.length > 0) {
        message += `• ${incomeTransactions.length} income transactions: ₹${incomeAmount.toLocaleString()}\n`
      }
      
      if (expenseTransactions.length > 0) {
        message += `• ${expenseTransactions.length} expense transactions: ₹${expenseAmount.toLocaleString()}\n`
      }

      // Only create notification if there are transactions
      if (upcomingTransactions.length > 0) {
        await this.createNotification({
          userId,
          title: 'Upcoming Scheduled Transactions',
          message: message.trim(),
          type: 'info',
          actionUrl: '/recurring'
        })
      }
    } catch (error) {
      console.error('Error checking upcoming recurring transactions:', error)
    }
  }

  /**
   * Check for budget overspending and create notifications
   */
  async checkBudgetOverspending(userId: string, userEmail?: string): Promise<void> {
    try {
      // Get current month's total expenses
      const currentDate = new Date()
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const { data: expenses, error } = await this.supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', userId)
        .eq('transaction_type', 'expense')
        .gte('transaction_date', startOfMonth.toISOString().split('T')[0])
        .lte('transaction_date', endOfMonth.toISOString().split('T')[0])

      if (error) {
        console.error('Error fetching expenses for budget check:', error)
        return
      }

      const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0
      
      // Budget thresholds (you can customize these or make them user-configurable)
      const budgetLimits = {
        warning: 30000,  // ₹30,000 warning threshold
        critical: 40000  // ₹40,000 critical threshold
      }

      // Check if we already have a notification for this month's budget
      const { data: existingNotifications } = await this.supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'error')
        .like('message', '%budget%')
        .gte('created_at', startOfMonth.toISOString())

      if (existingNotifications && existingNotifications.length > 0) {
        return // Already notified about budget this month
      }

      if (totalExpenses >= budgetLimits.critical) {
        await this.createNotification({
          userId,
          title: 'Budget Exceeded!',
          message: `You've spent ₹${totalExpenses.toLocaleString()} this month, exceeding your budget limit. Consider reviewing your expenses.`,
          type: 'error',
          actionUrl: '/analytics'
        })

        // Send email notification if user email is provided
        if (userEmail) {
          await emailService.sendBudgetWarning(
            userEmail,
            totalExpenses,
            budgetLimits.critical
          )
        }
      } else if (totalExpenses >= budgetLimits.warning) {
        await this.createNotification({
          userId,
          title: 'Budget Warning',
          message: `You've spent ₹${totalExpenses.toLocaleString()} this month. Consider reviewing your expenses.`,
          type: 'warning',
          actionUrl: '/analytics'
        })

        // Send email notification if user email is provided
        if (userEmail) {
          await emailService.sendBudgetWarning(
            userEmail,
            totalExpenses,
            budgetLimits.warning
          )
        }
      }
    } catch (error) {
      console.error('Error checking budget overspending:', error)
    }
  }

  /**
   * Create a notification
   */
  private async createNotification({
    userId,
    title,
    message,
    type,
    actionUrl
  }: {
    userId: string
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    actionUrl?: string
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          title,
          message,
          type,
          action_url: actionUrl,
          read: false
        }])

      if (error) {
        console.error('Error creating notification:', error)
      }
    } catch (error) {
      console.error('Error creating notification:', error)
    }
  }

  /**
   * Run all notification checks for a user
   */
  async runAllChecks(userId: string, userEmail?: string): Promise<void> {
    await Promise.all([
      this.checkUpcomingRecurringBills(userId, userEmail),
      this.checkUpcomingRecurringTransactions(userId),
      this.checkBudgetOverspending(userId, userEmail)
    ])
  }
}

export const notificationService = new NotificationService()
