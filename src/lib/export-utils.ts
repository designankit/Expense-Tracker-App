import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF
  }
}

export interface ExportData {
  incomeExpenses: Array<{
    date: string
    income: number
    expenses: number
    net: number
  }>
  categorySpending: Array<{
    category: string
    amount: number
    percentage: number
  }>
  budgetVsActual: Array<{
    category: string
    budget: number
    actual: number
    difference: number
    status: string
  }>
  cashFlow: {
    income: number
    expenses: number
    savings: number
    netFlow: number
  }
  financialHealth: {
    score: number
    savingsRate: number
    budgetAdherence: number
    expenseRatio: number
  }
}

export const exportToCSV = (data: ExportData, timeRange: string) => {
  const csvData = [
    ['Date', 'Income', 'Expenses', 'Net'],
    ...data.incomeExpenses.map(item => [
      item.date,
      item.income.toString(),
      item.expenses.toString(),
      item.net.toString()
    ])
  ]
  
  const csvContent = csvData.map(row => row.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export const exportToExcel = (data: ExportData, timeRange: string) => {
  // Create a simple CSV that can be opened in Excel
  const excelData = [
    ['Analytics Report', '', '', ''],
    ['Generated:', new Date().toLocaleDateString(), '', ''],
    ['Time Range:', timeRange, '', ''],
    ['', '', '', ''],
    ['Income vs Expenses', '', '', ''],
    ['Date', 'Income', 'Expenses', 'Net'],
    ...data.incomeExpenses.map(item => [
      item.date,
      item.income.toString(),
      item.expenses.toString(),
      item.net.toString()
    ]),
    ['', '', '', ''],
    ['Category Spending', '', '', ''],
    ['Category', 'Amount', 'Percentage', ''],
    ...data.categorySpending.map(item => [
      item.category,
      item.amount.toString(),
      item.percentage.toFixed(2) + '%',
      ''
    ]),
    ['', '', '', ''],
    ['Budget vs Actual', '', '', ''],
    ['Category', 'Budget', 'Actual', 'Difference'],
    ...data.budgetVsActual.map(item => [
      item.category,
      item.budget.toString(),
      item.actual.toString(),
      item.difference.toString()
    ]),
    ['', '', '', ''],
    ['Financial Summary', '', '', ''],
    ['Total Income', data.cashFlow.income.toString(), '', ''],
    ['Total Expenses', data.cashFlow.expenses.toString(), '', ''],
    ['Total Savings', data.cashFlow.savings.toString(), '', ''],
    ['Net Flow', data.cashFlow.netFlow.toString(), '', ''],
    ['Financial Health Score', data.financialHealth.score.toString(), '', ''],
    ['Savings Rate', data.financialHealth.savingsRate.toFixed(2) + '%', '', ''],
    ['Budget Adherence', data.financialHealth.budgetAdherence.toFixed(2) + '%', '', ''],
    ['Expense Ratio', data.financialHealth.expenseRatio.toFixed(2) + '%', '', '']
  ]
  
  const csvContent = excelData.map(row => row.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

export const exportToPDF = (data: ExportData, timeRange: string) => {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(20)
  doc.text('Financial Analytics Report', 20, 20)
  
  // Date and time range
  doc.setFontSize(12)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35)
  doc.text(`Time Range: ${timeRange}`, 20, 45)
  
  // Financial Summary
  doc.setFontSize(16)
  doc.text('Financial Summary', 20, 65)
  
  const summaryData = [
    ['Metric', 'Amount'],
    ['Total Income', `₹${data.cashFlow.income.toLocaleString()}`],
    ['Total Expenses', `₹${data.cashFlow.expenses.toLocaleString()}`],
    ['Total Savings', `₹${data.cashFlow.savings.toLocaleString()}`],
    ['Net Flow', `₹${data.cashFlow.netFlow.toLocaleString()}`],
    ['Financial Health Score', `${data.financialHealth.score}/100`],
    ['Savings Rate', `${data.financialHealth.savingsRate.toFixed(1)}%`],
    ['Budget Adherence', `${data.financialHealth.budgetAdherence.toFixed(1)}%`],
    ['Expense Ratio', `${data.financialHealth.expenseRatio.toFixed(1)}%`]
  ]
  
  autoTable(doc, {
    startY: 75,
    head: [summaryData[0]],
    body: summaryData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  } as Record<string, unknown>)
  
  // Category Spending
  doc.setFontSize(16)
  doc.text('Category Spending', 20, ((doc as unknown as Record<string, unknown>).lastAutoTable as Record<string, unknown>).finalY as number + 20)
  
  const categoryData = data.categorySpending.map(item => [
    item.category,
    `₹${item.amount.toLocaleString()}`,
    `${item.percentage.toFixed(1)}%`
  ])
  
  autoTable(doc, {
    startY: ((doc as unknown as Record<string, unknown>).lastAutoTable as Record<string, unknown>).finalY as number + 30,
    head: [['Category', 'Amount', 'Percentage']],
    body: categoryData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  } as Record<string, unknown>)
  
  // Budget vs Actual
  doc.setFontSize(16)
  doc.text('Budget vs Actual', 20, ((doc as unknown as Record<string, unknown>).lastAutoTable as Record<string, unknown>).finalY as number + 20)
  
  const budgetData = data.budgetVsActual.map(item => [
    item.category,
    `₹${item.budget.toLocaleString()}`,
    `₹${item.actual.toLocaleString()}`,
    `₹${item.difference.toLocaleString()}`,
    item.status
  ])
  
  autoTable(doc, {
    startY: ((doc as unknown as Record<string, unknown>).lastAutoTable as Record<string, unknown>).finalY as number + 30,
    head: [['Category', 'Budget', 'Actual', 'Difference', 'Status']],
    body: budgetData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  } as Record<string, unknown>)
  
  // Save the PDF
  doc.save(`analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`)
}

export const exportToJSON = (data: ExportData, timeRange: string) => {
  const jsonData = {
    metadata: {
      generated: new Date().toISOString(),
      timeRange,
      version: '1.0'
    },
    data
  }
  
  const jsonContent = JSON.stringify(jsonData, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}
