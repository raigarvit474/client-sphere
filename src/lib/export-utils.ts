// Export utilities for generating CSV and PDF reports

export interface ExportData {
  salesMetrics: {
    totalRevenue: number
    monthlyRevenue: number
    revenueGrowth: number
    averageDealSize: number
    dealsWon: number
    dealsLost: number
    winRate: number
    conversionRate: number
  }
  activityMetrics: {
    totalActivities: number
    completedActivities: number
    pendingActivities: number
    overdueActivities: number
    averageResponseTime: number
  }
  teamPerformance: Array<{
    id: string
    name: string
    role: string
    dealsWon: number
    revenue: number
    activitiesCompleted: number
    conversionRate: number
  }>
  monthlyData: Array<{
    month: string
    revenue: number
    deals: number
    leads: number
    activities: number
  }>
  pipelineHealth: {
    prospecting: number
    qualification: number
    proposal: number
    negotiation: number
    closedWon: number
    closedLost: number
  }
}

// Convert array of objects to CSV string
function convertToCSV(data: any[], headers: string[]): string {
  const csvHeaders = headers.join(',')
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header]
      // Handle values that might contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(',')
  )
  
  return [csvHeaders, ...csvRows].join('\n')
}

// Format currency for export
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Format percentage for export
function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

// Export sales metrics as CSV
export function exportSalesMetricsCSV(salesMetrics: ExportData['salesMetrics']): void {
  const data = [
    {
      Metric: 'Total Revenue',
      Value: formatCurrency(salesMetrics.totalRevenue)
    },
    {
      Metric: 'Monthly Revenue',
      Value: formatCurrency(salesMetrics.monthlyRevenue)
    },
    {
      Metric: 'Revenue Growth',
      Value: formatPercentage(salesMetrics.revenueGrowth)
    },
    {
      Metric: 'Average Deal Size',
      Value: formatCurrency(salesMetrics.averageDealSize)
    },
    {
      Metric: 'Deals Won',
      Value: salesMetrics.dealsWon.toString()
    },
    {
      Metric: 'Deals Lost',
      Value: salesMetrics.dealsLost.toString()
    },
    {
      Metric: 'Win Rate',
      Value: formatPercentage(salesMetrics.winRate)
    },
    {
      Metric: 'Conversion Rate',
      Value: formatPercentage(salesMetrics.conversionRate)
    }
  ]

  const csv = convertToCSV(data, ['Metric', 'Value'])
  downloadCSV(csv, 'sales-metrics-report.csv')
}

// Export team performance as CSV
export function exportTeamPerformanceCSV(teamPerformance: ExportData['teamPerformance']): void {
  const data = teamPerformance.map(member => ({
    Name: member.name,
    Role: member.role,
    'Deals Won': member.dealsWon,
    'Revenue Generated': formatCurrency(member.revenue),
    'Activities Completed': member.activitiesCompleted,
    'Conversion Rate': formatPercentage(member.conversionRate)
  }))

  const csv = convertToCSV(data, ['Name', 'Role', 'Deals Won', 'Revenue Generated', 'Activities Completed', 'Conversion Rate'])
  downloadCSV(csv, 'team-performance-report.csv')
}

// Export monthly data as CSV
export function exportMonthlyDataCSV(monthlyData: ExportData['monthlyData']): void {
  const data = monthlyData.map(month => ({
    Month: month.month,
    Revenue: formatCurrency(month.revenue),
    Deals: month.deals,
    Leads: month.leads,
    Activities: month.activities
  }))

  const csv = convertToCSV(data, ['Month', 'Revenue', 'Deals', 'Leads', 'Activities'])
  downloadCSV(csv, 'monthly-data-report.csv')
}

