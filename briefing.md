# Brief do Projeto: Gestor Financeiro

## 1. Identificação do Projeto

| Campo | Descrição |
|-------|-----------|
| **Nome do Projeto** | TechPanel Financeiro |
| **Tipo** | Aplicação Web de Gestão Financeira |
| **Data de Criação** | 24 de março de 2026 |
| **Versão** | 1.0 |
| **Responsável** | TechPanel |

---

## 2. Visão Geral

Sistema de gestão financeira pessoal e/ou empresarial com foco em controle de receitas, despesas, orçamentos e relatórios. O projeto terá integração com **n8n** para automação de processos workflows, notificações e sincronização de dados com serviços externos.

---

## 3. Objetivos do Projeto

### 3.1 Objetivo Principal
Desenvolver uma aplicação completa para gerenciamento financeiro que permita aos usuários controlar suas finanças de forma intuitiva, com dashboards visuais e automações poderosas via n8n.

### 3.2 Objetivos Específicos
- Oferecer controle completo de receitas e despesas
- Permitir categorização e tagging de transações
- Gerenciar orçamentos por categoria/período
- Gerar relatórios financeiros (diário, semanal, mensal, anual)
- Integrar com n8n para automações e workflows
- Disponibilizar APIs para comunicação bidirecional com n8n
- Sincronizar dados com serviços externos (bancos, carteiras digitais)

---

## 4. Funcionalidades Principais

### 4.1 Módulo de Transações
| Funcionalidade | Descrição | Prioridade |
|----------------|-----------|------------|
| Cadastro de receitas | Registrar entradas de dinheiro com categorization | Alta |
| Cadastro de despesas | Registrar gastos com categorization | Alta |
| Edição de transações | Modificar transações existentes | Alta |
| Exclusão de transações | Remover transações com confirmação | Alta |
| Importação CSV/OFX | Importar extratos bancários | Média |
| Tags/Labels | Etiquetar transações para filtragem | Média |

### 4.2 Módulo de Categorias
| Funcionalidade | Descrição | Prioridade |
|----------------|-----------|------------|
| CRUD de categorias | Criar, editar, excluir categorias | Alta |
| Subcategorias | Hierarquia de categorias | Média |
| Ícones e cores | Personalização visual das categorias | Baixa |

### 4.3 Módulo de Orçamentos
| Funcionalidade | Descrição | Prioridade |
|----------------|-----------|------------|
| Criar orçamento | Definir limite por categoria/período | Alta |
| Alertas de limite | Notificar quando orçamento atingir % definido | Alta |
| Acompanhamento | Visualizar progresso do orçamento | Alta |

### 4.4 Módulo de Dashboard
| Funcionalidade | Descrição | Prioridade |
|----------------|-----------|------------|
| Visão geral | Saldo total, receitas, despesas do período | Alta |
| Gráfico de pizza | Distribuição de despesas por categoria | Alta |
| Gráfico de linha | Evolução financeira no tempo | Alta |
| KPIs financeiros | Métricas principais (economia, média diária, etc.) | Média |

### 4.5 Módulo de Relatórios
| Funcionalidade | Descrição | Prioridade |
|----------------|-----------|------------|
| Relatório mensal | breakdown mensal de receitas/despesas | Alta |
| Relatório por categoria | Gastos detalhados por categoria | Alta |
| Relatório comparativo | Comparar períodos (mês a mês, ano a ano) | Média |
| Exportar PDF/Excel | Exportar relatórios em diferentes formatos | Média |

### 4.6 Integração com n8n
| Funcionalidade | Descrição | Prioridade |
|----------------|-----------|------------|
| Webhook de entrada | Receber transações via n8n | Alta |
| Webhook de saída | Enviar notificações para n8n | Alta |
| API REST | CRUD completo via API | Alta |
| Sincronização bidirecional | Sincronizar dados com serviços externos | Média |
| Triggers automáticos | Executar ações baseadas em eventos | Média |

---

## 5. Arquitetura Técnica

### 5.1 Stack Tecnológico
| Camada | Tecnologia | Observação |
|--------|------------|------------|
| Frontend | React + TypeScript + Vite | Interface responsiva |
| UI Components | shadcn/ui ou Tailwind CSS | Design system |
| Backend | Node.js + Express ou Fastify | API REST |
| Banco de Dados | PostgreSQL ou SQLite | Persistência local |
| ORM | Prisma | Abstração de banco |
| Integração n8n | Webhooks + REST API | Comunicação |

