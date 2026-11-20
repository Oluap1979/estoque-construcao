import prisma from './src/lib/prisma'
import { ProductCategory } from '@/generated/prisma/client'

async function main() {
  // Create some sample products
  const products: Array<{
    code: string
    barcode: string
    name: string
    description: string
    category: ProductCategory
    unit: string
    costPrice: number
    salePrice: number
    minStock: number
    maxStock: number
    location: string
    supplier: string
    ncm: string
  }> = [
    {
      code: 'CIM-001',
      barcode: '7891234567890',
      name: 'Cimento Portland CP-II-Z 50kg',
      description: 'Cimento Portland composto de alta resistência',
      category: 'CIMENTO',
      unit: 'UN',
      costPrice: 28.50,
      salePrice: 35.90,
      minStock: 20,
      maxStock: 100,
      location: 'A-01',
      supplier: 'Votorantim Cimentos',
      ncm: '25232910',
    },
    {
      code: 'ARE-001',
      barcode: '7891234567891',
      name: 'Areia Média Lavada m³',
      description: 'Areia média lavada para construção civil',
      category: 'AREIA',
      unit: 'M3',
      costPrice: 85.00,
      salePrice: 120.00,
      minStock: 5,
      maxStock: 30,
      location: 'Pátio',
      supplier: 'Areia Sul',
      ncm: '25059000',
    },
    {
      code: 'BRI-001',
      barcode: '7891234567892',
      name: 'Brita 1 (9,5-19mm) m³',
      description: 'Brita graduada para concreto',
      category: 'BRITA',
      unit: 'M3',
      costPrice: 95.00,
      salePrice: 135.00,
      minStock: 5,
      maxStock: 25,
      location: 'Pátio',
      supplier: 'Brita Forte',
      ncm: '25171000',
    },
    {
      code: 'TIJ-001',
      barcode: '7891234567893',
      name: 'Tijolo Baiano 8 Furos',
      description: 'Tijolo cerâmico 8 furos 9x14x19cm',
      category: 'TIJOLO',
      unit: 'UN',
      costPrice: 0.85,
      salePrice: 1.20,
      minStock: 500,
      maxStock: 2000,
      location: 'B-01',
      supplier: 'Cerâmica São João',
      ncm: '69041000',
    },
    {
      code: 'BLO-001',
      barcode: '7891234567894',
      name: 'Bloco de Concreto 14x19x39cm',
      description: 'Bloco estrutural de concreto',
      category: 'BLOCO',
      unit: 'UN',
      costPrice: 3.50,
      salePrice: 5.20,
      minStock: 100,
      maxStock: 500,
      location: 'B-02',
      supplier: 'Blocos Paraná',
      ncm: '68101100',
    },
    {
      code: 'TEL-001',
      barcode: '7891234567895',
      name: 'Telha Cerâmica Colonial',
      description: 'Telha cerâmica modelo colonial',
      category: 'TELHA',
      unit: 'UN',
      costPrice: 2.80,
      salePrice: 4.20,
      minStock: 200,
      maxStock: 1000,
      location: 'C-01',
      supplier: 'Telhas Brasil',
      ncm: '69051000',
    },
    {
      code: 'CAN-001',
      barcode: '7891234567896',
      name: 'Cano PVC 100mm x 6m',
      description: 'Cano PVC soldável para esgoto',
      category: 'CANO',
      unit: 'UN',
      costPrice: 45.00,
      salePrice: 65.00,
      minStock: 20,
      maxStock: 100,
      location: 'D-01',
      supplier: 'Tigre',
      ncm: '39172310',
    },
    {
      code: 'FIO-001',
      barcode: '7891234567897',
      name: 'Fio de Cobre 2,5mm 100m',
      description: 'Fio de cobre flexível 750V',
      category: 'FIO',
      unit: 'UN',
      costPrice: 180.00,
      salePrice: 250.00,
      minStock: 10,
      maxStock: 50,
      location: 'E-01',
      supplier: 'Sil Fios',
      ncm: '85444910',
    },
    {
      code: 'TIN-001',
      barcode: '7891234567898',
      name: 'Tinta Acrílica Branca 18L',
      description: 'Tinta acrílica premium para parede',
      category: 'TINTA',
      unit: 'UN',
      costPrice: 120.00,
      salePrice: 180.00,
      minStock: 15,
      maxStock: 60,
      location: 'F-01',
      supplier: 'Suvinil',
      ncm: '32091000',
    },
    {
      code: 'FER-001',
      barcode: '7891234567899',
      name: 'Martelo de Unha 500g',
      description: 'Martelo de unha com cabo de fibra',
      category: 'FERRAMENTA',
      unit: 'UN',
      costPrice: 35.00,
      salePrice: 55.00,
      minStock: 10,
      maxStock: 30,
      location: 'G-01',
      supplier: 'Tramontina',
      ncm: '82052000',
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { code: product.code },
      update: product,
      create: product,
    })
    console.log(`Upserted: ${product.name}`)
  }

  // Create a stock movement (entrada) for each product to have initial stock
  const createdProducts = await prisma.product.findMany()
  
  for (const product of createdProducts) {
    // Check if initial stock movement already exists
    const existingMovement = await prisma.stockMovement.findFirst({
      where: {
        productId: product.id,
        reference: 'ESTOQUE INICIAL',
      },
    })
    
    if (!existingMovement) {
      const costPrice = Number(product.costPrice)
      const quantity = product.minStock * 2
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: 'ENTRADA',
          quantity,
          unitCost: costPrice,
          totalCost: costPrice * quantity,
          reference: 'ESTOQUE INICIAL',
          notes: 'Carga inicial do sistema',
        },
      })
      console.log(`Created initial stock for: ${product.name}`)
    }
  }

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
