# Tech Spec: US-12 [Mobile] - Dashboard de Monitoramento por Status (Secretaria)

## Overview
Contexto:
- O ticket `US-12` em `ostracker-docs/TICKETS.md` define dashboard para secretaria com indicadores e lista filtravel.
- O estado atual do `ostrackermobile` possui fluxo ativo de autenticacao (`AuthGate`) e uma tela funcional principal (`FinalizationScreen`), sem tela de dashboard/listagem administrativa.
- No backend existe endpoint de fila de ligacao `GET /admin/orders/call-queue`, mas ainda nao existe contrato unico de dashboard cobrindo os 3 filtros exigidos (`Atrasados`, `Sem Agendamento`, `Proximos Descartes`).

Objetivo:
- Definir a experiencia mobile da secretaria com:
  - indicadores de volume por filtro operacional;
  - lista de OS filtravel;
  - estados completos de carregamento, erro, vazio e atualizacao.

Telas/componentes afetados:
- `src/features/auth/AuthGate.tsx` (roteamento por perfil apos login ativo).
- `src/features/dashboard/SecretaryDashboardScreen.tsx` (nova).
- `src/features/dashboard/components/*` (novos componentes de indicador, filtro e lista).
- `src/features/dashboard/api.ts` e `types.ts` (novo contrato de consumo).

Fora de escopo:
- Edicao de agendamento (US-13).
- Registro de logs de contato (US-14).
- Aprovacao de delivery (US-15).
- Finalizacao de entrega (US-16).
- Gestao de descartes (US-18) completa; aqui apenas filtro de proximidade.

## Business Rules (mobile-layer)
- A dashboard e exclusiva para perfil operacional de secretaria (ou superusuario em modo secretaria).
- Filtros obrigatorios da UI:
  - `ATRASADOS` (OS sem andamento resolutivo dentro da janela definida pelo backend).
  - `SEM_AGENDAMENTO` (OS aguardando agendamento).
  - `PROXIMOS_DESCARTES` (OS proximas da janela de 120 dias).
- Indicadores no topo devem refletir os mesmos criterios de filtro da lista, com fonte de dados consistente.
- Troca de filtro deve:
  - atualizar destaque visual do filtro selecionado;
  - reiniciar paginacao da lista para pagina 0;
  - manter resposta anterior em tela ate chegada da nova resposta (evitar flicker).
- Estados obrigatorios da tela:
  - `initial_loading`: skeleton/spinner para indicadores e lista.
  - `refreshing`: pull-to-refresh sem apagar conteudo atual.
  - `empty`: mensagem contextual por filtro + CTA de atualizar.
  - `error_initial`: erro de carga inicial com botao "Tentar novamente".
  - `error_incremental`: falha ao carregar proxima pagina com CTA "Repetir" no rodape.
  - `success`: indicadores e lista renderizados.
- Regra de resiliencia de UX:
  - se indicadores falharem e lista carregar, manter lista visivel com banner de erro parcial;
  - se lista falhar e indicadores carregarem, manter indicadores e exibir estado de erro da lista.
- Acessibilidade minima:
  - filtros com `accessibilityRole="button"` e estado selecionado anunciado;
  - cards de indicador com `accessibilityLabel` descritivo (nome + quantidade);
  - item da lista com ordem de foco consistente (cliente -> status -> tempo).

Assumptions:
- A regra de negocio exata de classificacao dos filtros e calculada no backend; o mobile apenas consome os buckets retornados no contrato.

## API Contract
### Endpoint 1 - Summary de indicadores (necessario para US-12)
- Method and path: `GET /admin/orders/dashboard/summary`
- Query params: nenhum
- Response `200`:
```ts
export type DashboardSummaryResponse = {
  atrasados: number;
  semAgendamento: number;
  proximosDescartes: number;
  generatedAt: string; // ISO-8601
};
```

### Endpoint 2 - Lista filtravel (necessario para US-12)
- Method and path: `GET /admin/orders/dashboard/orders`
- Query params:
  - `filter`: `ATRASADOS | SEM_AGENDAMENTO | PROXIMOS_DESCARTES`
  - `page`: number (default `0`)
  - `size`: number (default `20`, max `100`)
