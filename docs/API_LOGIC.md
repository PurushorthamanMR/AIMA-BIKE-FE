# AIMA Bike POS - Backend API Documentation

Base URL: `http://localhost:8080` (or `process.env.PORT`)

---

## Response Format

All APIs return a standardized response:

**Success:**
```json
{
  "status": true,
  "errorCode": 0,
  "errorDescription": null,
  "responseDto": { ... }
}
```

**Error:**
```json
{
  "status": false,
  "errorCode": 400,
  "errorDescription": "Error message",
  "responseDto": null
}
```

---

## Authentication

- **JWT Token:** Most APIs require `Authorization: Bearer <token>` header
- **Login:** `POST /user/login` returns JWT
- **Roles:** `ADMIN`, `MANAGER`, `STAFF`, `USER`

---

## 1. User (`/user`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/user/register` | No | - | Register new user |
| POST | `/user/login` | No | - | Login, returns JWT |
| GET | `/user/getAllPage` | Yes | - | Get all users (paginated) |
| GET | `/user/getById?id=` | Yes | ADMIN, MANAGER, STAFF | Get user by ID |
| GET | `/user/getByName?firstName=&lastName=` | Yes | ADMIN, MANAGER, STAFF | Get user by name |
| GET | `/user/getByEmailAddress?emailAddress=` | No | - | Get user by email |
| GET | `/user/getByRole?userRole=` | Yes | ADMIN, MANAGER, STAFF | Get users by role |
| POST | `/user/update` | Yes | ADMIN, MANAGER, STAFF | Update user |
| PUT | `/user/updateStatus?userId=&status=` | Yes | ADMIN, MANAGER, STAFF | Update user status |
| PUT | `/user/updatePassword?userId=&password=&changedByUserId=` | Yes | ADMIN, MANAGER, STAFF | Update password |
| POST | `/user/admin` | Yes | ADMIN, MANAGER | Test endpoint |
| POST | `/user/user` | Yes | USER | Test endpoint |

**Query params for getAllPage:** `pageNumber`, `pageSize`, `status`, `firstName`, `lastName`, `emailAddress`

---

## 2. Auth / Password Reset (`/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/forgot-password` | No | Request password reset |
| POST | `/auth/reset-password` | No | Reset password with token |

**forgot-password:** Body: `{ "emailAddress": "user@example.com" }`

**reset-password:** Body: `{ "token": "...", "newPassword": "newpassword123" }`

---

## 3. User Role (`/userRole`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/userRole/save` | Yes | ADMIN, MANAGER, STAFF | Save role (501 Not Implemented) |
| GET | `/userRole/getAll` | Yes | ADMIN, MANAGER, STAFF | Get all active roles |

---

## 4. User Logs (`/userLogs`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/userLogs/save` | Yes | Save user log |
| GET | `/userLogs/getAll` | Yes | Get all logs (paginated) |

**Query params:** `pageNumber`, `pageSize`, `status`, `action`

---

## 5. Category (`/category`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/category/save` | Yes | ADMIN, MANAGER, STAFF | Save category |
| GET | `/category/getAllPage` | Yes | ADMIN, MANAGER, STAFF | Get all (paginated) |
| GET | `/category/getByName?name=` | Yes | ADMIN, MANAGER, STAFF | Get by name |
| POST | `/category/update` | Yes | ADMIN, MANAGER, STAFF | Update category |
| PUT | `/category/updateStatus?categoryId=&status=` | Yes | ADMIN, MANAGER, STAFF | Update status |

**Query params for getAllPage:** `pageNumber`, `pageSize`, `status`, `name`

---

## 6. Model (`/model`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/model/save` | Yes | ADMIN, MANAGER, STAFF | Save model |
| GET | `/model/getAllPage` | Yes | ADMIN, MANAGER, STAFF | Get all (paginated) |
| GET | `/model/getByName?name=` | Yes | ADMIN, MANAGER, STAFF | Get by name |
| GET | `/model/getByCategory?categoryId=` | Yes | ADMIN, MANAGER, STAFF | Get by category |
| POST | `/model/update` | Yes | ADMIN, MANAGER, STAFF | Update model |
| PUT | `/model/updateStatus?modelId=&status=` | Yes | ADMIN, MANAGER, STAFF | Update status |

**Query params for getAllPage:** `pageNumber`, `pageSize`, `status`, `name`, `categoryId`

---

