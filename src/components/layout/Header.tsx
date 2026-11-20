'use client'

import { Bell, User, LogOut, Menu, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui'
import { useTheme } from '@/components/ui/ThemeProvider'

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const notifications = [
    { id: 1, title: 'Estoque baixo: Cimento Portland', message: 'Restam apenas 5 sacos', time: '10 min', read: false },
    { id: 2, title: 'Nova entrada registrada', message: 'Areia Média - 50 toneladas', time: '1 hora', read: false },
    { id: 3, title: 'Relatório mensal disponível', message: 'Clique para visualizar', time: '3 horas', read: true },
  ]

  const unreadCount = notifications.filter((n) => !n.read).length

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  const getThemeIcon = () => {
    if (!mounted) return <Sun className="w-5 h-5" />
    if (theme === 'system') return <Sun className="w-5 h-5" />
    return resolvedTheme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />
  }

  const getThemeLabel = () => {
    if (!mounted) return 'Sistema'
    if (theme === 'system') return 'Sistema'
    return theme === 'dark' ? 'Escuro' : 'Claro'
  }

  if (!mounted) {
    return (
      <header
        className="fixed top-0 right-0 h-16 border-b z-30 flex items-center justify-between px-4 lg:px-6"
        style={{ left: '16rem' }}
        role="banner"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg" aria-label="Alternar tema">
            <Sun className="w-5 h-5" />
          </button>
        </div>
      </header>
    )
  }

  return (
    <header
      className="fixed top-0 right-0 h-16 border-b z-30 flex items-center justify-between px-4 lg:px-6"
      style={{ left: '16rem', backgroundColor: 'var(--header-bg)', borderColor: 'var(--header-border)' }}
      role="banner"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-[var(--muted-text)] hover:bg-[var(--hover-bg)] transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: 'var(--card-border)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--muted-text)' }}>Loja Central</span>
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" aria-label="Online" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-[var(--muted-text)] hover:bg-[var(--hover-bg)] transition-colors"
            aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
            aria-expanded={showNotifications}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-lg py-2"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div className="px-4 py-2 border-b flex items-center justify-between"
                style={{ borderColor: 'var(--card-border)' }}>
                <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>Notificações</h3>
                {unreadCount > 0 && (
                  <button className="text-sm text-amber-700 hover:text-amber-800">Marcar todas como lidas</button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    className={`w-full px-4 py-3 text-left transition-colors ${!notif.read ? 'bg-amber-50' : ''}`}
                    style={{ color: 'var(--foreground)' }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`font-medium text-sm ${!notif.read ? '' : 'text-gray-500'}`}
                          style={{ color: 'var(--foreground)' }}>
                          {notif.title}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-text)' }}>{notif.message}</p>
                      </div>
                      <span className="text-xs whitespace-nowrap" style={{ color: 'var(--muted-text)' }}>{notif.time}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="px-4 py-2 border-t text-center" style={{ borderColor: 'var(--card-border)' }}>
                <a href="/alertas" className="text-sm text-amber-700 hover:text-amber-800 font-medium">
                  Ver todas as notificações
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-[var(--muted-text)] hover:bg-[var(--hover-bg)] transition-colors"
          aria-label={`Tema atual: ${getThemeLabel()}. Clique para alterar.`}
        >
          {getThemeIcon()}
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--hover-bg)] transition-colors"
            aria-label="Menu do usuário"
            aria-expanded={showUserMenu}
          >
            <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="hidden md:block text-sm font-medium" style={{ color: 'var(--foreground)' }}>Operador</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg py-2"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div className="px-4 py-2 border-b"
                style={{ borderColor: 'var(--card-border)' }}>
                <p className="font-medium" style={{ color: 'var(--foreground)' }}>João Silva</p>
                <p className="text-sm" style={{ color: 'var(--muted-text)' }}>operador@loja.com</p>
              </div>
              <a href="/perfil" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--hover-bg)]"
                style={{ color: 'var(--foreground)' }}>
                <User className="w-4 h-4" />
                Perfil
              </a>
              <a href="/configuracoes" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--hover-bg)]"
                style={{ color: 'var(--foreground)' }}>
                <Sun className="w-4 h-4" />
                Configurações
              </a>
              <hr className="my-2" style={{ borderColor: 'var(--card-border)' }} />
              <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}