var FMRoute = (function () {
    function FMRoute() {
        this.routes = [];
        this.previous_route = null;
        this.current_route = '#/c/aaa/e';
    }

    FMRoute.prototype = {
        get: function (path, callback_enter, callback_exit) {
            callback_enter = callback_enter || function () { };
            callback_exit = callback_exit || function () { };

            path = this.clearPath(path);
            path_elements = this.splitPath(path);
            path = '/' + path;

            var route = {
                path: path,
                path_elements: path_elements,
                callback_enter: callback_enter,
                callback_exit: callback_exit,
            };

            this.routes.push(route);
        },
        run: function () {
            this.startHashListener();
            this.getCurrentHash();
        },

        startHashListener: function () {
            var _ = this;
            window.addEventListener('hashchange', function () {
                _.getCurrentHash();
            }, false);
        },
        getCurrentHash: function () {
            var current_hash = window.location.hash;

            this.changePreviousCurrentRoute(current_hash);

            var exit_callback = this.getExitCallback();
            var enter_callback = this.getEnterCallback();

            // console.dir(exit_callback);
            // console.dir(enter_callback);

            exit_callback[0](exit_callback[1], function () {
                // console.dir('NEXT 1');

                enter_callback[0](enter_callback[1], function () {
                    // console.dir('NEXT 2');
                });
            });
        },
        clearPath: function (path) {
            path = path.trim();
            path = path.replace('#', '');
            path = path.toLowerCase();

            if (path.substring(0, 1) == '/') {
                path = path.substring(1);
            }

            if (path.slice(-1) == '/') {
                path = path.slice(0, -1);
            }

            return path;
        },
        splitPath: function (path) {
            path = path.split('/');
            return path;
        },
        changePreviousCurrentRoute: function (current_path) {
            this.previous_route = this.current_route;
            this.current_route = current_path;
        },
        getExitCallback: function () {
            var callback = function (vars, next) {
                console.dir('EXIT DEFAULT');
                next();
            };

            var vars = {};

            if (this.previous_route) {
                var path_exists = this.checkPathExists(this.previous_route);

                if (path_exists) {
                    callback = path_exists[0].callback_exit;
                    vars = path_exists[1];
                }
            }

            return [
                callback,
                vars,
            ];
        },
        getEnterCallback: function () {
            var callback = function (vars, next) {
                console.dir('ENTER DEFAULT');
                next();
            };

            var vars = {};

            if (this.current_route) {
                var path_exists = this.checkPathExists(this.current_route);

                if (path_exists) {
                    callback = path_exists[0].callback_enter;
                    vars = path_exists[1];
                }
            }

            return [
                callback,
                vars,
            ];
        },
        checkPathExists: function (current_hash) {
            var path = this.clearPath(current_hash);
            path = this.splitPath(path);

            var exists = null;
            var routes = this.routes;
            for (var i in routes) {
                var route = routes[i];
                if (route.path_elements.length == path.length) {
                    var equal = true;
                    var vars = {};
                    for (var j in route.path_elements) {
                        var route_path_item = route.path_elements[j];
                        var is_path_var = this.isPathVar(route_path_item);
                        if (is_path_var) {
                            vars[is_path_var] = path[j];
                        } else {
                            if (route_path_item != path[j]) {
                                equal = false;
                            }
                        }
                    }

                    if (equal) {
                        exists = [route, vars];
                        break;
                    }
                }
            };
            return exists;
        },
        isPathVar: function (item) {
            if (item.substring(0, 1) == ':') {
                return item.substring(1);
            }
            return false;
        }
    };

    return FMRoute;
})();