### 5.2 Estrutura de Pastas (Frontend)
```
src/
├── components/
│   ├── ui/           # Componentes base
│   ├── dashboard/    # Componentes do dashboard
│   ├── transactions/ # Componentes de transações
│   ├── budgets/      # Componentes de orçamentos
│   └── reports/      # Componentes de relatórios
├── pages/
├── hooks/
├── services/         # Comunicação com API
├── stores/           # Estado global (Zustand/Context)
├── types/            # TypeScript types
└── utils/
```

### 5.3 Estrutura de Pastas (Backend)
```
server/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── middlewares/
│   ├── utils/
│   └── config/
└── prisma/
    └── schema.prisma
```

### 5.4 Modelo de Dados (Entidades Principais)
```
User
├── id: string (uuid)
├── email: string
├── name: string
├── createdAt: datetime
└── updatedAt: datetime

Account
├── id: string (uuid)
├── userId: string (FK)
├── name: string
├── type: enum (checking, savings, credit, wallet)
├── balance: decimal
└── createdAt: datetime

Category
├── id: string (uuid)
├── userId: string (FK)
├── name: string
├── type: enum (income, expense)
├── parentId: string? (FK, self-reference)
├── icon: string?
├── color: string?
└── createdAt: datetime

Transaction
├── id: string (uuid)
├── userId: string (FK)
├── accountId: string (FK)
├── categoryId: string (FK)
├── type: enum (income, expense, transfer)
├── amount: decimal
├── description: string?
├── date: datetime
├── tags: string[]?
└── createdAt: datetime

Budget
├── id: string (uuid)
├── userId: string (FK)
├── categoryId: string (FK)
├── amount: decimal
├── period: enum (monthly, weekly, custom)
├── startDate: datetime
├── endDate: datetime?
└── alertThreshold: number (percentage)

Webhook
├── id: string (uuid)
├── userId: string (FK)
├── url: string
├── events: string[] (JSON)
├── secret: string (hashed)
├── active: boolean
└── createdAt: datetime
```

---

## 6. Integração com n8n - Especificações

### 6.1 Webhooks Disponíveis (Entrada)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/webhooks/transaction` | POST | Criar transação |
| `/api/webhooks/bulk-transactions` | POST | Criar múltiplas transações |
| `/api/webhooks/category` | POST | Criar/atualizar categoria |

### 6.2 Webhooks Disponíveis (Saída)

| Evento | Trigger | Payload |
|--------|---------|---------|
| `budget.exceeded` | Quando orçamento é ultrapassado | `{budgetId, categoryId, spent, limit}` |
| `budget.warning` | Quando atingir % do orçamento | `{budgetId, percentage, spent, limit}` |
| `transaction.created` | Nova transação criada | `{transactionId, type, amount, category}` |
| `balance.low` | Saldo abaixo do mínimo | `{accountId, balance, threshold}` |

### 6.3 Autenticação de Webhooks
- Assinatura HMAC-SHA256 no header `X-Webhook-Signature`
- Secret configurável por webhook
- Rate limiting: 100 requests/minuto por webhook

### 6.4 Fluxos n8n Sugeridos
1. **Sincronização bancária**: Importar transações do banco via API
2. **Notificações**: Enviar alertas via Telegram/Email
3. **Categorização automática**: Usar IA para categorizar transações
4. **Relatórios agendados**: Gerar e enviar relatórios periodicamente

---

## 7. API REST - Endpoints Principais

### 7.1 Transações
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/transactions` | Listar transações (com filtros) |
| GET | `/api/transactions/:id` | Detalhe de transação |
| POST | `/api/transactions` | Criar transação |
| PUT | `/api/transactions/:id` | Atualizar transação |
| DELETE | `/api/transactions/:id` | Excluir transação |
| POST | `/api/transactions/import` | Importar CSV/OFX |

### 7.2 Categorias
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/categories` | Listar categorias |
| POST | `/api/categories` | Criar categoria |
| PUT | `/api/categories/:id` | Atualizar categoria |
| DELETE | `/api/categories/:id` | Excluir categoria |

### 7.3 Contas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/accounts` | Listar contas |
| POST | `/api/accounts` | Criar conta |
| PUT | `/api/accounts/:id` | Atualizar conta |
| DELETE | `/api/accounts/:id` | Excluir conta |
| GET | `/api/accounts/:id/balance` | Saldo da conta |

### 7.4 Orçamentos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/budgets` | Listar orçamentos |
| POST | `/api/budgets` | Criar orçamento |
| PUT | `/api/budgets/:id` | Atualizar orçamento |
| DELETE | `/api/budgets/:id` | Excluir orçamento |
| GET | `/api/budgets/:id/progress` | Progresso do orçamento |

