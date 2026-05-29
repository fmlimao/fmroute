# CLAUDE.md

Guia para agentes de IA trabalhando neste repositório.

## O que é

`FM Route` é um micro-roteador front-end **vanilla, sem dependências de runtime**.
A lib inteira vive em um único arquivo, [fmroute.js](fmroute.js), distribuído em
**UMD** (funciona via `<script>`, CommonJS e bundlers).

## Estrutura

- `fmroute.js` — a biblioteca (fonte, documentado em JSDoc). **Edite aqui.**
- `fmroute.min.js` — **gerado** pelo build. Nunca edite à mão.
- `modelo/index.html` — demo do modo `hash` (abre direto via `file://`).
- `modelo/history.html` — demo do modo `history` (precisa do dev server).
- `server.js` — dev server Node puro com fallback de SPA (para o modo history).
- `package.json` — `private: true`; scripts de build e serve. **Não publicado no npm.**

## Comandos

```bash
npm install      # instala o terser (única devDependency)
npm run build    # gera fmroute.min.js a partir de fmroute.js (terser)
npm run serve    # sobe o dev server em http://localhost:8080 (testa o history)
```

Não há framework de testes. A verificação é feita com smoke tests via Node
(carregar a lib, simular `window`/`location` com mocks) e teste manual nos demos.

## Arquitetura da lib

`class FMRoute` com dois modos de navegação (`hash` | `history`):
- **API pública:** `get`, `error`, `before`, `after`, `run`, `stop`, `start`,
  `go`, `destroy`. Todos retornam `this` (encadeáveis).
- **Fluxo de cada navegação** (`_dispatch`): `before → exit(rota anterior) →
  enter(rota atual) → after`. Callbacks recebem `(vars, next, route)` e devem
  chamar `next()` para a cadeia seguir (exceto `after`, que é o último passo).
- **Matching** (`_match`): compara segmentos do caminho; `:nome` vira parâmetro
  em `vars` (decodificado com `decodeURIComponent`).
- O modo só muda a origem da URL (`location.hash` vs `location.pathname`) e o
  evento ouvido (`hashchange` vs `popstate`); o resto é compartilhado.

## Convenções

- **Indentação: 2 espaços**, em todos os arquivos (js, html). Sem tabs.
- **Documente a API pública com JSDoc.** O terser remove os comentários, então
  o `.min.js` não é afetado — documentação é custo zero no distribuído.
- Após mexer em `fmroute.js`, **rode `npm run build`** e confirme que o
  `.min.js` ainda carrega.

## Git / versionamento

- Versionamento semântico; mudanças registradas em [CHANGELOG.md](CHANGELOG.md).
- Tags: `0.2.0` → `v1.0.0` (legado ES5 congelado) → `v2.0.0` (esta reescrita).
- O legado vanilla ES5 está preservado na tag `v1.0.0`.
- Mensagens de commit em português.
