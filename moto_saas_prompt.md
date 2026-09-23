# 🏍️ MotoShop SaaS — Prompt Completo para Antigravity IDE

---

## CONTEXTO DO PROJETO

Desenvolva um sistema SaaS B2B completo chamado **MotoShop** para gestão de oficinas e autopeças de motocicletas. O sistema deve ser **moderno, responsivo (mobile-first)**, com suporte a impressão de Ordem de Serviço (OS) e multi-tenant (cada oficina é um tenant isolado).

---

## STACK TECNOLÓGICA

- **Frontend**: Next.js 14+ (App Router) com TypeScript
- **Estilização**: Tailwind CSS + shadcn/ui (componentes acessíveis)
- **Backend**: Next.js API Routes (ou tRPC para type-safety)
- **Banco de dados**: PostgreSQL via Prisma ORM
- **Autenticação**: NextAuth.js com suporte a múltiplos tenants
- **Deploy**: Vercel (frontend) + Supabase ou Railway (PostgreSQL)
- **Pagamentos SaaS**: Stripe (planos mensais por tenant)
- **Impressão**: react-to-print ou @react-pdf/renderer para OS
- **Notificações**: Retorno de clientes via WhatsApp (API Evolution ou Z-API)
- **Testes**: Jest + Playwright

---

## ARQUITETURA MULTI-TENANT

Implemente isolamento por `tenantId` em todas as tabelas do banco. Cada **oficina/empresa** é um tenant separado. O login deve identificar o tenant pelo subdomínio (`oficina-joao.motoshop.com`) ou por campo no login.

### Schema Prisma — Modelos Principais

```prisma
model Tenant {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  plan        Plan     @default(FREE)
  createdAt   DateTime @default(now())
  users       User[]
  vehicles    Vehicle[]
  parts       Part[]
  serviceOrders ServiceOrder[]
  suppliers   Supplier[]
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String
  role      Role     @default(MECHANIC)
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
}

enum Role { ADMIN MANAGER MECHANIC RECEPTIONIST }
enum Plan { FREE STARTER PRO ENTERPRISE }

model Customer {
  id          String    @id @default(cuid())
  name        String
  phone       String
  email       String?
  document    String?   // CPF ou CNPJ
  tenantId    String
  vehicles    Vehicle[]
  createdAt   DateTime  @default(now())
}

model Vehicle {
  id            String    @id @default(cuid())
  plate         String                    // Placa — chave de busca principal
  brand         String                    // Marca (Honda, Yamaha, etc.)
  model         String                    // Modelo (CG 160, Fazer 250, etc.)
  year          Int
  color         String?
  chassis       String?
  currentKm     Int       @default(0)     // KM atual registrado
  customerId    String
  customer      Customer  @relation(fields: [customerId], references: [id])
  tenantId      String
  serviceOrders ServiceOrder[]
  maintenanceHistory MaintenanceRecord[]
  createdAt     DateTime  @default(now())

  @@unique([plate, tenantId])
}

model ServiceOrder {
  id              String     @id @default(cuid())
  osNumber        Int                          // Número sequencial por tenant
  status          OSStatus   @default(OPEN)
  vehicleId       String
  vehicle         Vehicle    @relation(fields: [vehicleId], references: [id])
  mechanicId      String
  mechanic        User       @relation(fields: [mechanicId], references: [id])
  tenantId        String
  kmAtService     Int                          // KM no momento da OS
  kmNextService   Int?                         // KM previsto para próxima revisão
  complaint       String                       // Reclamação do cliente
  diagnosis       String?                      // Diagnóstico do mecânico
  notes           String?                      // Observações internas
  items           OSItem[]                     // Peças e serviços
  totalParts      Decimal    @default(0)
  totalLabor      Decimal    @default(0)
  totalAmount     Decimal    @default(0)
  estimatedTime   Int?                         // Minutos estimados
  completedAt     DateTime?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  @@unique([osNumber, tenantId])
}

enum OSStatus {
  OPEN          // Aberta
  IN_PROGRESS   // Em execução
  WAITING_PARTS // Aguardando peças
  WAITING_APPROVAL // Aguardando aprovação do cliente
  COMPLETED     // Concluída
  DELIVERED     // Entregue
  CANCELLED     // Cancelada
}

model OSItem {
  id              String       @id @default(cuid())
  serviceOrderId  String
  serviceOrder    ServiceOrder @relation(fields: [serviceOrderId], references: [id])
  type            ItemType                     // PART ou LABOR
  partId          String?
  part            Part?        @relation(fields: [partId], references: [id])
  description     String
  quantity        Decimal      @default(1)
  unitPrice       Decimal
  discount        Decimal      @default(0)
  total           Decimal
}

enum ItemType { PART LABOR }

model Part {
  id              String    @id @default(cuid())
  code            String                       // Código interno
  name            String
  description     String?
  brand           String?
  category        String                       // Filtro, freio, motor, etc.
  costPrice       Decimal
  salePrice       Decimal
  stockQty        Int       @default(0)
  minStock        Int       @default(1)        // Estoque mínimo para alerta
  location        String?                      // Localização física na prateleira
  tenantId        String
  supplierId      String?
  supplier        Supplier? @relation(fields: [supplierId], references: [id])
  osItems         OSItem[]
  stockMovements  StockMovement[]
  createdAt       DateTime  @default(now())

  @@unique([code, tenantId])
}

model StockMovement {
  id        String        @id @default(cuid())
  partId    String
  part      Part          @relation(fields: [partId], references: [id])
  type      MovementType
  qty       Int
  reason    String?
  tenantId  String
  createdAt DateTime      @default(now())
}

enum MovementType { IN OUT ADJUSTMENT }

model MaintenanceRecord {
  id          String   @id @default(cuid())
  vehicleId   String
  vehicle     Vehicle  @relation(fields: [vehicleId], references: [id])
  osId        String?                          // Referência à OS original
  km          Int                              // KM na manutenção
  description String
  date        DateTime @default(now())
  tenantId    String
}

model Supplier {
  id       String  @id @default(cuid())
  name     String
  contact  String?
  phone    String?
  email    String?
  tenantId String
  parts    Part[]
}
```

