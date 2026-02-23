# Cash & Lease - Backend Model Field Mapping

## Cash (models/Cash.js)

| Backend Field   | Frontend Field   | Type   | Description                          |
|-----------------|------------------|--------|--------------------------------------|
| copyOfNic       | copyOfNic        | STRING | Copy of NIC/Driving License/Passport |
| photographOne   | photographOne   | STRING | Two Photographs - Photo 1            |
| photographTwo   | photographTwo   | STRING | Photograph 2                          |
| paymentReceipt  | paymentReceipt  | STRING | Copy of Payment Receipt               |
| mta2            | mta2            | STRING | Duty filled MTA 2 Form                |
| slip            | slip            | STRING | Cheque / Cash Deposit Slip            |
| chequeNumber    | chequeNumber    | INTEGER| Cheque Number (if Cheque)             |

## Lease (models/Lease.js)

| Backend Field        | Frontend Field        | Type   | Description                    |
|----------------------|-----------------------|--------|--------------------------------|
| companyName          | companyName           | STRING | Leasing Company Name           |
| purchaseOrderNumber  | purchaseOrderNumber   | INTEGER| Purchase Order Number          |
| copyOfNic            | copyOfNic             | STRING | Copy of NIC/Driving License    |
| photographOne        | photographOne         | STRING | Two Photographs - Photo 1      |
| photographTwo        | photographTwo         | STRING | Photograph 2                   |
| paymentReceipt       | paymentReceipt        | STRING | Copy of Payment Receipt        |
| mta2                 | mta2                  | STRING | Duty filled MTA 2 Form         |
| mta3                 | mta3                  | STRING | MTA 3 / Mortgage Bond          |
| chequeNumber         | chequeNumber          | INTEGER| Cheque No / Cash Deposit       |

All fields are optional (allowNull or nullable). Frontend sends these to `POST /customer/saveWithPaymentOption` as `cashData` or `leaseData`.
