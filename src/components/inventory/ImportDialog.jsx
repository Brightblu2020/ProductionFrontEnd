import { useState, useRef } from 'react'
import Papa from 'papaparse'

export default function ImportDialog({ onClose, onImport }) {
  const [file, setFile] = useState(null)
  const [parsedItems, setParsedItems] = useState([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const fileRef = useRef()

  const handleFile = (f) => {
    if (!f || !f.name.endsWith('.csv')) {
      setError('Please select a CSV file')
      return
    }

    setFile(f)
    setError(null)

    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const items = results.data.map((row) => {
          const sku = (row['Item ID'] || row['SKU'] || row['sku'] || '').trim()
          const itemName = (row['Item Name'] || row['itemName'] || '').trim()
          let price = row['Purchase Price'] || row['purchasePrice'] || '0'
          price = String(price).replace(/^INR\s*/, '').replace(/,/g, '')
          const stockOnHand = parseFloat(
            String(row['Stock on Hand'] || row['stockOnHand'] || '0').replace(/,/g, '')
          )
          const preferredVendor = (row['Preferred Vendor'] || row['preferredVendor'] || '').trim() || null

          return {
            sku,
            itemName,
            purchasePrice: parseFloat(price) || 0,
            stockOnHand: isNaN(stockOnHand) ? 0 : stockOnHand,
            preferredVendor,
          }
        }).filter((item) => item.sku)

        setParsedItems(items)
      },
      error: () => {
        setError('Failed to parse CSV file')
      },
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleImport = async () => {
    setImporting(true)
    setError(null)
    try {
      const res = await onImport(parsedItems)
      setResult(res)
    } catch (err) {
      setError(err.response?.data?.error || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Import Inventory CSV</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
          )}

          {result ? (
            <div className="space-y-2">
              <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">
                Import complete!
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-semibold text-slate-900">{result.imported}</div>
                  <div className="text-slate-500">Imported</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-semibold text-green-600">{result.created}</div>
                  <div className="text-slate-500">Created</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-semibold text-blue-600">{result.updated}</div>
                  <div className="text-slate-500">Updated</div>
                </div>
              </div>
              {result.errors?.length > 0 && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {result.errors.length} errors occurred during import
                </div>
              )}
            </div>
          ) : !parsedItems.length ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
            >
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
              <svg className="mx-auto h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              <p className="mt-2 text-sm text-slate-600">
                Drop a CSV file here or <span className="text-blue-600 font-medium">browse</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Expected: SKU, Item Name, Purchase Price, Stock On Hand, Preferred Vendor
              </p>
            </div>
          ) : (
            <>
              <div className="text-sm text-slate-600">
                <span className="font-medium">{file?.name}</span> — {parsedItems.length} items found
              </div>
              <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-64 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-slate-500">SKU</th>
                      <th className="px-3 py-2 text-left text-slate-500">Name</th>
                      <th className="px-3 py-2 text-left text-slate-500">Price</th>
                      <th className="px-3 py-2 text-left text-slate-500">Stock</th>
                      <th className="px-3 py-2 text-left text-slate-500">Vendor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedItems.slice(0, 10).map((item, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-mono">{item.sku}</td>
                        <td className="px-3 py-2 max-w-[150px] truncate">{item.itemName}</td>
                        <td className="px-3 py-2">{item.purchasePrice}</td>
                        <td className="px-3 py-2">{item.stockOnHand}</td>
                        <td className="px-3 py-2 max-w-[100px] truncate">{item.preferredVendor || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedItems.length > 10 && (
                <p className="text-xs text-slate-400">
                  ...and {parsedItems.length - 10} more items
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg">
            {result ? 'Close' : 'Cancel'}
          </button>
          {parsedItems.length > 0 && !result && (
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {importing ? 'Importing...' : `Import ${parsedItems.length} Items`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
