import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/libs/auth';
import { initializeDatabase } from '~/libs/typeorm';
import { SalesDelivery } from '~/entities/SalesDelivery';
import { SalesDeliveryItem } from '~/entities/SalesDeliveryItem';
import { processQty } from '~/libs/stock';
import { DataSource } from 'typeorm';

// Generate delivery number
function generateDeliveryNumber(): string {
  const prefix = 'SD';
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
    const { salesOrderId, date, items, notes, status = 'draft' } = body;

    // Validate required fields
    if (!salesOrderId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Sales order ID and items are required' },
        { status: 400 }
      );
    }

    // Create sales delivery
    const salesDeliveryRepository = queryRunner.manager.getRepository(SalesDelivery);
    const salesDelivery = salesDeliveryRepository.create({
      deliveryNumber: generateDeliveryNumber(),
      date: date ? new Date(date) : new Date(),
      salesOrderId,
      userId,
      status: status as 'draft' | 'confirmed' | 'cancelled',
      notes: notes || null,
    });

    const savedDelivery = await queryRunner.manager.save(salesDelivery);

    // Process items and update stock
    const deliveryItems: SalesDeliveryItem[] = [];
    const stockUpdates: Array<{ itemId: string; itemVariant: string | null; qty: number }> = [];

    for (const item of items) {
      const { salesOrderItemId, productVariantId, quantity, itemVariant } = item;

      if (!productVariantId || !quantity || quantity <= 0) {
        throw new Error(`Invalid item: productVariantId and quantity are required`);
      }

      // Create delivery item
      const deliveryItem = queryRunner.manager.create(SalesDeliveryItem, {
        salesDeliveryId: savedDelivery.id,
        salesOrderItemId,
        productVariantId,
        quantity: parseFloat(quantity),
      });

      const savedItem = await queryRunner.manager.save(deliveryItem);
      deliveryItems.push(savedItem);

      // Track stock update (only if status is confirmed)
      if (status === 'confirmed') {
        stockUpdates.push({
          itemId: productVariantId,
          itemVariant: itemVariant || null,
          qty: parseFloat(quantity),
        });
      }
    }

    // Update stock for confirmed deliveries (decrease stock)
    if (status === 'confirmed') {
      for (const stockUpdate of stockUpdates) {
        const result = await processQty(
          stockUpdate.itemId,
          stockUpdate.itemVariant,
          'sale',
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
        ...savedDelivery,
        items: deliveryItems,
      },
      message: 'Sales delivery created successfully',
    });
  } catch (error: any) {
    // Rollback transaction on error
    await queryRunner.rollbackTransaction();
    console.error('Sales delivery error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create sales delivery' },
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
    const salesDeliveryRepository = dataSource.getRepository(SalesDelivery);
    const salesDeliveryItemRepository = dataSource.getRepository(SalesDeliveryItem);

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const queryBuilder = salesDeliveryRepository
      .createQueryBuilder('sd')
      .leftJoinAndSelect('sd.items', 'items')
      .leftJoinAndSelect('items.productVariant', 'productVariant')
      .orderBy('sd.date', 'DESC')
      .skip(offset)
      .take(limit);

    if (status) {
      queryBuilder.where('sd.status = :status', { status });
    }

    const [deliveries, total] = await queryBuilder.getManyAndCount();

    return NextResponse.json({
      success: true,
      data: deliveries,
      pagination: {
        total,
        limit,
        offset,
      },
    });
  } catch (error: any) {
    console.error('Get sales deliveries error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sales deliveries' },
      { status: 500 }
    );
  }
}

// Update delivery status (e.g., from draft to confirmed)
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
        { error: 'Delivery ID and status are required' },
        { status: 400 }
      );
    }

    const salesDeliveryRepository = queryRunner.manager.getRepository(SalesDelivery);
    const salesDeliveryItemRepository = queryRunner.manager.getRepository(SalesDeliveryItem);

    // Find the delivery
    const delivery = await salesDeliveryRepository.findOne({
      where: { id },
      relations: ['items']
    });

    if (!delivery) {
      return NextResponse.json(
        { error: 'Sales delivery not found' },
        { status: 404 }
      );
    }

    const oldStatus = delivery.status;
    delivery.status = status as 'draft' | 'confirmed' | 'cancelled';
    await queryRunner.manager.save(delivery);

    // Handle stock updates based on status change
    if (oldStatus !== 'confirmed' && status === 'confirmed') {
      // Moving to confirmed - decrease stock
      const items = await salesDeliveryItemRepository.find({
        where: { salesDeliveryId: id }
      });

      for (const item of items) {
        const result = await processQty(
          item.productVariantId,
          null,
          'sale',
          Number(item.quantity),
          queryRunner.manager
        );

        if (!result.success) {
          throw new Error(`Failed to update stock for item ${item.productVariantId}: ${result.message}`);
        }
      }
    } else if (oldStatus === 'confirmed' && status !== 'confirmed') {
      // Moving away from confirmed - increase stock (reverse the transaction)
      const items = await salesDeliveryItemRepository.find({
        where: { salesDeliveryId: id }
      });

      for (const item of items) {
        const result = await processQty(
          item.productVariantId,
          null,
          'purchase', // Use 'purchase' to increase stock (reverse sale)
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
      data: delivery,
      message: 'Sales delivery status updated successfully',
    });
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    console.error('Update sales delivery error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update sales delivery' },
      { status: 500 }
    );
  } finally {
    await queryRunner.release();
  }
}

