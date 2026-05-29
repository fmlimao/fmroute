/*!
 * FM Route 2.0
 * Roteador front-end simples, sem dependências.
 * Suporta dois modos de navegação: 'hash' (#/rota) e 'history' (URLs limpas).
 *
 * @license MIT
 */
(function (root, factory) {
  'use strict';

  if (typeof module === 'object' && module.exports) {
    // CommonJS / Node
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory);
  } else {
    // Browser global
    root.FMRoute = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Callback executado ao entrar/sair de uma rota, ou nos hooks before/404.
   * Deve chamar `next()` para a cadeia (before -> exit -> enter -> after) seguir.
   * @callback RouteCallback
   * @param {Object<string, string>} vars - Parâmetros nomeados extraídos da rota
   *   (ex.: a rota '/post/:id' acessada como '/post/42' fornece `{ id: '42' }`).
   * @param {function} next - Avança para a próxima etapa do fluxo.
   * @param {?string} route - Caminho da rota envolvida.
   */

  /**
   * Hook executado ao final do fluxo, depois da rota de entrada. Não recebe
   * `next()` por ser o último passo.
   * @callback AfterCallback
   * @param {Object<string, string>} vars - Parâmetros da rota atual.
   * @param {?string} route - Caminho da rota atual.
   */

  /**
   * Callback de passagem padrão: apenas segue o fluxo chamando next().
   * Usado quando uma rota não define callback de entrada/saída.
   * @type {RouteCallback}
   */
  function passthrough(vars, next) {
    next();
  }

  /**
   * Roteador front-end sem dependências.
   *
   * @example
   * const route = new FMRoute();          // modo 'hash' (padrão)
   * route
   *     .get('/', (vars, next) => next())
   *     .get('/post/:id', (vars, next) => { console.log(vars.id); next(); })
   *     .error('404', (vars, next) => next())
   *     .run();
   */
  class FMRoute {

    /**
     * @param {object} [options] - Opções de configuração.
     * @param {'hash'|'history'} [options.mode='hash'] - Estratégia de navegação.
     *   'hash' usa o fragmento da URL (#/rota); 'history' usa a History API
     *   (URLs limpas, /rota — exige fallback de SPA no servidor).
     * @param {string} [options.base=''] - Prefixo de caminho quando o app vive
     *   numa subpasta (ex.: '/app'). Relevante apenas no modo 'history'.
     */
    constructor(options = {}) {
      this.mode = options.mode === 'history' ? 'history' : 'hash';

      // Base normalizada com barra inicial e sem barra final (ex.: "/app").
      // Usada apenas no modo history, quando o app mora numa subpasta.
      const base = this._trimSlashes(options.base || '');
      this.base = base ? '/' + base : '';

      this.routes = [];
      this.previousRoute = null;
      this.currentRoute = null;
      this.running = false;

      this.defaultCallbacks = {
        '404': function (vars, next, route) {
          if (typeof console !== 'undefined') {
            console.warn('FMRoute: 404 NOT FOUND -> ' + route);
          }
          next();
        },
        'before': function (vars, next, route) {
          next();
        },
        'after': function (vars, route) { }
      };

      // Handler com referência estável, para poder remover o listener depois.
      this._listener = () => this._onLocationChange();
    }

    // ---- API pública --------------------------------------------------

    /**
     * Registra uma rota e seus callbacks.
     * @param {string} path - Caminho da rota. Aceita parâmetros nomeados
     *   com `:` (ex.: '/post/:id'), que viram propriedades de `vars`.
     * @param {RouteCallback} [callbackEnter] - Executado ao entrar na rota.
     * @param {RouteCallback} [callbackExit] - Executado ao sair da rota
     *   (ao navegar dela para outra). Opcional.
     * @returns {FMRoute} A própria instância, para encadeamento.
     */
    get(path, callbackEnter, callbackExit) {
      const { path: normalizedPath, segments } = this._normalize(path);

      this.routes.push({
        path: normalizedPath,
        segments,
        callbackEnter: callbackEnter || passthrough,
        callbackExit: callbackExit || passthrough
      });

      return this;
    }

    /**
     * Define o callback de um código de erro. Hoje o roteador dispara '404'
     * quando nenhuma rota casa com o caminho atual.
     * @param {string} code - Código do erro (ex.: '404').
     * @param {RouteCallback} callback - Executado quando o erro ocorre.
     * @returns {FMRoute} A própria instância, para encadeamento.
     */
    error(code, callback) {
      this.defaultCallbacks[code] = callback;
      return this;
    }

    /**
     * Define o hook executado ANTES de cada rota (em toda navegação).
     * @param {RouteCallback} callback - Executado no início do fluxo.
     * @returns {FMRoute} A própria instância, para encadeamento.
     */
    before(callback) {
      this.defaultCallbacks['before'] = callback;
      return this;
    }

    /**
     * Define o hook executado DEPOIS de cada rota (ao final do fluxo).
     * @param {AfterCallback} callback - Executado no fim do fluxo (sem `next`).
     * @returns {FMRoute} A própria instância, para encadeamento.
     */
    after(callback) {
      this.defaultCallbacks['after'] = callback;
      return this;
    }

    /**
     * Inicia o roteador: registra o listener do modo ativo (`hashchange` no
     * modo hash, `popstate` no history) e despacha a rota atual.
     * Deve ser chamado depois de registrar as rotas.
     * @returns {FMRoute} A própria instância, para encadeamento.
     */
    run() {
      this.running = true;

      const event = this.mode === 'history' ? 'popstate' : 'hashchange';
      window.addEventListener(event, this._listener, false);

      // No modo hash, garante um hash inicial; o hashchange disparado
      // por essa atribuição cuida do dispatch.
      if (this.mode === 'hash' && window.location.hash === '') {
        window.location.hash = '/';
        return this;
      }

      this._onLocationChange();
      return this;
    }

    /**
     * Pausa o tratamento de rotas. Enquanto pausado, mudanças de URL são
     * ignoradas (nenhum callback dispara). Retome com {@link FMRoute#start}.
     * @returns {FMRoute} A própria instância, para encadeamento.
     */
    stop() {
      this.running = false;
      return this;
    }

    /**
     * Retoma o tratamento de rotas após um {@link FMRoute#stop}.
     * Não redispara a rota atual; só volta a reagir a mudanças de URL.
     * @returns {FMRoute} A própria instância, para encadeamento.
     */
    start() {
      this.running = true;
      return this;
    }

    /**
     * Navega programaticamente para um caminho. No modo hash atualiza o
     * fragmento da URL; no modo history usa `pushState` e despacha a rota.
     * @param {string} path - Caminho de destino (ex.: '/page-1').
     * @returns {FMRoute} A própria instância, para encadeamento.
     */
    go(path) {
      const { path: normalizedPath } = this._normalize(path);

      if (this.mode === 'history') {
        const url = (this.base + '/' + normalizedPath).replace(/\/+/g, '/');
        window.history.pushState(null, document.title, url);
        this._onLocationChange();
      } else {
        window.location.hash = '/' + normalizedPath;
      }

      return this;
    }

    // ---- Internos -----------------------------------------------------

    _trimSlashes(value) {
      return String(value).trim().replace(/^\/+/, '').replace(/\/+$/, '');
    }

    // Normaliza um caminho cru em { path, segments }.
    _normalize(path) {
      const clean = this._trimSlashes(String(path).trim().replace('#', ''));

      return {
        path: clean,
        segments: clean === '' ? [''] : clean.split('/')
      };
    }

    // Lê o caminho atual conforme o modo, já sem o prefixo base.
    _currentLocation() {
      let raw;

      if (this.mode === 'history') {
        raw = window.location.pathname;
        if (this.base && raw.indexOf(this.base) === 0) {
          raw = raw.slice(this.base.length);
        }
      } else {
        raw = window.location.hash;
      }

      return this._normalize(raw);
    }

    // Procura a rota que casa com um caminho normalizado.
    // Retorna { route, vars } ou null.
    _match(location) {
      const segments = location.segments;

      for (const route of this.routes) {
        if (route.segments.length !== segments.length) {
          continue;
        }

        const vars = {};
        let matched = true;

        for (let j = 0; j < route.segments.length; j++) {
          const item = route.segments[j];
          const varName = this._paramName(item);

          if (varName) {
            vars[varName] = decodeURIComponent(segments[j]);
          } else if (item !== segments[j]) {
            matched = false;
            break;
          }
        }

        if (matched) {
          return { route, vars };
        }
      }

      return null;
    }

    // Nome do parâmetro se o segmento for ":nome", senão null.
    _paramName(segment) {
      return segment.charAt(0) === ':' ? segment.slice(1) : null;
    }

    _onLocationChange() {
      if (!this.running) {
        return;
      }

      const location = this._currentLocation();

      this.previousRoute = this.currentRoute;
      this.currentRoute = location.path;

      this._dispatch(location);
    }

    // Encadeia: before -> exit(rota anterior) -> enter(rota atual) -> after.
    _dispatch(location) {
      const before = this.defaultCallbacks['before'];
      const after = this.defaultCallbacks['after'];

      const enter = this._match(location);
      const exit = this.previousRoute !== null
        ? this._match(this._normalize(this.previousRoute))
        : null;

      const enterVars = enter ? enter.vars : {};
      const enterCallback = enter ? enter.route.callbackEnter : this.defaultCallbacks['404'];

      const exitVars = exit ? exit.vars : {};
      const exitCallback = exit ? exit.route.callbackExit : passthrough;

      before(enterVars, () => {
        exitCallback(exitVars, () => {
          enterCallback(enterVars, () => {
            after(enterVars, this.currentRoute);
          }, this.currentRoute);
        }, this.previousRoute);
      }, this.currentRoute);
    }
  }

  return FMRoute;
});
