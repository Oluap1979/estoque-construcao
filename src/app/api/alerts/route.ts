import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
export const dynamic = 'force-dynamic'


// GET /api/alerts - Listar alertas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const isRead = searchParams.get('isRead')
    const type = searchParams.get('type')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (isRead !== null) {
      where.isRead = isRead === 'true'
    }

    if (type) {
      where.type = type
    }

    const [alerts, total, unreadCount] = await Promise.all([
      prisma.stockAlert.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          product: {
            select: { id: true, code: true, name: true, unit: true, currentStock: true, minStock: true },
          },
        },
      }),
      prisma.stockAlert.count({ where }),
      prisma.stockAlert.count({ where: { isRead: false } }),
    ])

    return NextResponse.json({
      data: alerts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    })
  } catch (error) {
    console.error('Erro ao buscar alertas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PATCH /api/alerts - Marcar alertas como lidos
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { alertIds, markAllAsRead } = body

    if (markAllAsRead) {
      await prisma.stockAlert.updateMany({
        where: { isRead: false },
        data: { isRead: true, readAt: new Date() },
      })
      return NextResponse.json({ message: 'Todos os alertas marcados como lidos' })
    }

    if (alertIds && Array.isArray(alertIds) && alertIds.length > 0) {
      await prisma.stockAlert.updateMany({
        where: { id: { in: alertIds } },
        data: { isRead: true, readAt: new Date() },
      })
      return NextResponse.json({ message: 'Alertas marcados como lidos' })
    }

    return NextResponse.json({ error: 'Nenhum alerta especificado' }, { status: 400 })
  } catch (error) {
    console.error('Erro ao atualizar alertas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}