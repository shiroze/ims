# Database Schema
```
-- Products/Items Master
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    category VARCHAR(100),
    unit VARCHAR(50), -- pcs, kg, liter, etc
    valuation_method VARCHAR(20), -- 'FIFO', 'LIFO', 'AVERAGE', NULL (use global)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company Settings
CREATE TABLE company_settings (
    id INT PRIMARY KEY DEFAULT 1,
    default_valuation_method VARCHAR(20) DEFAULT 'FIFO',
    currency VARCHAR(10) DEFAULT 'USD',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chart of Accounts
CREATE TABLE accounts (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    account_type VARCHAR(50), -- ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
    parent_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);

-- Journal Entries (Header)
CREATE TABLE journal_entries (
    id VARCHAR(50) PRIMARY KEY,
    entry_date DATE NOT NULL,
    trans_type VARCHAR(50) NOT NULL, -- PURCHASE, SALES, RETURN_PURCHASE, etc
    reference_id VARCHAR(50), -- Link to source document (PO, SO, etc)
    remarks TEXT,
    total_amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    INDEX idx_entry_date (entry_date),
    INDEX idx_trans_type (trans_type),
    INDEX idx_reference (reference_id)
);

-- Journal Entry Lines (Detail)
CREATE TABLE journal_entry_lines (
    id VARCHAR(50) PRIMARY KEY,
    journal_entry_id VARCHAR(50) NOT NULL,
    account_id VARCHAR(50) NOT NULL,
    debit DECIMAL(15,2) DEFAULT 0,
    credit DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id),
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    INDEX idx_journal_entry (journal_entry_id),
    INDEX idx_account (account_id)
);

-- Inventory Batches (for FIFO/LIFO tracking)
CREATE TABLE inventory_batches (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    batch_date TIMESTAMP NOT NULL,
    journal_entry_id VARCHAR(50), -- Link to purchase journal
    quantity DECIMAL(15,4) NOT NULL,
    remaining_quantity DECIMAL(15,4) NOT NULL,
    unit_cost DECIMAL(15,4) NOT NULL,
    total_cost DECIMAL(15,2) NOT NULL,
    is_closed BOOLEAN DEFAULT FALSE, -- TRUE when remaining = 0
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id),
    INDEX idx_product (product_id),
    INDEX idx_batch_date (batch_date),
    INDEX idx_closed (is_closed)
);

-- Inventory Movements (Detail tracking)
CREATE TABLE inventory_movements (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    journal_entry_id VARCHAR(50),
    batch_id VARCHAR(50), -- Which batch was affected
    movement_date TIMESTAMP NOT NULL,
    movement_type VARCHAR(20) NOT NULL, -- 'IN', 'OUT'
    quantity DECIMAL(15,4) NOT NULL,
    unit_cost DECIMAL(15,4),
    total_cost DECIMAL(15,2),
    balance_qty DECIMAL(15,4), -- Running balance
    balance_value DECIMAL(15,2), -- Running value
    valuation_method VARCHAR(20), -- Method used for this transaction
    remarks TEXT,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id),
    FOREIGN KEY (batch_id) REFERENCES inventory_batches(id),
    INDEX idx_product (product_id),
    INDEX idx_movement_date (movement_date),
    INDEX idx_journal (journal_entry_id)
);

-- Batch Usage (for COGS tracking in FIFO/LIFO)
CREATE TABLE batch_usage (
    id VARCHAR(50) PRIMARY KEY,
    movement_id VARCHAR(50) NOT NULL,
    batch_id VARCHAR(50) NOT NULL,
    quantity_used DECIMAL(15,4) NOT NULL,
    unit_cost DECIMAL(15,4) NOT NULL,
    total_cost DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (movement_id) REFERENCES inventory_movements(id),
    FOREIGN KEY (batch_id) REFERENCES inventory_batches(id),
    INDEX idx_movement (movement_id),
    INDEX idx_batch (batch_id)
);
```
# Useful Queries
```
-- 1. Current Stock by Product
SELECT 
    p.id,
    p.name,
    p.sku,
    COALESCE(SUM(im.quantity * CASE WHEN im.movement_type = 'IN' THEN 1 ELSE -1 END), 0) as current_qty,
    COALESCE(SUM(im.total_cost * CASE WHEN im.movement_type = 'IN' THEN 1 ELSE -1 END), 0) as current_value,
    CASE 
        WHEN SUM(im.quantity * CASE WHEN im.movement_type = 'IN' THEN 1 ELSE -1 END) > 0 
        THEN SUM(im.total_cost * CASE WHEN im.movement_type = 'IN' THEN 1 ELSE -1 END) / 
             SUM(im.quantity * CASE WHEN im.movement_type = 'IN' THEN 1 ELSE -1 END)
        ELSE 0 
    END as avg_cost
FROM products p
LEFT JOIN inventory_movements im ON p.id = im.product_id
WHERE p.is_active = TRUE
GROUP BY p.id, p.name, p.sku
HAVING current_qty > 0;

-- 2. Available Batches for FIFO/LIFO (active batches)
SELECT 
    ib.id,
    ib.product_id,
    p.name,
    ib.batch_date,
    ib.remaining_quantity,
    ib.unit_cost,
    ib.remaining_quantity * ib.unit_cost as remaining_value
FROM inventory_batches ib
JOIN products p ON ib.product_id = p.id
WHERE ib.is_closed = FALSE 
  AND ib.remaining_quantity > 0
ORDER BY ib.product_id, ib.batch_date ASC; -- ASC for FIFO, DESC for LIFO

-- 3. Inventory Valuation Report (by product)
SELECT 
    p.id,
    p.name,
    p.valuation_method,
    SUM(ib.remaining_quantity) as total_qty,
    SUM(ib.remaining_quantity * ib.unit_cost) as total_value,
    CASE 
        WHEN SUM(ib.remaining_quantity) > 0 
        THEN SUM(ib.remaining_quantity * ib.unit_cost) / SUM(ib.remaining_quantity)
        ELSE 0 
    END as weighted_avg_cost
FROM products p
LEFT JOIN inventory_batches ib ON p.id = ib.product_id AND ib.is_closed = FALSE
WHERE p.is_active = TRUE
GROUP BY p.id, p.name, p.valuation_method;

-- 4. Stock Movement History
SELECT 
    im.movement_date,
    p.name as product_name,
    im.movement_type,
    im.quantity,
    im.unit_cost,
    im.total_cost,
    im.balance_qty,
    im.balance_value,
    im.valuation_method,
    je.trans_type,
    je.reference_id
FROM inventory_movements im
JOIN products p ON im.product_id = p.id
LEFT JOIN journal_entries je ON im.journal_entry_id = je.id
WHERE im.product_id = ? -- filter by product
ORDER BY im.movement_date DESC, im.id DESC;

-- 5. COGS Detail by Sales Transaction
SELECT 
    je.id as journal_id,
    je.entry_date,
    je.reference_id,
    p.name as product_name,
    im.quantity as qty_sold,
    bu.batch_id,
    ib.batch_date,
    bu.quantity_used,
    bu.unit_cost,
    bu.total_cost
FROM journal_entries je
JOIN inventory_movements im ON je.id = im.journal_entry_id
JOIN products p ON im.product_id = p.id
JOIN batch_usage bu ON im.id = bu.movement_id
JOIN inventory_batches ib ON bu.batch_id = ib.id
WHERE je.trans_type = 'SALES'
  AND je.id = ? -- filter by journal entry
ORDER BY bu.batch_id;

-- 6. Inventory Aging Report (FIFO basis)
SELECT 
    p.id,
    p.name,
    ib.batch_date,
    DATEDIFF(CURRENT_DATE, ib.batch_date) as age_days,
    ib.remaining_quantity,
    ib.unit_cost,
    ib.remaining_quantity * ib.unit_cost as value,
    CASE 
        WHEN DATEDIFF(CURRENT_DATE, ib.batch_date) <= 30 THEN '0-30 days'
        WHEN DATEDIFF(CURRENT_DATE, ib.batch_date) <= 60 THEN '31-60 days'
        WHEN DATEDIFF(CURRENT_DATE, ib.batch_date) <= 90 THEN '61-90 days'
        ELSE 'Over 90 days'
    END as age_category
FROM inventory_batches ib
JOIN products p ON ib.product_id = p.id
WHERE ib.is_closed = FALSE 
  AND ib.remaining_quantity > 0
ORDER BY p.id, ib.batch_date;

-- 7. Trial Balance (Accounting)
SELECT 
    a.id,
    a.name,
    a.account_type,
    SUM(jel.debit) as total_debit,
    SUM(jel.credit) as total_credit,
    SUM(jel.debit) - SUM(jel.credit) as balance
FROM accounts a
LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
WHERE a.is_active = TRUE
GROUP BY a.id, a.name, a.account_type
HAVING balance != 0
ORDER BY a.account_type, a.id;

-- 8. Get Effective Valuation Method for a Product
SELECT 
    p.id,
    p.name,
    COALESCE(p.valuation_method, cs.default_valuation_method) as effective_method
FROM products p
CROSS JOIN company_settings cs
WHERE p.id = ?;
```
# Javascript Code
```
const { v4: uuidv4 } = require('uuid');

// ==================== CONFIGURATION ====================

class InventoryConfig {
  constructor(db) {
    this.db = db;
  }

  async getCompanySettings() {
    const [settings] = await this.db.query(
      'SELECT * FROM company_settings WHERE id = 1'
    );
    return settings || { default_valuation_method: 'FIFO' };
  }

  async getEffectiveValuationMethod(productId, transactionOverride = null) {
    // Priority: Transaction Override > Product Setting > Company Default
    if (transactionOverride) {
      return transactionOverride;
    }

    const [product] = await this.db.query(
      'SELECT valuation_method FROM products WHERE id = ?',
      [productId]
    );

    if (product && product.valuation_method) {
      return product.valuation_method;
    }

    const settings = await this.getCompanySettings();
    return settings.default_valuation_method;
  }
}

// ==================== VALUATION STRATEGIES ====================

class ValuationStrategy {
  static async calculateCOGS(db, productId, quantityToSell, method) {
    const strategies = {
      FIFO: this.calculateFIFO,
      LIFO: this.calculateLIFO,
      AVERAGE: this.calculateAverage
    };

    const calculator = strategies[method];
    if (!calculator) {
      throw new Error(`Unknown valuation method: ${method}`);
    }

    return await calculator.call(this, db, productId, quantityToSell);
  }

  static async calculateFIFO(db, productId, quantityToSell) {
    // Get batches ordered by oldest first
    const batches = await db.query(
      `SELECT id, batch_date, remaining_quantity, unit_cost 
       FROM inventory_batches 
       WHERE product_id = ? AND is_closed = FALSE AND remaining_quantity > 0
       ORDER BY batch_date ASC, id ASC`,
      [productId]
    );

    return this.processBatches(batches, quantityToSell);
  }

  static async calculateLIFO(db, productId, quantityToSell) {
    // Get batches ordered by newest first
    const batches = await db.query(
      `SELECT id, batch_date, remaining_quantity, unit_cost 
       FROM inventory_batches 
       WHERE product_id = ? AND is_closed = FALSE AND remaining_quantity > 0
       ORDER BY batch_date DESC, id DESC`,
      [productId]
    );

    return this.processBatches(batches, quantityToSell);
  }

  static async calculateAverage(db, productId, quantityToSell) {
    const [result] = await db.query(
      `SELECT 
        SUM(remaining_quantity * unit_cost) as total_value,
        SUM(remaining_quantity) as total_qty
       FROM inventory_batches 
       WHERE product_id = ? AND is_closed = FALSE AND remaining_quantity > 0`,
      [productId]
    );

    if (!result || result.total_qty === 0) {
      throw new Error(`No inventory available for product: ${productId}`);
    }

    const avgCost = result.total_value / result.total_qty;
    const totalCost = quantityToSell * avgCost;

    // For average, we still need to deduct from batches proportionally
    const batches = await db.query(
      `SELECT id, batch_date, remaining_quantity, unit_cost 
       FROM inventory_batches 
       WHERE product_id = ? AND is_closed = FALSE AND remaining_quantity > 0
       ORDER BY batch_date ASC`,
      [productId]
    );

    // Deduct proportionally from all batches
    const usedBatches = [];
    let remaining = quantityToSell;

    for (const batch of batches) {
      if (remaining <= 0) break;

      const qtyFromBatch = Math.min(remaining, batch.remaining_quantity);
      usedBatches.push({
        batchId: batch.id,
        batchDate: batch.batch_date,
        quantity: qtyFromBatch,
        unitCost: avgCost, // Use average cost, not batch cost
        totalCost: qtyFromBatch * avgCost
      });

      remaining -= qtyFromBatch;
    }

    return {
      totalCost,
      avgCost,
      usedBatches,
      availableQty: result.total_qty
    };
  }

  static processBatches(batches, quantityToSell) {
    let remaining = quantityToSell;
    let totalCost = 0;
    const usedBatches = [];
    let totalAvailable = 0;

    for (const batch of batches) {
      totalAvailable += batch.remaining_quantity;
    }

    if (totalAvailable < quantityToSell) {
      throw new Error(
        `Insufficient inventory. Required: ${quantityToSell}, Available: ${totalAvailable}`
      );
    }

    for (const batch of batches) {
      if (remaining <= 0) break;

      const qtyFromBatch = Math.min(remaining, batch.remaining_quantity);
      const costFromBatch = qtyFromBatch * batch.unit_cost;

      usedBatches.push({
        batchId: batch.id,
        batchDate: batch.batch_date,
        quantity: qtyFromBatch,
        unitCost: batch.unit_cost,
        totalCost: costFromBatch
      });

      totalCost += costFromBatch;
      remaining -= qtyFromBatch;
    }

    return {
      totalCost,
      usedBatches,
      availableQty: totalAvailable
    };
  }
}

// ==================== INVENTORY MANAGER ====================

class InventoryManager {
  constructor(db) {
    this.db = db;
  }

  async addStock(productId, quantity, unitCost, journalEntryId, batchDate = new Date()) {
    const batchId = uuidv4();
    const totalCost = quantity * unitCost;

    await this.db.query(
      `INSERT INTO inventory_batches 
       (id, product_id, batch_date, journal_entry_id, quantity, remaining_quantity, unit_cost, total_cost)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [batchId, productId, batchDate, journalEntryId, quantity, quantity, unitCost, totalCost]
    );

    // Get current balance
    const [lastMovement] = await this.db.query(
      `SELECT balance_qty, balance_value 
       FROM inventory_movements 
       WHERE product_id = ? 
       ORDER BY movement_date DESC, id DESC 
       LIMIT 1`,
      [productId]
    );

    const newBalanceQty = (lastMovement?.balance_qty || 0) + quantity;
    const newBalanceValue = (lastMovement?.balance_value || 0) + totalCost;

    // Record movement
    await this.db.query(
      `INSERT INTO inventory_movements 
       (id, product_id, journal_entry_id, batch_id, movement_date, movement_type, 
        quantity, unit_cost, total_cost, balance_qty, balance_value)
       VALUES (?, ?, ?, ?, ?, 'IN', ?, ?, ?, ?, ?)`,
      [uuidv4(), productId, journalEntryId, batchId, batchDate, quantity, unitCost, totalCost, newBalanceQty, newBalanceValue]
    );

    return batchId;
  }

  async reduceStock(productId, quantity, journalEntryId, valuationMethod, movementDate = new Date()) {
    // Calculate COGS using specified method
    const cogsResult = await ValuationStrategy.calculateCOGS(
      this.db,
      productId,
      quantity,
      valuationMethod
    );

    const movementId = uuidv4();

    // Get current balance
    const [lastMovement] = await this.db.query(
      `SELECT balance_qty, balance_value 
       FROM inventory_movements 
       WHERE product_id = ? 
       ORDER BY movement_date DESC, id DESC 
       LIMIT 1`,
      [productId]
    );

    const newBalanceQty = (lastMovement?.balance_qty || 0) - quantity;
    const newBalanceValue = (lastMovement?.balance_value || 0) - cogsResult.totalCost;

    // Record movement
    await this.db.query(
      `INSERT INTO inventory_movements 
       (id, product_id, journal_entry_id, movement_date, movement_type, 
        quantity, unit_cost, total_cost, balance_qty, balance_value, valuation_method)
       VALUES (?, ?, ?, ?, 'OUT', ?, ?, ?, ?, ?, ?)`,
      [
        movementId,
        productId,
        journalEntryId,
        movementDate,
        quantity,
        cogsResult.totalCost / quantity, // avg unit cost for this transaction
        cogsResult.totalCost,
        newBalanceQty,
        newBalanceValue,
        valuationMethod
      ]
    );

    // Update batches and record usage
    for (const used of cogsResult.usedBatches) {
      // Record batch usage
      await this.db.query(
        `INSERT INTO batch_usage (id, movement_id, batch_id, quantity_used, unit_cost, total_cost)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), movementId, used.batchId, used.quantity, used.unitCost, used.totalCost]
      );

      // Update batch remaining quantity
      await this.db.query(
        `UPDATE inventory_batches 
         SET remaining_quantity = remaining_quantity - ?,
             is_closed = (remaining_quantity - ? <= 0)
         WHERE id = ?`,
        [used.quantity, used.quantity, used.batchId]
      );
    }

    return {
      movementId,
      cogs: cogsResult.totalCost,
      usedBatches: cogsResult.usedBatches
    };
  }

  async getCurrentStock(productId) {
    const [result] = await this.db.query(
      `SELECT balance_qty, balance_value 
       FROM inventory_movements 
       WHERE product_id = ? 
       ORDER BY movement_date DESC, id DESC 
       LIMIT 1`,
      [productId]
    );

    return {
      quantity: result?.balance_qty || 0,
      value: result?.balance_value || 0,
      avgCost: result?.balance_qty > 0 ? result.balance_value / result.balance_qty : 0
    };
  }
}

// ==================== JOURNAL PROCESSOR ====================

class JournalProcessor {
  constructor(db) {
    this.db = db;
    this.config = new InventoryConfig(db);
    this.inventory = new InventoryManager(db);
  }

  async processJournal({
    transType,
    amount,
    debitAccount = null,
    creditAccount = null,
    quantity = 0,
    productId = null,
    unitCost = null,
    referenceId = null,
    remarks = null,
    date = new Date(),
    valuationMethodOverride = null // Per-transaction override
  }) {
    const connection = await this.db.getConnection();
    
    try {
      await connection.beginTransaction();

      const journalId = uuidv4();
      let effectiveValuationMethod = null;

      // Get effective valuation method if product is involved
      if (productId) {
        effectiveValuationMethod = await this.config.getEffectiveValuationMethod(
          productId,
          valuationMethodOverride
        );
      }

      // Create journal entry header
      await connection.query(
        `INSERT INTO journal_entries 
         (id, entry_date, trans_type, reference_id, remarks, total_amount, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [journalId, date, transType, referenceId, remarks, amount, new Date()]
      );

      // Process based on transaction type
      switch (transType) {
        case 'PURCHASE':
          await this.processPurchase(connection, journalId, {
            amount,
            quantity,
            productId,
            unitCost: unitCost || amount / quantity,
            debitAccount: debitAccount || 'INVENTORY',
            creditAccount: creditAccount || 'ACCOUNTS_PAYABLE',
            date
          });
          break;

        case 'SALES':
          await this.processSales(connection, journalId, {
            amount,
            quantity,
            productId,
            debitAccount: debitAccount || 'ACCOUNTS_RECEIVABLE',
            creditAccount: creditAccount || 'SALES_REVENUE',
            valuationMethod: effectiveValuationMethod,
            date
          });
          break;

        case 'RETURN_PURCHASE':
          await this.processReturnPurchase(connection, journalId, {
            amount,
            quantity,
            productId,
            referenceId, // Original purchase journal ID
            date
          });
          break;

        case 'RETURN_SALES':
          await this.processReturnSales(connection, journalId, {
            amount,
            quantity,
            productId,
            referenceId, // Original sales journal ID
            date
          });
          break;

        case 'GOODS_RECEIPT':
          await this.processGoodsReceipt(connection, journalId, {
            quantity,
            productId,
            unitCost: unitCost || 0,
            remarks,
            date
          });
          break;

        case 'GOODS_ISSUED':
          await this.processGoodsIssued(connection, journalId, {
            quantity,
            productId,
            valuationMethod: effectiveValuationMethod,
            remarks,
            date
          });
          break;

        case 'MANUAL':
          // Manual journal entry
          await this.createJournalLines(connection, journalId, debitAccount, creditAccount, amount);
          break;

        default:
          throw new Error(`Unknown transaction type: ${transType}`);
      }

      await connection.commit();

      return {
        success: true,
        journalId,
        transType,
        amount,
        valuationMethod: effectiveValuationMethod,
        date
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async processPurchase(connection, journalId, { amount, quantity, productId, unitCost, debitAccount, creditAccount, date }) {
    // Create journal lines
    await this.createJournalLines(connection, journalId, debitAccount, creditAccount, amount);

    // Add stock
    const inventoryMgr = new InventoryManager(connection);
    await inventoryMgr.addStock(productId, quantity, unitCost, journalId, date);
  }

  async processSales(connection, journalId, { amount, quantity, productId, debitAccount, creditAccount, valuationMethod, date }) {
    // Revenue recognition
    await this.createJournalLines(connection, journalId, debitAccount, creditAccount, amount);

    // Calculate and record COGS
    const inventoryMgr = new InventoryManager(connection);
    const cogsResult = await inventoryMgr.reduceStock(productId, quantity, journalId, valuationMethod, date);

    // COGS journal entry
    await this.createJournalLines(connection, journalId, 'COGS', 'INVENTORY', cogsResult.cogs, 'Cost of Goods Sold');

    return cogsResult;
  }

  async processReturnPurchase(connection, journalId, { amount, quantity, productId, referenceId, date }) {
    // Reverse: DR Accounts Payable, CR Inventory
    await this.createJournalLines(connection, journalId, 'ACCOUNTS_PAYABLE', 'INVENTORY', amount);

    // Reduce stock (use FIFO to remove from oldest batch)
    const inventoryMgr = new InventoryManager(connection);
    await inventoryMgr.reduceStock(productId, quantity, journalId, 'FIFO', date);
  }

  async processReturnSales(connection, journalId, { amount, quantity, productId, referenceId, date }) {
    // Reverse revenue: DR Sales Returns, CR Accounts Receivable
    await this.createJournalLines(connection, journalId, 'SALES_RETURNS', 'ACCOUNTS_RECEIVABLE', amount);

    // Add stock back (need to determine cost from original sale)
    // This is complex - need to retrieve original COGS
    const [originalCogs] = await connection.query(
      `SELECT total_cost / quantity as avg_unit_cost
       FROM inventory_movements
       WHERE journal_entry_id = ? AND product_id = ? AND movement_type = 'OUT'`,
      [referenceId, productId]
    );

    const unitCost = originalCogs?.avg_unit_cost || 0;
    const totalCost = quantity * unitCost;

    // Reverse COGS: DR Inventory, CR COGS
    await this.createJournalLines(connection, journalId, 'INVENTORY', 'COGS', totalCost, 'Reverse COGS');

    // Add stock back
    const inventoryMgr = new InventoryManager(connection);
    await inventoryMgr.addStock(productId, quantity, unitCost, journalId, date);
  }

  async processGoodsReceipt(connection, journalId, { quantity, productId, unitCost, remarks, date }) {
    const amount = quantity * unitCost;
    
    // DR Inventory, CR Inventory Adjustment
    await this.createJournalLines(connection, journalId, 'INVENTORY', 'INVENTORY_ADJUSTMENT', amount, remarks);

    // Add stock
    const inventoryMgr = new InventoryManager(connection);
    await inventoryMgr.addStock(productId, quantity, unitCost, journalId, date);
  }

  async processGoodsIssued(connection, journalId, { quantity, productId, valuationMethod, remarks, date }) {
    // Reduce stock first to get the cost
    const inventoryMgr = new InventoryManager(connection);
    const result = await inventoryMgr.reduceStock(productId, quantity, journalId, valuationMethod, date);

    // DR Inventory Adjustment, CR Inventory
    await this.createJournalLines(connection, journalId, 'INVENTORY_ADJUSTMENT', 'INVENTORY', result.cogs, remarks);
  }

  async createJournalLines(connection, journalId, debitAccount, creditAccount, amount, description = null) {
    await connection.query(
      `INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit, credit, description)
       VALUES (?, ?, ?, ?, 0, ?), (?, ?, ?, 0, ?, ?)`,
      [
        uuidv4(), journalId, debitAccount, amount, description,
        uuidv4(), journalId, creditAccount, amount, description
      ]
    );
  }
}

// ==================== USAGE EXAMPLES ====================

// Example 1: Purchase with global default (FIFO)
async function example1(db) {
  const processor = new JournalProcessor(db);
  
  await processor.processJournal({
    transType: 'PURCHASE',
    productId: 'ITEM-A',
    quantity: 10,
    amount: 100, // $10 per unit
    referenceId: 'PO-001',
    remarks: 'Purchase from Supplier A'
  });
}

// Example 2: Sales with per-item setting
async function example2(db) {
  // Product ITEM-A has valuation_method = 'LIFO' in database
  const processor = new JournalProcessor(db);
  
  await processor.processJournal({
    transType: 'SALES',
    productId: 'ITEM-A',
    quantity: 5,
    amount: 150, // Sales price
    referenceId: 'SO-001'
  });
  // Will use LIFO because product has it set
}

// Example 3: Sales with per-transaction override
async function example3(db) {
  // Override product's LIFO setting with FIFO for this transaction
  const processor = new JournalProcessor(db);
  
  await processor.processJournal({
    transType: 'SALES',
    productId: 'ITEM-A',
    quantity: 5,
    amount: 150,
    referenceId: 'SO-002',
    valuationMethodOverride: 'FIFO' // This overrides product & company setting
  });
  // Will use FIFO despite product having LIFO
}

// Example 4: Your specific scenario (2 prices, sell 5)
async function example4(db) {
  const processor = new JournalProcessor(db);
  
  // First purchase: 3 units @ $5
  await processor.processJournal({
    transType: 'PURCHASE',
    productId: 'ITEM-A',
    quantity: 3,
    amount: 15,
    unitCost: 5,
    referenceId: 'PO-001',
    date: new Date('2025-01-01')
  });
  
  // Second purchase: 2 units @ $6
  await processor.processJournal({
    transType: 'PURCHASE',
    productId: 'ITEM-A',
    quantity: 2,
    amount: 12,
    unitCost: 6,
    referenceId: 'PO-002',
    date: new Date('2025-01-15')
  });
  
  // Now sell 5 units @ $20 each (FIFO)
  const result = await processor.processJournal({
    transType: 'SALES',
    productId: 'ITEM-A',
    quantity: 5,
    amount: 100, // Sales revenue
    referenceId: 'SO-001',
    valuationMethodOverride: 'FIFO'
  });
  
  console.log('COGS:', result.cogs); // Will be $27 (3*5 + 2*6)
  
  // Journal entries created:
  // DR: Accounts Receivable  $100
  // CR: Sales Revenue        $100
  // DR: COGS                 $27
  // CR: Inventory            $27
}

// Example 5: Goods Receipt (Inventory Adjustment - Add)
async function example5(db) {
  const processor = new JournalProcessor(db);
  
  await processor.processJournal({
    transType: 'GOODS_RECEIPT',
    productId: 'ITEM-B',
    quantity: 5,
    unitCost: 10,
    remarks: 'Found during stocktake'
  });
  // DR: Inventory $50, CR: Inventory Adjustment $50
}

// Example 6: Goods Issued (Inventory Adjustment - Remove)
async function example6(db) {
  const processor = new JournalProcessor(db);
  
  await processor.processJournal({
    transType: 'GOODS_ISSUED',
    productId: 'ITEM-B',
    quantity: 2,
    remarks: 'Damaged goods written off',
    valuationMethodOverride: 'AVERAGE'
  });
  // Will calculate cost using AVERAGE method
  // DR: Inventory Adjustment $X, CR: Inventory $X
}

// Example 7: Return Purchase
async function example7(db) {
  const processor = new JournalProcessor(db);
  
  await processor.processJournal({
    transType: 'RETURN_PURCHASE',
    productId: 'ITEM-A',
    quantity: 1,
    amount: 5,
    referenceId: 'PO-001', // Original purchase journal ID
    remarks: 'Return defective item'
  });
  // DR: Accounts Payable $5, CR: Inventory $5
}

// Example 8: Return Sales
async function example8(db) {
  const processor = new JournalProcessor(db);
  
  await processor.processJournal({
    transType: 'RETURN_SALES',
    productId: 'ITEM-A',
    quantity: 1,
    amount: 20,
    referenceId: 'SO-001', // Original sales journal ID
    remarks: 'Customer return'
  });
  // Reverses both revenue and COGS
}

// ==================== UTILITY FUNCTIONS ====================

// Get current stock for a product
async function getProductStock(db, productId) {
  const inventory = new InventoryManager(db);
  return await inventory.getCurrentStock(productId);
}

// Get valuation method being used for a product
async function getProductValuationMethod(db, productId) {
  const config = new InventoryConfig(db);
  return await config.getEffectiveValuationMethod(productId);
}

// Get detailed batch information
async function getBatchDetails(db, productId) {
  const batches = await db.query(
    `SELECT 
      id,
      batch_date,
      quantity as original_qty,
      remaining_quantity,
      unit_cost,
      remaining_quantity * unit_cost as remaining_value,
      is_closed
    FROM inventory_batches
    WHERE product_id = ?
    ORDER BY batch_date ASC`,
    [productId]
  );
  
  return batches;
}

// Get COGS breakdown for a sales transaction
async function getCOGSBreakdown(db, journalId) {
  const breakdown = await db.query(
    `SELECT 
      bu.id,
      bu.batch_id,
      ib.batch_date,
      bu.quantity_used,
      bu.unit_cost,
      bu.total_cost
    FROM batch_usage bu
    JOIN inventory_batches ib ON bu.batch_id = ib.id
    JOIN inventory_movements im ON bu.movement_id = im.id
    WHERE im.journal_entry_id = ?
    ORDER BY ib.batch_date`,
    [journalId]
  );
  
  return breakdown;
}

// Get inventory valuation summary (all products)
async function getInventoryValuation(db) {
  const summary = await db.query(
    `SELECT 
      p.id,
      p.name,
      p.sku,
      COALESCE(p.valuation_method, cs.default_valuation_method) as valuation_method,
      COALESCE(SUM(ib.remaining_quantity), 0) as current_qty,
      COALESCE(SUM(ib.remaining_quantity * ib.unit_cost), 0) as current_value,
      CASE 
        WHEN SUM(ib.remaining_quantity) > 0 
        THEN SUM(ib.remaining_quantity * ib.unit_cost) / SUM(ib.remaining_quantity)
        ELSE 0 
      END as avg_cost
    FROM products p
    CROSS JOIN company_settings cs
    LEFT JOIN inventory_batches ib ON p.id = ib.product_id AND ib.is_closed = FALSE
    WHERE p.is_active = TRUE
    GROUP BY p.id, p.name, p.sku, p.valuation_method, cs.default_valuation_method
    HAVING current_qty > 0
    ORDER BY p.name`
  );
  
  return summary;
}

// ==================== REPORTING ====================

class InventoryReports {
  constructor(db) {
    this.db = db;
  }

  // Stock Card Report (movement history for a product)
  async getStockCard(productId, startDate = null, endDate = null) {
    let query = `
      SELECT 
        im.movement_date,
        je.trans_type,
        je.reference_id,
        im.movement_type,
        im.quantity,
        im.unit_cost,
        im.total_cost,
        im.balance_qty,
        im.balance_value,
        im.valuation_method,
        im.remarks
      FROM inventory_movements im
      LEFT JOIN journal_entries je ON im.journal_entry_id = je.id
      WHERE im.product_id = ?
    `;
    
    const params = [productId];
    
    if (startDate) {
      query += ' AND im.movement_date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND im.movement_date <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY im.movement_date ASC, im.id ASC';
    
    return await this.db.query(query, params);
  }

  // Inventory Aging Report
  async getInventoryAging() {
    const aging = await this.db.query(`
      SELECT 
        p.id,
        p.name,
        p.sku,
        ib.batch_date,
        DATEDIFF(CURRENT_DATE, ib.batch_date) as age_days,
        ib.remaining_quantity,
        ib.unit_cost,
        ib.remaining_quantity * ib.unit_cost as value,
        CASE 
          WHEN DATEDIFF(CURRENT_DATE, ib.batch_date) <= 30 THEN '0-30 days'
          WHEN DATEDIFF(CURRENT_DATE, ib.batch_date) <= 60 THEN '31-60 days'
          WHEN DATEDIFF(CURRENT_DATE, ib.batch_date) <= 90 THEN '61-90 days'
          WHEN DATEDIFF(CURRENT_DATE, ib.batch_date) <= 180 THEN '91-180 days'
          ELSE 'Over 180 days'
        END as age_category
      FROM inventory_batches ib
      JOIN products p ON ib.product_id = p.id
      WHERE ib.is_closed = FALSE 
        AND ib.remaining_quantity > 0
      ORDER BY age_days DESC, p.name
    `);
    
    return aging;
  }

  // COGS Analysis Report
  async getCOGSAnalysis(startDate, endDate) {
    const analysis = await this.db.query(`
      SELECT 
        p.id,
        p.name,
        p.sku,
        COUNT(DISTINCT je.id) as sales_transactions,
        SUM(im.quantity) as total_qty_sold,
        SUM(im.total_cost) as total_cogs,
        AVG(im.unit_cost) as avg_unit_cost,
        im.valuation_method
      FROM inventory_movements im
      JOIN products p ON im.product_id = p.id
      JOIN journal_entries je ON im.journal_entry_id = je.id
      WHERE je.trans_type = 'SALES'
        AND im.movement_type = 'OUT'
        AND je.entry_date BETWEEN ? AND ?
      GROUP BY p.id, p.name, p.sku, im.valuation_method
      ORDER BY total_cogs DESC
    `, [startDate, endDate]);
    
    return analysis;
  }

  // Inventory Turnover Report
  async getInventoryTurnover(startDate, endDate) {
    const turnover = await this.db.query(`
      SELECT 
        p.id,
        p.name,
        p.sku,
        -- COGS for period
        COALESCE(SUM(CASE WHEN im.movement_type = 'OUT' THEN im.total_cost ELSE 0 END), 0) as cogs,
        -- Average inventory value
        (
          SELECT AVG(balance_value)
          FROM inventory_movements im2
          WHERE im2.product_id = p.id
            AND im2.movement_date BETWEEN ? AND ?
        ) as avg_inventory_value,
        -- Turnover ratio
        CASE 
          WHEN AVG(im.balance_value) > 0 
          THEN SUM(CASE WHEN im.movement_type = 'OUT' THEN im.total_cost ELSE 0 END) / AVG(im.balance_value)
          ELSE 0 
        END as turnover_ratio,
        -- Days in inventory
        CASE 
          WHEN SUM(CASE WHEN im.movement_type = 'OUT' THEN im.total_cost ELSE 0 END) > 0 
          THEN (AVG(im.balance_value) * DATEDIFF(?, ?)) / SUM(CASE WHEN im.movement_type = 'OUT' THEN im.total_cost ELSE 0 END)
          ELSE 0 
        END as days_in_inventory
      FROM products p
      LEFT JOIN inventory_movements im ON p.id = im.product_id
        AND im.movement_date BETWEEN ? AND ?
      WHERE p.is_active = TRUE
      GROUP BY p.id, p.name, p.sku
      HAVING cogs > 0
      ORDER BY turnover_ratio DESC
    `, [startDate, endDate, endDate, startDate, startDate, endDate]);
    
    return turnover;
  }

  // Trial Balance
  async getTrialBalance(asOfDate = null) {
    let query = `
      SELECT 
        a.id,
        a.name,
        a.account_type,
        COALESCE(SUM(jel.debit), 0) as total_debit,
        COALESCE(SUM(jel.credit), 0) as total_credit,
        COALESCE(SUM(jel.debit), 0) - COALESCE(SUM(jel.credit), 0) as balance
      FROM accounts a
      LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
    `;
    
    const params = [];
    
    if (asOfDate) {
      query += `
        LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
        WHERE je.entry_date <= ?
      `;
      params.push(asOfDate);
    }
    
    query += `
      GROUP BY a.id, a.name, a.account_type
      HAVING balance != 0
      ORDER BY a.account_type, a.id
    `;
    
    const results = await this.db.query(query, params);
    
    // Calculate totals
    const totals = {
      totalDebit: results.reduce((sum, row) => sum + parseFloat(row.total_debit), 0),
      totalCredit: results.reduce((sum, row) => sum + parseFloat(row.total_credit), 0),
      difference: 0
    };
    totals.difference = totals.totalDebit - totals.totalCredit;
    
    return { accounts: results, totals };
  }
}

// ==================== COMPLETE EXAMPLE ====================

async function completeExample() {
  // Assume db connection is already established
  const db = require('./db'); // Your database connection
  
  const processor = new JournalProcessor(db);
  const reports = new InventoryReports(db);
  
  try {
    // 1. Set company default to FIFO
    await db.query(
      'UPDATE company_settings SET default_valuation_method = ? WHERE id = 1',
      ['FIFO']
    );
    
    // 2. Create a product with specific valuation method
    await db.query(
      `INSERT INTO products (id, name, sku, valuation_method, unit) 
       VALUES (?, ?, ?, ?, ?)`,
      ['ITEM-A', 'Product A', 'SKU-A', 'LIFO', 'pcs']
    );
    
    // 3. Create another product using global default
    await db.query(
      `INSERT INTO products (id, name, sku, valuation_method, unit) 
       VALUES (?, ?, ?, ?, ?)`,
      ['ITEM-B', 'Product B', 'SKU-B', null, 'pcs'] // NULL = use global
    );
    
    // 4. Purchase inventory
    console.log('=== Purchase 1 ===');
    await processor.processJournal({
      transType: 'PURCHASE',
      productId: 'ITEM-A',
      quantity: 3,
      amount: 15,
      unitCost: 5,
      referenceId: 'PO-001',
      date: new Date('2025-01-01')
    });
    
    console.log('=== Purchase 2 ===');
    await processor.processJournal({
      transType: 'PURCHASE',
      productId: 'ITEM-A',
      quantity: 2,
      amount: 12,
      unitCost: 6,
      referenceId: 'PO-002',
      date: new Date('2025-01-15')
    });
    
    // 5. Check current stock
    const stock = await getProductStock(db, 'ITEM-A');
    console.log('Current Stock:', stock);
    // { quantity: 5, value: 27, avgCost: 5.4 }
    
    // 6. Check batches
    const batches = await getBatchDetails(db, 'ITEM-A');
    console.log('Batches:', batches);
    // [
    //   { batch_date: '2025-01-01', remaining_quantity: 3, unit_cost: 5, ... },
    //   { batch_date: '2025-01-15', remaining_quantity: 2, unit_cost: 6, ... }
    // ]
    
    // 7. Sell using LIFO (product setting)
    console.log('=== Sale with LIFO (product setting) ===');
    const sale1 = await processor.processJournal({
      transType: 'SALES',
      productId: 'ITEM-A',
      quantity: 3,
      amount: 60, // $20 per unit
      referenceId: 'SO-001'
    });
    console.log('COGS (LIFO):', sale1.cogs);
    // COGS = (2 * $6) + (1 * $5) = $17
    
    // 8. Sell using FIFO (override)
    console.log('=== Sale with FIFO (override) ===');
    const sale2 = await processor.processJournal({
      transType: 'SALES',
      productId: 'ITEM-A',
      quantity: 2,
      amount: 40,
      referenceId: 'SO-002',
      valuationMethodOverride: 'FIFO' // Override LIFO
    });
    console.log('COGS (FIFO):', sale2.cogs);
    // COGS = 2 * $5 = $10
    
    // 9. Get COGS breakdown
    const cogsBreakdown = await getCOGSBreakdown(db, sale1.journalId);
    console.log('COGS Breakdown:', cogsBreakdown);
    
    // 10. Stock card report
    const stockCard = await reports.getStockCard('ITEM-A');
    console.log('Stock Card:', stockCard);
    
    // 11. Inventory valuation summary
    const valuation = await getInventoryValuation(db);
    console.log('Inventory Valuation:', valuation);
    
    // 12. Trial Balance
    const trialBalance = await reports.getTrialBalance();
    console.log('Trial Balance:', trialBalance);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Export all classes and functions
module.exports = {
  JournalProcessor,
  InventoryManager,
  InventoryConfig,
  ValuationStrategy,
  InventoryReports,
  // Utility functions
  getProductStock,
  getProductValuationMethod,
  getBatchDetails,
  getCOGSBreakdown,
  getInventoryValuation
};
```