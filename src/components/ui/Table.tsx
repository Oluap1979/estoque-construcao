'use client'

import React, { HTMLAttributes, forwardRef, ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  render?: (row: T, index: number) => ReactNode
  className?: string
  headerClassName?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  striped?: boolean
  hoverable?: boolean
  emptyMessage?: string
  className?: string
  onRowClick?: (row: T) => void
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  striped = true,
  hoverable = true,
  emptyMessage = 'Nenhum registro encontrado',
  className = '',
  onRowClick,
}: TableProps<T>) {
  return (
    <div className={`overflow-x-auto rounded-xl border ${className}`} style={{ borderColor: 'var(--card-border)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: 'var(--sidebar-bg)', color: 'var(--sidebar-text)' }}>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left font-medium ${column.headerClassName || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={{ backgroundColor: 'var(--card-bg)' }}>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center" style={{ color: 'var(--muted-text)' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={keyExtractor(row)}
                className={`
                  ${striped && rowIndex % 2 === 1 ? 'bg-[var(--hover-bg)]' : ''}
                  ${hoverable ? 'hover:bg-amber-50/50 transition-colors cursor-pointer' : ''}
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
                onClick={() => onRowClick?.(row)}
                style={{ borderColor: 'var(--card-border)' }}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 ${column.className || ''}`}
                    style={{ color: 'var(--foreground)', borderColor: 'var(--card-border)' }}
                  >
                    {column.render ? column.render(row, rowIndex) : String((row as Record<string, unknown>)[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)
  )

  return (
    <div className={`flex items-center justify-between px-4 py-3 ${className}`} style={{ borderColor: 'var(--card-border)' }}>
      <div className="text-sm" style={{ color: 'var(--muted-text)' }}>
        Página {currentPage} de {totalPages}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border rounded-lg hover:bg-[var(--hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
        >
          Anterior
        </button>
        {visiblePages.map((page, index) => (
          <React.Fragment key={page}>
            {index > 0 && visiblePages[index - 1] !== page - 1 && (
              <span className="px-2" style={{ color: 'var(--muted-text)' }}>...</span>
            )}
            <button
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'bg-amber-700 text-white'
                  : 'hover:bg-[var(--hover-bg)]'
              }`}
              style={{ color: page === currentPage ? 'white' : 'var(--foreground)' }}
            >
              {page}
            </button>
          </React.Fragment>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border rounded-lg hover:bg-[var(--hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
        >
          Próxima
        </button>
      </div>
    </div>
  )
}