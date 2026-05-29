# FM Route 2.0

A forma fácil de implementar rotas na sua aplicação web, **sem dependências**.

A versão 2.0 é uma reescrita madura: escrita como `class` ES6, distribuída em **UMD**
(funciona via `<script>`, CommonJS e `import`) e com suporte tanto a roteamento por
**hash** (`#/rota`) quanto à **History API** (URLs limpas).

> Procurando a versão antiga (vanilla ES5, só hash)? Ela está congelada na tag [`v1.0.0`](../../tree/v1.0.0).

## Instalação

Importe o arquivo na sua página:

```html
<script src="./fmroute.min.js"></script>
```

Ou via módulo:

```javascript
const FMRoute = require('fmroute');     // CommonJS
import FMRoute from 'fmroute';          // ESM (com bundler)
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
    console.log(vars.id);               // parâmetro nomeado
    next();
});

route.run();                            // inicia o roteador
```

## Modos de navegação

```javascript
// Hash (padrão) — URLs como /#/page-1
new FMRoute({ mode: 'hash' });

// History API — URLs limpas como /page-1
// (requer servidor que entregue o index.html nas rotas)
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

Veja [modelo/index.html](modelo/index.html) para um exemplo completo (Bootstrap 5, sem framework).
No modo `history`, sirva os arquivos por um servidor HTTP (ex.: `python3 -m http.server`).

## Licença

MIT
