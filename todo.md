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


## Phase 8: SMS Fallback for OTP Delivery

### Twilio Integration
- [ ] Install Twilio SDK
- [ ] Create Twilio SMS service helper
- [ ] Configure Twilio credentials via environment variables
- [ ] Implement error handling and retry logic

### OTP Delivery Strategy
- [ ] Modify OTP router to try WhatsApp first
- [ ] Fallback to SMS if WhatsApp fails
- [ ] Track delivery method in database
- [ ] Log delivery attempts and failures

### Testing
- [ ] Unit tests for SMS sending
- [ ] Integration tests for fallback scenarios
- [ ] Test WhatsApp success + SMS fallback
- [ ] Test both WhatsApp and SMS failures

### Documentation
- [ ] Update OTP flow documentation
- [ ] Add SMS configuration guide
- [ ] Document fallback strategy


## Phase 9: Critical Bug Fixes & Notifications

### User Authentication Issues
- [x] Fix logout button functionality
- [x] Implement user switching (logout and login as different user)
- [x] Add "Switch Account" option in settings
- [x] Clear session cookies on logout
- [x] Redirect to home after logout

### Business Setup & Onboarding
- [x] Fix business creation flow
- [x] Users logged in as customers cannot create business profiles
- [x] Add business setup wizard with step-by-step guidance
- [x] Implement feature selection (POS, Analytics, etc.)
- [ ] Add business profile completion checklist
- [ ] Validate required fields before allowing access to dashboard
- [ ] Add way to switch between customer and business modes

### Password Management
- [ ] Implement password recovery/reset feature
- [ ] Add "Forgot Password" link on login page
- [ ] Send password reset email with secure token
- [ ] Create password reset page
- [ ] Validate password reset token expiry
- [ ] Update password securely

### Business Notifications
- [x] Implement automatic email notifications on order placement
- [x] Send order details to business email
- [x] Include customer info, items, total amount in email
- [x] Implement automatic WhatsApp notifications on order placement
- [x] Send order summary to business WhatsApp number
- [ ] Add notification preferences in business settings
- [ ] Track notification delivery status

## Phase 10: Attendant Management & Mobile Layout

### Attendant/Team Management UI
- [x] Add "Team" tab to admin panel for managing attendants
- [x] Build invite attendant form (email, name, role selection)
- [x] Display list of invited/active attendants with roles
- [x] Implement role selection dropdown (admin, accountant, sales person, cashier)
- [ ] Add remove/edit attendant functionality
- [x] Show attendant status (pending invite, active, inactive)
- [ ] Create attendant invitation email template
- [ ] Implement attendant acceptance flow (email link → create account)
- [ ] Add role-based permissions display

### Mobile Layout Improvements
- [x] Fix Store Profile form layout on mobile (stack fields vertically)
- [ ] Improve responsive design for admin panel tabs
- [ ] Optimize product grid for small screens
- [x] Fix cramped spacing in store profile fields
- [ ] Test all admin pages on mobile viewport (375px width)
- [ ] Ensure buttons and inputs are touch-friendly (min 44px height)
- [ ] Improve form field spacing and labels on mobile

## Phase 11: Email, OTP, and WhatsApp Notifications

### Email Configuration
- [x] Set up SMTP credentials via webdev_request_secrets (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM)
- [ ] Test email sending with real SMTP provider (Gmail, SendGrid, or similar)
- [ ] Add business email field to business schema for order notifications
- [ ] Send order confirmation emails to customers
- [ ] Send order notification emails to business owners

### Attendant Invite Emails
- [x] Create attendant invite email template
- [x] Send invite email when attendant is created
- [ ] Implement email verification link with token
- [ ] Create attendant acceptance flow (email link → create account)