### 7.5 Dashboard
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/dashboard/summary` | Resumo financeiro |
| GET | `/api/dashboard/charts` | Dados para gráficos |
| GET | `/api/dashboard/kpis` | Indicadores principais |

### 7.6 Relatórios
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/reports/monthly` | Relatório mensal |
| GET | `/api/reports/by-category` | Relatório por categoria |
| GET | `/api/reports/comparison` | Comparativo de períodos |
| GET | `/api/reports/export` | Exportar em PDF/Excel |

### 7.7 Webhooks
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/webhooks` | Listar webhooks |
| POST | `/api/webhooks` | Criar webhook |
| PUT | `/api/webhooks/:id` | Atualizar webhook |
| DELETE | `/api/webhooks/:id` | Excluir webhook |
| POST | `/api/webhooks/:id/test` | Testar webhook |

---

## 8. Requisitos Não Funcionais

### 8.1 Performance
- Tempo de carregamento da página inicial: < 2 segundos
- Resposta da API: < 500ms para operações simples
- Suporte a até 10.000 transações por usuário

### 8.2 Segurança
- Autenticação JWT para acesso à API
- HTTPS obrigatório
- Validação e sanitização de inputs
- Rate limiting em todos os endpoints

### 8.3 Usabilidade
- Interface responsiva (mobile-first)
- Intuitiva e de fácil navegação
- Feedback visual para todas as ações
- Suporte a tema claro/escuro

### 8.4 Disponibilidade
- Sistema disponível 24/7
- Backups automáticos diários
- logs de erros e monitoramento

---

## 9. Escopo do Projeto

### 9.1 Escopo Incluído (MVP)
- [x] Sistema de autenticação (registro, login, logout)
- [x] CRUD completo de transações
- [x] CRUD completo de categorias
- [x] CRUD completo de contas bancárias
- [x] Sistema de orçamentos com alertas
- [x] Dashboard com gráficos básicos
- [x] Relatórios mensais
- [x] Integração com n8n (webhooks de entrada e saída)
- [x] API REST completa
- [x] Importação de CSV

### 9.2 Escopo Excluído (Fase 2)
- [ ] Aplicativo mobile nativo
- [ ] Integração direta com bancos brasileiros
- [ ] Previsão de gastos com Machine Learning
- [ ] Compartilhamento de contas (multi-usuário)
- [ ] Carteiras digitais/wallets integradas
- [ ] Exportação para contador (SPED, etc.)

---

## 10. Cronograma Estimado

| Fase | Descrição | Duração Estimada |
|------|-----------|------------------|
| **Fase 1** | Setup, Autenticação, Modelo de Dados | 1 semana |
| **Fase 2** | CRUD Transações, Categorias, Contas | 1 semana |
| **Fase 3** | Dashboard e Gráficos | 1 semana |
| **Fase 4** | Orçamentos e Alertas | 1 semana |
| **Fase 5** | Relatórios e Exportação | 1 semana |
| **Fase 6** | Integração n8n e API | 1 semana |
| **Fase 7** | Refinamento, Testes, Bug Fixes | 1 semana |

**Total Estimado: 7 semanas**

---

## 11. Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Atrasos na integração n8n | Média | Médio | Usar webhook genérico primeiro |
| Complexidade na importação de extratos | Alta | Alto | Começar com CSV simples |
| Problemas de performance com muitos dados | Baixa | Médio | Implementar paginação e cache |
| Mudanças de requisitos | Média | Médio | Validação frequente com usuário |

---

## 12. Partes Interessadas

| Stakeholder | Papel | Interesse |
|-------------|-------|-----------|
| Usuários finais | Usuários | Controle financeiro pessoal |
| Desenvolvedores | Equipe técnica | Código limpo e manutenível |
| Automatizadores (n8n) | Integração | APIs bem documentadas e webhooks confiáveis |

---

## 13. Critérios de Sucesso

1. **Usuário consegue** cadastrar, editar e excluir transações em menos de 3 cliques
2. **Dashboard carrega** em menos de 2 segundos com até 1.000 transações
3. **Webhook delivery** tem taxa de sucesso > 95%
4. **Integração n8n** permite criar workflow funcional em < 30 minutos
5. **Sistema é responsivo** e utilizável em dispositivos móveis

---

## 14. Próximos Passos

1. [ ] Aprovar este briefing
2. [ ] Criar wireframes/UX design
3. [ ] Definirstack tecnológico final
4. [ ] Criar Product Requirements Document (PRD)
5. [ ] Definir épicos e user stories
6. [ ] Iniciar desenvolvimento (Fase 1)

---

*Documento criado em: 24/03/2026*
*Versão: 1.0*
