import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
export const dynamic = 'force-dynamic'
import { MovementType } from '@/generated/prisma/client'


// GET /api/movements - Listar movimentações com filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const productId = searchParams.get('productId')
    const type = searchParams.get('type') as MovementType | null
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (productId) {
      where.productId = productId
    }

    if (type) {
      where.type = type
    }

    if (startDate || endDate) {
      where.createdAt = {}
      const createdAtFilter: Record<string, Date> = where.createdAt as Record<string, Date>
      if (startDate) createdAtFilter.gte = new Date(startDate)
      if (endDate) createdAtFilter.lte = new Date(endDate)
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          product: {
            select: { id: true, code: true, name: true, unit: true },
          },
        },
      }),
      prisma.stockMovement.count({ where }),
    ])

    return NextResponse.json({
      data: movements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/movements - Registrar nova movimentação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, type, quantity, unitCost, reference, notes, userId } = body

    if (!productId || !type || quantity === undefined || unitCost === undefined) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: productId, type, quantity, unitCost' },
        { status: 400 }
      )
    }

    // Verificar se produto existe
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    if (!product.isActive) {
      return NextResponse.json({ error: 'Produto está inativo' }, { status: 400 })
    }

    // Calcular custo total
    const totalCost = Math.abs(quantity) * Number(unitCost)

    // Determinar mudança no estoque
    let stockChange = 0
    switch (type) {
      case 'ENTRADA':
      case 'DEVOLUCAO':
        stockChange = Math.abs(quantity)
        break
      case 'SAIDA':
      case 'PERDA':
        stockChange = -Math.abs(quantity)
        break
      case 'AJUSTE':
        stockChange = quantity // Pode ser positivo ou negativo
        break
    }

    const newStock = product.currentStock + stockChange

    if (newStock < 0) {
      return NextResponse.json({ error: 'Estoque insuficiente para esta saída' }, { status: 400 })
    }

    // Transação: criar movimentação + atualizar estoque do produto
    const [movement] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          productId,
          type,
          quantity: stockChange,
          unitCost,
          totalCost,
          reference,
          notes,
          userId,
        },
      }),
      prisma.product.update({
        where: { id: productId },
        data: { currentStock: newStock },
      }),
    ])

    // Verificar alertas
    if (newStock <= 0 && product.currentStock > 0) {
      await prisma.stockAlert.create({
        data: {
          productId,
          type: 'OUT_OF_STOCK',
          message: `Produto ${product.name} ficou sem estoque após movimentação de ${type.toLowerCase()}`,
        },
      })
    } else if (newStock <= product.minStock && product.currentStock > product.minStock) {
      await prisma.stockAlert.create({
        data: {
          productId,
          type: 'LOW_STOCK',
          message: `Produto ${product.name} está com estoque baixo (${newStock} ${product.unit})`,
        },
      })
    } else if (newStock > product.minStock && product.currentStock <= product.minStock) {
      await prisma.stockAlert.updateMany({
        where: {
          productId,
          type: { in: ['LOW_STOCK', 'OUT_OF_STOCK'] },
          isRead: false,
        },
        data: { isRead: true, readAt: new Date() },
      })
    }

    // Verificar overstock
    if (product.maxStock && newStock >= product.maxStock && product.currentStock < product.maxStock) {
      await prisma.stockAlert.create({
        data: {
          productId,
          type: 'OVERSTOCK',
          message: `Produto ${product.name} atingiu estoque máximo (${newStock} ${product.unit})`,
        },
      })
    }

    return NextResponse.json(movement, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar movimentação:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}