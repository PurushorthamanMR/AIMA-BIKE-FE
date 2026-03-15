import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getStocksPage, type StockDto } from '@/lib/stockApi'
import { Link } from 'react-router-dom'
import EditIcon from '@/components/icons/EditIcon'
import { Package, ChevronLeft, ChevronRight, Printer } from 'lucide-react'

const PAGE_SIZE_OPTIONS = [10, 25, 50]

export default function Stock() {
  const [stocks, setStocks] = useState<StockDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const load = () => {
    setLoading(true)
    // Load a large single page so search can cover all stocks, then paginate on the client
    getStocksPage(1, 10000).then((res) => {
      setStocks(res.content ?? [])
      setLoading(false)
    })
  }

  useEffect(() => {
    load()
  }, [])

  const filteredStocks = stocks.filter((s) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    const model = (s.modelDto?.name ?? '').toLowerCase()
    const code = (s.itemCode ?? '').toLowerCase()
    const barcode = (s.barcode ?? '').toLowerCase()
    const chassis = (s.chassisNumber ?? '').toLowerCase()
    const motor = (s.motorNumber ?? '').toLowerCase()
    const color = (s.color ?? '').toLowerCase()
    return (
      model.includes(q) ||
      code.includes(q) ||
      barcode.includes(q) ||
      chassis.includes(q) ||
      motor.includes(q) ||
      color.includes(q)
    )
  })

  const totalElements = filteredStocks.length
  const totalPages = totalElements > 0 ? Math.ceil(totalElements / pageSize) : 0
  const startIndex = (pageNumber - 1) * pageSize
  const pageStocks = filteredStocks.slice(startIndex, startIndex + pageSize)

  const handlePrintLabel = (stock: StockDto) => {
    const value = stock.barcode || stock.chassisNumber || stock.itemCode || `${stock.id}`
    const modelName = stock.modelDto?.name ?? ''
    const color = stock.color ?? ''
    const win = window.open('', '_blank', 'width=400,height=250')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>Barcode Label</title>
          <style>
            body { margin: 0; padding: 8px; font-family: Arial, sans-serif; }
            .label-container {
              width: 320px;
              border: 1px solid #000;
              padding: 8px 10px;
              box-sizing: border-box;
            }
            .label-header {
              font-size: 12px;
              margin-bottom: 4px;
            }
            .label-meta {
              font-size: 11px;
              margin-bottom: 4px;
            }
            .barcode-wrapper {
              text-align: center;
              margin: 6px 0;
            }
            .barcode-text {
              font-size: 11px;
              text-align: center;
            }
            @media print {
              body { margin: 0; }
              .label-container { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="label-container">
            <div class="label-header">${modelName || 'STOCK ITEM'}</div>
            <div class="label-meta">${color ? 'Color: ' + color : ''}</div>
            <div class="barcode-wrapper">
              <svg id="barcode"></svg>
            </div>
            <div class="barcode-text">${value}</div>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
          <script>
            window.onload = function() {
              try {
                JsBarcode("#barcode", "${value}", {
                  format: "CODE128",
                  displayValue: false,
                  margin: 0,
                  width: 2,
                  height: 60
                });
              } catch (e) {
                console.error(e);
              }
              window.print();
            };
          </script>
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 p-2" style={{ background: 'rgba(170, 51, 106, 0.1)' }}>
            <Package size={28} style={{ color: 'var(--aima-primary)' }} />
          </div>
          <h2 className="mb-0" style={{ color: 'var(--aima-secondary)' }}>Stock</h2>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <Input
            placeholder="Search by model, item code, chassis, motor, color..."
            className="mb-3"
            style={{ maxWidth: '400px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {loading ? (
            <p className="text-muted mb-0">Loading...</p>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Model</th>
                      <th>Item Code</th>
                      <th>Barcode</th>
                      <th>Chassis Number</th>
                      <th>Motor Number</th>
                      <th>Color</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageStocks.map((s) => (
                      <tr key={s.id}>
                        <td className="align-middle">{s.modelDto?.name ?? '-'}</td>
                        <td className="align-middle">{s.itemCode ?? '-'}</td>
                        <td className="align-middle">{s.barcode ?? '-'}</td>
                        <td className="align-middle">{s.chassisNumber ?? '-'}</td>
                        <td className="align-middle">{s.motorNumber ?? '-'}</td>
                        <td className="align-middle">{s.color ?? '-'}</td>
                        <td className="align-middle">
                          <div className="d-flex align-items-center gap-1">
                            <Link to={`/stock/${s.id}`} className="text-decoration-none d-inline-flex align-items-center">
                              <Button variant="ghost" size="sm" className="p-1 d-inline-flex align-items-center" title="Edit">
                                <EditIcon size={20} className="text-dark" />
                              </Button>
                            </Link>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="p-1"
                              title="Print Barcode Label"
                              onClick={() => handlePrintLabel(s)}
                            >
                              <Printer size={18} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pageStocks.length === 0 && !loading && <p className="text-muted mb-0">No stock found</p>}
              {totalPages > 0 && (
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3 pt-2 border-top">
                  <div className="d-flex align-items-center gap-2">
                    <span className="small text-muted">
                      Page {pageNumber} of {totalPages} ({totalElements} total)
                    </span>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: 'auto' }}
                      value={pageSize}
                      onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1) }}
                    >
                      {PAGE_SIZE_OPTIONS.map((n) => (
                        <option key={n} value={n}>{n} per page</option>
                      ))}
                    </select>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                      disabled={pageNumber <= 1}
                    >
                      <ChevronLeft size={18} />
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                      disabled={pageNumber >= totalPages}
                    >
                      Next
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
