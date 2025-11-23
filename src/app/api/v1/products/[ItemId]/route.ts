import { NextRequest, NextResponse } from 'next/server'
import { auth } from '~/libs/auth'
import { initializeDatabase } from '~/libs/typeorm'
import { Product } from '~/entities/Product'
import { ProductVariant } from '~/entities/ProductVariant'
import { SalesInvoiceItem } from '~/entities/SalesInvoiceItem'
import { PurchaseInvoiceItem } from '~/entities/PurchaseInvoiceItem'
import { User } from '~/entities/User'

// DELETE - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ ItemId: string }> }
) {
  const dataSource = await initializeDatabase()
  if (!dataSource) {
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 500 }
    )
  }
  const queryRunner = dataSource.createQueryRunner()
  await queryRunner.connect()
  await queryRunner.startTransaction()

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ItemId } = await params

    if (!ItemId) {
      return NextResponse.json(
        { error: 'ItemId is required' },
        { status: 400 }
      )
    }

    const productRepository = queryRunner.manager.getRepository(Product)
    const productVariantRepository =
      queryRunner.manager.getRepository(ProductVariant)
    const salesInvoiceItemRepository =
      queryRunner.manager.getRepository(SalesInvoiceItem)
    const purchaseInvoiceItemRepository =
      queryRunner.manager.getRepository(PurchaseInvoiceItem)
    const userRepository = queryRunner.manager.getRepository(User)

    // Find the product
    const product = await productRepository.findOne({
      where: { ItemId },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if product has variants
    const variantCount = await productVariantRepository.count({
      where: { ItemId },
    })

    const hasVariants = variantCount > 0

    // Check if product is used in sales invoices
    const salesInvoiceUsage = await salesInvoiceItemRepository.count({
      where: { ItemId },
    })

    // Check if product is used in purchase invoices
    const purchaseInvoiceUsage = await purchaseInvoiceItemRepository.count({
      where: { ItemId },
    })

    const isUsedInTransactions =
      salesInvoiceUsage > 0 || purchaseInvoiceUsage > 0

    // Get current user for audit trail (if soft delete)
    const currentUser = await userRepository.findOne({
      where: { UserName: (session.user as any).username || session.user.name },
    })

    // If product has variants OR is used in transactions: soft delete (set IsActive to 0)
    // This preserves data integrity for existing transactions and variants
    if (hasVariants || isUsedInTransactions) {
      product.IsActive = false
      if (currentUser) {
        product.UpdatedBy = currentUser
      }
      product.UpdatedDate = new Date()

      await productRepository.save(product)
      await queryRunner.commitTransaction()

      return NextResponse.json({
        message:
          'Product deactivated successfully (product has variants or is used in transactions)',
        product: {
          ItemId: product.ItemId,
          ItemName: product.ItemName,
          IsActive: product.IsActive,
        },
      })
    }

    // If product has no variants AND is not used in transactions: hard delete
    // First delete all product variants (should be none, but just in case)
    await productVariantRepository.delete({ ItemId })

    // Then delete the product
    await productRepository.delete({ ItemId })

    await queryRunner.commitTransaction()

    return NextResponse.json({
      message: 'Product and variants deleted successfully',
      product: {
        ItemId,
      },
    })
  } catch (error: any) {
    await queryRunner.rollbackTransaction()
    console.error('DELETE /api/v1/products/[ItemId] error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete product' },
      { status: 500 }
    )
  } finally {
    await queryRunner.release()
  }
}

