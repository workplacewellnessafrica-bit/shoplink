# ShopLink – Project TODO

## Database Schema
- [x] businesses table (id, userId, name, slug, description, whatsappNumber, logoUrl, coverUrl, createdAt)
- [x] products table (id, businessId, name, description, price, stock, imageUrl, imageKey, isActive, createdAt)
- [x] customers table (id, name, phone, passwordHash, createdAt)
- [x] orders table (id, businessId, customerId, customerName, customerPhone, deliveryDetails, totalAmount, status, whatsappSent, createdAt)
- [x] orderItems table (id, orderId, productId, productName, productPrice, quantity, subtotal)

## Backend Routers
- [x] business router: create, update, getBySlug, getAll, getMyBusiness
- [x] product router: create, update, delete, list by business, get by id
- [x] order router: create order (deduct stock + save + trigger WhatsApp), list by business, update status
- [x] customer router: register (phone+name+password), login, getMyOrders

## Business Admin Panel
- [x] Business owner login via Manus OAuth
- [x] Dashboard overview (product count, order count, low stock alerts)
- [x] Store profile editor (name, slug, description, WhatsApp number, logo, cover image)
- [x] Product list with stock levels and low-stock indicators
- [x] Add product form (name, description, price, stock, image upload to S3)
- [x] Edit/delete product
- [x] Orders list with customer details and fulfillment status
- [x] Order status update (pending → processing → shipped → delivered)

## Public Storefront
- [x] Landing page listing all registered businesses with logos and links
- [x] Per-business storefront at /store/[slug]
- [x] Product grid with images, price, stock badge
- [x] Product detail modal/page
- [x] Shopping cart (add/remove/update quantity)
- [x] Checkout form (name, phone, delivery details)
- [x] WhatsApp checkout: send cart to business WhatsApp + save order to DB
- [x] Inventory auto-deduction on order placement
- [x] Order confirmation page

## Customer Portal
- [x] Customer registration (name, phone, password)
- [x] Customer login (phone + password)
- [x] Order history list with status badges
- [x] Order detail view (items, totals, delivery info)

## Design & Polish
- [x] Premium color palette and typography (Google Fonts: Inter + Playfair Display)
- [x] Responsive layout across all pages
- [x] Smooth transitions and micro-interactions
- [x] Loading skeletons and empty states
- [x] Low-stock badge on products (< 5 items)
- [x] Toast notifications for all actions
- [x] Vitest tests (14 passing)

## Phase 2: POS System & Enhanced Features

### Database Schema Additions
- [x] otp_verifications table (id, phone, otpCode, expiresAt, attempts, createdAt)
- [x] business_features table (id, businessId, featureName, isEnabled, createdAt) — tracks which features (POS, analytics) are enabled
- [x] attendants table (id, businessId, name, email, role, createdAt) — POS attendants and accountants
- [x] pos_transactions table (id, businessId, attendantId, items, totalAmount, paymentMethod, notes, createdAt)
- [x] day_end_reconciliation table (id, businessId, date, cashAtHand, mpesaTotal, cardTotal, credits, daysSales, expenditures, openingBalance, closingBalance, status, createdAt)
- [x] product_barcodes table (id, productId, barcodeValue, barcodeImage, createdAt)
- [x] device_sessions table (id, customerId, deviceId, lastAccessedAt, createdAt) — persistent device login

### Customer Portal Enhancements
- [ ] Separate /customer route (avoid collision with business flows)
- [ ] OTP-based login: phone → OTP verification → password setup (first time) or login (returning)
- [ ] Persistent device login (like Jumia) using device fingerprint
- [ ] Order history with status timeline
- [ ] Order tracking and details

### Business Admin Panel Refactor
- [ ] Separate /store route for business owners
- [ ] Feature selection during business signup (enable/disable POS)
- [ ] Multi-role support: owner, attendant, accountant
- [ ] Role-based dashboard (owner sees all, attendant sees sales, accountant sees reconciliation)
- [ ] Attendant management (add/remove/edit)

### POS System
- [ ] Product search by product code
- [ ] Popular items suggestion (based on sales history)
- [ ] Emoji/image button interface for mobile
- [ ] Calculator-like interface for quantity entry
- [ ] Add items to cart, adjust quantities
- [ ] Barcode generation for all products (Code128 format)
- [ ] Barcode scanning (mobile-compatible using camera)
- [ ] POS checkout: select payment method (cash, M-Pesa, card, credit)
- [ ] Real-time sales logging and inventory deduction
- [ ] Multi-attendant sales tracking (who made the sale)

### Day-End Reconciliation
- [ ] Daily sales summary by payment method
- [ ] Cash at hand input
- [ ] M-Pesa total tracking
- [ ] Card payments total
- [ ] Credits tracking
- [ ] Expenditures input
- [ ] Balance verification (opening + sales - expenditures = closing)
- [ ] Reconciliation status (pending, verified, closed)
- [ ] Excel export for accounting
- [ ] Historical reconciliation records

### OTP & Authentication
- [x] OTP generation and sending via WhatsApp
- [x] OTP verification with rate limiting
- [x] First-time password setup after OTP verification
- [x] Returning customer password verification
- [x] Device fingerprinting for persistent login

### Testing & Deployment
- [x] Unit tests for OTP, POS, reconciliation routers (31 tests passing)
- [ ] Integration tests for multi-role access control
- [ ] E2E tests for POS checkout flow
- [ ] Barcode generation and scanning tests
