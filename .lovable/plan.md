

# Sistema de Indicacao (Referral Program)

## O que muda para voce
- Na sidebar e no dashboard, um novo item **"Indique e Ganhe"** permite compartilhar um link unico de indicacao
- Quando alguem se cadastra pelo seu link e faz o primeiro pagamento, **ambos ganham 30 dias gratis** na proxima renovacao
- Um painel mostra quantos amigos voce indicou, quantos ja converteram e quantos meses voce ja ganhou

## Como vai funcionar
1. Cada empresa recebe um codigo unico automaticamente (ex: `ABC123`)
2. O usuario compartilha o link `app.barbersoft.com/auth?tab=signup&ref=ABC123`
3. O visitante se cadastra normalmente - o codigo fica salvo no localStorage
4. Ao criar a conta, um registro `referral` com status `pending` e criado
5. Quando o convidado faz o primeiro pagamento (Stripe webhook), o sistema:
   - Aplica cupom de 100% para a proxima fatura do **convidado**
   - Aplica cupom de 100% para a proxima fatura do **indicador**
   - Atualiza o status do referral para `completed`

## Fluxo Visual

```text
[Usuario A] --compartilha link--> [Usuario B acessa /auth?ref=CODE]
                                         |
                                    [Cadastro + ref salvo localStorage]
                                         |
                                    [Cria company + referral (pending)]
                                         |
                                    [Primeiro pagamento Stripe]
                                         |
                                    [Webhook: invoice.paid]
                                         |
                              [Verifica se e 1o pagamento]
                              [Busca referral pending]
                                         |
                          [Aplica cupom 100% para ambos]
                          [Status -> completed]
```

---

## Detalhes Tecnicos

### 1. Banco de Dados (Migracao SQL)

**Coluna na tabela `companies`:**
- `referral_code TEXT UNIQUE` - codigo unico gerado automaticamente

**Nova tabela `referrals`:**
- `id` (uuid, PK)
- `referrer_company_id` (uuid, FK -> companies.id) - quem indicou
- `referred_company_id` (uuid, FK -> companies.id) - quem foi indicado
- `status` (text: 'pending' | 'completed')
- `completed_at` (timestamptz, nullable)
- `created_at` (timestamptz, default now())

**RLS policies para `referrals`:**
- SELECT: usuario pode ver referrals onde ele e o dono da company referrer OU referred (usando `user_owns_company`)
- INSERT: via service_role apenas (edge function)
- UPDATE: via service_role apenas (edge function)

**Trigger:** ao criar uma company, gerar automaticamente um `referral_code` unico de 8 caracteres alfanumericos

### 2. Frontend - Pagina Auth (`src/pages/Auth.tsx`)

- Ler `ref` dos search params e salvar no `localStorage` como `referral_code`
- No `handleSignup`, apos criar a company, verificar se existe `referral_code` no localStorage
- Se existir, buscar a company do indicador pelo codigo e inserir na tabela `referrals` com status `pending`
- Limpar localStorage apos inserir

### 3. Frontend - Componente "Indique e Ganhe" (`src/components/referral/ReferralCard.tsx`)

- Card com o link de indicacao copiavel
- Botoes de compartilhar (copiar link, WhatsApp)
- Estatisticas: total de indicacoes, convertidas, meses ganhos
- Hook `src/hooks/useReferrals.ts` para buscar dados

### 4. Frontend - Dashboard Integration

- Adicionar o `ReferralCard` no Dashboard ou como item no menu lateral
- Adicionar rota `/indicacoes` no App.tsx dentro das ProtectedRoutes

### 5. Backend - Stripe Webhook (`supabase/functions/stripe-webhook/index.ts`)

Extender o case `invoice.paid` existente com a logica de referral:

```text
case "invoice.paid":
  1. Buscar company pelo stripe_subscription_id
  2. Verificar se e a primeira invoice paga (billing_reason === 'subscription_create' 
     OU contar invoices anteriores pagas = 0)
  3. Buscar referral pendente onde referred_company_id = company.id
  4. Se encontrar:
     a. Buscar subscription do convidado -> aplicar coupon 100% (duration: once)
     b. Buscar subscription do indicador -> aplicar coupon 100% (duration: once)
     c. Atualizar referral.status = 'completed', completed_at = now()
```

**Cupom Stripe:** Criar cupom via API `stripe.coupons.create({ percent_off: 100, duration: 'once', name: 'Referral - 1 Mes Gratis' })` e aplicar com `stripe.subscriptions.update(subId, { coupon: couponId })`

### 6. Config (`supabase/config.toml`)

Ja existe `verify_jwt = false` para webhook. Sem alteracoes necessarias.

### Arquivos criados/alterados

| Arquivo | Acao |
|---------|------|
| Migracao SQL (via Supabase) | Criar tabela `referrals`, coluna `referral_code`, trigger, RLS |
| `src/pages/Auth.tsx` | Ler `ref` param, salvar localStorage, criar referral no signup |
| `src/hooks/useReferrals.ts` | Novo - hook para buscar/gerenciar referrals |
| `src/components/referral/ReferralCard.tsx` | Novo - UI de compartilhamento e estatisticas |
| `src/pages/Indicacoes.tsx` | Novo - pagina dedicada ao programa de indicacao |
| `src/App.tsx` | Adicionar rota `/indicacoes` |
| `src/components/layout/AppSidebar.tsx` | Adicionar item "Indique e Ganhe" no menu |
| `supabase/functions/stripe-webhook/index.ts` | Extender `invoice.paid` com logica de referral |

### Seguranca
- Referrals so podem ser criados/atualizados pelo service_role (edge functions)
- Usuario so ve seus proprios referrals via RLS
- Codigo de referral e unico e gerado server-side (trigger)
- Beneficio so e liberado apos confirmacao de pagamento (webhook assincrono)
- Auto-referral e bloqueado (verificacao no signup)