---

## FUNCIONALIDADES REQUERIDAS

### 1. 🔐 Autenticação e Multi-Tenant
- Login por e-mail/senha com identificação de tenant
- Roles: **Admin** (dono da oficina), **Manager**, **Mecânico**, **Recepcionista**
- Cada role vê apenas o que precisa (RBAC)
- Primeiro acesso cria o tenant automaticamente (onboarding)

### 2. 🏍️ Gestão de Veículos (por Placa)
- **Busca rápida por placa** como campo principal (com máscara Mercosul: ABC1D23)
- Ao digitar a placa, exibir o histórico completo do veículo imediatamente
- Cadastro completo: marca, modelo, ano, cor, chassi
- KM atual sempre atualizado a cada OS
- **Consulta automática de placa** via API externa (opcional: SinistroCheck, PlacaFipe ou similar)

### 3. 📋 Ordem de Serviço (OS)
- Número sequencial automático por tenant
- Fluxo de status com kanban visual: Aberta → Em Execução → Aguardando Peças → Concluída → Entregue
- Campos obrigatórios: placa, KM entrada, reclamação do cliente, mecânico responsável
- Adicionar peças do estoque com autocomplete (descontar estoque automaticamente)
- Adicionar serviços/mão de obra com valor avulso
- Campo para KM da próxima revisão (ex: troca de óleo a cada 3.000 km)
- Aprovação pelo cliente (status "Aguardando Aprovação" com envio de link ou WhatsApp)
- **Impressão da OS** em formato profissional (A4 e térmica 80mm)
- Foto de danos ao receber a moto (upload de imagens)

