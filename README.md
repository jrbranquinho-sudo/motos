# 🏍️ MotoShop SaaS — Sistema de Gestão para Oficinas de Motos e Autopeças

O **MotoShop** é um SaaS B2B moderno, responsivo (mobile-first para uso na bancada do mecânico) com suporte a multi-tenant, isolamento por oficina, controle de estoque com baixa automática, impressão profissional de Ordem de Serviço (em Folha A4 e Cupom Térmico de 80mm) e banco de dados serverless **Turso (LibSQL)** com **Prisma ORM**.

---

## ⚡ Destaques da Aplicação

- **🎨 Design Dark Mode Esportivo**: Paleta com fundo `#0F0F0F`/`#1A1A1A`, laranja vibrante `#F97316`, verde de aprovação `#22C55E` e vermelho de alerta `#EF4444`.
- **🏍️ Fluxo Rápido do Mecânico (3 Taps)**:
  1. Busca instantânea por placa Mercosul (`BRA2E19`, `FDX4G82`, etc.);
  2. Card com histórico e botão direto "Abrir Nova OS";
  3. Preenchimento de KM, queixa, adição de peças com autocomplete e salvar/imprimir.
- **📋 Kanban de Ordens de Serviço**:
  - Colunas: *Aberta* ➔ *Em Execução* ➔ *Aguardando Peças* ➔ *Aguardando Aprovação* ➔ *Concluída* ➔ *Entregue*.
  - Cronômetro de tempo de serviço integrado por OS.
  - Botão de envio rápido com mensagem pronta para o cliente no WhatsApp.
- **🖨️ Módulo de Impressão Profissional (`/orders/[id]/print`)**:
  - **Folha A4**: Logotipo da oficina, dados cadastrais, checklist de entrada, discriminação de peças e mão de obra, termos de garantia (CDC 90 dias) e campo para assinaturas.
  - **Cupom Térmico 80mm**: Formatado para impressoras térmicas não-fiscais (bobina) via CSS `@media print`.
- **📦 Estoque de Peças em Tempo Real**:
  - Dedução automática no estoque ao faturar uma OS.
  - Indicadores e alertas visuais de estoque abaixo do mínimo (`minStock`).
  - Histórico de movimentações (Entradas, Saídas e Ajustes de inventário).
- **📜 Linha do Tempo de Manutenções do Veículo**:
  - Histórico de cada moto com KM, serviços realizados, custo e alerta inteligente de próxima revisão vencida ou próxima.
- **💳 Planos SaaS & Billing**:
  - Planos Free, Starter (R$79/mês), Pro (R$149/mês) e Enterprise com medidores de uso e simulação de fatura Stripe.
- **🔐 Multi-Tenant & RBAC**:
  - Suporte a múltiplas oficinas com dados isolados e troca de perfil rápido (Admin, Mecânico, Recepcionista).
- **☁️ Banco de Dados Turso (LibSQL)**:
  - Totalmente serverless, distribuído na Edge, sem pausas por inatividade e com 9 GB gratuitos permanentes.

---

## 🚀 Como Executar Localmente

1. **Instale as dependências**:
   ```bash
   npm install
   ```

2. **Gere o Prisma Client e crie as tabelas locais**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Acesse no navegador**:
   - Landing page pública: [http://localhost:3000](http://localhost:3000)
   - Painel Operacional: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
   - Kanban de OS: [http://localhost:3000/orders](http://localhost:3000/orders)
   - Estoque de Peças: [http://localhost:3000/stock](http://localhost:3000/stock)
   - Veículos & Placas: [http://localhost:3000/vehicles](http://localhost:3000/vehicles)
   - Verificação de Conexão com o BD: [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 🗄️ Configuração do Banco de Dados Turso (Nuvem)

### 1. Criar o Banco no Turso
Você pode criar o banco de dados pelo site do [Turso Web](https://turso.tech) ou via CLI:

```bash
# Se quiser usar a CLI do Turso:
turso auth login
turso db create motos-db
```

### 2. Obter as Credenciais
- **URL de Conexão:**
  ```bash
  turso db show motos-db --url
  # Retornará algo como: libsql://motos-db-[seu-usuario].turso.io
  ```

- **Token de Autenticação:**
  ```bash
  turso db tokens create motos-db
  ```

### 3. Configurar o `.env`
Crie um arquivo `.env` na raiz do projeto com:
```env
TURSO_DATABASE_URL="libsql://motos-db-[seu-usuario].turso.io"
TURSO_AUTH_TOKEN="seu-token-gerado-no-passo-anterior"
DATABASE_URL="libsql://motos-db-[seu-usuario].turso.io"
```

### 4. Sincronizar o Schema e Popular o Banco Remoto
Execute no terminal:
```bash
# Cria todas as tabelas no Turso
npm run db:push

# Popula o banco remoto com os dados de demonstração
npm run db:seed
```

---

## 🐙 Publicação no GitHub

1. Inicialize o commit com os arquivos preparados:
   ```bash
   git add .
   git commit -m "feat: migracao para banco turso libsql e preparacao para vercel"
   ```

2. Crie um novo repositório no seu GitHub (ex: `motos-saas`).

3. Conecte o repositório remoto e envie o código:
   ```bash
   git remote add origin https://github.com/[seu-usuario]/motos-saas.git
   git branch -M main
   git push -u origin main
   ```

---

## ▲ Deploy na Vercel

1. Acesse o painel da [Vercel](https://vercel.com) e clique em **"Add New..." ➔ "Project"**.
2. Selecione o repositório do GitHub que você acabou de enviar.
3. Em **Environment Variables**, adicione as seguintes variáveis:
   - `TURSO_DATABASE_URL`: `libsql://motos-db-[seu-usuario].turso.io`
   - `TURSO_AUTH_TOKEN`: `seu-token-do-turso`
   - `DATABASE_URL`: `libsql://motos-db-[seu-usuario].turso.io`
4. O comando de build da Vercel já executará automaticamente:
   `npm run build` (que invoca o `prisma generate` pelo hook `postinstall`).
5. Clique em **"Deploy"**! Seu sistema estará no ar em segundos com banco de dados ultra-rápido na nuvem e sem pausas.

---

## 🛠️ Stack Tecnológica

- **Next.js 16** (App Router & Turbopack) + **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Turso (LibSQL)**: Edge SQLite serverless, sem hibernação e sem limites de pausa
- **Prisma ORM 6**: com `@prisma/adapter-libsql`
- **Lucide Icons**
