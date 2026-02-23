# Transfer & Dealer Invoice - Form Fields (Backend Based)

## Transfer Form (`/transfer`)

Backend: `models/Transfer.js`, `POST /transfer/save`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **stockId** | number | Yes | Stock ID - select from available stocks (with qty > 0) |
| **userId** | number | Yes | Logged-in user ID (auto from auth) |
| **quantity** | number | No | Default 1 - reduces stock by this amount |
| **companyName** | string | Yes | Company/Receiver name |
| **contactNumber** | number | No | Contact number |
| **address** | string | Yes | Delivery address |
| **deliveryDetails** | string | Yes | Delivery instructions/details |

---

## Dealer Invoice (Consignment Note) Form (`/dealer-invoice`)

Backend: `models/DealerConsignmentNote.js`, `DealerConsignmentNoteItem.js`, `POST /dealerConsignmentNote/save`

### Header Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **dealerCode** | string | Yes | Dealer code |
| **dealerName** | string | Yes | Dealer name |
| **address** | string | No | Dealer address |
| **consignmentNoteNo** | string | Yes | Consignment note number |
| **date** | string (DATEONLY) | No | Note date |
| **deliveryMode** | string | No | e.g. Truck, Van |
| **vehicleNo** | string | No | Vehicle number |
| **references** | string | No | References |
| **contactPerson** | string | No | Contact person name |

### Items (Array)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **modelId** | number | Yes | Model ID - select from models |
| **stockId** | number | No | Stock ID - if null, backend creates/updates stock by model |
| **itemCode** | string | No | Item code |
| **chassisNumber** | string | No | Chassis number |
| **motorNumber** | string | No | Motor number |
| **color** | string | No | Color |
| **quantity** | number | No | Default 1 - increases stock |
