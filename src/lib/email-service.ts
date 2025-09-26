// Email notification service using Supabase Edge Functions
// This is an optional feature that requires setting up Supabase Edge Functions

export interface EmailNotification {
  to: string
  subject: string
  html: string
  text?: string
}

export class EmailService {
  private supabaseUrl: string
  private supabaseAnonKey: string

  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    this.supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  }

  /**
   * Send email notification using Supabase Edge Function
   * Note: This requires setting up a Supabase Edge Function for email sending
   */
  async sendEmail(notification: EmailNotification): Promise<boolean> {
    try {
      // Check if email service is configured
      if (!this.supabaseUrl || !this.supabaseAnonKey) {
        console.warn('Email service not configured. Skipping email notification.')
        return false
      }

      const response = await fetch(`${this.supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
        },
        body: JSON.stringify(notification),
      })

      if (!response.ok) {
        console.error('Failed to send email:', await response.text())
        return false
      }

      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  /**
   * Send recurring bill reminder email
   */
  async sendRecurringBillReminder(
    userEmail: string,
    billTitle: string,
    amount: number,
    dueDate: string
  ): Promise<boolean> {
    const dueDateFormatted = new Date(dueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Upcoming Recurring Bill</h2>
        <p>Hello!</p>
        <p>This is a reminder that your recurring bill is due soon:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #374151;">${billTitle}</h3>
          <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #dc2626;">₹${amount.toLocaleString()}</p>
          <p style="margin: 5px 0; color: #6b7280;">Due: ${dueDateFormatted}</p>
        </div>
        <p>Please make sure to pay this bill on time to avoid any late fees.</p>
        <p>Best regards,<br>Expensio Tracker Team</p>
      </div>
    `

    const text = `
      Upcoming Recurring Bill
      
      Hello!
      
      This is a reminder that your recurring bill is due soon:
      
      ${billTitle}
      Amount: ₹${amount.toLocaleString()}
      Due: ${dueDateFormatted}
      
      Please make sure to pay this bill on time to avoid any late fees.
      
      Best regards,
      Expensio Tracker Team
    `

    return this.sendEmail({
      to: userEmail,
      subject: `Reminder: ${billTitle} due ${dueDateFormatted}`,
      html,
      text,
    })
  }

  /**
   * Send budget warning email
   */
  async sendBudgetWarning(
    userEmail: string,
    totalSpent: number,
    budgetLimit: number
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Budget Warning</h2>
        <p>Hello!</p>
        <p>You're approaching your monthly budget limit:</p>
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin: 0 0 10px 0; color: #374151;">Monthly Spending</h3>
          <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #dc2626;">₹${totalSpent.toLocaleString()}</p>
          <p style="margin: 5px 0; color: #6b7280;">Budget Limit: ₹${budgetLimit.toLocaleString()}</p>
          <p style="margin: 5px 0; color: #6b7280;">Remaining: ₹${(budgetLimit - totalSpent).toLocaleString()}</p>
        </div>
        <p>Consider reviewing your expenses to stay within your budget.</p>
        <p>Best regards,<br>Expensio Tracker Team</p>
      </div>
    `

    const text = `
      Budget Warning
      
      Hello!
      
      You're approaching your monthly budget limit:
      
      Monthly Spending: ₹${totalSpent.toLocaleString()}
      Budget Limit: ₹${budgetLimit.toLocaleString()}
      Remaining: ₹${(budgetLimit - totalSpent).toLocaleString()}
      
      Consider reviewing your expenses to stay within your budget.
      
      Best regards,
      Expensio Tracker Team
    `

    return this.sendEmail({
      to: userEmail,
      subject: `Budget Warning: ₹${totalSpent.toLocaleString()} spent this month`,
      html,
      text,
    })
  }
}

export const emailService = new EmailService()
