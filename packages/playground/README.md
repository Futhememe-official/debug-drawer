# MSW Debug Drawer — React + Vite + TailwindCSS

Debug drawer para alternar cenários de mock da API em tempo real com MSW, usando MVVM.

## Estrutura

```
src/
├── mocks/
│   ├── handlers.ts          # handlers padrão + scenarioHandlers dinâmicos
│   ├── browser.ts           # setupWorker (Service Worker, para dev)
│   ├── server.ts            # setupServer (Node, para testes Vitest)
│   ├── endpointsConfig.ts   # config visual dos endpoints no drawer
│   └── types.ts
├── components/
│   └── DebugDrawer/
│       ├── DebugDrawer.tsx  # FAB + backdrop + drawer + footer
│       └── EndpointBlock.tsx # bloco expansível por endpoint
├── hooks/
│   ├── useDebugDrawerViewModel.ts  # ViewModel do drawer (MVVM)
│   └── useTeamViewModel.ts         # ViewModel da tela de exemplo
├── views/
│   └── TeamView.tsx         # view que consome useTeamViewModel
├── test/
│   └── setup.ts             # setup global Vitest
├── App.tsx
├── main.tsx                 # inicia MSW worker antes do render
└── index.css
```

## Setup

```bash
npm install
```

### Gerar o Service Worker do MSW

O MSW precisa do arquivo `mockServiceWorker.js` na pasta `public/`:

```bash
npx msw init public/ --save
```

### Rodar em dev

```bash
npm run dev
```

O `main.tsx` inicia o Service Worker do MSW antes de renderizar a árvore React. Em produção (`npm run build`), o worker não é iniciado e o `<DebugDrawer />` não renderiza.

## Como usar o drawer

1. Abre o browser em `http://localhost:5173`
2. Clica no botão ⚡ no canto inferior direito
3. Seleciona o cenário por endpoint, ou usa os botões globais
4. Clica em **Apply & reload** — o MSW passa a interceptar com o novo handler
5. Clica em **refetch** na tela para ver o resultado

### Badge do FAB

| Badge | Significa |
|-------|-----------|
| ✓ verde | Todos em success |
| … amarelo | Algum em loading |
| ! vermelho | Algum em error / not_found |

## Testes

```bash
npm test
```

O Vitest usa `jsdom` + `@testing-library/react`. O `src/test/setup.ts` configura:

```ts
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Override por teste

```ts
server.use(
  http.get('https://api.example.com/users', () =>
    HttpResponse.json({ message: 'Server error' }, { status: 500 }),
  ),
)
```

## Adicionar novo endpoint

**1. `handlers.ts`** — handler padrão + cenários:

```ts
export const handlers = [
  http.get('https://api.example.com/products', () =>
    HttpResponse.json([...]),
  ),
]

export const scenarioHandlers = {
  'GET /products': {
    success: () => http.get('...', () => HttpResponse.json([...])),
    error:   () => http.get('...', () => HttpResponse.json({}, { status: 500 })),
    loading: () => http.get('...', async () => { await delay('infinite'); return HttpResponse.json([]) }),
  },
}
```

**2. `endpointsConfig.ts`** — config visual:

```ts
{
  id: 'GET /products',
  method: 'GET',
  path: '/products',
  selectedScenario: 'success',
  options: [
    { id: 'success', label: 'Success', description: 'Returns products', statusCode: 200, scenario: 'success' },
    { id: 'error',   label: 'Server error', description: '500',         statusCode: 500, scenario: 'error'   },
  ],
}
```

## Stack

| Pacote | Versão | Uso |
|--------|--------|-----|
| vite | ^6 | bundler + dev server |
| react | ^19 | UI |
| tailwindcss | ^3 | estilização |
| msw | ^2.7 | interceptação de rede |
| vitest | ^2 | testes |
| @testing-library/react | ^16 | testes de componente |
