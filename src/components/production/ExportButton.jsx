import { useState } from 'react'

export default function ExportButton({ onExport, planName }) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const data = await onExport()

      const headers = ['SKU', 'Item Name', 'Total Needed', 'Stock on Hand', 'Shortage', 'Unit Rate', 'Shortage Cost', 'Order Status', 'Contributing Products']
      const rows = (data.items || []).map((item) => [
        item.sku,
        item.itemName,
        item.totalNeeded,
        item.stockOnHand,
        item.shortage,
        item.unitRate,
        item.shortageCost,
        item.orderStatus,
        item.contributingProducts,
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => {
            const str = String(cell ?? '')
            return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
          }).join(',')
        ),
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${(planName || 'production-plan').replace(/\s+/g, '-')}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      // silently fail — toast handled upstream if needed
    } finally {
      setExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="px-3 py-1.5 text-xs border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 disabled:opacity-50"
    >
      {exporting ? 'Exporting...' : 'Export CSV'}
    </button>
  )
}
