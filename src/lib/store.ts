'use client'

// Tipos baseados no schema Prisma original
export type ProductCategory =
  | 'CIMENTO' | 'AREIA' | 'BRITA' | 'TIJOLO' | 'BLOCO' | 'TELHA' | 'CANO'
  | 'FIO' | 'TINTA' | 'FERRAMENTA' | 'EPI' | 'HIDRAULICA' | 'ELETRICA'
  | 'MADEIRA' | 'METAL' | 'IMPERMEABILIZANTE' | 'ARGAMASSA' | 'REJUNTE' | 'OUTROS'

export type MovementType = 'ENTRADA' | 'SAIDA' | 'AJUSTE' | 'PERDA' | 'DEVOLUCAO'

export type AlertType = 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK'

export interface Product {
  id: string
  code: string
  barcode: string | null
  name: string
  description: string | null
  category: ProductCategory
  unit: string
  costPrice: number
  salePrice: number
  minStock: number
  maxStock: number | null
  currentStock: number
  location: string | null
  supplier: string | null
  ncm: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface StockMovement {
  id: string
  productId: string
  type: MovementType
  quantity: number
  unitCost: number
  totalCost: number
  reference: string | null
  notes: string | null
  userId: string | null
  createdAt: string
  product?: Product
}

export interface StockAlert {
  id: string
  productId: string
  type: AlertType
  message: string
  isRead: boolean
  createdAt: string
  readAt: string | null
  product?: Product
}

// Chaves do localStorage
const STORAGE_KEYS = {
  products: 'estoque_products',
  movements: 'estoque_movements',
  alerts: 'estoque_alerts',
  initialized: 'estoque_initialized',
} as const

// Utilitários
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function nowISO(): string {
  return new Date().toISOString()
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Erro ao salvar no localStorage:', e)
  }
}

// Seed inicial com dados de exemplo
const INITIAL_PRODUCTS: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    code: 'CIM-001',
    barcode: '7891234567890',
    name: 'Cimento Portland CP-II 50kg',
    description: 'Cimento Portland composto para uso geral',
    category: 'CIMENTO',
    unit: 'UN',
    costPrice: 28.90,
    salePrice: 36.90,
    minStock: 20,
    maxStock: 200,
    currentStock: 45,
    location: 'A-01',
    supplier: 'Votorantim Cimentos',
    ncm: '25232910',
    isActive: true,
  },
  {
    code: 'ARE-001',
    barcode: '7891234567891',
    name: 'Areia Média Lavada 1m³',
    description: 'Areia média lavada para construção civil',
    category: 'AREIA',
    unit: 'M3',
    costPrice: 85.00,
    salePrice: 120.00,
    minStock: 5,
    maxStock: 50,
    currentStock: 12,
    location: 'Pátio - Setor 1',
    supplier: 'Areia & Cia',
    ncm: '25059000',
    isActive: true,
  },
  {
    code: 'BRI-001',
    barcode: '7891234567892',
    name: 'Brita 1 (9,5-19mm) 1m³',
    description: 'Brita graduada para concreto',
    category: 'BRITA',
    unit: 'M3',
    costPrice: 95.00,
    salePrice: 135.00,
    minStock: 5,
    maxStock: 40,
    currentStock: 8,
    location: 'Pátio - Setor 2',
    supplier: 'Pedreira São José',
    ncm: '25171000',
    isActive: true,
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
    maxStock: 10000,
    currentStock: 2500,
    location: 'Galpão B - Prateleira 1-5',
    supplier: 'Cerâmica União',
    ncm: '69041000',
    isActive: true,
  },
  {
    code: 'BLO-001',
    barcode: '7891234567894',
    name: 'Bloco de Concreto 14x19x39cm',
    description: 'Bloco estrutural de concreto',
    category: 'BLOCO',
    unit: 'UN',
    costPrice: 3.20,
    salePrice: 4.50,
    minStock: 200,
    maxStock: 5000,
    currentStock: 150,
    location: 'Galpão B - Prateleira 6-10',
    supplier: 'Blocos Forte',
    ncm: '68101100',
    isActive: true,
  },
  {
    code: 'TEL-001',
    barcode: '7891234567895',
    name: 'Telha Cerâmica Colonial',
    description: 'Telha cerâmica modelo colonial',
    category: 'TELHA',
    unit: 'UN',
    costPrice: 2.10,
    salePrice: 3.20,
    minStock: 300,
    maxStock: 5000,
    currentStock: 850,
    location: 'Galpão A - Setor Telhas',
    supplier: 'Telhas Brasil',
    ncm: '69051000',
    isActive: true,
  },
  {
    code: 'CAN-001',
    barcode: '7891234567896',
    name: 'Cano PVC 50mm x 3m',
    description: 'Cano PVC soldável para água fria',
    category: 'CANO',
    unit: 'UN',
    costPrice: 18.50,
    salePrice: 26.90,
    minStock: 30,
    maxStock: 200,
    currentStock: 5,
    location: 'A-03',
    supplier: 'Tigre',
    ncm: '39172300',
    isActive: true,
  },
  {
    code: 'FIO-001',
    barcode: '7891234567897',
    name: 'Fio 2,5mm 100m (Azul)',
    description: 'Fio de cobre flexível 750V',
    category: 'FIO',
    unit: 'CX',
    costPrice: 185.00,
    salePrice: 265.00,
    minStock: 10,
    maxStock: 100,
    currentStock: 22,
    location: 'A-04',
    supplier: 'Sil Fios',
    ncm: '85444900',
    isActive: true,
  },
  {
    code: 'TIN-001',
    barcode: '7891234567898',
    name: 'Tinta Acrílica Branca 18L',
    description: 'Tinta acrílica premium fosca',
    category: 'TINTA',
    unit: 'UN',
    costPrice: 145.00,
    salePrice: 210.00,
    minStock: 15,
    maxStock: 100,
    currentStock: 30,
    location: 'A-05',
    supplier: 'Suvinil',
    ncm: '32091000',
    isActive: true,
  },
  {
    code: 'FER-001',
    barcode: '7891234567899',
    name: 'Furadeira de Impacto 650W',
    description: 'Furadeira profissional 1/2" com maleta',
    category: 'FERRAMENTA',
    unit: 'UN',
    costPrice: 280.00,
    salePrice: 399.00,
    minStock: 3,
    maxStock: 20,
    currentStock: 8,
    location: 'A-06',
    supplier: 'Bosch',
    ncm: '84672100',
    isActive: true,
  },
]

