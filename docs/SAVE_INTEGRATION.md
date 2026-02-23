# Customer Save - Frontend ↔ Backend Integration

## API: POST /customer/saveWithPaymentOption

### Customer Data Sheet → Backend Customer

| Frontend (formData)        | Backend (customerFields) | Notes                    |
|---------------------------|--------------------------|--------------------------|
| nameInFull                 | name                     | Required                 |
| address                    | address                  | '-' if empty             |
| province                   | province                 | '-' if empty             |
| district                   | district                 | '-' if empty             |
| occupation                 | occupation               | '-' if empty             |
| religion                   | religion                 | '-' if empty             |
| nicOrBusinessRegNo         | nic                      | '-' if empty             |
| contactNumber              | contactNumber            | INTEGER, parseNum        |
| whatsAppNumber             | whatsappNumber           | INTEGER, parseNum        |
| dateOfBirth                | dateOfBirth              | DATEONLY                 |
| model (from bikeModels)    | modelId                  | Lookup via getModelsPage |
| chassisNumber              | chassisNumber            | '-' if empty             |
| motorNumber                | motorNumber              | '-' if empty             |
| colourOfVehicle            | colorOfVehicle           | '-' if empty             |
| dateOfPurchase             | dateOfPurchase           | DATEONLY                 |
| aimaCareLoyaltyCardNo      | loyalityCardNo           | INTEGER, parseNum        |
| dateOfDeliveryToCustomer   | dateOfDelivery           | DATEONLY                 |
| sellingPrice               | sellingAmount            | parseFloat               |
| registrationFee            | registrationFees         | parseFloat               |
| advancePaymentAmount       | advancePaymentAmount     | parseFloat               |
| advancePaymentDate         | advancePaymentDate       | Backend defaults to today if empty |
| balancePaymentAmount       | balancePaymentAmount     | Auto-calculated          |
| balancePaymentDate         | balancePaymentDate       |                          |
| paymentType                | paymentId                | Lookup via getPaymentByName |

### Cash Form → Backend Cash

| Frontend (cashFormData) | Backend (cashData) | Notes              |
|-------------------------|--------------------|--------------------|
| copyOfNic               | copyOfNic          | upload path/URL    |
| photographOne           | photographOne      | upload path/URL    |
| photographTwo           | photographTwo      | upload path/URL    |
| paymentReceipt          | paymentReceipt     | upload path/URL    |
| mta2                    | mta2               | upload path/URL    |
| slip                    | slip               | upload path/URL    |
| chequeNumber            | chequeNumber       | INTEGER, parseNum  |

### Lease Form → Backend Lease

| Frontend (leaseFormData) | Backend (leaseData) | Notes              |
|-------------------------|---------------------|--------------------|
| companyName             | companyName         | upload path or text|
| purchaseOrderNumber     | purchaseOrderNumber | INTEGER, parseNum  |
| copyOfNic               | copyOfNic           | upload path/URL    |
| photographOne           | photographOne       | upload path/URL    |
| photographTwo           | photographTwo       | upload path/URL    |
| paymentReceipt          | paymentReceipt      | upload path/URL    |
| mta2                    | mta2                | upload path/URL    |
| mta3                    | mta3                | upload path/URL    |
| chequeNumber            | chequeNumber        | INTEGER, parseNum  |

## Prerequisites (Backend)

- **Models** in DB (e.g. AIMA Maverick, AIMA Mana) - from model/getAllPage
- **Payments** in DB (Cash, Bank Draft, Cheque, Online, Credit Card) - from payment/getByName
- **Stock** with quantity > 0 for selected model+color

## Flow

1. User fills Customer Data Sheet → Next
2. User selects Cash or Lease
3. User fills Cash/Lease form (uploads + cheque/PO number)
4. Save → POST /customer/saveWithPaymentOption
5. Backend: creates Customer, Cash or Lease, reduces Stock by 1