### 4. 🖨️ Impressão da OS
Gere um layout de impressão profissional contendo:
- Logo da oficina + dados da empresa
- Número da OS, data, mecânico responsável
- Dados do cliente e veículo (placa, KM)
- Tabela de peças utilizadas (qtd, descrição, valor unitário, total)
- Tabela de serviços/mão de obra
- Subtotais, descontos e **total geral**
- Campo de assinatura do cliente
- Termos e condições resumidos
- Rodapé com dados de contato
- Suporte a impressão térmica 80mm (CSS @media print)

### 5. 📦 Controle de Estoque
- Cadastro de peças com código, nome, categoria, fornecedor
- Estoque atual com alerta visual quando abaixo do mínimo
- Movimentações: Entrada, Saída (automática via OS), Ajuste de inventário
- Relatório de peças mais utilizadas
- Controle de custo vs. preço de venda (margem)
- Histórico de movimentações por peça

### 6. 📜 Histórico de Manutenções por Veículo
- Timeline visual de todas as OSs da moto
- Exibição de: data, KM, serviços realizados, peças trocadas, valor total
- Alerta de próxima manutenção (por KM ou por data)
- Exportação em PDF do histórico completo

### 7. 👥 Gestão de Clientes
- Cadastro por CPF/CNPJ, telefone, e-mail
- Um cliente pode ter múltiplos veículos
- Histórico de gastos e visitas
- **Recorrência**: alertar quando o cliente não retorna há X dias ou quando o KM previsto foi atingido

### 8. 📊 Dashboard e Relatórios
- Cards: OS abertas, OS concluídas hoje, faturamento do mês, peças com estoque baixo
- Gráfico de faturamento mensal
- Ranking de mecânicos (OS concluídas, tempo médio)
- Relatório de peças mais vendidas
- Relatório de clientes fiéis vs. inativos

### 9. 💳 SaaS — Planos e Billing
- Plano **Free**: 1 usuário, 30 OS/mês, 50 peças no estoque
- Plano **Starter** (R$79/mês): 3 usuários, OS ilimitadas, 200 peças
- Plano **Pro** (R$149/mês): 10 usuários, tudo ilimitado, relatórios avançados, API WhatsApp
- Plano **Enterprise**: customizado, multi-filial
- Integração com **Stripe** para cobrança recorrente
- Página de pricing pública e onboarding de trial 14 dias

---

## ESTRUTURA DE PASTAS DO PROJETO

```
motoshop/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Sidebar + Header responsivo
│   │   ├── page.tsx                # Dashboard principal
│   │   ├── orders/
│   │   │   ├── page.tsx            # Lista de OS com kanban
│   │   │   ├── new/page.tsx        # Nova OS
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Detalhes da OS
│   │   │       └── print/page.tsx  # Página de impressão
│   │   ├── vehicles/
│   │   │   ├── page.tsx            # Busca por placa
│   │   │   └── [id]/page.tsx       # Histórico do veículo
│   │   ├── stock/
│   │   │   ├── page.tsx            # Lista de peças
│   │   │   └── movements/page.tsx  # Movimentações
│   │   ├── customers/page.tsx
│   │   ├── reports/page.tsx
│   │   └── settings/
│   │       ├── page.tsx            # Configurações da oficina
│   │       └── billing/page.tsx    # Plano e pagamento
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── orders/route.ts
│   │   ├── vehicles/route.ts
│   │   ├── parts/route.ts
│   │   └── webhooks/stripe/route.ts
│   └── (landing)/
│       ├── page.tsx                # Landing page pública
│       └── pricing/page.tsx
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── orders/
│   │   ├── OSKanbanBoard.tsx
│   │   ├── OSForm.tsx
│   │   ├── OSPrintLayout.tsx       # Layout de impressão
│   │   └── OSStatusBadge.tsx
│   ├── vehicles/
│   │   ├── PlateSearchInput.tsx    # Input com máscara de placa
│   │   ├── MaintenanceTimeline.tsx
│   │   └── VehicleCard.tsx
│   ├── stock/
│   │   ├── PartAutocomplete.tsx    # Autocomplete para adicionar peças na OS
│   │   └── LowStockAlert.tsx
│   └── dashboard/
│       ├── StatCards.tsx
│       └── RevenueChart.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                     # Dados de demonstração
└── public/
    └── logo.svg
```

