'use client'

import { useState, useEffect, useMemo } from 'react'
import { Download, FileText, BarChart3, TrendingUp, Package, DollarSign, AlertTriangle, Calendar, Filter, ArrowUpRight, ArrowDownRight, RotateCcw } from 'lucide-react'
import { Layout } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Table } from '@/components/ui/Table'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency, formatNumber, formatShortDate, getCategoryLabel, getStockStatus, CATEGORIES } from '@/lib/utils'
import { getDashboardStats, getMovementsByPeriod, getTopProducts, initializeStore } from '@/lib/store'

interface DashboardData {
  stats: {
    totalProducts: number
    activeProducts: number
    lowStockProducts: number
    outOfStockProducts: number
    totalStockValue: number
    totalStockCost: number
  }
  recentMovements: Array<{
    id: string
    type: string
    quantity: number
    unitCost: number
    totalCost: number
    reference: string | null
    notes: string | null
    createdAt: string
    product?: { id: string; code: string; name: string; unit: string }
  }>
  movementsByType: Array<{
    type: string
    _count: { id: number }
    _sum: { quantity: number | null; totalCost: number | null }
  }>
  movementsByDay: Array<{
    day: string
    type: string
    count: number
    total_quantity: number
    total_cost: number
  }>
  topCategories: Array<{
    category: string
    _sum: { currentStock: number | null }
    _count: { id: number }
  }>
  topProducts: Array<{
    productId: string
    _count: { id: number }
    _sum: { quantity: number | null }
    product?: { id: string; code: string; name: string; unit: string }
  }>
  recentAlerts: Array<{
    id: string
    type: string
    message: string
    createdAt: string
    product?: { id: string; code: string; name: string; currentStock: number; minStock: number }
  }>
}

