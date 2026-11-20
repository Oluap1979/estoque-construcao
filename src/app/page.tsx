'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Package, AlertTriangle, TrendingUp, DollarSign, Box, ArrowUpRight, ArrowDownRight, Minus, Plus, Clock } from 'lucide-react'
import { Layout } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatNumber, formatShortDate, getMovementTypeLabel, getMovementTypeColor, getStockStatus } from '@/lib/utils'

interface DashboardStats {
  totalProducts: number
  activeProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  totalStockValue: number
  totalStockCost: number
}

interface Movement {
  id: string
  type: string
  quantity: number
  unitCost: number
  totalCost: number
  reference: string | null
  notes: string | null
  createdAt: string
  product: {
    id: string
    code: string
    name: string
    unit: string
  }
}

interface Alert {
  id: string
  type: string
  message: string
  createdAt: string
  product: {
    id: string
    code: string
    name: string
    unit: string
    currentStock: number
    minStock: number
  }
}

interface DashboardData {
  stats: DashboardStats
  recentMovements: Movement[]
  recentAlerts: Alert[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/dashboard')
        if (!res.ok) throw new Error('Erro ao carregar dashboard')
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent" />
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar dashboard</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </Layout>
    )
  }

  const stats = data?.stats
  const recentMovements = data?.recentMovements || []
  const recentAlerts = data?.recentAlerts || []

  const statCards = [
    {
      title: 'Total de Produtos',
      value: formatNumber(stats?.totalProducts || 0),
      icon: Package,
      color: 'bg-blue-500',
      subtitle: `${stats?.activeProducts || 0} ativos`,
    },
    {
      title: 'Valor em Estoque',
      value: formatCurrency(stats?.totalStockValue || 0),
      icon: DollarSign,
      color: 'bg-green-500',
      subtitle: `Custo: ${formatCurrency(stats?.totalStockCost || 0)}`,
    },
    {
      title: 'Estoque Baixo',
      value: formatNumber(stats?.lowStockProducts || 0),
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      subtitle: 'Abaixo do mínimo',
      variant: 'warning' as const,
    },
    {
      title: 'Sem Estoque',
      value: formatNumber(stats?.outOfStockProducts || 0),
      icon: Box,
      color: 'bg-red-500',
      subtitle: 'Zerados',
      variant: 'danger' as const,
    },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Visão geral do estoque da loja</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4" />
              Novo Produto
            </Button>
            <Button variant="primary" size="sm">
              <Box className="w-4 h-4" />
              Nova Movimentação
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Movements & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Movements */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Movimentações Recentes</CardTitle>
                <a href="/movimentacoes" className="text-sm text-amber-700 hover:text-amber-800 font-medium">
                  Ver todas
                </a>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentMovements.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Box className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhuma movimentação recente</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentMovements.slice(0, 8).map((movement) => (
                    <div
                      key={movement.id}
                      className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-lg ${getMovementTypeColor(movement.type)}`}
                        >
                          {movement.type === 'ENTRADA' && <ArrowUpRight className="w-5 h-5" />}
                          {movement.type === 'SAIDA' && <ArrowDownRight className="w-5 h-5" />}
                          {movement.type === 'AJUSTE' && <Minus className="w-5 h-5" />}
                          {movement.type === 'PERDA' && <AlertTriangle className="w-5 h-5" />}
                          {movement.type === 'DEVOLUCAO' && <Plus className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{movement.product.name}</p>
                          <p className="text-sm text-gray-500">
                            {getMovementTypeLabel(movement.type)} •{' '}
                            {movement.quantity > 0 ? '+' : ''}{formatNumber(movement.quantity)} {movement.product.unit}
                          </p>
                        </div>
                      </div>
                      <div className="text-right min-w-[120px]">
                        <p className="font-medium text-gray-900">{formatCurrency(movement.totalCost)}</p>
                        <p className="text-xs text-gray-500">{formatShortDate(movement.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Alertas de Estoque</CardTitle>
                <a href="/alertas" className="text-sm text-amber-700 hover:text-amber-800 font-medium">
                  Ver todos
                </a>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentAlerts.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhum alerta ativo</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentAlerts.slice(0, 8).map((alert) => (
                    <div key={alert.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <Badge
                          variant={alert.type === 'OUT_OF_STOCK' ? 'danger' : alert.type === 'LOW_STOCK' ? 'warning' : 'info'}
                          className="flex-shrink-0 mt-0.5"
                        >
                          {alert.type === 'OUT_OF_STOCK' ? 'Sem Estoque' : alert.type === 'LOW_STOCK' ? 'Estoque Baixo' : 'Estoque Alto'}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{alert.product.name}</p>
                          <p className="text-sm text-gray-500">{alert.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Atual: {formatNumber(alert.product.currentStock)} {alert.product.unit} • Mín: {formatNumber(alert.product.minStock)}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatShortDate(alert.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => window.location.href = '/produtos?new=true'}
              >
                <Package className="w-8 h-8" />
                <span>Cadastrar Produto</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => window.location.href = '/movimentacoes?new=true'}
              >
                <Box className="w-8 h-8" />
                <span>Registrar Entrada</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => window.location.href = '/movimentacoes?new=true&type=SAIDA'}
              >
                <ArrowDownRight className="w-8 h-8" />
                <span>Registrar Saída</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => window.location.href = '/relatorios'}
              >
                <TrendingUp className="w-8 h-8" />
                <span>Ver Relatórios</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}