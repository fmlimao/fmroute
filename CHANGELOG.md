# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o projeto adota o [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [2.0.0] - 2026-05-28

Reescrita madura, mantendo o propósito original (roteador front-end simples,
sem dependências).

### Adicionado
- Modo de roteamento `history` (URLs limpas via History API), além do `hash`,
  selecionável por `new FMRoute({ mode, base })`.
- Empacotamento **UMD**: a lib funciona via `<script>`, CommonJS (`require`) e
  bundlers (`import`).
- Método `destroy()` para remover o listener e encerrar o roteador.
- Encadeamento de métodos: todos os métodos públicos retornam a instância.
- Decodificação de parâmetros de rota com `decodeURIComponent`.
- Documentação JSDoc completa da API pública (com `@typedef` dos callbacks).
- `package.json` com build via `terser` (`npm run build`) e dev server com
  fallback de SPA (`npm run serve`) para testar o modo history.
- Demos separados por modo: `modelo/index.html` (hash) e `modelo/history.html`
  (history), em JS puro com Bootstrap 5.
- Arquivos `LICENSE` (MIT), `CHANGELOG.md` e `CLAUDE.md`.

### Alterado
- Reescrito como `class` ES6 dentro do wrapper UMD; arquivo inteiro em strict mode.
- Indentação padronizada em 2 espaços.

### Corrigido
- Global implícita `path_elements`, que vazava para o escopo global.
- Removido o `clearPathname()`, que misturava `pushState` no pathname com o
  roteamento por hash (origem do bug "ajuste na primeira / da url").

## [1.0.0] - 2018-02-26

Versão legada consolidada (roteador hash vanilla ES5). Congela a era
pré-refatoração — inclui as features acrescentadas após a 0.2.0: `go()`,
`stop()`/`start()` e a versão minificada.

## [0.2.0] - 2017-08-23

Primeira versão pública: roteamento por hash, parâmetros nomeados (`:id`),
hooks `before`/`after` e tratamento de `404`.

[2.0.0]: https://github.com/fmlimao/fmroute/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/fmlimao/fmroute/compare/0.2.0...v1.0.0
[0.2.0]: https://github.com/fmlimao/fmroute/releases/tag/0.2.0