// Export complete report as CSV
export function exportCompleteReportCSV(reportData: ExportData): void {
  let csvContent = 'CRM Analytics Report\\n'
  csvContent += '===================\\n\\n'
  
  // Sales Metrics Section
  csvContent += 'SALES METRICS\\n'
  csvContent += 'Metric,Value\\n'
  csvContent += `Total Revenue,${formatCurrency(reportData.salesMetrics.totalRevenue)}\\n`
  csvContent += `Monthly Revenue,${formatCurrency(reportData.salesMetrics.monthlyRevenue)}\\n`
  csvContent += `Revenue Growth,${formatPercentage(reportData.salesMetrics.revenueGrowth)}\\n`
  csvContent += `Average Deal Size,${formatCurrency(reportData.salesMetrics.averageDealSize)}\\n`
  csvContent += `Deals Won,${reportData.salesMetrics.dealsWon}\\n`
  csvContent += `Deals Lost,${reportData.salesMetrics.dealsLost}\\n`
  csvContent += `Win Rate,${formatPercentage(reportData.salesMetrics.winRate)}\\n`
  csvContent += `Conversion Rate,${formatPercentage(reportData.salesMetrics.conversionRate)}\\n\\n`
  
  // Activity Metrics Section
  csvContent += 'ACTIVITY METRICS\\n'
  csvContent += 'Metric,Value\\n'
  csvContent += `Total Activities,${reportData.activityMetrics.totalActivities}\\n`
  csvContent += `Completed Activities,${reportData.activityMetrics.completedActivities}\\n`
  csvContent += `Pending Activities,${reportData.activityMetrics.pendingActivities}\\n`
  csvContent += `Overdue Activities,${reportData.activityMetrics.overdueActivities}\\n`
  csvContent += `Average Response Time,${reportData.activityMetrics.averageResponseTime} days\\n\\n`
  
  // Team Performance Section
  csvContent += 'TEAM PERFORMANCE\\n'
  csvContent += 'Name,Role,Deals Won,Revenue Generated,Activities Completed,Conversion Rate\\n'
  reportData.teamPerformance.forEach(member => {
    csvContent += `${member.name},${member.role},${member.dealsWon},${formatCurrency(member.revenue)},${member.activitiesCompleted},${formatPercentage(member.conversionRate)}\\n`
  })
  csvContent += '\\n'
  
  // Monthly Data Section
  csvContent += 'MONTHLY TRENDS\\n'
  csvContent += 'Month,Revenue,Deals,Leads,Activities\\n'
  reportData.monthlyData.forEach(month => {
    csvContent += `${month.month},${formatCurrency(month.revenue)},${month.deals},${month.leads},${month.activities}\\n`
  })
  csvContent += '\\n'
  
  // Pipeline Health Section
  csvContent += 'PIPELINE HEALTH\\n'
  csvContent += 'Stage,Count\\n'
  Object.entries(reportData.pipelineHealth).forEach(([stage, count]) => {
    csvContent += `${stage.replace('_', ' ')},${count}\\n`
  })

  downloadCSV(csvContent, 'complete-analytics-report.csv')
}

// Generate and download PDF report (simplified version)
export function exportReportPDF(reportData: ExportData): void {
  // Create HTML content for PDF
  const htmlContent = generateReportHTML(reportData)
  
  // Create a new window with the report content
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Trigger print dialog
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}

// Generate HTML content for PDF export
function generateReportHTML(reportData: ExportData): string {
  const currentDate = new Date().toLocaleDateString()
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>CRM Analytics Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .metric-card { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; background: #f9fafb; }
        .metric-value { font-size: 24px; font-weight: bold; color: #059669; }
        .metric-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
        th { background-color: #f3f4f6; font-weight: 600; }
        .text-green { color: #059669; }
        .text-center { text-align: center; }
        @media print {
          body { margin: 0; }
          .header { page-break-after: avoid; }
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>CRM Analytics Report</h1>
        <p>Generated on ${currentDate}</p>
      </div>

      <div class="section">
        <h2>Sales Performance</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">${formatCurrency(reportData.salesMetrics.totalRevenue)}</div>
            <div class="metric-label">Total Revenue</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${formatCurrency(reportData.salesMetrics.averageDealSize)}</div>
            <div class="metric-label">Average Deal Size</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${formatPercentage(reportData.salesMetrics.winRate)}</div>
            <div class="metric-label">Win Rate</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${formatPercentage(reportData.salesMetrics.conversionRate)}</div>
            <div class="metric-label">Conversion Rate</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Team Performance</h2>
        <table>
          <thead>
            <tr>
              <th>Team Member</th>
              <th>Role</th>
              <th>Deals Won</th>
              <th>Revenue Generated</th>
              <th>Activities Completed</th>
              <th>Conversion Rate</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.teamPerformance.map(member => `
              <tr>
                <td>${member.name}</td>
                <td>${member.role}</td>
                <td>${member.dealsWon}</td>
                <td class="text-green">${formatCurrency(member.revenue)}</td>
                <td>${member.activitiesCompleted}</td>
                <td>${formatPercentage(member.conversionRate)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Monthly Trends</h2>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Revenue</th>
              <th>Deals</th>
              <th>Leads</th>
              <th>Activities</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.monthlyData.map(month => `
              <tr>
                <td>${month.month}</td>
                <td class="text-green">${formatCurrency(month.revenue)}</td>
                <td>${month.deals}</td>
                <td>${month.leads}</td>
                <td>${month.activities}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Pipeline Health</h2>
        <table>
          <thead>
            <tr>
              <th>Stage</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(reportData.pipelineHealth).map(([stage, count]) => `
              <tr>
                <td>${stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                <td>${count}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `
}

// Helper function to download CSV
function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Export specific sections
export const exportOptions = {
  salesMetrics: exportSalesMetricsCSV,
  teamPerformance: exportTeamPerformanceCSV,
  monthlyData: exportMonthlyDataCSV,
  completeReport: exportCompleteReportCSV,
  pdfReport: exportReportPDF
}