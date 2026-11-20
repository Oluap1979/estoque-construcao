'use client'

import { useState } from 'react'
import { User, Bell, Shield, Database, Palette, Save, Key, Building2, Truck, Upload, Trash2, LogOut } from 'lucide-react'
import { Layout } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'

export default function ConfiguracoesPage() {
  const { success } = useToast()
  const [activeTab, setActiveTab] = useState<'geral' | 'estoque' | 'notificacoes' | 'aparencia' | 'backup'>('geral')
  const [saving, setSaving] = useState(false)

  const tabs = [
    { id: 'geral', label: 'Geral', icon: Building2 },
    { id: 'estoque', label: 'Estoque', icon: Database },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'aparencia', label: 'Aparência', icon: Palette },
    { id: 'backup', label: 'Backup', icon: Shield },
  ]

  const handleSave = async () => {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    success('Configurações salvas com sucesso!')
    setSaving(false)
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-500 mt-1">Gerencie as configurações do sistema</p>
        </div>

        {/* Tabs Navigation */}
        <Card>
          <CardContent className="p-2">
            <div className="flex flex-wrap gap-1" role="tablist">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id as 'geral' | 'estoque' | 'notificacoes' | 'aparencia' | 'backup')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-amber-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        {activeTab === 'geral' && (
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>Informações básicas da loja</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input label="Nome da Loja" placeholder="Minha Loja de Construção" defaultValue="Loja Central" />
                <Input label="CNPJ" placeholder="00.000.000/0000-00" defaultValue="12.345.678/0001-90" />
                <Input label="Telefone" placeholder="(11) 99999-9999" defaultValue="(11) 99999-9999" />
                <Input label="E-mail" type="email" placeholder="contato@loja.com" defaultValue="contato@lojacentral.com" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input label="Endereço" placeholder="Rua das Flores, 123" defaultValue="Av. Principal, 1000" />
                <Input label="Bairro" placeholder="Centro" defaultValue="Centro" />
                <Input label="Cidade" placeholder="São Paulo" defaultValue="São Paulo" />
                <Select
                  label="Estado"
                  options={[
                    { value: 'SP', label: 'São Paulo' },
                    { value: 'RJ', label: 'Rio de Janeiro' },
                    { value: 'MG', label: 'Minas Gerais' },
                    { value: 'RS', label: 'Rio Grande do Sul' },
                    { value: 'PR', label: 'Paraná' },
                    { value: 'SC', label: 'Santa Catarina' },
                    { value: 'BA', label: 'Bahia' },
                    { value: 'GO', label: 'Goiás' },
                    { value: 'PE', label: 'Pernambuco' },
                    { value: 'CE', label: 'Ceará' },
                    { value: 'OUTRO', label: 'Outro' },
                  ]}
                  defaultValue="SP"
                />
              </div>
              <Input label="CEP" placeholder="00000-000" defaultValue="01000-000" />
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button onClick={handleSave} loading={saving}>
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'estoque' && (
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Estoque</CardTitle>
              <CardDescription>Parâmetros padrão para controle de estoque</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Estoque Mínimo Padrão"
                  type="number"
                  min="0"
                  defaultValue="10"
                  helperText="Quantidade mínima para alerta de estoque baixo"
                />
                <Input
                  label="Estoque Máximo Padrão"
                  type="number"
                  min="0"
                  placeholder="Opcional"
                  helperText="Quantidade máxima para alerta de overstock"
                />
                <Select
                  label="Unidade Padrão"
                  options={[
                    { value: 'UN', label: 'Unidade (UN)' },
                    { value: 'KG', label: 'Quilograma (KG)' },
                    { value: 'M', label: 'Metro (M)' },
                    { value: 'M2', label: 'Metro Quadrado (M²)' },
                    { value: 'M3', label: 'Metro Cúbico (M³)' },
                    { value: 'L', label: 'Litro (L)' },
                    { value: 'CX', label: 'Caixa (CX)' },
                    { value: 'PC', label: 'Peça (PC)' },
                  ]}
                  defaultValue="UN"
                />
                <Select
                  label="Categoria Padrão"
                  options={[
                    { value: 'OUTROS', label: 'Outros' },
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
                  ]}
                  defaultValue="OUTROS"
                />
              </div>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                  <div>
                    <p className="font-medium text-gray-900">Bloquear saída com estoque insuficiente</p>
                    <p className="text-sm text-gray-500">Impede registrar saídas quando não há estoque disponível</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                  <div>
                    <p className="font-medium text-gray-900">Alertar estoque baixo automaticamente</p>
                    <p className="text-sm text-gray-500">Gera alertas quando produto atinge estoque mínimo</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                  <div>
                    <p className="font-medium text-gray-900">Alertar overstock automaticamente</p>
                    <p className="text-sm text-gray-500">Gera alertas quando produto atinge estoque máximo</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                  <div>
                    <p className="font-medium text-gray-900">Permitir ajuste de inventário negativo</p>
                    <p className="text-sm text-gray-500">Permite ajustes que resultem em estoque negativo</p>
                  </div>
                </label>
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button onClick={handleSave} loading={saving}>
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'notificacoes' && (
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Configure como e quando receber alertas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                  <div>
                    <p className="font-medium text-gray-900">Notificações no sistema</p>
                    <p className="text-sm text-gray-500">Exibir alertas no painel de notificações</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                  <div>
                    <p className="font-medium text-gray-900">Notificações por e-mail</p>
                    <p className="text-sm text-gray-500">Enviar e-mail para alertas críticos (sem estoque)</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                  <div>
                    <p className="font-medium text-gray-900">Notificações push (navegador)</p>
                    <p className="text-sm text-gray-500">Receber notificações mesmo com a aba fechada</p>
                  </div>
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Select
                  label="Frequência de Resumo Diário"
                  options={[
                    { value: 'never', label: 'Nunca' },
                    { value: 'daily', label: 'Diário' },
                    { value: 'weekly', label: 'Semanal' },
                  ]}
                  defaultValue="daily"
                />
                <Select
                  label="Horário do Resumo"
                  options={[
                    { value: '08:00', label: '08:00' },
                    { value: '09:00', label: '09:00' },
                    { value: '10:00', label: '10:00' },
                    { value: '17:00', label: '17:00' },
                    { value: '18:00', label: '18:00' },
                  ]}
                  defaultValue="08:00"
                />
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button onClick={handleSave} loading={saving}>
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'aparencia' && (
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>Personalize a interface do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Tema</label>
                <div className="grid grid-cols-3 gap-4">
                  {['light', 'dark', 'system'].map((theme) => (
                    <label key={theme} className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        value={theme}
                        defaultChecked={theme === 'system'}
                        className="sr-only"
                      />
                      <div className={`p-6 rounded-xl border-2 transition-colors ${
                        theme === 'system' ? 'border-amber-500' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className={`w-full h-16 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
                        <p className="mt-3 font-medium text-gray-900 capitalize">{theme}</p>
                        <p className="text-sm text-gray-500">
                          {theme === 'light' ? 'Claro' : theme === 'dark' ? 'Escuro' : 'Sistema'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Cor Primária</label>
                <div className="flex gap-3">
                  {['amber', 'blue', 'green', 'orange', 'red', 'purple'].map((color) => (
                    <label key={color} className="relative cursor-pointer">
                      <input type="radio" name="primaryColor" value={color} defaultChecked={color === 'amber'} className="sr-only" />
                      <div className={`w-12 h-12 rounded-lg border-2 transition-colors ${color === 'amber' ? 'border-amber-500' : 'border-transparent hover:border-gray-300'}`}>
                        <div className={`w-full h-full rounded-lg bg-${color}-600`} />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button onClick={handleSave} loading={saving}>
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'backup' && (
          <Card>
            <CardHeader>
              <CardTitle>Backup e Dados</CardTitle>
              <CardDescription>Gerencie backups e exportação de dados (localStorage)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                  <Database className="w-8 h-8" />
                  <span>Exportar Dados (JSON)</span>
                  <span className="text-xs text-gray-500">Baixar backup completo</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                  <Database className="w-8 h-8" />
                  <span>Exportar CSV</span>
                  <span className="text-xs text-gray-500">Produtos e movimentações</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                  <Upload className="w-8 h-8" />
                  <span>Importar Dados</span>
                  <span className="text-xs text-gray-500">Restaurar backup</span>
                </Button>
                <Button variant="danger" className="h-24 flex flex-col items-center justify-center gap-2">
                  <Trash2 className="w-8 h-8" />
                  <span>Limpar Dados</span>
                  <span className="text-xs text-gray-500">Resetar sistema (cuidado!)</span>
                </Button>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Informações do Armazenamento</h4>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-gray-500">Tipo</dt>
                  <dd className="font-medium">localStorage (navegador)</dd>
                  <dt className="text-gray-500">Chaves</dt>
                  <dd className="font-medium font-mono">estoque_*</dd>
                  <dt className="text-gray-500">Persistência</dt>
                  <dd className="font-medium">Por navegador/dispositivo</dd>
                  <dt className="text-gray-500">Último Backup</dt>
                  <dd className="font-medium text-amber-600">Nunca</dd>
                </dl>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Minha Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-amber-600 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">João Silva</p>
                <p className="text-sm text-gray-500">operador@loja.com</p>
                <Badge variant="outline">Operador</Badge>
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Button variant="outline">
                <User className="w-4 h-4" />
                Editar Perfil
              </Button>
              <Button variant="outline">
                <Key className="w-4 h-4" />
                Alterar Senha
              </Button>
              <Button variant="danger">
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}