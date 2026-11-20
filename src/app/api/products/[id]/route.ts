import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
export const dynamic = 'force-dynamic'


// GET /api/products/[id] - Buscar produto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        alerts: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT /api/products/[id] - Atualizar produto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      currentStock,
      location,
      supplier,
      ncm,
      isActive,
    } = body

    // Verificar se produto existe
    const existingProduct = await prisma.product.findUnique({ where: { id } })
    if (!existingProduct) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Verificar código duplicado
    if (code && code !== existingProduct.code) {
      const codeExists = await prisma.product.findUnique({ where: { code } })
      if (codeExists) {
        return NextResponse.json({ error: 'Código/SKU já cadastrado' }, { status: 400 })
      }
    }

    // Verificar barcode duplicado
    if (barcode && barcode !== existingProduct.barcode) {
      const barcodeExists = await prisma.product.findUnique({ where: { barcode } })
      if (barcodeExists) {
        return NextResponse.json({ error: 'Código de barras já cadastrado' }, { status: 400 })
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
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
        currentStock,
        location,
        supplier,
        ncm,
        isActive,
      },
    })

    // Verificar alertas após atualização
    if (currentStock !== undefined && currentStock !== existingProduct.currentStock) {
      if (currentStock <= 0 && existingProduct.currentStock > 0) {
        await prisma.stockAlert.create({
          data: {
            productId: product.id,
            type: 'OUT_OF_STOCK',
            message: `Produto ${product.name} ficou sem estoque!`,
          },
        })
      } else if (currentStock <= product.minStock && existingProduct.currentStock > product.minStock) {
        await prisma.stockAlert.create({
          data: {
            productId: product.id,
            type: 'LOW_STOCK',
            message: `Produto ${product.name} está com estoque baixo (${currentStock} ${product.unit})`,
          },
        })
      } else if (currentStock > product.minStock && existingProduct.currentStock <= product.minStock) {
        // Resolver alertas de estoque baixo
        await prisma.stockAlert.updateMany({
          where: {
            productId: product.id,
            type: { in: ['LOW_STOCK', 'OUT_OF_STOCK'] },
            isRead: false,
          },
          data: { isRead: true, readAt: new Date() },
        })
      }
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE /api/products/[id] - Excluir produto (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Soft delete - apenas desativa
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ message: 'Produto desativado com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}