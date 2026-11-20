export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    CIMENTO: 'Cimento',
    AREIA: 'Areia',
    BRITA: 'Brita',
    TIJOLO: 'Tijolo',
    BLOCO: 'Bloco',
    TELHA: 'Telha',
    CANO: 'Cano/Tubo',
    FIO: 'Fio/Cabo',
    TINTA: 'Tinta',
    FERRAMENTA: 'Ferramenta',
    EPI: 'EPI',
    HIDRAULICA: 'Hidráulica',
    ELETRICA: 'Elétrica',
    MADEIRA: 'Madeira',
    METAL: 'Metal',
    IMPERMEABILIZANTE: 'Impermeabilizante',
    ARGAMASSA: 'Argamassa',
    REJUNTE: 'Rejunte',
    OUTROS: 'Outros',
  }
  return labels[category] || category
}

export function getMovementTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    ENTRADA: 'Entrada',
    SAIDA: 'Saída',
    AJUSTE: 'Ajuste',
    PERDA: 'Perda',
    DEVOLUCAO: 'Devolução',
  }
  return labels[type] || type
}

export function getMovementTypeColor(type: string): string {
  const colors: Record<string, string> = {
    ENTRADA: 'bg-green-600 text-white',
    SAIDA: 'bg-red-600 text-white',
    AJUSTE: 'bg-yellow-600 text-white',
    PERDA: 'bg-orange-600 text-white',
    DEVOLUCAO: 'bg-blue-600 text-white',
  }
  return colors[type] || 'bg-gray-600 text-white'
}

export function getAlertTypeColor(type: string): string {
  const colors: Record<string, string> = {
    LOW_STOCK: 'bg-yellow-600 text-white',
    OUT_OF_STOCK: 'bg-red-600 text-white',
    OVERSTOCK: 'bg-blue-600 text-white',
  }
  return colors[type] || 'bg-gray-600 text-white'
}

export function getStockStatus(current: number, min: number, max?: number): {
  label: string
  color: string
  variant: 'default' | 'warning' | 'danger' | 'info'
} {
  if (current <= 0) return { label: 'Sem estoque', color: 'bg-red-600 text-white', variant: 'danger' }
  if (current <= min) return { label: 'Estoque baixo', color: 'bg-yellow-600 text-white', variant: 'warning' }
  if (max && current >= max) return { label: 'Estoque alto', color: 'bg-blue-600 text-white', variant: 'info' }
  return { label: 'Normal', color: 'bg-green-600 text-white', variant: 'default' }
}

export const UNITS = [
  { value: 'UN', label: 'Unidade (UN)' },
  { value: 'KG', label: 'Quilograma (KG)' },
  { value: 'M', label: 'Metro (M)' },
  { value: 'M2', label: 'Metro Quadrado (M²)' },
  { value: 'M3', label: 'Metro Cúbico (M³)' },
  { value: 'L', label: 'Litro (L)' },
  { value: 'CX', label: 'Caixa (CX)' },
  { value: 'PC', label: 'Peça (PC)' },
  { value: 'RL', label: 'Rolo (RL)' },
  { value: 'BR', label: 'Barra (BR)' },
  { value: 'SQ', label: 'Saco (SQ)' },
  { value: 'PL', label: 'Pallet (PL)' },
]

export const CATEGORIES = [
  { value: 'CIMENTO', label: 'Cimento' },
  { value: 'AREIA', label: 'Areia' },
  { value: 'BRITA', label: 'Brita' },
  { value: 'TIJOLO', label: 'Tijolo' },
  { value: 'BLOCO', label: 'Bloco' },
  { value: 'TELHA', label: 'Telha' },
  { value: 'CANO', label: 'Cano/Tubo' },
  { value: 'FIO', label: 'Fio/Cabo' },
  { value: 'TINTA', label: 'Tinta' },
  { value: 'FERRAMENTA', label: 'Ferramenta' },
  { value: 'EPI', label: 'EPI' },
  { value: 'HIDRAULICA', label: 'Hidráulica' },
  { value: 'ELETRICA', label: 'Elétrica' },
  { value: 'MADEIRA', label: 'Madeira' },
  { value: 'METAL', label: 'Metal' },
  { value: 'IMPERMEABILIZANTE', label: 'Impermeabilizante' },
  { value: 'ARGAMASSA', label: 'Argamassa' },
  { value: 'REJUNTE', label: 'Rejunte' },
  { value: 'OUTROS', label: 'Outros' },
]

export const MOVEMENT_TYPES = [
  { value: 'ENTRADA', label: 'Entrada (Compra/Recebimento)' },
  { value: 'SAIDA', label: 'Saída (Venda/Consumo)' },
  { value: 'AJUSTE', label: 'Ajuste de Inventário' },
  { value: 'PERDA', label: 'Perda/Quebra' },
  { value: 'DEVOLUCAO', label: 'Devolução' },
]