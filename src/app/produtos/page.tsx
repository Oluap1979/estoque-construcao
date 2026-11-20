'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Search, Filter, Edit, Trash2, Eye, AlertTriangle, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import { Layout } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Table, TablePagination } from '@/components/ui/Table'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { Textarea } from '@/components/ui/Textarea'
import { formatCurrency, formatNumber, getCategoryLabel, getStockStatus, CATEGORIES, UNITS } from '@/lib/utils'
import { Product, useStore } from '@/lib/StoreContext'

interface Pagination { page: number; limit: number; total: number; totalPages: number }

export default function ProdutosPage() {
  const { products: allProducts, createProduct, updateProduct, deleteProduct, loading, initialized } = useStore()
  const { success, error: toastError } = useToast()

  const [displayProducts, setDisplayProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [lowStockFilter, setLowStockFilter] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Product | null>(null)

  const [formData, setFormData] = useState({
    code: '', barcode: '', name: '', description: '',
    category: 'OUTROS' as Product['category'], unit: 'UN',
    costPrice: '', salePrice: '', minStock: '10', maxStock: '',
    location: '', supplier: '', ncm: '', isActive: true,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Filter & paginate (memoized)
  const filteredProducts = useMemo(() => {
    let result = allProducts
    if (debouncedSearch) {
      const s = debouncedSearch.toLowerCase()
      result = result.filter(p =>
        p.code.toLowerCase().includes(s) ||
        p.name.toLowerCase().includes(s) ||
        p.description?.toLowerCase().includes(s) ||
        p.barcode?.toLowerCase().includes(s)
      )
    }
    if (categoryFilter) result = result.filter(p => p.category === categoryFilter)
    if (activeFilter) result = result.filter(p => p.isActive === (activeFilter === 'true'))
    if (lowStockFilter) result = result.filter(p => p.currentStock > 0 && p.currentStock <= p.minStock)
    return result
  }, [allProducts, debouncedSearch, categoryFilter, activeFilter, lowStockFilter])

  // Pagination
  useEffect(() => {
    const total = filteredProducts.length
    const totalPages = Math.max(1, Math.ceil(total / pagination.limit))
    const page = Math.min(pagination.page, totalPages)
    const start = (page - 1) * pagination.limit
    setDisplayProducts(filteredProducts.slice(start, start + pagination.limit))
    setPagination(prev => ({ ...prev, total, totalPages, page }))
  }, [filteredProducts, pagination.limit])

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPagination(p => ({ ...p, page: 1 })) }

  const openCreateModal = () => { setEditingProduct(null); resetForm(); setShowModal(true) }
  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({ code: product.code, barcode: product.barcode || '', name: product.name, description: product.description || '',
      category: product.category, unit: product.unit, costPrice: product.costPrice.toString(),
      salePrice: product.salePrice.toString(), minStock: product.minStock.toString(),
      maxStock: product.maxStock?.toString() || '', location: product.location || '',
      supplier: product.supplier || '', ncm: product.ncm || '', isActive: product.isActive })
    setShowModal(true)
  }
  const resetForm = () => setFormData({ code: '', barcode: '', name: '', description: '', category: 'OUTROS', unit: 'UN', costPrice: '', salePrice: '', minStock: '10', maxStock: '', location: '', supplier: '', ncm: '', isActive: true })

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.code.trim()) errors.code = 'Código é obrigatório'
    if (!formData.name.trim()) errors.name = 'Nome é obrigatório'
    if (!formData.category) errors.category = 'Categoria é obrigatória'
    if (!formData.unit) errors.unit = 'Unidade é obrigatória'
    if (!formData.costPrice || parseFloat(formData.costPrice) < 0) errors.costPrice = 'Preço de custo inválido'
    if (!formData.salePrice || parseFloat(formData.salePrice) < 0) errors.salePrice = 'Preço de venda inválido'
    if (!formData.minStock || parseInt(formData.minStock) < 0) errors.minStock = 'Estoque mínimo inválido'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setSubmitting(true)
    try {
      const payload = { code: formData.code, barcode: formData.barcode || null, name: formData.name, description: formData.description || null,
        category: formData.category, unit: formData.unit, costPrice: parseFloat(formData.costPrice), salePrice: parseFloat(formData.salePrice),
        minStock: parseInt(formData.minStock), maxStock: formData.maxStock ? parseInt(formData.maxStock) : null, currentStock: 0,
        location: formData.location || null, supplier: formData.supplier || null, ncm: formData.ncm || null, isActive: formData.isActive }
      if (editingProduct) { updateProduct(editingProduct.id, payload); success('Produto atualizado!') }
      else { createProduct(payload); success('Produto criado!') }
      setShowModal(false)
    } catch (err) { toastError('Erro', err instanceof Error ? err.message : 'Erro ao salvar produto') }
    finally { setSubmitting(false) }
  }

  const handleDelete = () => { if (!showDeleteConfirm) return; deleteProduct(showDeleteConfirm.id); success('Produto desativado!'); setShowDeleteConfirm(null) }

  const columns = useMemo(() => [
    { key: 'code', header: 'Código', render: (row: Product) => <span className="font-mono text-sm font-medium">{row.code}</span> },
    { key: 'name', header: 'Produto', render: (row: Product) => <div><p className="font-medium text-gray-900">{row.name}</p>{row.description && <p className="text-xs text-gray-500 truncate max-w-xs">{row.description}</p>}</div> },
    { key: 'category', header: 'Categoria', render: (row: Product) => <Badge variant="outline">{getCategoryLabel(row.category)}</Badge> },
    { key: 'unit', header: 'Unidade', render: (row: Product) => row.unit },
    { key: 'prices', header: 'Preços', render: (row: Product) => <div><p className="text-sm">Custo: {formatCurrency(row.costPrice)}</p><p className="text-sm font-medium text-green-600">Venda: {formatCurrency(row.salePrice)}</p></div> },
    { key: 'stock', header: 'Estoque', render: (row: Product) => { const status = getStockStatus(row.currentStock, row.minStock, row.maxStock || undefined); return <div className="flex items-center gap-2"><Badge variant={status.variant === 'danger' ? 'danger' : status.variant === 'warning' ? 'warning' : status.variant === 'info' ? 'info' : 'success'}>{formatNumber(row.currentStock)} {row.unit}</Badge><Badge variant="outline" className="text-xs">{status.label}</Badge></div> } },
    { key: 'actions', header: 'Ações', render: (row: Product) => <div className="flex items-center gap-1"><Button variant="ghost" size="sm" onClick={() => openEditModal(row)} aria-label={`Editar ${row.name}`}><Edit className="w-4 h-4" /></Button>{!row.isActive && <Badge variant="outline" className="text-xs">Inativo</Badge>}</div> },
  ], [])

  if (loading || !initialized) return <Layout><div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-600 border-t-transparent mx-auto" /></div></Layout>

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-2xl font-bold text-gray-900">Produtos</h1><p className="text-gray-500 mt-1">Gerencie o catálogo de produtos da loja</p></div>
          <Button onClick={openCreateModal}><Plus className="w-4 h-4" />Novo Produto</Button>
        </div>

        <Card className={showFilters ? '' : 'hidden sm:block'}><CardContent className="p-4 pt-0">
          <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4">
            <Input placeholder="Buscar por código, nome, descrição..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 min-w-[200px]" />
            <Select options={[{ value: '', label: 'Todas' }, ...CATEGORIES]} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} placeholder="Categoria" className="w-48" />
            <Select options={[{ value: '', label: 'Todas' }, { value: 'true', label: 'Ativos' }, { value: 'false', label: 'Inativos' }]} value={activeFilter} onChange={e => setActiveFilter(e.target.value)} placeholder="Status" className="w-40" />
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={lowStockFilter} onChange={e => setLowStockFilter(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" /><span className="text-sm text-gray-700">Apenas estoque baixo</span></label>
            <Button type="submit" variant="primary"><Search className="w-4 h-4" />Filtrar</Button>
          </form></CardContent></Card>

        <div className="sm:hidden flex items-center justify-between"><Button variant="outline" onClick={() => setShowFilters(!showFilters)}><Filter className="w-4 h-4" />Filtros</Button></div>
        {showFilters && <Card className="sm:hidden"><CardContent className="p-4 pt-0"><form onSubmit={handleSearch} className="space-y-4"><Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} /><Select options={[{ value: '', label: 'Todas' }, ...CATEGORIES]} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} placeholder="Categoria" /><Select options={[{ value: '', label: 'Todas' }, { value: 'true', label: 'Ativos' }, { value: 'false', label: 'Inativos' }]} value={activeFilter} onChange={e => setActiveFilter(e.target.value)} placeholder="Status" /><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={lowStockFilter} onChange={e => setLowStockFilter(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" /><span className="text-sm text-gray-700">Apenas estoque baixo</span></label><Button type="submit" variant="primary" className="w-full"><Search className="w-4 h-4" />Filtrar</Button></form></CardContent></Card>}

        <Card><CardContent className="p-0">{displayProducts.length === 0 ? <div className="p-8 text-center text-gray-500"><Package className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>Nenhum produto encontrado</p></div> : <><Table columns={columns} data={displayProducts} keyExtractor={row => row.id} emptyMessage="Nenhum produto encontrado" />{pagination.totalPages > 1 && <TablePagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={page => setPagination(p => ({ ...p, page }))} />}</>}</CardContent></Card>

        <div className="text-sm text-gray-500">Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} produtos</div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingProduct ? 'Editar Produto' : 'Novo Produto'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Código/SKU *" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} error={formErrors.code} placeholder="Ex: CIM-001" required />
            <Input label="Código de Barras" value={formData.barcode} onChange={e => setFormData({ ...formData, barcode: e.target.value })} placeholder="Opcional" />
            <Input label="Nome *" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} error={formErrors.name} placeholder="Ex: Cimento Portland 50kg" required />
            <Select label="Categoria *" options={CATEGORIES} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as Product['category'] })} error={formErrors.category} required />
            <Select label="Unidade *" options={UNITS} value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} error={formErrors.unit} required />
            <Input label="Preço de Custo *" type="number" step="0.01" min="0" value={formData.costPrice} onChange={e => setFormData({ ...formData, costPrice: e.target.value })} error={formErrors.costPrice} placeholder="0,00" required />
            <Input label="Preço de Venda *" type="number" step="0.01" min="0" value={formData.salePrice} onChange={e => setFormData({ ...formData, salePrice: e.target.value })} error={formErrors.salePrice} placeholder="0,00" required />
            <Input label="Estoque Mínimo *" type="number" min="0" value={formData.minStock} onChange={e => setFormData({ ...formData, minStock: e.target.value })} error={formErrors.minStock} placeholder="10" required />
            <Input label="Estoque Máximo" type="number" min="0" value={formData.maxStock} onChange={e => setFormData({ ...formData, maxStock: e.target.value })} placeholder="Opcional" />
            <Input label="Localização" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Ex: A-01, Prateleira 3" />
            <Input label="Fornecedor" value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} placeholder="Nome do fornecedor" />
            <Input label="NCM" value={formData.ncm} onChange={e => setFormData({ ...formData, ncm: e.target.value })} placeholder="Código NCM para NF" />
          </div>
          <div className="flex items-center gap-2"><input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" /><label htmlFor="isActive" className="text-sm text-gray-700">Produto ativo</label></div>
          <Textarea label="Descrição" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Descrição detalhada do produto..." rows={3} />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200"><Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button><Button type="submit" loading={submitting}>{editingProduct ? 'Atualizar' : 'Criar'}</Button></div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} onConfirm={handleDelete} title="Desativar Produto" message={`Tem certeza que deseja desativar "${showDeleteConfirm?.name}"? O produto não será exibido nas listagens, mas o histórico será mantido.`} confirmText="Desativar" variant="danger" />
    </Layout>
  )
}