- Response `200`:
```ts
export type DashboardOrderItem = {
  id: string;
  clientName: string;
  clientPhone: string;
  status: string;
  finishedAt: string; // ISO-8601
  inactiveHours?: number; // quando aplicavel (ex.: atrasados)
  daysToDiscard?: number; // quando aplicavel (proximos descartes)
};

export type DashboardOrderPageResponse = {
  content: DashboardOrderItem[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};
```

### Endpoint 3 - Reaproveitamento parcial existente
- Method and path: `GET /admin/orders/call-queue`
- Uso: fallback temporario para `ATRASADOS` ate o Endpoint 2 estar disponivel.
- Observacao: nao cobre `SEM_AGENDAMENTO` e `PROXIMOS_DESCARTES`.

### Error mapping (todos endpoints dashboard)
- `401`: limpar sessao e voltar ao login (ja centralizado em `http.ts`).
- `403`: mostrar mensagem "Seu perfil nao possui acesso ao dashboard da secretaria." e oferecer voltar para home permitida.
- `422`: mostrar "Nao foi possivel aplicar o filtro selecionado.".
- `5xx` ou falha de rede: mostrar "Servico indisponivel no momento. Tente novamente em instantes.".

Assumptions:
- Dependencia de SPEC_BACKEND: os Endpoints 1 e 2 acima devem ser definidos e entregues antes da implementacao mobile completa de US-12.
- Se backend optar por endpoint unico (summary + list), o mobile adapta `api.ts` mantendo os mesmos tipos internos.

## Screens & Components
| Screen / Component | Status | Responsibility | State shape | Key interactions |
|---|---|---|---|---|
| `src/features/dashboard/SecretaryDashboardScreen.tsx` | `new` | Orquestrar filtros, carregamento de indicadores e lista | `{ selectedFilter, summaryState, listState, pagination, refreshing }` | trocar filtro, pull-to-refresh, scroll para carregar mais |
| `src/features/dashboard/components/StatusIndicators.tsx` | `new` | Renderizar cards de indicadores e destaque por filtro ativo | `{ selectedFilter }` + props de contagem | tap no card aplica filtro |
| `src/features/dashboard/components/FilterChips.tsx` | `new` | Renderizar filtro compacto persistente | stateless | selecionar `ATRASADOS`, `SEM_AGENDAMENTO`, `PROXIMOS_DESCARTES` |
| `src/features/dashboard/components/OrderListItem.tsx` | `new` | Exibir resumo de cada OS (cliente, status, idade) | stateless | tap futuro para detalhe (fora de escopo US-12) |
| `src/features/dashboard/components/ListStateView.tsx` | `new` | Padronizar estados vazio/erro/loading da lista | `{ mode: 'loading' | 'empty' | 'error' | 'ready' }` | CTA de retry |
| `src/features/dashboard/api.ts` | `new` | Consumir endpoints de summary/lista e mapear erros | funcoes stateless | `getDashboardSummary`, `getDashboardOrders` |
| `src/features/dashboard/types.ts` | `new` | Definir tipos de filtro, DTOs e view-models | tipos TS | parse/mapeamento |
| `src/features/auth/session.ts` | `modified` | Incluir identificacao de perfil para roteamento pos-login | `AuthSession` com `role` opcional | direcionar fluxo ativo |
| `src/features/auth/AuthGate.tsx` | `modified` | Rotear usuario ativo para dashboard da secretaria ou tela tecnica | `authState` + decisao por role | branch de renderizacao |

Assumptions:
- Para decisao de roteamento por perfil, o mobile precisa receber `role` no payload de login ou extrair claim `role` do JWT com parser local.

## Navigation
- Estrategia recomendada para esta US: manter navegacao por renderizacao condicional no `AuthGate` (sem introduzir React Navigation neste passo).
- Fluxo de entrada:
  - `unauthenticated` -> `LoginScreen`
  - `pending` -> `PendingApprovalScreen`
  - `active + role=SECRETARIA|SUPERUSUARIO` -> `SecretaryDashboardScreen`
  - `active + role=TECNICO` -> `FinalizationScreen`
