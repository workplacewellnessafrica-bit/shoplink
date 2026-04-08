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
- [x] Separate /customer route (avoid collision with business flows)
- [x] OTP-based login: phone → OTP verification → password setup (first time) or login (returning)
- [x] Persistent device login (like Jumia) using device fingerprint
- [x] Order history with status timeline
- [x] Order tracking and details

### Business Admin Panel Refactor
- [x] Separate /store route for business owners
- [x] Feature selection during business signup (enable/disable POS)
- [x] Multi-role support: owner, attendant, accountant
- [x] Role-based dashboard (owner sees all, attendant sees sales, accountant sees reconciliation)
- [x] Attendant management (add/remove/edit)

### POS System
- [x] Product search by product code
- [x] Popular items suggestion (based on sales history)
- [x] Emoji/image button interface for mobile
- [x] Calculator-like interface for quantity entry
- [x] Add items to cart, adjust quantities
- [x] Barcode generation for all products (Code128 format)
- [x] Barcode scanning (mobile-compatible using camera)
- [x] POS checkout: select payment method (cash, M-Pesa, card, credit)
- [x] Real-time sales logging and inventory deduction
- [x] Multi-attendant sales tracking (who made the sale)

### Day-End Reconciliation
- [x] Daily sales summary by payment method
- [x] Cash at hand input
- [x] M-Pesa total tracking
- [x] Card payments total
- [x] Credits tracking
- [x] Expenditures input
- [x] Balance verification (opening + sales - expenditures = closing)
- [x] Reconciliation status (pending, verified, closed)
- [ ] Excel export for accounting
- [x] Historical reconciliation records

### OTP & Authentication
- [x] OTP generation and sending via WhatsApp
- [x] OTP verification with rate limiting
- [x] First-time password setup after OTP verification
- [x] Returning customer password verification
- [x] Device fingerprinting for persistent login

### Testing & Deployment
- [x] Unit tests for OTP, POS, reconciliation routers (31 tests passing)
- [x] Integration tests for multi-role access control
- [x] E2E tests for POS checkout flow
- [x] Barcode generation and scanning tests
