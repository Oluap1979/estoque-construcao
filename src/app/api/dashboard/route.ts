import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
export const dynamic = 'force-dynamic'


// GET /api/dashboard - Estatísticas do dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Estatísticas gerais
    const [
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalStockValue,
      totalStockCost,
      recentMovements,
      topCategories,
      recentAlerts,
    ] = await Promise.all([
      // Total de produtos
      prisma.product.count(),

      // Produtos ativos
      prisma.product.count({ where: { isActive: true } }),

      // Produtos com estoque baixo (usar raw query)
      prisma.$queryRaw`SELECT COUNT(*) as count FROM Product WHERE isActive = 1 AND currentStock > 0 AND currentStock <= minStock`,

      // Produtos sem estoque
      prisma.product.count({
        where: { isActive: true, currentStock: { lte: 0 } },
      }),

      // Valor total em estoque (preço de venda)
      prisma.product.aggregate({
        where: { isActive: true },
        _sum: { salePrice: true },
      }),

      // Custo total em estoque (preço de custo)
      prisma.product.aggregate({
        where: { isActive: true },
        _sum: { costPrice: true },
      }),

      // Movimentações recentes
      prisma.stockMovement.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          product: { select: { id: true, code: true, name: true, unit: true } },
        },
      }),

      // Top categorias por valor
      prisma.product.groupBy({
        by: ['category'],
        where: { isActive: true },
        _sum: { currentStock: true },
        _count: { id: true },
        orderBy: { _sum: { currentStock: 'desc' } },
        take: 5,
      }),

      // Alertas recentes não lidos
      prisma.stockAlert.findMany({
        where: { isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          product: { select: { id: true, code: true, name: true, unit: true, currentStock: true, minStock: true } },
        },
      }),
    ])

    // Extrair o count do raw query result
    const lowStockCount = Array.isArray(lowStockProducts) && lowStockProducts[0] ? Number(lowStockProducts[0].count) : 0

    // Movimentações por tipo nos últimos dias
    const movementsByType = await prisma.stockMovement.groupBy({
      by: ['type'],
      where: { createdAt: { gte: startDate } },
      _count: { id: true },
      _sum: { quantity: true, totalCost: true },
    })

    // Movimentações por dia (para gráfico)
    const movementsByDay = await prisma.$queryRaw`
      SELECT
        date(createdAt) as day,
        type,
        COUNT(*) as count,
        SUM(quantity) as total_quantity,
        SUM(totalCost) as total_cost
      FROM StockMovement
      WHERE createdAt >= ${startDate}
      GROUP BY date(createdAt), type
      ORDER BY day ASC
    ` as Array<{
      day: Date
      type: string
      count: number
      total_quantity: number
      total_cost: number
    }>

    // Produtos mais movimentados
    const topProducts = await prisma.stockMovement.groupBy({
      by: ['productId'],
      where: { createdAt: { gte: startDate } },
      _count: { id: true },
      _sum: { quantity: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    })

    // Buscar detalhes dos top produtos
    const topProductIds = topProducts.map((p) => p.productId)
    const topProductsDetails = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, code: true, name: true, unit: true },
    })

    const topProductsWithDetails = topProducts.map((p) => {
      const details = topProductsDetails.find((dp) => dp.id === p.productId)
      return {
        ...p,
        product: details,
      }
    })

    return NextResponse.json({
      stats: {
        totalProducts,
        activeProducts,
        lowStockProducts: lowStockCount,
        outOfStockProducts,
        totalStockValue: Number(totalStockValue._sum.salePrice || 0),
        totalStockCost: Number(totalStockCost._sum.costPrice || 0),
      },
      recentMovements,
      movementsByType,
      movementsByDay,
      topCategories,
      topProducts: topProductsWithDetails,
      recentAlerts,
    })
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}