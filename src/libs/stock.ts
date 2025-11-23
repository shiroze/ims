import { initializeDatabase } from './typeorm';
import { ProductVariant } from '~/entities/ProductVariant';
import { EntityManager } from 'typeorm';

export type TransactionType = 'purchase' | 'receipt' | 'sale' | 'issue' | 'adjustment' | 'return';

/**
 * Process stock quantity for a product variant
 * @param itemId - Product Variant ID (UUID)
 * @param itemVariant - Product Variant SKU (optional, for validation)
 * @param transType - Transaction type: 'purchase' (increase), 'sale' (decrease), 'adjustment', 'return'
 * @param qty - Quantity to process (positive number)
 * @param entityManager - Optional EntityManager for transaction support
 * @returns Promise with updated stock quantity
 */
export async function processQty(
  itemId: string,
  itemVariant: string | null,
  transType: TransactionType,
  qty: number,
  entityManager?: EntityManager
): Promise<{ success: boolean; newStock: number; previousStock: number; message?: string }> {
  try {
    // Qty can't positive number only cause for adjustment and return may use negative number
    // if (qty <= 0) {
    //   throw new Error('Quantity must be greater than 0');
    // }

    // Use provided entity manager or get repository from data source
    const dataSource = await initializeDatabase();
    const productVariantRepository = entityManager 
      ? entityManager.getRepository(ProductVariant)
      : dataSource.getRepository(ProductVariant);

    // Find the product variant - try by ID first, then by SKU if not found
    let productVariant = await productVariantRepository.findOne({
      where: { id: itemId }
    });

    // If not found by ID, try by SKU (in case itemId is actually a SKU)
    if (!productVariant) {
      productVariant = await productVariantRepository.findOne({
        where: { skuVariant: itemId }
      });
    }

    // If itemVariant is provided and different from itemId, use it for validation
    if (!productVariant && itemVariant) {
      productVariant = await productVariantRepository.findOne({
        where: { skuVariant: itemVariant }
      });
    }

    if (!productVariant) {
      throw new Error(`Product variant not found with ID/SKU: ${itemId}${itemVariant ? ` or ${itemVariant}` : ''}`);
    }

    const previousStock = Number(productVariant.stock) || 0;
    let newStock: number;

    // Process stock based on transaction type
    switch (transType) {
      case 'purchase': case "receipt":
        // Increase stock for purchase receipts
        newStock = previousStock + qty;
        break;

      case 'sale': case "issue":
        // Decrease stock for sales deliveries
        newStock = previousStock - qty;
        if (newStock < 0) {
          throw new Error(`Insufficient stock. Available: ${previousStock}, Requested: ${qty}`);
        }
        break;

      case 'adjustment':
        // Direct adjustment (must positive)
        newStock = qty;
        if (newStock < 0) {
          throw new Error(`Stock adjustment would result in negative stock. Current: ${previousStock}, Adjustment: ${qty}`);
        }
        break;

      case 'return':
        // Return stock (increase)
        newStock = previousStock + qty;
        break;

      default:
        throw new Error(`Invalid transaction type: ${transType}`);
    }

    // Update stock in database
    productVariant.stock = newStock;
    await productVariantRepository.save(productVariant);

    return {
      success: true,
      newStock,
      previousStock,
      message: `Stock updated: ${previousStock} → ${newStock} (${transType}: ${qty})`
    };
  } catch (error: any) {
    console.error('Stock processing error:', error);
    return {
      success: false,
      newStock: 0,
      previousStock: 0,
      message: error.message || 'Failed to process stock'
    };
  }
}

/**
 * Get current stock for a product variant
 * @param itemId - Product Variant ID (UUID)
 * @returns Promise with current stock quantity
 */
export async function getStock(itemId: string): Promise<number> {
  try {
    const dataSource = await initializeDatabase();
    const productVariantRepository = dataSource.getRepository(ProductVariant);

    const productVariant = await productVariantRepository.findOne({
      where: { id: itemId }
    });

    if (!productVariant) {
      throw new Error(`Product variant not found with ID: ${itemId}`);
    }

    return Number(productVariant.stock) || 0;
  } catch (error: any) {
    console.error('Get stock error:', error);
    throw error;
  }
}

