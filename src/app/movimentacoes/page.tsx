'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Search, Filter, ChevronLeft, ChevronRight, Box, ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, RotateCcw, Package } from 'lucide-react'
import { Layout } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Table, TablePagination } from '@/components/ui/Table'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency, formatNumber, formatShortDate, getMovementTypeLabel, getMovementTypeColor, MOVEMENT_TYPES, UNITS } from '@/lib/utils'
import { Textarea } from '@/components/ui/Textarea'
import { Product, StockMovement, useStore } from '@/lib/StoreContext'

interface Pagination { page: number; limit: number; total: number; totalPages: number }

export default function MovimentacoesPage() {
  const { products: allProducts, movements: allMovements, createMovement, loading, initialized } = useStore()
  const { success, error: toastError } = useToast()

  const [displayMovements, setDisplayMovements] = useState<(StockMovement & { product?: Product })[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 })
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [productFilter, setProductFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [defaultType, setDefaultType] = useState<'ENTRADA' | 'SAIDA' | 'AJUSTE'>('ENTRADA')

  const [formData, setFormData] = useState({ productId: '', type: 'ENTRADA' as 'ENTRADA' | 'SAIDA' | 'AJUSTE' | 'PERDA' | 'DEVOLUCAO', quantity: '', unitCost: '', reference: '', notes: '' })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // Debounce search
  useEffect(() => { const timer = setTimeout(() => setDebouncedSearch(search), 300); return () => clearTimeout(timer) }, [search])

  // Filter & paginate
  const filteredMovements = useMemo(() => {
    let result = allMovements
    if (productFilter) result = result.filter(m => m.productId === productFilter)
    if (typeFilter) result = result.filter(m => m.type === typeFilter)
    if (startDate) result = result.filter(m => new Date(m.createdAt) >= new Date(startDate))
    if (endDate) { const end = new Date(endDate); end.setHours(23,59,59,999); result = result.filter(m => new Date(m.createdAt) <= end) }
    if (debouncedSearch) { const s = debouncedSearch.toLowerCase(); result = result.filter(m => m.reference?.toLowerCase().includes(s) || m.notes?.toLowerCase().includes(s)) }
    return result
  }, [allMovements, productFilter, typeFilter, startDate, endDate, debouncedSearch])

  // Enrich with product data
  const enrichedMovements = useMemo(() => filteredMovements.map(m => ({ ...m, product: allProducts.find(p => p.id === m.productId) })), [filteredMovements, allProducts])

  useEffect(() => {
    const total = enrichedMovements.length
    const totalPages = Math.max(1, Math.ceil(total / pagination.limit))
    const page = Math.min(pagination.page, totalPages)
    const start = (page - 1) * pagination.limit
    setDisplayMovements(enrichedMovements.slice(start, start + pagination.limit))
    setPagination(prev => ({ ...prev, total, totalPages, page }))
  }, [enrichedMovements, pagination.limit])

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPagination(p => ({ ...p, page: 1 })) }
  const openCreateModal = (type: 'ENTRADA' | 'SAIDA' | 'AJUSTE' = 'ENTRADA') => { setDefaultType(type); resetForm(type); setShowModal(true) }
  const resetForm = (type: 'ENTRADA' | 'SAIDA' | 'AJUSTE' = 'ENTRADA') => { setFormData({ productId: '', type, quantity: '', unitCost: '', reference: '', notes: '' }); setFormErrors({}) }

  const validateForm = () => { const errors: Record<string, string> = {}; if (!formData.productId) errors.productId = 'Produto é obrigatório'; if (!formData.type) errors.type = 'Tipo é obrigatório'; if (!formData.quantity || parseInt(formData.quantity) <= 0) errors.quantity = 'Quantidade deve ser maior que zero'; if (!formData.unitCost || parseFloat(formData.unitCost) < 0) errors.unitCost = 'Custo unitário inválido'; setFormErrors(errors); return Object.keys(errors).length === 0 }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!validateForm()) return
    const selectedProduct = allProducts.find(p => p.id === formData.productId)
    if (!selectedProduct) { setFormErrors({ productId: 'Produto não encontrado' }); return }
    if (['SAIDA', 'PERDA'].includes(formData.type)) { const qty = parseInt(formData.quantity); if (qty > selectedProduct.currentStock) { setFormErrors({ quantity: `Estoque insuficiente. Disponível: ${selectedProduct.currentStock} ${selectedProduct.unit}` }); return } }
    setSubmitting(true)
    try {
      createMovement({ productId: formData.productId, type: formData.type, quantity: parseInt(formData.quantity), unitCost: parseFloat(formData.unitCost), totalCost: 0, reference: formData.reference || null, notes: formData.notes || null, userId: null })
      success('Movimentação registrada!'); setShowModal(false)
    } catch (err) { toastError('Erro', err instanceof Error ? err.message : 'Erro ao registrar movimentação') }
    finally { setSubmitting(false) }
  }

  const columns = useMemo(() => [
    { key: 'date', header: 'Data', render: (row: StockMovement & { product?: Product }) => formatShortDate(row.createdAt) },
    { key: 'product', header: 'Produto', render: (row: StockMovement & { product?: Product }) => <div><p className="font-medium text-gray-900">{row.product?.name || 'Produto removido'}</p><p className="text-xs text-gray-500">{row.product?.code || ''}</p></div> },
    { key: 'type', header: 'Tipo', render: (row: StockMovement & { product?: Product }) => <Badge className={getMovementTypeColor(row.type)}>{getMovementTypeLabel(row.type)}</Badge> },
    { key: 'quantity', header: 'Quantidade', render: (row: StockMovement & { product?: Product }) => <span className={`font-medium ${row.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>{row.quantity > 0 ? '+' : ''}{formatNumber(row.quantity)} {row.product?.unit || ''}</span> },
    { key: 'unitCost', header: 'Custo Unit.', render: (row: StockMovement & { product?: Product }) => formatCurrency(row.unitCost) },
    { key: 'totalCost', header: 'Custo Total', render: (row: StockMovement & { product?: Product }) => <span className="font-medium">{formatCurrency(row.totalCost)}</span> },
    { key: 'reference', header: 'Referência', render: (row: StockMovement & { product?: Product }) => row.reference || <span className="text-gray-400">—</span> },
    { key: 'stockAfter', header: 'Estoque Atual', render: (row: StockMovement & { product?: Product }) => <Badge variant="outline">{formatNumber(row.product?.currentStock || 0)} {row.product?.unit || ''}</Badge> },
  ], [])

  if (loading || !initialized) return <Layout><div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-600 border-t-transparent mx-auto" /></div></Layout>

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><h1 className="text-2xl font-bold text-gray-900">Movimentações</h1><p className="text-gray-500 mt-1">Registre entradas, saídas e ajustes de estoque</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => openCreateModal('SAIDA')}><ArrowDownRight className="w-4 h-4" />Saída</Button><Button variant="primary" onClick={() => openCreateModal('ENTRADA')}><ArrowUpRight className="w-4 h-4" />Entrada</Button></div></div>

        <Card><CardContent className="p-4"><div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><Button variant="outline" onClick={() => openCreateModal('ENTRADA')} className="h-20 flex flex-col items-center justify-center gap-2"><ArrowUpRight className="w-8 h-8 text-green-600" /><span className="font-medium">Registrar Entrada</span><span className="text-xs text-gray-500">Compra, recebimento, devolução</span></Button><Button variant="outline" onClick={() => openCreateModal('SAIDA')} className="h-20 flex flex-col items-center justify-center gap-2"><ArrowDownRight className="w-8 h-8 text-red-600" /><span className="font-medium">Registrar Saída</span><span className="text-xs text-gray-500">Venda, consumo, perda</span></Button><Button variant="outline" onClick={() => openCreateModal('AJUSTE')} className="h-20 flex flex-col items-center justify-center gap-2"><RotateCcw className="w-8 h-8 text-amber-600" /><span className="font-medium">Ajuste de Inventário</span><span className="text-xs text-gray-500">Correção de quantidade</span></Button></div></CardContent></Card>

        <Card className={showFilters ? '' : 'hidden sm:block'}><CardContent className="p-4 pt-0"><form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4"><Input placeholder="Buscar por referência, notas..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 min-w-[200px]" /><Select options={[{ value: '', label: 'Todos os produtos' }, ...allProducts.map(p => ({ value: p.id, label: `${p.code} - ${p.name}` }))]} value={productFilter} onChange={e => setProductFilter(e.target.value)} placeholder="Produto" className="w-64" /><Select options={[{ value: '', label: 'Todos' }, ...MOVEMENT_TYPES]} value={typeFilter} onChange={e => setTypeFilter(e.target.value)} placeholder="Tipo" className="w-40" /><Input label="Data Inicial" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-40" /><Input label="Data Final" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-40" /><Button type="submit" variant="primary"><Search className="w-4 h-4" />Filtrar</Button></form></CardContent></Card>

        <div className="sm:hidden flex items-center justify-between"><Button variant="outline" onClick={() => setShowFilters(!showFilters)}><Filter className="w-4 h-4" />Filtros</Button></div>
        {showFilters && <Card className="sm:hidden"><CardContent className="p-4 pt-0"><form onSubmit={handleSearch} className="space-y-4"><Input placeholder="Buscar por referência, notas..." value={search} onChange={e => setSearch(e.target.value)} /><Select options={[{ value: '', label: 'Todos os produtos' }, ...allProducts.map(p => ({ value: p.id, label: `${p.code} - ${p.name}` }))]} value={productFilter} onChange={e => setProductFilter(e.target.value)} placeholder="Produto" /><Select options={[{ value: '', label: 'Todos' }, ...MOVEMENT_TYPES]} value={typeFilter} onChange={e => setTypeFilter(e.target.value)} placeholder="Tipo" /><div className="grid grid-cols-2 gap-4"><Input label="Data Inicial" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /><Input label="Data Final" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div><Button type="submit" variant="primary" className="w-full"><Search className="w-4 h-4" />Filtrar</Button></form></CardContent></Card>}

        <Card><CardContent className="p-0">{displayMovements.length === 0 ? <div className="p-8 text-center"><Box className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>Nenhuma movimentação encontrada</p></div> : <><Table columns={columns} data={displayMovements} keyExtractor={row => row.id} emptyMessage="Nenhuma movimentação encontrada" />{pagination.totalPages > 1 && <TablePagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={page => setPagination(p => ({ ...p, page }))} />}</>}</CardContent></Card>

        <div className="text-sm text-gray-500">Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} movimentações</div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={defaultType === 'ENTRADA' ? 'Registrar Entrada' : defaultType === 'SAIDA' ? 'Registrar Saída' : 'Nova Movimentação'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Produto *" options={[{ value: '', label: 'Selecione um produto' }, ...allProducts.map(p => ({ value: p.id, label: `${p.code} - ${p.name} (Estoque: ${p.currentStock} ${p.unit})` }))]} value={formData.productId} onChange={e => setFormData({ ...formData, productId: e.target.value })} error={formErrors.productId} required />
            <Select label="Tipo *" options={MOVEMENT_TYPES} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as typeof formData.type })} error={formErrors.type} required />
            <Input label="Quantidade *" type="number" min="1" step="1" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} error={formErrors.quantity} placeholder="Ex: 10" required />
            <Input label="Custo Unitário *" type="number" step="0.01" min="0" value={formData.unitCost} onChange={e => setFormData({ ...formData, unitCost: e.target.value })} error={formErrors.unitCost} placeholder="0,00" required />
            <Input label="Referência" value={formData.reference} onChange={e => setFormData({ ...formData, reference: e.target.value })} placeholder="NF, Pedido, OS..." />
          </div>
          <Textarea label="Observações" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Detalhes adicionais..." rows={3} />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200"><Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button><Button type="submit" loading={submitting}>Registrar</Button></div>
        </form>
      </Modal>
    </Layout>
  )
}