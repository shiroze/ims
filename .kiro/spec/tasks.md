# Tasks - IMS Development

## Phase 1: Foundation (Week 1-2)
  - [ ] Project setup and configuration
  - [ ] Initialize Next.js project
  - [ ] Setup TypeORM with MySql
  - [ ] Configure NextAuth.js
  - [ ] Setup Tailwind CSS and Mantine UI
  - [ ] Configure ESLint and Prettier
  - [ ] Database design
  - [ ] Design complete database schema
  - [ ] Create TypeORM entities
  - [ ] Setup migrations
  - [ ] Seed initial data
  - [ ] Authentication & Authorization
  - [ ] Implement login/logout (username & password)
  - [ ] Implement role-based access control (IsAdd, IsView,IsDelete)
  - [ ] Check folder "libs/api/permission" can be used for permission control ? (haspermission, matchpermission)
  - [ ] Create user management UI

## Phase 2: Chart of Accounts (Week 3-4)
  - [ ] Backend API Located "src/app/api/v1"
  - [ ] Create CRUD endpoints for accounts
  - [ ] Implement account hierarchy (can be used for 3 levels)
  - [ ] Build journal entry endpoints
  - [ ] Create general ledger queries
  - [ ] Frontend UI
  - [ ] Account listing page
  - [ ] Account creation/edit form
  - [ ] Account tree view
  - [ ] Journal entry form
  - [ ] General ledger view

## Phase 3: Product Module (Week 5-6)
  - [ ] Product Management
  - [ ] Create CRUD endpoints for products
  - [ ] Product listing with filters
  - [ ] Product creation/edit form
  - [ ] Product category management
  - [ ] Product unit of measure management
  - [ ] Product barcode management
  - [ ] Product SKU management

## Phase 3: Business Partners Module (Week 5-6)
  - [ ] Business Partners Management (Separate by bp_type customer,vendor,both)
  - [ ] Business Partners CRUD endpoints
  - [ ] Business Partners listing with filters
  - [ ] Business Partners creation/edit form

## Phase 3: Purchase Module (Week 5-6)
  - [ ] Purchase Orders
  - [ ] PO CRUD endpoints
  - [ ] PO creation form
  - [ ] PO listing with filters
  - [ ] GRPO & Purchase Invoice
  - [ ] GRPO creation from PO
  - [ ] Goods receipt processing
  - [ ] Stock update integration
  - [ ] Convert GRPO to invoice

## Phase 4: Sales Module (Week 7-8)
  - [ ] Sales Orders
  - [ ] SO CRUD endpoints
  - [ ] SO creation form
  - [ ] SO listing with filters
  - [ ] DO & Sales Invoice
  - [ ] DO creation from SO
  - [ ] Delivery processing
  - [ ] Stock update integration
  - [ ] Convert DO to invoice

## Phase 5: Stock Management (Week 9-10)
  - [ ] Warehouse Setup
  - [ ] Warehouse CRUD endpoints
  - [ ] Warehouse management UI
  - [ ] Inventory Tracking
  - [ ] Stock movement tracking
  - [ ] Real-time inventory updates
  - [ ] Barcode/SKU management
  - [ ] Valuation Methods
  - [ ] Implement FIFO calculation
  - [ ] Implement LIFO calculation
  - [ ] Implement AVG calculation
  - [ ] Valuation method selector
  - [ ] Stock Operations
  - [ ] Stock adjustment form
  - [ ] Stock transfer between warehouses
  - [ ] Minimum stock alerts
  - [ ] Inventory reports

## Phase 6: Account Receivable/Payable (Week 11-12)
  - [ ] Account Receivable
  - [ ] Customer invoice tracking
  - [ ] Payment recording
  - [ ] Aging reports
  - [ ] Credit memo management
  - [ ] Account Payable
  - [ ] Vendor bill tracking
  - [ ] Payment recording
  - [ ] Aging reports
  - [ ] Debit memo management
  - [ ] Reconciliation
  - [ ] Payment reconciliation UI
  - [ ] Bank statement import

## Phase 7: Reporting & Dashboard (Week 13-14)
  - [ ] Dashboard
  - [ ] Key metrics cards
  - [ ] Sales/Purchase charts
  - [ ] Inventory status widgets
  - [ ] Recent activities feed
  - [ ] Financial Reports
  - [ ] Balance sheet
  - [ ] Income statement
  - [ ] Cash flow statement
  - [ ] Trial balance
  - [ ] Operational Reports
  - [ ] Inventory valuation report
  - [ ] Stock movement report
  - [ ] Sales analysis
  - [ ] Purchase analysis
  - [ ] Export Functionality
  - [ ] PDF export
  - [ ] Excel export
  - [ ] Email reports

## Phase 8: Testing & Deployment (Week 15-16)
  - [ ] Testing
  - [ ] Unit tests
  - [ ] Integration tests
  - [ ] E2E tests
  - [ ] Performance testing
  - [ ] Security audit
  - [ ] Documentation
  - [ ] API documentation
  - [ ] User manual
  - [ ] Admin guide
  - [ ] Deployment
  - [ ] Setup CI/CD pipeline
  - [ ] Configure production environment
  - [ ] Deploy to production
  - [ ] Post-deployment verification