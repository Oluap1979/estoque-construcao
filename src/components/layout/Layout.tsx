'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ToastProvider } from '@/components/ui'
import { ThemeProvider } from '@/components/ui/ThemeProvider'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
          <Sidebar />
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main
            className="pt-16 lg:pl-64 min-h-screen transition-all duration-300"
            style={{ marginLeft: '16rem' }}
            role="main"
          >
            <div className="p-4 lg:p-6">
              {children}
            </div>
          </main>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}
        </div>
      </ToastProvider>
    </ThemeProvider>
  )
}