- Comportamento de retorno:
  - na dashboard, botao de voltar do sistema nao deve retornar para login enquanto sessao ativa;
  - logout/expiracao de token retorna para login via mecanismo ja existente.

Assumptions:
- Se nao houver `role` disponivel na sessao, o app usa fallback por tentativa de acesso: abre dashboard, e em `403` redireciona para tela permitida com mensagem.

## State & Data Flow
- Fetching strategy:
  - `on mount`: carregar summary e primeira pagina do filtro default (`ATRASADOS`).
  - `on filter change`: manter dados atuais, requisitar nova pagina 0 para o filtro selecionado.
  - `on pull-to-refresh`: refazer summary + pagina 0 do filtro atual.
  - `on end reached`: buscar proxima pagina quando `last=false`.
- Estado local sugerido:
```ts
type DashboardFilter = 'ATRASADOS' | 'SEM_AGENDAMENTO' | 'PROXIMOS_DESCARTES';

type AsyncState<T> =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; data: T }
  | { kind: 'error'; message: string; lastData?: T };

type DashboardScreenState = {
  selectedFilter: DashboardFilter;
  summary: AsyncState<DashboardSummaryResponse>;
  list: AsyncState<DashboardOrderPageResponse>;
  isRefreshing: boolean;
  isLoadingMore: boolean;
};
```
- Cache local:
  - manter ultimo `summary` valido durante refresh;
  - manter ultima pagina valida por filtro para evitar layout vazio em troca rapida.
- Side effects:
  - `401/403` segue interceptador global de `http.ts`.
  - `403` especifico de dashboard exibe erro contextual antes de redirecionar, quando aplicavel.

Assumptions:
- Sem introduzir biblioteca de estado global nesta fase; `useState`/`useReducer` local e suficiente.

## Configuration
- Variaveis existentes reutilizadas:
  - `EXPO_PUBLIC_API_BASE_URL`
- Novas variaveis obrigatorias: nenhuma.
- Flag opcional recomendada para rollout seguro:
  - `EXPO_PUBLIC_ENABLE_SECRETARY_DASHBOARD=true|false` (default `false` em ambientes sem contrato backend final).

Assumptions:
- Se a flag opcional nao for adotada, rollout depende exclusivamente da disponibilidade do contrato backend em producao.

## Tests
Unit tests:
- `src/features/dashboard/api.test.ts`
  - mapeamento de erro por status HTTP (`403`, `422`, `5xx`, rede).
  - parse de payload de summary e pagina.
- `src/features/dashboard/state.test.ts` (ou helper equivalente)
  - troca de filtro reseta pagina.
  - merge de paginacao concatena `content` sem duplicar `id`.

Component tests (`@testing-library/react-native`):
- `SecretaryDashboardScreen.test.tsx`
  - loading inicial -> sucesso.
  - estado vazio por filtro.
  - erro inicial com retry.
  - erro incremental sem perder lista carregada.
  - pull-to-refresh mantendo conteudo anterior.
- `StatusIndicators.test.tsx`
  - clique em indicador altera filtro selecionado.
- `AuthGate.test.tsx` (regressao)
  - sessao ativa secretaria abre dashboard.
  - sessao ativa tecnico continua abrindo `FinalizationScreen`.

Regression focus:
- fluxo atual de finalizacao nao pode regredir para tecnico.
- tratamento global de `401/403` deve continuar limpando sessao corretamente.

Acceptance criteria (mobile):
- secretaria visualiza 3 indicadores (`Atrasados`, `Sem Agendamento`, `Proximos Descartes`) com contagens coerentes com backend.
- secretaria alterna filtros e lista e atualizada sem travar UI.
- estados `loading`, `erro`, `vazio` e `refresh` sao apresentados com feedback claro.
- pagina adicional carrega ao fim da lista quando houver mais dados.
- app trata indisponibilidade do backend com retry e mensagens amigaveis.