## 7. Stock (`/stock`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/stock/save` | Yes | ADMIN, MANAGER, STAFF | Save stock |
| GET | `/stock/getAllPage` | Yes | ADMIN, MANAGER, STAFF | Get all (paginated) |
| GET | `/stock/getByName?name=` | Yes | ADMIN, MANAGER, STAFF | Get by name |
| GET | `/stock/getByColor?color=` | Yes | ADMIN, MANAGER, STAFF | Get by color |
| GET | `/stock/getByModel?modelId=` | Yes | ADMIN, MANAGER, STAFF | Get by model |
| POST | `/stock/update` | Yes | ADMIN, MANAGER, STAFF | Update stock |
| PUT | `/stock/updateStatus?stockId=&status=` | Yes | ADMIN, MANAGER, STAFF | Update status |
| PUT | `/stock/updateQuantity?stockId=&quantity=` | Yes | ADMIN, MANAGER, STAFF | Add quantity to stock |

**Query params for getAllPage:** `pageNumber`, `pageSize`, `status`, `name`, `color`, `modelId`

**updateQuantity:** Adds `quantity` to current stock (e.g. current 50 + 50 = 100)

---

## 8. Payment (`/payment`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/payment/save` | Yes | ADMIN, MANAGER, STAFF | Save payment |
| GET | `/payment/getByName?name=` | Yes | ADMIN, MANAGER, STAFF | Get by name |
| POST | `/payment/update` | Yes | ADMIN, MANAGER, STAFF | Update payment |
| PUT | `/payment/updateStatus?paymentId=&status=` | Yes | ADMIN, MANAGER, STAFF | Update status |

---

## 9. Upload (`/api/upload`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/api/upload/single?subfolder=cash\|lease` | Yes | ADMIN, MANAGER, STAFF | Upload single file (image/PDF). Returns `{ path: "upload/cash/xxx.jpg" }` |

**Body:** `multipart/form-data` with field `file`. Max 10MB. Allowed: jpg, png, gif, webp, pdf.

**Static:** Uploaded files served at `GET /upload/cash/xxx.jpg` or `/upload/lease/xxx.jpg`

---

## 10. Cash (`/cash`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/cash/save` | Yes | ADMIN, MANAGER, STAFF | Save cash record |
| GET | `/cash/getByCustomer?customerId=` | Yes | ADMIN, MANAGER, STAFF | Get by customer |
| POST | `/cash/update` | Yes | ADMIN, MANAGER, STAFF | Update cash |
| PUT | `/cash/updateStatus?cashId=&status=` | Yes | ADMIN, MANAGER, STAFF | Update status |

---

## 11. Lease (`/lease`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/lease/save` | Yes | ADMIN, MANAGER, STAFF | Save lease record |
| GET | `/lease/getByCustomer?customerId=` | Yes | ADMIN, MANAGER, STAFF | Get by customer |
| GET | `/lease/getByCompany?companyName=` | Yes | ADMIN, MANAGER, STAFF | Get by company (partial match) |
| POST | `/lease/update` | Yes | ADMIN, MANAGER, STAFF | Update lease |
| PUT | `/lease/updateStatus?leaseId=&status=` | Yes | ADMIN, MANAGER, STAFF | Update status |

---

## 12. Customer (`/customer`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/customer/saveWithPaymentOption` | Yes | ADMIN, MANAGER, STAFF | Save customer + Lease OR Cash |
| GET | `/customer/getAllPage` | Yes | ADMIN, MANAGER, STAFF | Get all (paginated) |
| GET | `/customer/getByName?name=` | Yes | ADMIN, MANAGER, STAFF | Get by name |
| GET | `/customer/getByColor?colorOfVehicle=` | Yes | ADMIN, MANAGER, STAFF | Get by vehicle color |
| GET | `/customer/getByModel?modelId=` | Yes | ADMIN, MANAGER, STAFF | Get by model |
| GET | `/customer/getByPayment?paymentId=` | Yes | ADMIN, MANAGER, STAFF | Get by payment |
| POST | `/customer/update` | Yes | ADMIN, MANAGER, STAFF | Update customer |
| PUT | `/customer/updateStatus?customerId=&status=` | Yes | ADMIN, MANAGER, STAFF | Update status |
| POST | `/customer/approved?customerId=` | Yes | ADMIN, MANAGER, STAFF | Approve (status=complete) |
| POST | `/customer/return?customerId=` | Yes | ADMIN, MANAGER, STAFF | Return (status=return, stock +1) |

**Query params for getAllPage:** `pageNumber`, `pageSize`, `status`, `name`, `colorOfVehicle`, `modelId`, `paymentId`

**saveWithPaymentOption Body:**
```json
{
  "paymentOption": "lease" | "cash",
  ...customerFields,
  "leaseData": { ... } | "cashData": { ... }
}
```
- If `paymentOption === 'lease'`: include `leaseData` (companyName, purchaseOrderNumber, copyOfNic, photographOne, photographTwo, paymentReceipt, mta2, mta3, chequeNumber, etc.)
- If `paymentOption === 'cash'`: include `cashData` (copyOfNic, photographOne, photographTwo, paymentReceipt, mta2, slip, chequeNumber, etc.)
- Creates Customer, deducts stock.quantity by 1, status=pending

