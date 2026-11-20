import prisma from './src/lib/prisma'

async function main() {
  // Get all products with their movements
  const products = await prisma.product.findMany({
    include: {
      movements: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  for (const product of products) {
    let currentStock = 0
    
    for (const movement of product.movements) {
      let stockChange = 0
      switch (movement.type) {
        case 'ENTRADA':
        case 'DEVOLUCAO':
          stockChange = Math.abs(movement.quantity)
          break
        case 'SAIDA':
        case 'PERDA':
          stockChange = -Math.abs(movement.quantity)
          break
        case 'AJUSTE':
          stockChange = movement.quantity
          break
      }
      currentStock += stockChange
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { currentStock },
    })
    
    console.log(`Updated ${product.name}: currentStock = ${currentStock}`)
  }

  console.log('Stock fix completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
