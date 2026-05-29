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

    // Callback de passagem padrão: apenas segue o fluxo.
    function passthrough(vars, next) {
        next();
    }

    class FMRoute {

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

        error(code, callback) {
            this.defaultCallbacks[code] = callback;
            return this;
        }

        before(callback) {
            this.defaultCallbacks['before'] = callback;
            return this;
        }

        after(callback) {
            this.defaultCallbacks['after'] = callback;
            return this;
        }

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

        stop() {
            this.running = false;
            return this;
        }

        start() {
            this.running = true;
            return this;
        }

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
