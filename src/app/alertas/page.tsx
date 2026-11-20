'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { AlertTriangle, Bell, Check, CheckCheck, Filter, ChevronLeft, ChevronRight, Eye, RefreshCw } from 'lucide-react'
import { Layout } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Table, TablePagination } from '@/components/ui/Table'
import { useToast } from '@/components/ui/Toast'
import { formatNumber, formatShortDate, getAlertTypeColor } from '@/lib/utils'
import { StockAlert, Product, useStore } from '@/lib/StoreContext'

interface Pagination { page: number; limit: number; total: number; totalPages: number }

export default function AlertasPage() {
  const { alerts: allAlerts, products: allProducts, markAlertsAsRead, markAllAlertsAsRead, loading, initialized } = useStore()
  const { success, error: toastError } = useToast()

  const [displayAlerts, setDisplayAlerts] = useState<(StockAlert & { product?: Product })[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 })
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('unread')
  const [typeFilter, setTypeFilter] = useState('')

  // Filter & paginate
  const filteredAlerts = useMemo(() => {
    let result = allAlerts
    if (readFilter !== 'all') result = result.filter(a => (readFilter === 'unread') === !a.isRead)
    if (typeFilter) result = result.filter(a => a.type === typeFilter)
    return result
  }, [allAlerts, readFilter, typeFilter])

  const enrichedAlerts = useMemo(() => filteredAlerts.map(a => ({ ...a, product: allProducts.find(p => p.id === a.productId) })), [filteredAlerts, allProducts])

  const unreadCount = useMemo(() => allAlerts.filter(a => !a.isRead).length, [allAlerts])

  useEffect(() => {
    const total = enrichedAlerts.length
    const totalPages = Math.max(1, Math.ceil(total / pagination.limit))
    const page = Math.min(pagination.page, totalPages)
    const start = (page - 1) * pagination.limit
    setDisplayAlerts(enrichedAlerts.slice(start, start + pagination.limit))
    setPagination(prev => ({ ...prev, total, totalPages, page }))
  }, [enrichedAlerts, pagination.limit])

  const handleMarkAsRead = useCallback((alertIds: string[]) => { markAlertsAsRead(alertIds); success('Alertas marcados como lidos') }, [markAlertsAsRead, success])
  const handleMarkAllAsRead = useCallback(() => { markAllAlertsAsRead(); success('Todos os alertas marcados como lidos') }, [markAllAlertsAsRead, success])

  const getAlertTypeLabel = (type: string) => ({ LOW_STOCK: 'Estoque Baixo', OUT_OF_STOCK: 'Sem Estoque', OVERSTOCK: 'Estoque Alto' }[type] || type)

  const columns = useMemo(() => [
    { key: 'type', header: 'Tipo', render: (row: StockAlert & { product?: Product }) => <Badge className={getAlertTypeColor(row.type)}>{getAlertTypeLabel(row.type)}</Badge> },
    { key: 'product', header: 'Produto', render: (row: StockAlert & { product?: Product }) => <div><p className={`font-medium ${!row.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{row.product?.name || 'Produto removido'}</p><p className="text-xs text-gray-500">{row.product?.code || ''}</p></div> },
    { key: 'message', header: 'Mensagem', render: (row: StockAlert & { product?: Product }) => <p className={!row.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}>{row.message}</p> },
    { key: 'stock', header: 'Estoque Atual', render: (row: StockAlert & { product?: Product }) => <div className="flex items-center gap-2"><Badge variant="outline">{formatNumber(row.product?.currentStock || 0)} {row.product?.unit || ''}</Badge>{row.product && row.product.minStock > 0 && <Badge variant="outline" className="text-xs text-amber-700 bg-amber-50 border-amber-200">Mín: {formatNumber(row.product.minStock)}</Badge>}</div> },
    { key: 'date', header: 'Data', render: (row: StockAlert & { product?: Product }) => formatShortDate(row.createdAt) },
    { key: 'status', header: 'Status', render: (row: StockAlert & { product?: Product }) => <Badge variant={row.isRead ? 'success' : 'warning'}>{row.isRead ? 'Lido' : 'Não lido'}</Badge> },
    { key: 'actions', header: 'Ações', render: (row: StockAlert & { product?: Product }) => <div className="flex items-center gap-1">{!row.isRead && <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead([row.id])} aria-label="Marcar como lido"><Check className="w-4 h-4" /></Button>}<Button variant="ghost" size="sm" aria-label="Ver produto"><Eye className="w-4 h-4" /></Button></div> },
  ], [handleMarkAsRead])

  const unreadAlerts = displayAlerts.filter(a => !a.isRead)
  const selectedUnreadIds = unreadAlerts.map(a => a.id)

  if (loading || !initialized) return <Layout><div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-600 border-t-transparent mx-auto" /></div></Layout>

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">Alertas de Estoque{unreadCount > 0 && <Badge variant="danger" className="text-sm">{unreadCount} não lidos</Badge>}</h1><p className="text-gray-500 mt-1">Monitore produtos com estoque baixo ou zerado</p></div>
          <div className="flex gap-2"><Button variant="outline" onClick={() => {}}><RefreshCw className="w-4 h-4" />Atualizar</Button>{unreadCount > 0 && <Button variant="primary" onClick={handleMarkAllAsRead}><CheckCheck className="w-4 h-4" />Marcar todos como lidos</Button>}</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Total de Alertas</p><p className="text-3xl font-bold text-gray-900">{pagination.total}</p></div><AlertTriangle className="w-12 h-12 text-amber-600" /></div></CardContent></Card><Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Não Lidos</p><p className="text-3xl font-bold text-red-600">{unreadCount}</p></div><Bell className="w-12 h-12 text-red-500" /></div></CardContent></Card><Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Lidos</p><p className="text-3xl font-bold text-green-600">{pagination.total - unreadCount}</p></div><CheckCheck className="w-12 h-12 text-green-500" /></div></CardContent></Card></div>

        <Card><CardContent className="p-4 pt-0"><div className="flex flex-wrap items-end gap-4"><Select options={[{ value: 'unread', label: 'Não lidos' }, { value: 'read', label: 'Lidos' }, { value: 'all', label: 'Todos' }]} value={readFilter} onChange={e => setReadFilter(e.target.value as typeof readFilter)} placeholder="Status" className="w-40" /><Select options={[{ value: '', label: 'Todos os tipos' }, { value: 'LOW_STOCK', label: 'Estoque Baixo' }, { value: 'OUT_OF_STOCK', label: 'Sem Estoque' }, { value: 'OVERSTOCK', label: 'Estoque Alto' }]} value={typeFilter} onChange={e => setTypeFilter(e.target.value)} placeholder="Tipo" className="w-48" />{selectedUnreadIds.length > 0 && <Button variant="primary" onClick={() => handleMarkAsRead(selectedUnreadIds)} className="ml-auto"><Check className="w-4 h-4" />Marcar {selectedUnreadIds.length} como lidos</Button>}</div></CardContent></Card>

        <Card><CardContent className="p-0">{displayAlerts.length === 0 ? <div className="p-8 text-center"><AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>{readFilter === 'unread' ? 'Nenhum alerta não lido! 🎉' : 'Nenhum alerta encontrado'}</p></div> : <><Table columns={columns} data={displayAlerts} keyExtractor={row => row.id} emptyMessage="Nenhum alerta encontrado" />{pagination.totalPages > 1 && <TablePagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={page => setPagination(p => ({ ...p, page }))} />}</>}</CardContent></Card>

        <div className="text-sm text-gray-500">Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} alertas</div>
      </div>
    </Layout>
  )
}