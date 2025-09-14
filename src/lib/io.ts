// Demo expense type
interface Expense {
  id: string
  amount: number
  category: string
  type: "expense" | "income"
  date: string
  note?: string
  userId: string
  createdAt: string
  updatedAt: string
}

/**
 * Export expenses to JSON file
 * @param expenses - Array of expenses to export
 */
export function exportJSON(expenses: Expense[]): void {
  try {
    const jsonString = JSON.stringify(expenses, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "expenses.json"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error exporting JSON:", error)
    throw new Error("Failed to export JSON file")
  }
}

/**
 * Export expenses to CSV file
 * @param expenses - Array of expenses to export
 */
export function exportCSV(expenses: Expense[]): void {
  try {
    if (expenses.length === 0) {
      throw new Error("No expenses to export")
    }

    // CSV headers
    const headers = ["id", "amount", "category", "type", "date", "note"]
    
    // Convert expenses to CSV rows
    const csvRows = expenses.map(expense => [
      expense.id,
      expense.amount.toString(),
      `"${expense.category.replace(/"/g, '""')}"`, // Escape quotes in category
      expense.type,
      expense.date,
      `"${(expense.note || "").replace(/"/g, '""')}"` // Escape quotes in note
    ])
    
    // Combine headers and rows
    const csvContent = [headers.join(","), ...csvRows.map(row => row.join(","))].join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "expenses.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error exporting CSV:", error)
    throw new Error("Failed to export CSV file")
  }
}

/**
 * Import expenses from JSON file
 * @param file - File object to import
 * @param addExpenses - Function to add expenses to store
 * @returns Promise<boolean> - Success status
 */
