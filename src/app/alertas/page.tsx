'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, Bell, Check, CheckCheck, Filter, ChevronLeft, ChevronRight, Eye, RefreshCw } from 'lucide-react'
import { Layout } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Table, TablePagination } from '@/components/ui/Table'
import { useToast } from '@/components/ui/Toast'
import { formatNumber, formatShortDate, getAlertTypeColor } from '@/lib/utils'
import { StockAlert, Product, getAlerts, markAlertsAsRead, markAllAlertsAsRead, getProducts, initializeStore } from '@/lib/store'

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AlertasPage() {
  const { success, error: toastError } = useToast()
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('unread')
  const [typeFilter, setTypeFilter] = useState('')

  const fetchData = useCallback(() => {
    setLoading(true)
    try {
      initializeStore()
      const allProducts = getProducts()
      setProducts(allProducts)

      let allAlerts = getAlerts()

      // Filtros
      if (readFilter !== 'all') {
        allAlerts = allAlerts.filter((a) => (readFilter === 'unread') === !a.isRead)
      }
      if (typeFilter) {
        allAlerts = allAlerts.filter((a) => a.type === typeFilter)
      }

      const unread = allAlerts.filter((a) => !a.isRead).length
      const total = allAlerts.length
      const totalPages = Math.ceil(total / pagination.limit)
      const start = (pagination.page - 1) * pagination.limit
      const paginatedAlerts = allAlerts.slice(start, start + pagination.limit)

      // Enriquecer com dados do produto
      const enrichedAlerts = paginatedAlerts.map((a) => {
        const product = allProducts.find((p) => p.id === a.productId)
        return { ...a, product }
      })

      setAlerts(enrichedAlerts)
      setPagination((prev) => ({ ...prev, total, totalPages }))
      setUnreadCount(unread)
    } catch (err) {
      toastError('Erro', err instanceof Error ? err.message : 'Erro ao carregar alertas')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, readFilter, typeFilter, toastError])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const markAsRead = async (alertIds: string[]) => {
    try {
      markAlertsAsRead(alertIds)
      success('Alertas marcados como lidos')
      fetchData()
    } catch (err) {
      toastError('Erro', err instanceof Error ? err.message : 'Erro ao atualizar alertas')
    }
  }

  const markAllAsRead = async () => {
    try {
      markAllAlertsAsRead()
      success('Todos os alertas marcados como lidos')
      fetchData()
    } catch (err) {
      toastError('Erro', err instanceof Error ? err.message : 'Erro ao atualizar alertas')
    }
  }

  const getAlertTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      LOW_STOCK: 'Estoque Baixo',
      OUT_OF_STOCK: 'Sem Estoque',
      OVERSTOCK: 'Estoque Alto',
    }
    return labels[type] || type
  }

  const columns = [
    {
      key: 'type',
      header: 'Tipo',
      render: (row: StockAlert & { product?: Product }) => (
        <Badge className={getAlertTypeColor(row.type)}>
          {getAlertTypeLabel(row.type)}
        </Badge>
      ),
    },
    {
      key: 'product',
      header: 'Produto',
      render: (row: StockAlert & { product?: Product }) => (
        <div>
          <p className={`font-medium ${!row.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
            {row.product?.name || 'Produto removido'}
          </p>
          <p className="text-xs text-gray-500">{row.product?.code || ''}</p>
        </div>
      ),
    },
    {
      key: 'message',
      header: 'Mensagem',
      render: (row: StockAlert & { product?: Product }) => (
        <p className={!row.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}>
          {row.message}
        </p>
      ),
    },
    {
      key: 'stock',
      header: 'Estoque Atual',
      render: (row: StockAlert & { product?: Product }) => (
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {formatNumber(row.product?.currentStock || 0)} {row.product?.unit || ''}
          </Badge>
          {row.product && row.product.minStock > 0 && (
            <Badge variant="outline" className="text-xs text-amber-700 bg-amber-50 border-amber-200">
              Mín: {formatNumber(row.product.minStock)}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Data',
      render: (row: StockAlert & { product?: Product }) => formatShortDate(row.createdAt),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: StockAlert & { product?: Product }) => (
        <Badge variant={row.isRead ? 'success' : 'warning'}>
          {row.isRead ? 'Lido' : 'Não lido'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (row: StockAlert & { product?: Product }) => (
        <div className="flex items-center gap-1">
          {!row.isRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAsRead([row.id])}
              aria-label="Marcar como lido"
            >
              <Check className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" aria-label="Ver produto">
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  const unreadAlerts = alerts.filter((a) => !a.isRead)
  const selectedUnreadIds = unreadAlerts.map((a) => a.id)

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Alertas de Estoque
              {unreadCount > 0 && (
                <Badge variant="danger" className="text-sm">
                  {unreadCount} não lidos
                </Badge>
              )}
            </h1>
            <p className="text-gray-500 mt-1">Monitore produtos com estoque baixo ou zerado</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
            {unreadCount > 0 && (
              <Button variant="primary" onClick={markAllAsRead}>
                <CheckCheck className="w-4 h-4" />
                Marcar todos como lidos
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total de Alertas</p>
                  <p className="text-3xl font-bold text-gray-900">{pagination.total}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Não Lidos</p>
                  <p className="text-3xl font-bold text-red-600">{unreadCount}</p>
                </div>
                <Bell className="w-12 h-12 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Lidos</p>
                  <p className="text-3xl font-bold text-green-600">{pagination.total - unreadCount}</p>
                </div>
                <CheckCheck className="w-12 h-12 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 pt-0">
            <div className="flex flex-wrap items-end gap-4">
              <Select
                options={[
                  { value: 'unread', label: 'Não lidos' },
                  { value: 'read', label: 'Lidos' },
                  { value: 'all', label: 'Todos' },
                ]}
                value={readFilter}
                onChange={(e) => setReadFilter(e.target.value as typeof readFilter)}
                placeholder="Status"
                className="w-40"
              />
              <Select
                options={[
                  { value: '', label: 'Todos os tipos' },
                  { value: 'LOW_STOCK', label: 'Estoque Baixo' },
                  { value: 'OUT_OF_STOCK', label: 'Sem Estoque' },
                  { value: 'OVERSTOCK', label: 'Estoque Alto' },
                ]}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                placeholder="Tipo"
                className="w-48"
              />
              {selectedUnreadIds.length > 0 && (
                <Button variant="primary" onClick={() => markAsRead(selectedUnreadIds)} className="ml-auto">
                  <Check className="w-4 h-4" />
                  Marcar {selectedUnreadIds.length} como lidos
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alerts Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-600 border-t-transparent mx-auto" />
              </div>
            ) : (
              <>
                <Table
                  columns={columns}
                  data={alerts}
                  keyExtractor={(row) => row.id}
                  emptyMessage={readFilter === 'unread' ? 'Nenhum alerta não lido! 🎉' : 'Nenhum alerta encontrado'}
                />
                {pagination.totalPages > 1 && (
                  <TablePagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Results info */}
        <div className="text-sm text-gray-500">
          Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} alertas
        </div>
      </div>
    </Layout>
  )
}