// Inicialização
export function initializeStore(): void {
  if (typeof window === 'undefined') return
  if (localStorage.getItem(STORAGE_KEYS.initialized)) return

  const products: Product[] = INITIAL_PRODUCTS.map((p) => ({
    ...p,
    id: generateId(),
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }))

  write(STORAGE_KEYS.products, products)
  write(STORAGE_KEYS.movements, [])
  write(STORAGE_KEYS.alerts, [])
  localStorage.setItem(STORAGE_KEYS.initialized, 'true')
}

// ===== PRODUCTS =====
export function getProducts(): Product[] {
  return read<Product[]>(STORAGE_KEYS.products, [])
}

export function getProduct(id: string): Product | undefined {
  return getProducts().find((p) => p.id === id)
}

export function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  const products = getProducts()
  const now = nowISO()
  const product: Product = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  write(STORAGE_KEYS.products, [...products, product])
  checkAndCreateAlerts(product)
  return product
}

export function updateProduct(id: string, data: Partial<Product>): Product | null {
  const products = getProducts()
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) return null

  const oldProduct = products[index]
  const updated: Product = {
    ...oldProduct,
    ...data,
    id: oldProduct.id,
    createdAt: oldProduct.createdAt,
    updatedAt: nowISO(),
  }
  products[index] = updated
  write(STORAGE_KEYS.products, products)
  checkAndCreateAlerts(updated, oldProduct)
  return updated
}

export function deleteProduct(id: string): boolean {
  const products = getProducts()
  const filtered = products.filter((p) => p.id !== id)
  if (filtered.length === products.length) return false
  write(STORAGE_KEYS.products, filtered)
  return true
}

// ===== MOVEMENTS =====
export function getMovements(): StockMovement[] {
  return read<StockMovement[]>(STORAGE_KEYS.movements, [])
}

export function createMovement(
  data: Omit<StockMovement, 'id' | 'createdAt' | 'product'>
): StockMovement {
  const products = getProducts()
  const product = products.find((p) => p.id === data.productId)
  if (!product) throw new Error('Produto não encontrado')
  if (!product.isActive) throw new Error('Produto está inativo')

  const quantity = Math.abs(data.quantity)
  let stockChange = 0
  switch (data.type) {
    case 'ENTRADA':
    case 'DEVOLUCAO':
      stockChange = quantity
      break
    case 'SAIDA':
    case 'PERDA':
      stockChange = -quantity
      break
    case 'AJUSTE':
      stockChange = data.quantity
      break
  }

  const newStock = product.currentStock + stockChange
  if (newStock < 0) throw new Error('Estoque insuficiente para esta saída')

  const totalCost = quantity * data.unitCost

  const movement: StockMovement = {
    ...data,
    quantity: stockChange,
    totalCost,
    id: generateId(),
    createdAt: nowISO(),
  }

  // Atualiza estoque do produto
  updateProduct(data.productId, { currentStock: newStock })

  // Salva movimentação
  const movements = getMovements()
  write(STORAGE_KEYS.movements, [movement, ...movements])

  // Alertas
  checkAndCreateAlerts({ ...product, currentStock: newStock }, product)

  return movement
}

// ===== ALERTS =====
export function getAlerts(): StockAlert[] {
  return read<StockAlert[]>(STORAGE_KEYS.alerts, [])
}