---

## 13. Dealer Consignment Note (`/dealerConsignmentNote`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/dealerConsignmentNote/save` | Yes | ADMIN, MANAGER, STAFF | Save note (header + items) |
| GET | `/dealerConsignmentNote/getAllPage` | Yes | ADMIN, MANAGER, STAFF | Get all (paginated) |
| GET | `/dealerConsignmentNote/getByDealerCode?dealerCode=` | Yes | ADMIN, MANAGER, STAFF | Get by dealer code |
| GET | `/dealerConsignmentNote/getByDealerName?dealerName=` | Yes | ADMIN, MANAGER, STAFF | Get by dealer name |
| GET | `/dealerConsignmentNote/getByConsignmentNoteNo?consignmentNoteNo=` | Yes | ADMIN, MANAGER, STAFF | Get by consignment note no |
| POST | `/dealerConsignmentNote/update` | Yes | ADMIN, MANAGER, STAFF | Update note (header + items) |
| PUT | `/dealerConsignmentNote/updateStatus?noteId=&status=` | Yes | ADMIN, MANAGER, STAFF | Update status |

**Query params for getAllPage:** `pageNumber`, `pageSize`, `status`, `dealerCode`, `dealerName`, `consignmentNoteNo`

---

## 14. Shop Details (`/shopDetails`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/shopDetails/save` | Yes | ADMIN, MANAGER, STAFF | Save shop detail |
| GET | `/shopDetails/getAll` | Yes | ADMIN, MANAGER, STAFF | Get all |
| POST | `/shopDetails/update` | Yes | ADMIN, MANAGER, STAFF | Update shop detail |
| PUT | `/shopDetails/updateStatus?shopId=&status=` | Yes | ADMIN, MANAGER, STAFF | Update status |

---

## 15. Courier (`/courier`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/courier/save` | Yes | ADMIN, MANAGER, STAFF | Save courier |
| POST | `/courier/received` | Yes | ADMIN, MANAGER, STAFF | Mark as received |
| POST | `/courier/update` | Yes | ADMIN, MANAGER, STAFF | Update courier |
| PUT | `/courier/updateStatus?courierId=&status=` | Yes | ADMIN, MANAGER, STAFF | Update status |
| GET | `/courier/getByCategoryId?categoryId=` | Yes | ADMIN, MANAGER, STAFF | Get by category |
| GET | `/courier/getByCustomerId?customerId=` | Yes | ADMIN, MANAGER, STAFF | Get by customer |
| GET | `/courier/getByName?name=` | Yes | ADMIN, MANAGER, STAFF | Get by name |
| GET | `/courier/getByReceiverName?receivername=` | Yes | ADMIN, MANAGER, STAFF | Get by receiver name |

**received Body:** `{ courierId (or id), receivedDate, receivername, nic }`

---

## 16. Transfer (`/transfer`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/transfer/save` | Yes | ADMIN, MANAGER, STAFF | Save transfer |
| POST | `/transfer/update` | Yes | ADMIN, MANAGER, STAFF | Update transfer |
| PUT | `/transfer/updateStatus?transferId=&status=` | Yes | ADMIN, MANAGER, STAFF | Update status |
| GET | `/transfer/getByStockId?stockId=` | Yes | ADMIN, MANAGER, STAFF | Get by stock |
| GET | `/transfer/getByCompanyName?companyName=` | Yes | ADMIN, MANAGER, STAFF | Get by company |
| GET | `/transfer/getByUserId?userId=` | Yes | ADMIN, MANAGER, STAFF | Get by user |
| GET | `/transfer/getByReceiverName?receiverName=` | Yes | ADMIN, MANAGER, STAFF | Get by receiver name |

---

## Route Summary

| Route | Prefix |
|-------|--------|
| User | `/user` |
| Auth (Password Reset) | `/auth` |
| User Role | `/userRole` |
| User Logs | `/userLogs` |
| Category | `/category` |
| Model | `/model` |
| Stock | `/stock` |
| Payment | `/payment` |
| Upload | `/api/upload` |
| Cash | `/cash` |
| Lease | `/lease` |
| Customer | `/customer` |
| Dealer Consignment Note | `/dealerConsignmentNote` |
| Shop Details | `/shopDetails` |
| Courier | `/courier` |
| Transfer | `/transfer` |

---

## Database Schema

See `docs/MODELS_TABLES.md` for full table schema and associations.
