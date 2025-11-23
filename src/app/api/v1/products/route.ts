import { NextRequest, NextResponse } from 'next/server'
import { auth } from '~/libs/auth'
import { initializeDatabase } from '~/libs/typeorm'
import { Product } from '~/entities/Product'
import { ProductVariant } from '~/entities/ProductVariant'
import { SalesInvoiceItem } from '~/entities/SalesInvoiceItem'
import { PurchaseInvoiceItem } from '~/entities/PurchaseInvoiceItem'
import { User } from '~/entities/User'
import { UoM } from '~/entities/UoM'

// GET - List all products
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dataSource = await initializeDatabase()
    if (!dataSource) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }
    const productRepository = dataSource.getRepository(Product)
    const uomRepository = dataSource.getRepository(UoM)

    const products = await productRepository.find({
      relations: ['CreatedBy', 'UpdatedBy'],
      order: {
        CreatedDate: 'DESC',
      },
    })

    // Get all UoM records for mapping
    const uoms = await uomRepository.find()
    const uomMap = new Map(uoms.map((uom) => [uom.UomId, uom]))

    // Map products to include UserName from CreatedBy relation and UoM name
    const mappedProducts = products.map((product) => {
      const uom = product.UomId ? uomMap.get(product.UomId) : null
      return {
        ItemId: product.ItemId,
        ItemName: product.ItemName,
        UomId: product.UomId,
        UoM: uom?.UomName || uom?.UomCode || (product.UomId != null ? String(product.UomId) : ''),
        CategoryId: product.CategoryId,
        BrandId: product.BrandId,
        MinQty: product.MinQty,
        IsStock: product.IsStock,
        Descriptions: product.Descriptions,
        ItemImage: product.ItemImage,
        IsActive: product.IsActive,
        HasVariant: product.HasVariant,
        CreatedBy: product.CreatedBy?.UserName || null,
        CreatedDate: product.CreatedDate,
        UpdatedBy: product.UpdatedBy?.UserName || null,
        UpdatedDate: product.UpdatedDate,
        AccessBy: product.UpdatedBy?.UserName || product.CreatedBy?.UserName || null,
        AccessTime: product.UpdatedDate || product.CreatedDate,
      }
    })

    return NextResponse.json(mappedProducts)
  } catch (error: any) {
    console.error('GET /api/v1/products error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      ItemId,
      ItemName,
      UomId,
      CategoryId,
      BrandId,
      MinQty = 0,
      IsStock = true,
      Descriptions,
      ItemImage = '',
      IsActive = true,
      HasVariant = false,
    } = body

    // Validation
    if (!ItemId || !ItemName || !UomId) {
      return NextResponse.json(
        { error: 'ItemId, ItemName, and UomId are required' },
        { status: 400 }
      )
    }

    const productRepository = queryRunner.manager.getRepository(Product)
    const userRepository = queryRunner.manager.getRepository(User)

    // Check if product already exists
    const existingProduct = await productRepository.findOne({
      where: { ItemId },
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this ItemId already exists' },
        { status: 400 }
      )
    }

    // Get current user
    const currentUser = await userRepository.findOne({
      where: { UserName: (session.user as any).username || session.user.name },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create product
    const newProduct = productRepository.create({
      ItemId,
      ItemName,
      UomId,
      CategoryId: CategoryId || null,
      BrandId: BrandId || null,
      MinQty,
      IsStock,
      Descriptions: Descriptions || null,
      ItemImage,
      IsActive,
      HasVariant,
      CreatedBy: currentUser,
      CreatedDate: new Date(),
    })

    await productRepository.save(newProduct)
    await queryRunner.commitTransaction()

    return NextResponse.json(
      {
        message: 'Product created successfully',
        product: {
          ItemId: newProduct.ItemId,
          ItemName: newProduct.ItemName,
          IsActive: newProduct.IsActive,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    await queryRunner.rollbackTransaction()
    console.error('POST /api/v1/products error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    )
  } finally {
    await queryRunner.release()
  }
}

// PUT - Update a product
export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { ItemId, ...updateData } = body

    if (!ItemId) {
      return NextResponse.json(
        { error: 'ItemId is required' },
        { status: 400 }
      )
    }

    const productRepository = queryRunner.manager.getRepository(Product)
    const userRepository = queryRunner.manager.getRepository(User)

    // Find existing product
    const product = await productRepository.findOne({
      where: { ItemId },
      relations: ['CreatedBy', 'UpdatedBy'],
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Get current user
    const currentUser = await userRepository.findOne({
      where: { UserName: (session.user as any).username || session.user.name },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update product fields (only provided fields)
    if (updateData.ItemName !== undefined) product.ItemName = updateData.ItemName
    if (updateData.UomId !== undefined) product.UomId = updateData.UomId
    if (updateData.CategoryId !== undefined)
      product.CategoryId = updateData.CategoryId
    if (updateData.BrandId !== undefined) product.BrandId = updateData.BrandId
    if (updateData.MinQty !== undefined) product.MinQty = updateData.MinQty
    if (updateData.IsStock !== undefined) product.IsStock = updateData.IsStock
    if (updateData.Descriptions !== undefined)
      product.Descriptions = updateData.Descriptions
    if (updateData.ItemImage !== undefined)
      product.ItemImage = updateData.ItemImage
    if (updateData.IsActive !== undefined) product.IsActive = updateData.IsActive
    if (updateData.HasVariant !== undefined)
      product.HasVariant = updateData.HasVariant

    // Update audit fields
    product.UpdatedBy = currentUser
    product.UpdatedDate = new Date()

    await productRepository.save(product)
    await queryRunner.commitTransaction()

    return NextResponse.json({
      message: 'Product updated successfully',
      product: {
        ItemId: product.ItemId,
        ItemName: product.ItemName,
        IsActive: product.IsActive,
      },
    })
  } catch (error: any) {
    await queryRunner.rollbackTransaction()
    console.error('PUT /api/v1/products error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
      { status: 500 }
    )
  } finally {
    await queryRunner.release()
  }
}