export function markAlertsAsRead(ids: string[]): void {
  const alerts = getAlerts()
  const updated = alerts.map((a) =>
    ids.includes(a.id) ? { ...a, isRead: true, readAt: nowISO() } : a
  )
  write(STORAGE_KEYS.alerts, updated)
}

export function markAllAlertsAsRead(): void {
  const alerts = getAlerts()
  const updated = alerts.map((a) => (a.isRead ? a : { ...a, isRead: true, readAt: nowISO() }))
  write(STORAGE_KEYS.alerts, updated)
}

function checkAndCreateAlerts(product: Product, oldProduct?: Product): void {
  const alerts = getAlerts()
  const newAlerts: StockAlert[] = []

  // Estoque zerado
  if (product.currentStock <= 0 && (!oldProduct || oldProduct.currentStock > 0)) {
    newAlerts.push({
      id: generateId(),
      productId: product.id,
      type: 'OUT_OF_STOCK',
      message: `Produto ${product.name} está sem estoque!`,
      isRead: false,
      createdAt: nowISO(),
      readAt: null,
    })
  }
  // Estoque baixo
  else if (
    product.currentStock > 0 &&
    product.currentStock <= product.minStock &&
    (!oldProduct || oldProduct.currentStock > product.minStock)
  ) {
    newAlerts.push({
      id: generateId(),
      productId: product.id,
      type: 'LOW_STOCK',
      message: `Produto ${product.name} está com estoque baixo (${product.currentStock} ${product.unit})`,
      isRead: false,
      createdAt: nowISO(),
      readAt: null,
    })
  }
  // Resolveu estoque baixo
  else if (
    product.currentStock > product.minStock &&
    oldProduct &&
    oldProduct.currentStock <= product.minStock
  ) {
    // Marca alertas antigos como lidos
    markAlertsAsRead(
      alerts
        .filter((a) => a.productId === product.id && (a.type === 'LOW_STOCK' || a.type === 'OUT_OF_STOCK') && !a.isRead)
        .map((a) => a.id)
    )
  }

  // Overstock
  if (
    product.maxStock &&
    product.currentStock >= product.maxStock &&
    (!oldProduct || oldProduct.currentStock < product.maxStock)
  ) {
    newAlerts.push({
      id: generateId(),
      productId: product.id,
      type: 'OVERSTOCK',
      message: `Produto ${product.name} atingiu estoque máximo (${product.currentStock} ${product.unit})`,
      isRead: false,
      createdAt: nowISO(),
      readAt: null,
    })
  }

  if (newAlerts.length > 0) {
    write(STORAGE_KEYS.alerts, [...newAlerts, ...alerts])
  }
}

// ===== DASHBOARD =====
export function getDashboardStats() {
  const products = getProducts()
  const movements = getMovements()
  const alerts = getAlerts()

  const activeProducts = products.filter((p) => p.isActive)
  const lowStockProducts = activeProducts.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStock)
  const outOfStockProducts = activeProducts.filter((p) => p.currentStock <= 0)

  const totalStockValue = activeProducts.reduce((sum, p) => sum + p.salePrice * p.currentStock, 0)
  const totalStockCost = activeProducts.reduce((sum, p) => sum + p.costPrice * p.currentStock, 0)

  const recentMovements = movements.slice(0, 10).map((m) => {
    const product = getProduct(m.productId)
    return {
      ...m,
      product: product ? { id: product.id, code: product.code, name: product.name, unit: product.unit } : undefined,
    }
  })

  const recentAlerts = alerts
    .filter((a) => !a.isRead)
    .slice(0, 5)
    .map((a) => {
      const product = getProduct(a.productId)
      return {
        ...a,
        product: product
          ? {
              id: product.id,
              code: product.code,
              name: product.name,
              unit: product.unit,
              currentStock: product.currentStock,
              minStock: product.minStock,
            }
          : undefined,
      }
    })

  return {
    stats: {
      totalProducts: products.length,
      activeProducts: activeProducts.length,
      lowStockProducts: lowStockProducts.length,
      outOfStockProducts: outOfStockProducts.length,
      totalStockValue,
      totalStockCost,
    },
    recentMovements,
    recentAlerts,
  }
}

// ===== RELATÓRIOS =====
export function getMovementsByPeriod(days: number) {
  const movements = getMovements()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return movements.filter((m) => new Date(m.createdAt) >= startDate)
}

export function getTopProducts(days: number, limit = 10) {
  const movements = getMovementsByPeriod(days)
  const productCounts = new Map<string, { count: number; totalQty: number }>()

  movements.forEach((m) => {
    const existing = productCounts.get(m.productId) || { count: 0, totalQty: 0 }
    existing.count += 1
    existing.totalQty += Math.abs(m.quantity)
    productCounts.set(m.productId, existing)
  })

  return Array.from(productCounts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([productId, data]) => {
      const product = getProduct(productId)
      return { productId, ...data, product }
    })
}