export async function importJSONFile(
  file: File, 
  addExpenses: (items: Expense[]) => void
): Promise<boolean> {
  try {
    // Read file as text
    const text = await file.text()
    
    // Parse JSON
    let parsedData: unknown
    try {
      parsedData = JSON.parse(text)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_parseError) {
      throw new Error("Invalid JSON file format")
    }
    
    // Validate that it's an array
    if (!Array.isArray(parsedData)) {
      throw new Error("File must contain an array of expenses")
    }
    
    // Validate and process each expense
    const validExpenses: Expense[] = []
    const existingIds = new Set<string>()
    
    for (let i = 0; i < parsedData.length; i++) {
      const item = parsedData[i] as Record<string, unknown>
      
      // Check required fields
      if (typeof item.amount !== "number" || item.amount < 0) {
        console.warn(`Skipping item ${i}: Invalid amount`)
        continue
      }
      
      if (typeof item.category !== "string" || item.category.trim() === "") {
        console.warn(`Skipping item ${i}: Invalid category`)
        continue
      }
      
      if (!["expense", "income"].includes(item.type as string)) {
        console.warn(`Skipping item ${i}: Invalid type`)
        continue
      }
      
      if (typeof item.date !== "string" || !item.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        console.warn(`Skipping item ${i}: Invalid date format`)
        continue
      }
      
      // Generate ID if missing or duplicate
      let id: string = typeof item.id === "string" ? item.id : ""
      if (!id || existingIds.has(id)) {
        id = `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
      existingIds.add(id)
      
      // Create valid expense object
      const expense: Expense = {
        id,
        amount: item.amount,
        category: item.category.trim(),
        type: item.type as "expense" | "income",
        date: item.date,
        note: typeof item.note === "string" ? item.note.trim() : undefined,
        userId: "demo-user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      validExpenses.push(expense)
    }
    
    if (validExpenses.length === 0) {
      throw new Error("No valid expenses found in file")
    }
    
    // Add expenses to store
    addExpenses(validExpenses)
    
    return true
  } catch (error) {
    console.error("Error importing JSON:", error)
    throw error
  }
}

/**
 * Export expenses to PDF file
 * @param expenses - Array of expenses to export
 */
export function exportPDF(expenses: Expense[]): void {
  try {
    if (expenses.length === 0) {
      throw new Error("No expenses to export")
    }

    // Calculate totals
    const totalExpenses = expenses
      .filter(expense => expense.type === 'expense')
      .reduce((sum, expense) => sum + expense.amount, 0)
    
    const totalIncome = expenses
      .filter(expense => expense.type === 'income')
      .reduce((sum, expense) => sum + expense.amount, 0)

    const netBalance = totalIncome - totalExpenses

    // Group by category
    const categoryTotals = expenses
      .filter(expense => expense.type === 'expense')
      .reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      }, {} as Record<string, number>)

    // Create HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Expense Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #1f2937;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #6b7280;
            margin: 5px 0 0 0;
            font-size: 14px;
          }
          .summary {
            display: flex;
            justify-content: space-around;
            margin-bottom: 30px;
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
          }
          .summary-item {
            text-align: center;
          }
          .summary-item h3 {
            margin: 0 0 5px 0;
            font-size: 14px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .summary-item .amount {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
          }
          .expenses { color: #dc2626; }
          .income { color: #16a34a; }
          .balance { color: ${netBalance >= 0 ? '#16a34a' : '#dc2626'}; }
          .section {
            margin-bottom: 30px;
          }
          .section h2 {
            color: #1f2937;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            text-align: left;
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          td {
            font-size: 14px;
          }
          .amount-cell {
            text-align: right;
            font-weight: 500;
          }
          .expense-amount { color: #dc2626; }
          .income-amount { color: #16a34a; }
          .category-badge {
            background: #e5e7eb;
            color: #374151;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
          }
          .type-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
          }
          .type-expense {
            background: #fef2f2;
            color: #dc2626;
          }
          .type-income {
            background: #f0fdf4;
            color: #16a34a;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          @media print {
            body { margin: 0; }
            .summary { page-break-inside: avoid; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Expense Report</h1>
          <p>Generated on ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>

        <div class="summary">
          <div class="summary-item">
            <h3>Total Expenses</h3>
            <p class="amount expenses">₹${totalExpenses.toLocaleString()}</p>
          </div>
          <div class="summary-item">
            <h3>Total Income</h3>
            <p class="amount income">₹${totalIncome.toLocaleString()}</p>
          </div>
          <div class="summary-item">
            <h3>Net Balance</h3>
            <p class="amount balance">₹${netBalance.toLocaleString()}</p>
          </div>
        </div>

        <div class="section">
          <h2>Spending by Category</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(categoryTotals)
                .sort(([,a], [,b]) => b - a)
                .map(([category, amount]) => {
                  const percentage = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : '0.0'
                  return `
                    <tr>
                      <td><span class="category-badge">${category}</span></td>
                      <td class="amount-cell expense-amount">₹${amount.toLocaleString()}</td>
                      <td>${percentage}%</td>
                    </tr>
                  `
                }).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>All Transactions</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              ${expenses
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(expense => `
                  <tr>
                    <td>${new Date(expense.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</td>
                    <td><span class="category-badge">${expense.category}</span></td>
                    <td><span class="type-badge type-${expense.type}">${expense.type}</span></td>
                    <td class="amount-cell ${expense.type}-amount">
                      ${expense.type === 'income' ? '+' : '-'}₹${expense.amount.toLocaleString()}
                    </td>
                    <td>${expense.note || '-'}</td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Report generated by ExpenseTracker • Total transactions: ${expenses.length}</p>
        </div>
      </body>
      </html>
    `

    // Create a new window and print
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      throw new Error("Failed to open print window. Please allow popups for this site.")
    }
    
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      printWindow.print()
      // Close the window after a short delay
      setTimeout(() => {
        printWindow.close()
      }, 1000)
    }
  } catch (error) {
    console.error("Error exporting PDF:", error)
    throw new Error("Failed to export PDF file")
  }
}

/**
 * Trigger file picker for JSON import
 * @param addExpenses - Function to add expenses to store
 * @returns Promise<boolean> - Success status
 */
export function triggerJSONImport(addExpenses: (items: Expense[]) => void): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.style.display = "none"
    
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) {
        resolve(false)
        return
      }
      
      try {
        const success = await importJSONFile(file, addExpenses)
        resolve(success)
      } catch (error) {
        reject(error)
      }
    }
    
    input.oncancel = () => {
      resolve(false)
    }
    
    document.body.appendChild(input)
    input.click()
    document.body.removeChild(input)
  })
}
