# FM Route 2.0

A forma fácil de implementar rotas na sua aplicação web, **sem dependências**.

A versão 2.0 é uma reescrita madura: escrita como `class` ES6, distribuída em **UMD**
(funciona via `<script>`, CommonJS e `import`) e com suporte tanto a roteamento por
**hash** (`#/rota`) quanto à **History API** (URLs limpas).

> Procurando a versão antiga (vanilla ES5, só hash)? Ela está congelada na tag [`v1.0.0`](../../tree/v1.0.0).

## Instalação

Baixe o `fmroute.min.js` e importe na sua página:

```html
<script src="./fmroute.min.js"></script>
```

Ou consuma como módulo (apontando para o arquivo — o pacote não é publicado no npm):

```javascript
const FMRoute = require('./fmroute.js');   // CommonJS
import FMRoute from './fmroute.js';        // ESM (com bundler)
```

## Uso

```javascript
var route = new FMRoute();              // modo 'hash' (padrão)

route.get('/', function (vars, next) {
  // insira o seu código aqui
  next();
});

route.get('/page-1', function (vars, next) {
  next();
});

route.get('/page-2/:id', function (vars, next) {
  console.log(vars.id);                 // parâmetro nomeado
  next();
});

route.run();                            // inicia o roteador
```

## Modos de navegação

```javascript
// Hash (padrão) — URLs como /#/page-1
new FMRoute({ mode: 'hash' });

// History API — URLs limpas como /page-1
// (requer servidor que entregue o HTML em todas as rotas)
new FMRoute({ mode: 'history' });

// Com base, quando o app vive numa subpasta
new FMRoute({ mode: 'history', base: '/app' });
```

A API é idêntica nos dois modos — só muda como a URL aparece.

## Mais opções

Defina uma ação para quando uma rota não for encontrada:

```javascript
route.error('404', function (vars, next) {
  next();
});
```

Hooks executados **antes** e **depois** de cada rota:

```javascript
route.before(function (vars, next, route) {
  next();
});

route.after(function (vars, route) {
  // sem next(): roda ao final do fluxo
});
```

Callback de **saída** de uma rota (terceiro argumento do `get`), útil para limpeza:

```javascript
route.get('/editor',
  function (vars, next) { /* enter */ next(); },
  function (vars, next) { /* exit  */ next(); }
);
```

Navegação programática e controle do roteador:

```javascript
route.go('/page-1');   // navega via código
route.stop();          // pausa o tratamento de rotas
route.start();         // retoma
route.destroy();       // remove o listener e encerra (evita leak ao descartar)
```

Todos os métodos retornam a própria instância, então dá pra encadear:

```javascript
new FMRoute()
  .before(fn)
  .get('/', home)
  .get('/sobre', sobre)
  .error('404', naoEncontrado)
  .run();
```

## Build

O `.min.js` é gerado com [terser](https://github.com/terser/terser):

```bash
npm install
npm run build
```

## Demo

Há um demo para cada modo (Bootstrap 5, sem framework):

- **Hash** — [modelo/index.html](modelo/index.html): abra direto no navegador (`file://`).
- **History** — [modelo/history.html](modelo/history.html): precisa de um servidor com fallback
  de SPA, pois recarregar `/page-1` exige que o servidor devolva o HTML. Use o dev server incluso:

  ```bash
  npm run serve
  # Demo history: http://localhost:8080/
  # Demo hash:    http://localhost:8080/modelo/index.html
  ```

O dev server ([server.js](server.js)) é Node puro, sem dependências.

## Changelog

Veja [CHANGELOG.md](CHANGELOG.md) para o histórico de versões.

## Contribuidores

- Leandro Macedo ([@fmlimao](https://github.com/fmlimao)) — autor e mantenedor
- Forgehouse Tech — colaboração

## Licença

[MIT](LICENSE) © Leandro Macedo
