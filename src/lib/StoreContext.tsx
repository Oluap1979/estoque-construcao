'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react'
import type { Product, StockMovement, StockAlert, ProductCategory, MovementType } from './store'
export type { Product, StockMovement, StockAlert, ProductCategory, MovementType } from './store'
import {
  initializeStore,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getMovements,
  createMovement,
  getAlerts,
  markAlertsAsRead,
  markAllAlertsAsRead,
  getDashboardStats,
  getMovementsByPeriod,
  getTopProducts,
} from './store'

interface StoreContextType {
  // State
  products: Product[]
  movements: StockMovement[]
  alerts: StockAlert[]
  loading: boolean
  initialized: boolean

  // Products
  createProduct: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product
  updateProduct: (id: string, data: Partial<Product>) => Product | null
  deleteProduct: (id: string) => boolean
  refreshProducts: () => void

  // Movements
  createMovement: (data: Omit<StockMovement, 'id' | 'createdAt' | 'product'>) => StockMovement
  refreshMovements: () => void

  // Alerts
  markAlertsAsRead: (ids: string[]) => void
  markAllAlertsAsRead: () => void
  refreshAlerts: () => void

  // Dashboard/Reports
  getDashboardStats: () => ReturnType<typeof getDashboardStats>
  getMovementsByPeriod: (days: number) => StockMovement[]
  getTopProducts: (days: number, limit?: number) => ReturnType<typeof getTopProducts>
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const isClient = typeof window !== 'undefined'

  // Initialize synchronously on client for static generation
  const initialProducts = isClient ? getProducts() : []
  const initialMovements = isClient ? getMovements() : []
  const initialAlerts = isClient ? getAlerts() : []
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [movements, setMovements] = useState<StockMovement[]>(initialMovements)
  const [alerts, setAlerts] = useState<StockAlert[]>(initialAlerts)
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(isClient)

  // Initialize store on mount (for seeding if needed)
  useEffect(() => {
    if (!isClient) return
    try {
      initializeStore()
      setProducts(getProducts())
      setMovements(getMovements())
      setAlerts(getAlerts())
      setInitialized(true)
    } catch (e) {
      console.error('Store init error:', e)
    }
  }, [])

  // Refresh functions
  const refreshProducts = useCallback(() => setProducts(getProducts()), [])
  const refreshMovements = useCallback(() => setMovements(getMovements()), [])
  const refreshAlerts = useCallback(() => setAlerts(getAlerts()), [])

  // Product actions
  const handleCreateProduct = useCallback((data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const product = createProduct(data)
    setProducts(getProducts())
    setAlerts(getAlerts())
    return product
  }, [])

  const handleUpdateProduct = useCallback((id: string, data: Partial<Product>) => {
    const product = updateProduct(id, data)
    setProducts(getProducts())
    setAlerts(getAlerts())
    return product
  }, [])

  const handleDeleteProduct = useCallback((id: string) => {
    const result = deleteProduct(id)
    setProducts(getProducts())
    return result
  }, [])

  // Movement actions
  const handleCreateMovement = useCallback((data: Omit<StockMovement, 'id' | 'createdAt' | 'product'>) => {
    const movement = createMovement(data)
    setProducts(getProducts())
    setMovements(getMovements())
    setAlerts(getAlerts())
    return movement
  }, [])

  // Alert actions
  const handleMarkAlertsAsRead = useCallback((ids: string[]) => {
    markAlertsAsRead(ids)
    setAlerts(getAlerts())
  }, [])

  const handleMarkAllAlertsAsRead = useCallback(() => {
    markAllAlertsAsRead()
    setAlerts(getAlerts())
  }, [])

  // Computed/Report functions
  const getDashboardStatsFn = useCallback(() => getDashboardStats(), [])
  const getMovementsByPeriodFn = useCallback((days: number) => getMovementsByPeriod(days), [])
  const getTopProductsFn = useCallback((days: number, limit?: number) => getTopProducts(days, limit), [])

  const value = useMemo(() => ({
    products,
    movements,
    alerts,
    loading,
    initialized,
    createProduct: handleCreateProduct,
    updateProduct: handleUpdateProduct,
    deleteProduct: handleDeleteProduct,
    refreshProducts,
    createMovement: handleCreateMovement,
    refreshMovements,
    markAlertsAsRead: handleMarkAlertsAsRead,
    markAllAlertsAsRead: handleMarkAllAlertsAsRead,
    refreshAlerts,
    getDashboardStats: getDashboardStatsFn,
    getMovementsByPeriod: getMovementsByPeriodFn,
    getTopProducts: getTopProductsFn,
  }), [
    products, movements, alerts, loading, initialized,
    handleCreateProduct, handleUpdateProduct, handleDeleteProduct, refreshProducts,
    handleCreateMovement, refreshMovements,
    handleMarkAlertsAsRead, handleMarkAllAlertsAsRead, refreshAlerts,
    getDashboardStatsFn, getMovementsByPeriodFn, getTopProductsFn
  ])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore must be used within StoreProvider')
  return context
}