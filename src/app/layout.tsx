import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'EstoquePro - Controle de Estoque para Construção',
  description: 'Sistema completo de controle de estoque para lojas de material de construção',
  keywords: ['estoque', 'construção', 'material de construção', 'controle de estoque', 'inventário'],
  authors: [{ name: 'EstoquePro' }],
  openGraph: {
    title: 'EstoquePro - Controle de Estoque para Construção',
    description: 'Sistema completo de controle de estoque para lojas de material de construção',
    type: 'website',
    locale: 'pt_BR',
  },
}

export const viewport: Viewport = {
  themeColor: '#92400e',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full flex flex-col font-sans text-gray-900 bg-gray-50">
        {children}
      </body>
    </html>
  )
}