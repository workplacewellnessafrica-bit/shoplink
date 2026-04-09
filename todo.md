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
- [x] Excel export for accounting
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


## Phase 3: Bug Fixes & Improvements

### Critical Fixes
- [x] Add logout button to settings page
- [x] Fix OTP verification flow and redirect to order history
- [x] Add email notifications on order placement
- [x] Add email notifications on POS checkout
- [x] Implement icon/emoji picker for POS mobile interface
- [x] Polish UI/UX for professional appearance
- [x] Verify all features work end-to-end


## Phase 4: POS Restructuring & Store Onboarding

### Store Onboarding Wizard
- [x] Onboarding flow for new businesses (feature selection, system setup)
- [x] Feature toggles: POS, Analytics, Inventory Management, Multi-attendant
- [x] Business customization: branding, payment methods, tax settings
- [x] Lean system loading based on selected features
- [x] Onboarding completion and dashboard redirect

### POS Download & Distribution
- [x] POS download page with mobile and desktop options
- [x] Mobile POS app (standalone, emoji-based categories, quick sale)
- [x] Desktop POS app (full features, analytics, reconciliation)
- [x] App version management and auto-updates
- [x] Offline capability for mobile POS

### Mobile POS Features (from prototype)
- [x] Emoji-based category selection
- [x] Quick sale interface with cart
- [x] Low-stock alerts with visual indicators
- [x] Transaction log with expandable details
- [x] Daily summary with revenue and top sellers
- [x] Admin PIN for sensitive operations

### Desktop POS Features
- [x] Full inventory management interface
- [x] Advanced analytics and reporting
- [x] Multi-attendant support with role management
- [x] Day-end reconciliation with detailed breakdown
- [x] Barcode scanning and product search
- [x] Export capabilities (CSV, PDF)


## Phase 5: Navigation Restructuring

### Landing Page Updates
- [x] Remove "List Your Business" button from home page
- [x] Update navigation to include Tools link

### Tools Page
- [x] Create Tools page with POS downloads and guidelines
- [x] POS download section (Android, Desktop/Windows)
- [x] Integration guidelines: web catalogue to POS inventory sync
- [x] Instructions for inventory linking between platforms
- [x] Desktop POS user access to store admin section

### Access Control
- [x] Desktop POS users can access /admin (store management)
- [x] Mobile POS users have read-only access
- [x] Implement role-based access control for store features


## Phase 6: Production Readiness & Advanced Features

### Desktop POS Enhancements
- [x] Barcode scanner integration (camera/decoder for product lookup)
- [x] Attendant session management (login/logout, sales attribution)
- [x] Inventory stock adjustment interface
- [x] Persisted analytics/reporting with date ranges
- [x] Day-end reconciliation workflow integration
- [x] CSV/PDF export for reports and transactions

### Backend Security & RBAC
- [x] Secure admin PIN storage (hashed, salted)
- [x] PIN attempt throttling and lockout (backend-enforced)
- [x] Role-based access control enforcement on all endpoints
- [x] Audit logging for admin actions
- [x] Session management for POS attendants

### Data Persistence & Sync
- [x] Persist transaction logs to database
- [x] Sync analytics data across sessions
- [x] Real-time inventory updates across POS instances
- [x] Offline mode with sync on reconnection

### Testing & Documentation
- [x] End-to-end tests for POS workflows
- [x] Integration tests for multi-role access
- [x] API documentation for POS endpoints
- [x] User guide for business owners and attendants


## Phase 7: Real-Time Inventory Synchronization

### WebSocket Infrastructure
- [x] Set up WebSocket server with ws library
- [x] Create inventory event broadcaster
- [x] Implement business-scoped subscriptions
- [x] Add connection pooling and memory management

### Inventory Sync Events
- [x] Broadcast inventory updates on product stock changes
- [x] Subscribe to inventory updates in frontend
- [x] Handle concurrent updates and race conditions
- [x] Implement optimistic updates on client

### Frontend Integration
- [x] Add useInventorySubscription hook
- [x] Update POS components to listen for stock changes
- [x] Update storefront to reflect real-time stock
- [x] Add visual indicators for stock changes

### Error Handling & Resilience
- [x] WebSocket reconnection logic with exponential backoff
- [x] Fallback to polling if WebSocket fails
- [x] Handle network interruptions gracefully
- [x] Sync state on reconnection

### Testing
- [x] Integration tests for WebSocket connections
- [x] Test concurrent inventory updates
- [x] Test reconnection scenarios
- [x] Test business isolation (no cross-business updates)