export default function RelatoriosPage() {
  const { success, error: toastError } = useToast()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7' | '30' | '90' | '365'>('30')

  const periodDays = useMemo(() => parseInt(period), [period])

  useEffect(() => {
    try {
      initializeStore()
      const stats = getDashboardStats()
      const days = periodDays

      // Buscar movimentações do período para relatórios
      const movements = getMovementsByPeriod(days)

      // Agrupar por tipo
      const movementsByTypeMap = new Map<string, { count: number; totalQty: number; totalCost: number }>()
      movements.forEach((m) => {
        const existing = movementsByTypeMap.get(m.type) || { count: 0, totalQty: 0, totalCost: 0 }
        existing.count += 1
        existing.totalQty += Math.abs(m.quantity)
        existing.totalCost += m.totalCost
        movementsByTypeMap.set(m.type, existing)
      })

      const movementsByType = Array.from(movementsByTypeMap.entries()).map(([type, data]) => ({
        type,
        _count: { id: data.count },
        _sum: { quantity: data.totalQty, totalCost: data.totalCost },
      }))

      // Agrupar por dia
      const dailyMap = new Map<string, { day: string; entradas: number; saidas: number; ajustes: number; valor: number }>()
      movements.forEach((m) => {
        const day = m.createdAt.split('T')[0]
        if (!dailyMap.has(day)) dailyMap.set(day, { day, entradas: 0, saidas: 0, ajustes: 0, valor: 0 })
        const d = dailyMap.get(day)!
        if (m.type === 'ENTRADA' || m.type === 'DEVOLUCAO') d.entradas += Math.abs(m.quantity)
        if (m.type === 'SAIDA' || m.type === 'PERDA') d.saidas += Math.abs(m.quantity)
        if (m.type === 'AJUSTE') d.ajustes += m.quantity
        d.valor += m.totalCost
      })

      const movementsByDay = Array.from(dailyMap.values()).map((d) => ({
        day: d.day,
        type: 'ALL',
        count: 1,
        total_quantity: d.entradas - d.saidas + d.ajustes,
        total_cost: d.valor,
      }))

      // Top categorias - simplificado usando getProducts
      const topCategories: Array<{ category: string; _sum: { currentStock: number | null }; _count: { id: number } }> = []
      const topProducts = getTopProducts(days, 5).map((item) => ({
        productId: item.productId,
        _count: { id: item.count },
        _sum: { quantity: item.totalQty },
        product: item.product,
      }))

      setData({
        stats: stats.stats,
        recentMovements: stats.recentMovements,
        movementsByType,
        movementsByDay,
        topCategories,
        topProducts,
        recentAlerts: stats.recentAlerts,
      })
    } catch (err) {
      toastError('Erro', err instanceof Error ? err.message : 'Erro ao carregar relatórios')
    } finally {
      setLoading(false)
    }
  }, [periodDays, toastError])

  const handleExport = (type: 'csv' | 'pdf') => {
    // TODO: Implementar exportação
    success(`Exportação ${type.toUpperCase()} em desenvolvimento`)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent" />
        </div>
      </Layout>
    )
  }

  if (!data) {
    return (
      <Layout>
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar relatórios</h2>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </Layout>
    )
  }

  const { stats, movementsByType, topCategories, topProducts, movementsByDay } = data

  // Calcular totais por tipo
  const totalEntradas = movementsByType.find(m => m.type === 'ENTRADA')?._sum.quantity || 0
  const totalSaidas = Math.abs(movementsByType.find(m => m.type === 'SAIDA')?._sum.quantity || 0)
  const totalAjustes = movementsByType.find(m => m.type === 'AJUSTE')?._sum.quantity || 0

  // Agrupar dados por dia para gráfico simples
  const dailyData = movementsByDay.reduce((acc, item) => {
    const day = item.day
    if (!acc[day]) acc[day] = { day, entradas: 0, saidas: 0, ajustes: 0, valor: 0 }
    if (item.type === 'ENTRADA') acc[day].entradas += item.total_quantity
    if (item.type === 'SAIDA') acc[day].saidas += Math.abs(item.total_quantity)
    if (item.type === 'AJUSTE') acc[day].ajustes += item.total_quantity
    acc[day].valor += item.total_cost
    return acc
  }, {} as Record<string, { day: string; entradas: number; saidas: number; ajustes: number; valor: number }>)

  const chartData = Object.values(dailyData).slice(-14) // Últimos 14 dias

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-500 mt-1">Análise de movimentações e desempenho do estoque</p>
          </div>
          <div className="flex items-center gap-4">
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value as typeof period)}
              options={[
                { value: '7', label: 'Últimos 7 dias' },
                { value: '30', label: 'Últimos 30 dias' },
                { value: '90', label: 'Últimos 90 dias' },
                { value: '365', label: 'Último ano' },
              ]}
              className="w-48"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExport('csv')}>
                <Download className="w-4 h-4" />
                CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport('pdf')}>
                <FileText className="w-4 h-4" />
                PDF
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Valor Total em Estoque</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalStockValue)}</p>
                  <p className="text-xs text-gray-500 mt-1">Custo: {formatCurrency(stats.totalStockCost)}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-500">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Produtos Ativos</p>
                  <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.activeProducts)}</p>
                  <p className="text-xs text-gray-500 mt-1">de {formatNumber(stats.totalProducts)} total</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Estoque Baixo</p>
                  <p className="text-3xl font-bold text-amber-600">{formatNumber(stats.lowStockProducts)}</p>
                  <p className="text-xs text-gray-500 mt-1">Abaixo do mínimo</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-500">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Sem Estoque</p>
                  <p className="text-3xl font-bold text-red-600">{formatNumber(stats.outOfStockProducts)}</p>
                  <p className="text-xs text-gray-500 mt-1">Zerados</p>
                </div>
                <div className="p-3 rounded-xl bg-red-500">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Movement Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo de Movimentações</CardTitle>
              <CardDescription>Período selecionado: {period} dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500">
                      <ArrowUpRight className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Entradas</p>
                      <p className="text-sm text-gray-500">{movementsByType.find(m => m.type === 'ENTRADA')?._count.id || 0} registros</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{formatNumber(totalEntradas)}</p>
                    <p className="text-xs text-gray-500">unidades</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500">
                      <ArrowDownRight className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Saídas</p>
                      <p className="text-sm text-gray-500">{movementsByType.find(m => m.type === 'SAIDA')?._count.id || 0} registros</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">{formatNumber(totalSaidas)}</p>
                    <p className="text-xs text-gray-500">unidades</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500">
                      <RotateCcw className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Ajustes</p>
                      <p className="text-sm text-gray-500">{movementsByType.find(m => m.type === 'AJUSTE')?._count.id || 0} registros</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-amber-600">{formatNumber(totalAjustes)}</p>
                    <p className="text-xs text-gray-500">unidades</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Categorias por Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCategories.slice(0, 5).map((cat, index) => (
                  <div key={cat.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center text-sm font-medium text-gray-500">{index + 1}</span>
                      <Badge variant="outline">{getCategoryLabel(cat.category)}</Badge>
                    </div>
                    <span className="font-medium text-gray-900">{formatNumber(cat._sum.currentStock || 0)} un</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produtos Mais Movimentados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProducts.slice(0, 5).map((item, index) => (
                  <div key={item.productId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center text-sm font-medium text-gray-500">{index + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{item.product?.name || 'Produto removido'}</p>
                        <p className="text-xs text-gray-500">{item.product?.code}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{item._count.id} mov.</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simple Chart Area */}
        <Card>
          <CardHeader>
            <CardTitle>Movimentações por Dia (Últimos 14 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chartData.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhuma movimentação no período</p>
              ) : (
                chartData.map((day) => (
                  <div key={day.day} className="flex items-center gap-4">
                    <span className="w-24 text-sm text-gray-500 font-mono">{formatShortDate(day.day)}</span>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                      {day.entradas > 0 && (
                        <div
                          className="h-full bg-green-500 rounded-l"
                          style={{ width: `${Math.max(2, (day.entradas / Math.max(day.entradas + day.saidas + day.ajustes, 1)) * 100)}%` }}
                          title={`Entradas: ${day.entradas}`}
                        />
                      )}
                      {day.saidas > 0 && (
                        <div
                          className="h-full bg-red-500"
                          style={{ width: `${Math.max(2, (day.saidas / Math.max(day.entradas + day.saidas + day.ajustes, 1)) * 100)}%` }}
                          title={`Saídas: ${day.saidas}`}
                        />
                      )}
                      {day.ajustes !== 0 && (
                        <div
                          className="h-full bg-amber-500"
                          style={{ width: `${Math.max(2, (Math.abs(day.ajustes) / Math.max(day.entradas + day.saidas + Math.abs(day.ajustes), 1)) * 100)}%` }}
                          title={`Ajustes: ${day.ajustes}`}
                        />
                      )}
                    </div>
                    <span className="w-32 text-sm text-right text-gray-600">
                      E:{day.entradas} S:{day.saidas} A:{day.ajustes}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-green-500" />
                Entradas
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-red-500" />
                Saídas
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-amber-500" />
                Ajustes
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}