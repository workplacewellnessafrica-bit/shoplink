# ShopLink User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Business Owner Guide](#business-owner-guide)
3. [POS System Guide](#pos-system-guide)
4. [Customer Guide](#customer-guide)
5. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Creating Your Business

1. Visit the ShopLink landing page and click **"Start Selling"**
2. Authenticate with your Manus account
3. Complete the **5-step onboarding wizard:**
   - **Welcome:** Review platform features
   - **Basic Info:** Enter business name, description, and WhatsApp number
   - **Feature Selection:** Choose which features to enable (POS, OTP portal, etc.)
   - **Customization:** Upload logo and cover image
   - **Review:** Confirm all details and activate your store

4. Your storefront is now live at `shoplink-nwqhx2ut.manus.space/store/[your-slug]`

---

## Business Owner Guide

### Admin Panel

Access your admin panel after login. Here you can:

#### Product Management

**Add a Product:**
1. Click **"Add Product"** in the admin panel
2. Enter product details:
   - **Name:** Product name
   - **Description:** Product details
   - **Price:** Selling price
   - **Stock:** Initial quantity
   - **Code:** Barcode/SKU (optional, used for POS scanning)
   - **Image:** Upload product photo (stored in S3)
3. Click **"Save"** — product appears immediately on your storefront

**Edit a Product:**
1. Click the product in your product list
2. Modify any details
3. Click **"Update"**

**Delete a Product:**
1. Click the product
2. Click **"Delete"** and confirm

**Bulk Actions:**
- Use the inventory management interface to adjust stock levels in bulk
- Set low-stock alerts to be notified when inventory drops below a threshold

#### Order Management

**View Orders:**
1. Click **"Orders"** in the admin panel
2. See all orders with customer details, items, and status
3. Click an order to view full details

**Update Order Status:**
1. Click an order
2. Change status from: Pending → Confirmed → Processing → Shipped → Delivered
3. Click **"Update"** — customer is notified via WhatsApp

**Handle Cancellations:**
1. Click an order
2. Select status **"Cancelled"**
3. Inventory is automatically restored

#### Analytics & Reporting

**View Dashboard:**
1. Click **"Analytics"** in the admin panel
2. See:
   - Total revenue (today, this week, this month)
   - Top-selling products
   - Sales by payment method (Cash, M-Pesa, Card, Credit)
   - Order trends

**Export Reports:**
1. Click **"Export"** in analytics
2. Choose format: **Excel** or **PDF**
3. Select date range
4. Download report

#### Settings

**Update Business Profile:**
1. Click **"Settings"** → **"Business Profile"**
2. Edit:
   - Business name
   - Description
   - WhatsApp number
   - Logo and cover image
3. Click **"Save"**

**Manage Attendants:**
1. Click **"Settings"** → **"Attendants"**
2. **Add attendant:** Enter name, email, and role (Attendant/Accountant/Manager)
3. **Edit attendant:** Click attendant and modify details
4. **Remove attendant:** Click attendant and click **"Delete"**

**Role Permissions:**
- **Attendant:** Can operate POS, view their own sales
- **Accountant:** Can view all sales, export reports, access reconciliation
- **Manager:** Can manage attendants and inventory

---

## POS System Guide

### Accessing POS

**Web POS:**
1. From admin panel, click **"Tools"** → **"POS"**
2. You're in the web-based POS system

**Mobile POS (Android):**
1. Click **"Tools"** → **"POS Download"**
2. Download the Android APK
3. Install on your Android device
4. Login with your business credentials

**Desktop POS (Windows):**
1. Click **"Tools"** → **"POS Download"**
2. Download the Windows installer
3. Install on your computer
4. Login with your business credentials

### Using POS

#### Quick Sale (Mobile POS)

1. **Select Category:** Tap emoji/image categories to browse products
2. **Add to Cart:** Tap a product to add it (quantity appears in cart badge)
3. **Adjust Quantity:** Tap the cart badge to modify quantities
4. **Checkout:** Click **"Checkout"**
5. **Payment:** Select payment method (Cash, M-Pesa, Card, Credit)
6. **Complete:** Transaction is saved, inventory updated

#### Search by Code (All POS)

1. Click **"Search by Code"** or scan barcode
2. Enter product code/barcode
3. Product appears in results
4. Click to add to cart

#### Full Checkout (Desktop POS)

1. **Add Items:** Search by code or category
2. **View Cart:** See all items with prices and totals
3. **Payment Details:**
   - Select payment method
   - Enter amount received (for cash)
   - System calculates change
4. **Attendant Assignment:** Select which attendant made the sale (for multi-staff tracking)
5. **Complete Sale:** Click **"Complete"**
6. **Receipt:** Print or email receipt

#### Day-End Reconciliation

1. Click **"Day-End Reconciliation"** in POS
2. **Enter totals for each payment method:**
   - Cash at hand
   - M-Pesa total
   - Card total
   - Credits issued
   - Expenditures (e.g., supplies, cash withdrawals)
3. **Verify Balance:**
   - System calculates: Opening Balance + Sales - Expenditures = Expected Closing Balance
   - Confirm it matches your physical count
4. **Close Day:** Click **"Close Day"** — reconciliation is locked and archived

#### Analytics (Desktop POS)

1. Click **"Analytics"** tab
2. View:
   - Today's sales by payment method
   - Top-selling products
   - Transaction history with attendant names
   - Revenue trends

### Barcode Management

**Generate Barcodes:**
1. In admin panel, click **"Products"**
2. Click a product
3. Click **"Generate Barcode"**
4. Choose format: Code128 or EAN13
5. Click **"Print"** to print barcode labels

**Scan Barcodes:**
1. In POS, click **"Scan Barcode"**
2. Allow camera access
3. Point camera at barcode
4. Product is automatically added to cart

---

## Customer Guide

### Browsing & Shopping

**Find a Store:**
1. Visit ShopLink landing page
2. Click **"Explore Stores"**
3. Browse all registered businesses
4. Click a business to view their storefront

**Browse Products:**
1. On storefront, scroll through product catalog
2. Click a product for details
3. Click **"Add to Cart"**

**Manage Cart:**
1. Click cart icon (top-right)
2. Adjust quantities or remove items
3. See total price

### Checkout

**Via WhatsApp:**
1. Click **"Checkout"**
2. Enter your details:
   - Name
   - Phone number
   - Delivery address
3. Select payment method
4. Click **"Send to WhatsApp"**
5. Your cart is sent to the business WhatsApp
6. Business confirms order and arranges delivery

### Order Tracking

**View Your Orders:**
1. Click **"My Orders"** (top-right)
2. Enter your phone number
3. Enter your password (set during first order)
4. View all your orders with status and tracking info

**Order Status:**
- **Pending:** Order received, awaiting confirmation
- **Confirmed:** Business confirmed your order
- **Processing:** Order is being prepared
- **Shipped:** Order is on the way
- **Delivered:** Order received

---

## Troubleshooting

### Common Issues

**Q: My product isn't showing on the storefront**
- A: Check that stock > 0. Products with 0 stock are hidden.

**Q: Barcode scanner isn't working**
- A: Ensure you've granted camera permissions. Try scanning in good lighting.

**Q: OTP isn't arriving**
- A: Check your WhatsApp number is correct. Wait 1 minute before retrying. Check spam folder.

**Q: Inventory isn't updating after POS sale**
- A: Inventory updates automatically. Refresh the page to see changes.

**Q: Can't login to POS**
- A: Ensure you're using your business owner credentials, not customer credentials.

**Q: Day-end reconciliation won't close**
- A: Verify your balance matches the system calculation. Check all payment method totals.

### Getting Help

- **In-app help:** Click **"?"** icon in any page
- **Contact support:** Email support@shoplink.local
- **Report a bug:** Use the **"Report Issue"** button in Settings

---

## Security Best Practices

1. **Protect Your Password:** Never share your admin password
2. **Attendant Access:** Review attendant permissions regularly
3. **Reconciliation:** Always verify day-end reconciliation before closing
4. **Backups:** Export reports regularly for your records
5. **Device Sessions:** Logout from POS devices when not in use

---

## FAQ

**Q: Can I have multiple businesses on ShopLink?**
- A: Currently, one business per Manus account. Contact support for enterprise accounts.

**Q: What payment methods do you support?**
- A: Cash, M-Pesa, Card, and Credit (configurable per business).

**Q: Can customers pay online?**
- A: Currently, checkout is via WhatsApp. Online payments are planned for a future release.

**Q: Is there a mobile app for customers?**
- A: Customers access ShopLink via web browser. Native apps are planned.

**Q: How do I export my data?**
- A: Use the **"Export"** button in analytics to download Excel or PDF reports.

**Q: Can I integrate with my existing POS?**
- A: ShopLink provides its own POS system. API documentation is available for custom integrations.

---

## Glossary

- **Storefront:** Your public shop page where customers browse and buy
- **POS:** Point of Sale system for in-store transactions
- **OTP:** One-Time Password sent via WhatsApp for customer authentication
- **Reconciliation:** Daily balance verification of cash and payment methods
- **Attendant:** Staff member who operates POS
- **Accountant:** Staff member who can view sales and export reports
- **SKU:** Stock Keeping Unit (product code for inventory tracking)

---

Last updated: April 2026
