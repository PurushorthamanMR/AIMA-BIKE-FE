import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MOCK_CUSTOMERS } from '@/data/mockData'

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCustomers = MOCK_CUSTOMERS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.bikeNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Customers</h2>
        <Button>Add Customer</Button>
      </div>
      <div className="card">
        <div className="card-body">
          <Input
            placeholder="Search by name, phone, bike number..."
            className="mb-3"
            style={{ maxWidth: '400px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Bike Number</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="fw-medium">{customer.name}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.bikeNumber ?? '-'}</td>
                    <td>{customer.address ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredCustomers.length === 0 && (
            <p className="text-muted mb-0">No customers found</p>
          )}
        </div>
      </div>
    </div>
  )
}
