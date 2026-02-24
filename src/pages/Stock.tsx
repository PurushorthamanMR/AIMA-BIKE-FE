import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getStocksPage, type StockDto } from '@/lib/stockApi'
import { Link } from 'react-router-dom'
import EditIcon from '@/components/icons/EditIcon'
import { Package } from 'lucide-react'

export default function Stock() {
  const [stocks, setStocks] = useState<StockDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const load = () => {
    setLoading(true)
    getStocksPage(1, 500).then((list) => {
      setStocks(list ?? [])
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
    const chassis = (s.chassisNumber ?? '').toLowerCase()
    const motor = (s.motorNumber ?? '').toLowerCase()
    const color = (s.color ?? '').toLowerCase()
    return model.includes(q) || code.includes(q) || chassis.includes(q) || motor.includes(q) || color.includes(q)
  })

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
                      <th>Chassis Number</th>
                      <th>Motor Number</th>
                      <th>Color</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStocks.map((s) => (
                      <tr key={s.id}>
                        <td className="align-middle">{s.modelDto?.name ?? '-'}</td>
                        <td className="align-middle">{s.itemCode ?? '-'}</td>
                        <td className="align-middle">{s.chassisNumber ?? '-'}</td>
                        <td className="align-middle">{s.motorNumber ?? '-'}</td>
                        <td className="align-middle">{s.color ?? '-'}</td>
                        <td className="align-middle">
                          <Link to={`/stock/${s.id}`} className="text-decoration-none d-inline-flex align-items-center">
                            <Button variant="ghost" size="sm" className="p-1 d-inline-flex align-items-center" title="Edit">
                              <EditIcon size={20} className="text-dark" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredStocks.length === 0 && <p className="text-muted mb-0">No stock found</p>}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
