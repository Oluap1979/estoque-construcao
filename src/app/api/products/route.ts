import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
export const dynamic = 'force-dynamic'
import { ProductCategory, MovementType } from '@/generated/prisma/client'


// GET /api/products - Listar produtos com filtros e paginação
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') as ProductCategory | null
    const isActive = searchParams.get('isActive')
    const lowStock = searchParams.get('lowStock') === 'true'
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category) {
      where.category = category
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    // Para lowStock, buscar todos e filtrar em memória (mais simples para SQLite)
    // Em produção com PostgreSQL, usar query raw ou view
    const shouldFilterLowStock = lowStock

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: shouldFilterLowStock ? 0 : skip, // Se filtrar lowStock, buscar todos primeiro
        take: shouldFilterLowStock ? undefined : limit,
        include: {
          _count: { select: { movements: true, alerts: true } },
        },
      }),
      prisma.product.count({ where }),
    ])

    // Filtrar low stock em memória se necessário
    let filteredProducts = products
    if (shouldFilterLowStock) {
      filteredProducts = products.filter(p => p.currentStock > 0 && p.currentStock <= p.minStock)
    }

    // Aplicar paginação após filtro lowStock
    const paginatedProducts = shouldFilterLowStock
      ? filteredProducts.slice(skip, skip + limit)
      : filteredProducts

    const finalTotal = shouldFilterLowStock ? filteredProducts.length : total

    return NextResponse.json({
      data: paginatedProducts,
      pagination: {
        page,
        limit,
        total: finalTotal,
        totalPages: Math.ceil(finalTotal / limit),
      },
    })
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/products - Criar novo produto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      code,
      barcode,
      name,
      description,
      category,
      unit,
      costPrice,
      salePrice,
      minStock,
      maxStock,
      location,
      supplier,
      ncm,
    } = body

    // Validações
    if (!code || !name || !category || !unit || costPrice === undefined || salePrice === undefined) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: code, name, category, unit, costPrice, salePrice' },
        { status: 400 }
      )
    }

    // Verificar se código já existe
    const existingCode = await prisma.product.findUnique({ where: { code } })
    if (existingCode) {
      return NextResponse.json({ error: 'Código/SKU já cadastrado' }, { status: 400 })
    }

    if (barcode) {
      const existingBarcode = await prisma.product.findUnique({ where: { barcode } })
      if (existingBarcode) {
        return NextResponse.json({ error: 'Código de barras já cadastrado' }, { status: 400 })
      }
    }

    const product = await prisma.product.create({
      data: {
        code,
        barcode,
        name,
        description,
        category,
        unit,
        costPrice,
        salePrice,
        minStock: minStock || 10,
        maxStock,
        location,
        supplier,
        ncm,
      },
    })

    // Verificar alerta de estoque baixo inicial
    if (product.currentStock <= product.minStock) {
      await prisma.stockAlert.create({
        data: {
          productId: product.id,
          type: product.currentStock <= 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
          message: product.currentStock <= 0
            ? `Produto ${product.name} está sem estoque!`
            : `Produto ${product.name} está com estoque baixo (${product.currentStock} ${product.unit})`,
        },
      })
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}