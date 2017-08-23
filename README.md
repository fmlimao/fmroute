# FM Route

A forma fácil de implementar rotas em sua aplicação web sem dependências.

Importe o arquivo em sua página:

`<script src="./fmroute.min.js"></script>`

Em seguida chame o objeto FMRoute:

```javascript
var route = new FMRoute();
```

Chame suas rotas:

```javascript
route.get('/', function (vars, next) {
    // insira o seu código aqui
    next();
});

route.get('/page-1', function (vars, next) {
    // insira o seu código aqui
    next();
});

route.get('/page-2/:id', function (vars, next) {
    // insira o seu código aqui
    next();
});
```

E por último execute as rotas para iniciar a bagaça toda:

```javascript
route.run();
```

E chablau!!!

## Mais opções

Vocẽ pode definir ações quando uma rota não for encontrada:

```javascript
route.error('404', function (vars, next) {
    // insira o seu código aqui
    next();
});
```

E definir ações que serão executadas **antes** ou **depois** de acessar as rotas:

```javascript
route.before(function (vars, next, route) {
    // insira o seu código aqui
    next();
});

route.after(function (vars, route) {
    // insira o seu código aqui
});
```