### OTP & SMS Configuration
- [x] Set up Twilio credentials via webdev_request_secrets (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
- [x] Test OTP delivery via WhatsApp (primary)
- [x] Test SMS fallback for OTP
- [x] Verify phone number normalization works correctly

### WhatsApp Notifications
- [ ] Fix WhatsApp order notification to use correct API function
- [ ] Test WhatsApp order notifications to business owners
- [ ] Test WhatsApp order notifications to customers
- [ ] Verify message formatting and content
- [ ] Add WhatsApp status tracking

### Testing & Validation
- [ ] Test complete order flow with notifications
- [ ] Verify all notification channels work (Email, WhatsApp, SMS)
- [ ] Check logs for notification delivery status
- [ ] Test error handling and fallbacks


## Phase 12: Business Signup and App Updates

### New Business Signup Flow
- [x] Fix OAuth callback to redirect new businesses to admin portal
- [x] Verify business creation after OAuth completes
- [x] Ensure redirect URL is correct for admin dashboard
- [ ] Test complete signup flow end-to-end
- [x] Add error handling for signup failures

### Android App Updates
- [ ] Update Android app with latest API endpoints
- [ ] Ensure OAuth flow works on mobile
- [ ] Test business signup on Android device
- [ ] Update app version and build number
- [ ] Publish updated Android app to Play Store

### Desktop App Updates
- [ ] Update Electron/Desktop app with latest endpoints
- [ ] Test business signup on desktop
- [ ] Update app version
- [ ] Publish updated desktop app


## Phase 13: Page Persistence and State Management

### Route Persistence
- [x] Save current route to localStorage on navigation
- [x] Restore route on page refresh
- [x] Persist admin panel tab selection
- [ ] Persist POS screen state
- [ ] Persist customer portal filters and search

### Session State Persistence
- [x] Save auth state to localStorage
- [x] Restore auth state on app load
- [ ] Persist user preferences (theme, language)
- [x] Clear persistence on logout

### Testing & Validation
- [ ] Test route persistence across all main pages
- [ ] Test tab persistence in admin panel
- [x] Verify state clears on logout
- [ ] Test on mobile and desktop browsers


## Phase 14: Currency Configuration (KSH)

### Currency Setup
- [x] Create currency configuration constants (KSH)
- [x] Add currency formatting utilities
- [x] Update all price displays to show KSH symbol and format
- [ ] Configure currency in database schema
- [ ] Update API responses with currency information

### Price Display Updates
- [x] Update product price displays
- [x] Update order total displays
- [x] Update cart price displays
- [x] Update payment method displays
- [x] Update analytics/reports with currency

### Testing & Validation
- [ ] Test price formatting across all pages
- [ ] Verify currency displays correctly on mobile
- [ ] Test with various price ranges
- [ ] Verify API responses include currency


## Phase 15: Product Variant Editor

### Database Schema Updates
- [x] Extend productVariants table with attributes (size, color, quality, origin, materials)
- [x] Add variant image support
- [x] Create migration for new variant fields

### Variant API Endpoints
- [x] Create endpoint to list variants for a product
- [x] Create endpoint to add variant
- [x] Create endpoint to update variant
- [x] Create endpoint to delete variant
- [x] Create endpoint to reorder variants

### Variant Editor UI
- [x] Build variant editor floating card component
- [x] Add size attribute input
- [x] Add color attribute input
- [x] Add quality attribute input
- [x] Add origin attribute input
- [x] Add materials attribute input
- [x] Add variant price and stock fields
- [x] Add variant image upload
- [x] Implement add/edit/delete variant actions

### Image Gallery
- [x] Build fullscreen image gallery component
- [x] Implement image zoom functionality
- [x] Add image navigation (prev/next)
- [x] Add close button for gallery
- [x] Integrate gallery with variant display

### Integration
- [x] Add Variants tab to product form
- [x] Show variants list under main product
- [x] Wire up variant editor to API
- [ ] Update Storefront to display variants
- [ ] Update POS to support variant selection

### Testing & Validation
- [ ] Test variant creation and editing
- [ ] Test image gallery fullscreen
- [ ] Test variant display in storefront
- [ ] Verify all attributes save correctly


## Bug Fixes

- [x] Fix variant creation database error - constraint violation when adding variant with attributes


## Phase 16: Variant Editor Improvements & Order Notifications

### Variant Creation Fixes
- [x] Fix price data type conversion (string to decimal)
- [x] Add field validation and guidelines to variant editor
- [x] Mark mandatory fields (Variant Name, Price, Stock) clearly
- [x] Mark optional fields with helper text
- [x] Add input format guidelines (e.g., "e.g., 100% Cotton, Polyester blend" for Materials)
- [ ] Improve error messages for failed variant creation

### Checkout Improvements
- [x] Clarify WhatsApp CTA button text: "Confirm Order on WhatsApp"
- [x] Add tooltip explaining WhatsApp is for order confirmation with business
- [x] Improve button styling to make it more prominent
- [x] Add order summary before WhatsApp redirect

### In-App Notifications
- [x] Create notifications table in database
- [ ] Add notification API endpoints (list, mark as read, delete)
- [ ] Add notification tab to customer portal
- [ ] Send notification when customer places order
- [ ] Send notification to business when order is placed
- [ ] Display notification bell icon with unread count
- [ ] Implement real-time notification updates via WebSocket
- [ ] Add notification preferences (email, SMS, in-app)

### Testing & Validation
- [ ] Test variant creation with all data types
- [ ] Test notification delivery for orders
- [ ] Verify field validation works correctly
- [ ] Test WhatsApp CTA clarity on mobile


## Phase 17: Bug Fixes & Sales Analytics

### Variant Creation Error
- [x] Debug variant creation database error from browser
- [x] Check server logs for SQL error details
- [x] Fix enum or data type mismatch in variant insertion
- [x] Verify all field types match schema

### Day Sales Analytics
- [ ] Add sales breakdown by channel (POS vs Web sales)
- [ ] Add POS sales breakdown by payment method (Credit, Card, Cash, M-Pesa)
- [ ] Display day sales in admin portal analytics
- [ ] Create sales summary card showing daily totals
- [ ] Add charts for sales trends by channel
- [ ] Test sales data aggregation


## Phase 18: Admin Controls & Team Management

### Day Sales Analytics
- [x] Create sales summary API endpoint with channel breakdown
- [x] Add sales breakdown by channel (POS vs Web)
- [x] Add POS sales breakdown by payment method (Credit, Card, Cash, M-Pesa)
- [ ] Display day sales in admin dashboard
- [ ] Add sales charts and graphs
- [ ] Implement date range filtering

### Attendant Access Control
- [ ] Add feature permission system for attendants
- [ ] Create role-based access control (admin, manager, sales, accountant, cashier)
- [ ] Allow admin to enable/disable features per attendant
- [ ] Show feature access matrix in admin panel
- [ ] Restrict POS access based on permissions
- [ ] Restrict dashboard access based on permissions

### Credential Management
- [ ] Generate login credentials for attendants
- [ ] Create temporary password system
- [ ] Allow password reset for attendants
- [ ] Add credential expiration tracking
- [ ] Create credential audit log
- [ ] Allow admin to revoke credentials

### Feature Testing
- [ ] Test variant creation and editing
- [ ] Test variant image gallery
- [ ] Test product display with variants
- [ ] Test POS system with variants
- [ ] Test order creation and notifications
- [ ] Test day sales analytics
- [ ] Test attendant login and access control
- [ ] Test mobile responsiveness
- [ ] Test WhatsApp integration
- [ ] Test email and SMS notifications
