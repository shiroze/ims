import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/libs/auth';
import { initializeDatabase } from '~/libs/typeorm';
import { GoodsReceipt } from '~/entities/GoodsReceipt';
import { GoodsReceiptItem } from '~/entities/GoodsReceiptItem';
import { processQty } from '~/libs/stock';
import { DataSource } from 'typeorm';

// Generate receipt number
function generateReceiptNumber(): string {
  const prefix = 'GR';
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${year}${month}${random}`;
}

export async function POST(request: NextRequest) {
  const dataSource = await initializeDatabase();
  const queryRunner = dataSource.createQueryRunner();
  
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id ? parseInt((session.user as any).id) : null;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }

    const body = await request.json();
    const { purchaseOrderId, date, items, notes, status = 'draft' } = body;

    // Validate required fields
    if (!purchaseOrderId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Purchase order ID and items are required' },
        { status: 400 }
      );
    }

    // Create goods receipt
    const goodsReceiptRepository = queryRunner.manager.getRepository(GoodsReceipt);
    const goodsReceipt = goodsReceiptRepository.create({
      grNumber: generateReceiptNumber(),
      date: date ? new Date(date) : new Date(),
      purchaseOrderId,
      userId,
      status: status as 'draft' | 'confirmed' | 'cancelled',
      notes: notes || null,
    });

    const savedReceipt = await queryRunner.manager.save(goodsReceipt);

    // Process items and update stock
    const receiptItems: GoodsReceiptItem[] = [];
    const stockUpdates: Array<{ itemId: string; itemVariant: string | null; qty: number }> = [];

    for (const item of items) {
      const { purchaseOrderItemId, productVariantId, quantity, itemVariant } = item;

      if (!productVariantId || !quantity || quantity <= 0) {
        throw new Error(`Invalid item: productVariantId and quantity are required`);
      }

      // Create receipt item
      const receiptItem = queryRunner.manager.create(GoodsReceiptItem, {
        goodsReceiptId: savedReceipt.id,
        purchaseOrderItemId,
        productVariantId,
        quantity: parseFloat(quantity),
      });

      const savedItem = await queryRunner.manager.save(receiptItem);
      receiptItems.push(savedItem);

      // Track stock update (only if status is confirmed)
      if (status === 'confirmed') {
        stockUpdates.push({
          itemId: productVariantId,
          itemVariant: itemVariant || null,
          qty: parseFloat(quantity),
        });
      }
    }

    // Update stock for confirmed receipts
    if (status === 'confirmed') {
      for (const stockUpdate of stockUpdates) {
        const result = await processQty(
          stockUpdate.itemId,
          stockUpdate.itemVariant,
          'purchase',
          stockUpdate.qty,
          queryRunner.manager
        );

        if (!result.success) {
          throw new Error(`Failed to update stock for item ${stockUpdate.itemId}: ${result.message}`);
        }
      }
    }

    // Commit transaction
    await queryRunner.commitTransaction();

    return NextResponse.json({
      success: true,
      data: {
        ...savedReceipt,
        items: receiptItems,
      },
      message: 'Purchase receipt created successfully',
    });
  } catch (error: any) {
    // Rollback transaction on error
    await queryRunner.rollbackTransaction();
    console.error('Purchase receipt error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create purchase receipt' },
      { status: 500 }
    );
  } finally {
    await queryRunner.release();
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dataSource = await initializeDatabase();
    const goodsReceiptRepository = dataSource.getRepository(GoodsReceipt);
    const goodsReceiptItemRepository = dataSource.getRepository(GoodsReceiptItem);

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const queryBuilder = goodsReceiptRepository
      .createQueryBuilder('gr')
      .leftJoinAndSelect('gr.items', 'items')
      .leftJoinAndSelect('items.productVariant', 'productVariant')
      .orderBy('gr.date', 'DESC')
      .skip(offset)
      .take(limit);

    if (status) {
      queryBuilder.where('gr.status = :status', { status });
    }

    const [receipts, total] = await queryBuilder.getManyAndCount();

    return NextResponse.json({
      success: true,
      data: receipts,
      pagination: {
        total,
        limit,
        offset,
      },
    });
  } catch (error: any) {
    console.error('Get purchase receipts error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch purchase receipts' },
      { status: 500 }
    );
  }
}

// Update receipt status (e.g., from draft to confirmed)
export async function PATCH(request: NextRequest) {
  const dataSource = await initializeDatabase();
  const queryRunner = dataSource.createQueryRunner();
  
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Receipt ID and status are required' },
        { status: 400 }
      );
    }

    const goodsReceiptRepository = queryRunner.manager.getRepository(GoodsReceipt);
    const goodsReceiptItemRepository = queryRunner.manager.getRepository(GoodsReceiptItem);

    // Find the receipt
    const receipt = await goodsReceiptRepository.findOne({
      where: { id },
      relations: ['items']
    });

    if (!receipt) {
      return NextResponse.json(
        { error: 'Purchase receipt not found' },
        { status: 404 }
      );
    }

    const oldStatus = receipt.status;
    receipt.status = status as 'draft' | 'confirmed' | 'cancelled';
    await queryRunner.manager.save(receipt);

    // Handle stock updates based on status change
    if (oldStatus !== 'confirmed' && status === 'confirmed') {
      // Moving to confirmed - increase stock
      const items = await goodsReceiptItemRepository.find({
        where: { goodsReceiptId: id }
      });

      for (const item of items) {
        const result = await processQty(
          item.productVariantId,
          null,
          'purchase',
          Number(item.quantity),
          queryRunner.manager
        );

        if (!result.success) {
          throw new Error(`Failed to update stock for item ${item.productVariantId}: ${result.message}`);
        }
      }
    } else if (oldStatus === 'confirmed' && status !== 'confirmed') {
      // Moving away from confirmed - decrease stock (reverse the transaction)
      const items = await goodsReceiptItemRepository.find({
        where: { goodsReceiptId: id }
      });

      for (const item of items) {
        const result = await processQty(
          item.productVariantId,
          null,
          'sale', // Use 'sale' to decrease stock
          Number(item.quantity),
          queryRunner.manager
        );

        if (!result.success) {
          throw new Error(`Failed to reverse stock for item ${item.productVariantId}: ${result.message}`);
        }
      }
    }

    await queryRunner.commitTransaction();

    return NextResponse.json({
      success: true,
      data: receipt,
      message: 'Purchase receipt status updated successfully',
    });
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error('Update purchase receipt error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update purchase receipt' },
      { status: 500 }
    );
  } finally {
    await queryRunner.release();
  }
}

