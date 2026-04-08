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