---

## DESIGN SYSTEM

Use um design **dark mode** moderno como tema padrão, com opção de light mode:

- **Cor primária**: `#F97316` (laranja vibrante — remetendo a motos e energia)
- **Cor de fundo dark**: `#0F0F0F` e `#1A1A1A`
- **Acento**: `#22C55E` (verde para status positivos)
- **Perigo**: `#EF4444` (vermelho para estoque baixo, OS urgente)
- **Fonte**: Inter (Google Fonts)
- Cards com glassmorphism sutil no dark mode
- Animações com Framer Motion nas transições de status da OS
- Sidebar colapsável no desktop, drawer no mobile
- Bottom navigation bar no mobile (Dashboard, OS, Estoque, +Nova OS)

---

## FLUXO PRINCIPAL DO MECÂNICO (UX CRÍTICO)

O mecânico acessa pelo celular na bancada. O fluxo deve ser em **máximo 3 taps**:

1. **Tela Inicial**: Campo de busca por placa em destaque (tamanho grande, auto-focus)
2. **Resultado**: Exibe o veículo encontrado, cliente e botão "Abrir Nova OS" ou "Ver Última OS"
3. **Nova OS**: Form simplificado (KM, reclamação, adicionar peças) → Salvar e Imprimir

---

## FEATURES ADICIONAIS SUGERIDAS

1. **Timer de OS**: Cronômetro por OS para calcular tempo real de serviço
2. **Checklist de vistoria**: Fotos antes/depois da moto (upload mobile-friendly)
3. **Notificação WhatsApp**: Avisar cliente quando OS foi concluída (via Z-API ou Evolution API)
4. **QR Code na OS**: Para o cliente acompanhar o status online sem login
5. **Agendamento**: Calendário para agendar revisões futuras
6. **Integração com NFSe**: Geração de nota fiscal de serviço (para plano Enterprise)
7. **App PWA**: Configurar como Progressive Web App para instalação no celular sem app store
8. **Estoque com código de barras**: Leitura de código de barras via câmera do celular para dar baixa em peças

---

## INSTRUÇÕES DE EXECUÇÃO

1. Crie o projeto com `npx create-next-app@latest motoshop --typescript --tailwind --app`
2. Configure o Prisma com PostgreSQL (use SQLite para desenvolvimento local primeiro)
3. Instale as dependências: `shadcn/ui`, `next-auth`, `@prisma/client`, `react-to-print`, `framer-motion`, `recharts`, `react-hook-form`, `zod`
4. Implemente o schema do banco conforme descrito acima
5. Crie o seed com dados de demonstração (1 oficina, 3 veículos, 5 OS em diferentes status, 20 peças)
6. Implemente as páginas na ordem: Auth → Dashboard → Veículos → OS → Estoque → Relatórios → Billing
7. Configure o layout de impressão da OS como rota separada (`/orders/[id]/print`) com `@media print` CSS
8. Ao final, configure o PWA com `next-pwa` para instalação mobile
9. Escreva testes E2E com Playwright para o fluxo principal: buscar placa → abrir OS → adicionar peça → concluir → imprimir

---

## CRITÉRIOS DE QUALIDADE

- [ ] Responsivo em 320px (mobile pequeno) até 1920px (desktop wide)
- [ ] Tempo de carregamento < 2s na página principal
- [ ] Busca por placa com debounce de 300ms
- [ ] OS pode ser impressa offline (dados em cache)
- [ ] Estoque atualizado em tempo real ao finalizar uma OS
- [ ] Histórico do veículo paginado (infinite scroll no mobile)
- [ ] Todos os formulários com validação Zod + feedback visual
- [ ] Acessibilidade: aria-labels, contraste WCAG AA

---

> **Nota**: Execute este projeto completo, desde a configuração inicial até a aplicação funcional com dados de seed. Priorize o fluxo do mecânico (busca por placa → OS → impressão) como MVP. Implemente todas as features listadas, começando pelas obrigatórias e depois as sugeridas.
