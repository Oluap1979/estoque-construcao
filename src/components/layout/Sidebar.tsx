'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Package, Box, AlertTriangle, BarChart3, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Produtos', href: '/produtos', icon: Package },
  { name: 'Movimentações', href: '/movimentacoes', icon: Box },
  { name: 'Alertas', href: '/alertas', icon: AlertTriangle },
  { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen text-[var(--sidebar-text)] transition-all duration-300 z-40
        ${collapsed ? 'w-20' : 'w-64'}
      `}
      style={{ backgroundColor: 'var(--sidebar-bg)' }}
      aria-label="Menu principal"
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={`
          flex items-center justify-between h-16 px-4
          ${collapsed ? 'justify-center' : ''}
        `}
          style={{ borderColor: 'var(--card-border)' }}>
          {!collapsed && (
            <Link href="/" className="flex items-center gap-3" aria-label="Ir para o dashboard">
              <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="font-bold text-xl tracking-tight">EstoquePro</span>
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="flex items-center justify-center" aria-label="Ir para o dashboard">
              <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label={collapsed ? 'Expandir menu' : 'Colapsar menu'}
            aria-expanded={!collapsed}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Navegação principal">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                  ${isActive
                    ? 'bg-amber-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
                  ${collapsed ? 'justify-center' : ''}
                `}
                aria-current={isActive ? 'page' : undefined}
                title={collapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                {!collapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className={`
          p-3
          ${collapsed ? 'flex justify-center' : ''}
        `}
          style={{ borderColor: 'var(--card-border)' }}>
          {!collapsed && (
            <div className="text-xs text-center" style={{ color: 'var(--muted-text)' }}>
              v1.0.0 · Estoque de Construção
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}