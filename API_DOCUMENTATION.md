# ShopLink API Documentation

## Overview

ShopLink is a multi-tenant e-commerce platform with integrated POS system. All APIs are exposed via tRPC with end-to-end type safety.

---

## Authentication

All endpoints require Manus OAuth authentication. The current user context is available via `ctx.user`.

**Public endpoints:** `publicProcedure` — no authentication required  
**Protected endpoints:** `protectedProcedure` — requires authentication  
**Admin endpoints:** `adminProcedure` — requires admin role

---

## Business Management

### `business.getMine`
Get the current user's business profile.

**Type:** Query (Protected)  
**Returns:** `Business | null`

```typescript
const { data: business } = trpc.business.getMine.useQuery();
```

### `business.update`
Update business profile (name, description, logo, cover, WhatsApp number).

**Type:** Mutation (Protected)  
**Input:**
```typescript
{
  name?: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  whatsappNumber?: string;
}
```

**Returns:** `Business`

---

## Products

### `product.listMine`
List all products for the current business.

**Type:** Query (Protected)  
**Returns:** `Product[]`

### `product.listByBusiness`
List products for a specific business (public).

**Type:** Query (Public)  
**Input:** `{ businessSlug: string }`  
**Returns:** `Product[]`

### `product.create`
Create a new product.

**Type:** Mutation (Protected)  
**Input:**
```typescript
{
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  code?: string;
}
```

**Returns:** `Product`

### `product.update`
Update product details.

**Type:** Mutation (Protected)  
**Input:**
```typescript
{
  id: number;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
  code?: string;
}
```

**Returns:** `Product`

### `product.delete`
Delete a product.

**Type:** Mutation (Protected)  
**Input:** `{ id: number }`  
**Returns:** `{ success: boolean }`

---

## Orders

### `order.create`
Create a new order (web storefront checkout).

**Type:** Mutation (Public)  
**Input:**
```typescript
{
  businessId: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: { productId: number; quantity: number }[];
  paymentMethod: "cash" | "mpesa" | "card" | "credit";
  notes?: string;
}
```

**Returns:** `Order`

### `order.list`
List all orders for a business.

**Type:** Query (Protected)  
**Returns:** `Order[]`

### `order.updateStatus`
Update order status.

**Type:** Mutation (Protected)  
**Input:**
```typescript
{
  id: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
}
```

**Returns:** `Order`

---

## OTP & Customer Authentication

### `otp.send`
Send OTP to customer phone via WhatsApp.

**Type:** Mutation (Public)  
**Input:** `{ phone: string }`  
**Returns:** `{ success: boolean; message: string }`

### `otp.verify`
Verify OTP and create/authenticate customer.

**Type:** Mutation (Public)  
**Input:**
```typescript
{
  phone: string;
  otpCode: string;
  password?: string; // For first-time signup
}
```

**Returns:** `{ customerId: number; isNewCustomer: boolean }`

### `customer.login`
Login customer with phone and password.

**Type:** Mutation (Public)  
**Input:**
```typescript
{
  phone: string;
  password: string;
}
```

**Returns:** `{ customerId: number }`

### `customer.myOrders`
Get order history for authenticated customer.

**Type:** Query (Protected)  
**Returns:** `Order[]`

---

## POS System

### `pos.searchByCode`
Search products by code for POS.

**Type:** Query (Protected)  
**Input:** `{ code: string }`  
**Returns:** `Product | null`

### `pos.getPopularItems`
Get popular items based on sales history.

**Type:** Query (Protected)  
**Returns:** `{ productId: number; name: string; sales: number }[]`

### `pos.checkout`
Complete POS transaction and deduct inventory.

**Type:** Mutation (Protected)  
**Input:**
```typescript
{
  businessId: number;
  attendantId?: number;
  items: { productId: number; quantity: number }[];
  paymentMethod: "cash" | "mpesa" | "card" | "credit";
  notes?: string;
}
```

**Returns:** `{ transactionId: number; totalAmount: number }`

---

## Barcode Management

### `barcode.generate`
Generate barcode for a product.

**Type:** Mutation (Protected)  
**Input:**
```typescript
{
  productId: number;
  format?: "code128" | "ean13"; // Default: code128
}
```

**Returns:** `{ barcodeValue: string; barcodeImage: string }`

### `barcode.scan`
Lookup product by barcode.

**Type:** Query (Public)  
**Input:** `{ barcode: string }`  
**Returns:** `Product | null`

---

## Day-End Reconciliation

### `reconciliation.create`
Create a new day-end reconciliation record.

**Type:** Mutation (Protected)  
**Input:**
```typescript
{
  businessId: number;
  date: string; // ISO date
  cashAtHand: number;
  mpesaTotal: number;
  cardTotal: number;
  credits: number;
  expenditures: number;
}
```

**Returns:** `Reconciliation`

### `reconciliation.verify`
Verify reconciliation balances.

**Type:** Mutation (Protected)  
**Input:**
```typescript
{
  id: number;
  openingBalance: number;
}
```

**Returns:** `{ verified: boolean; balanceMatch: boolean }`

### `reconciliation.close`
Close day-end reconciliation.

**Type:** Mutation (Protected)  
**Input:** `{ id: number }`  
**Returns:** `Reconciliation`

### `reconciliation.history`
Get reconciliation history for a business.

**Type:** Query (Protected)  
**Input:** `{ businessId: number; limit?: number }`  
**Returns:** `Reconciliation[]`

---

## Attendant Management

### `attendant.create`
Create a new attendant/staff member.

**Type:** Mutation (Protected)  
**Input:**
```typescript
{
  name: string;
  email?: string;
  role: "attendant" | "accountant" | "manager";
}
```

**Returns:** `Attendant`

### `attendant.list`
List all attendants for a business.

**Type:** Query (Protected)  
**Returns:** `Attendant[]`

### `attendant.update`
Update attendant details.

**Type:** Mutation (Protected)  
**Input:**
```typescript
{
  id: number;
  name?: string;
  email?: string;
  role?: "attendant" | "accountant" | "manager";
}
```

**Returns:** `Attendant`

### `attendant.delete`
Delete an attendant.

**Type:** Mutation (Protected)  
**Input:** `{ id: number }`  
**Returns:** `{ success: boolean }`

---

## Error Handling

All endpoints return standardized error responses:

```typescript
{
  code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "BAD_REQUEST" | "INTERNAL_SERVER_ERROR";
  message: string;
}
```

---

## Rate Limiting

- OTP sending: 1 per minute per phone number
- OTP verification: 3 attempts per OTP (then locked for 15 minutes)
- Admin PIN: 3 failed attempts triggers lockout

---

## Pagination

Endpoints returning lists support optional pagination:

```typescript
{
  limit?: number; // Default: 50, Max: 500
  offset?: number; // Default: 0
}
```

---

## Webhooks (Future)

Planned webhook events:
- `order.created`
- `order.status_changed`
- `inventory.low_stock`
- `reconciliation.closed`

---

## SDK Usage

### TypeScript/React

```typescript
import { trpc } from "@/lib/trpc";

// Query
const { data: products } = trpc.product.listMine.useQuery();

// Mutation
const createProduct = trpc.product.create.useMutation({
  onSuccess: (newProduct) => {
    console.log("Product created:", newProduct);
  },
  onError: (error) => {
    console.error("Error:", error.message);
  },
});

createProduct.mutate({
  name: "Product Name",
  description: "Description",
  price: 100,
  stock: 50,
  imageUrl: "https://...",
});
```

---

## Support

For API issues or questions, contact support@shoplink.local
