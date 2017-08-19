var FMRoute = (function () {
    function FMRoute() {
        this.routes = [];
        this.previous_route = null;
        this.current_route = '#/c/d/e';
    }

    FMRoute.prototype = {
        get: function (path, callback_enter, callback_exit) {
            console.dir('get(' + path + ')');

            callback_enter = callback_enter || function () { };
            callback_exit = callback_enter || function () { };

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
            console.dir('run()');

            this.startHashListener();
            this.getCurrentHash();
        },

        startHashListener: function () {
            console.dir('startHashListener()');

            var _ = this;
            window.addEventListener('hashchange', function () {
                _.getCurrentHash();
            }, false);
        },
        getCurrentHash: function () {
            console.dir('getCurrentHash()');

            var current_hash = window.location.hash;
            // current_hash = this.clearPath(current_hash);
            // current_hash = this.splitPath(current_hash);

            this.changePreviousCurrentRoute(current_hash);
            // this.exitPreviousRoute();

            var exit_callback = this.getExitCallback();
            var enter_callback = this.getEnterCallback();

            console.dir(exit_callback);
            console.dir(enter_callback);

            // var path_exists = this.checkPathExists(current_hash);

            // console.dir('current_hash: ' + JSON.stringify(current_hash));
            // console.dir('path_exists: ');
            // console.dir(path_exists);
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
            console.dir('changePreviousCurrentRoute(' + current_path + ')');

            this.previous_route = this.current_route;
            this.current_route = current_path;
            // console.dir('previous_route: ' + this.previous_route);
            // console.dir('current_route: ' + this.current_route);
        },
        getExitCallback: function () {
            console.dir('getExitCallback()');

            if (this.previous_route) {
                console.dir(this.previous_route);
                var path_exists = this.checkPathExists(this.previous_route);
                console.dir(path_exists);

            //     if (path_exists) {
            //         console.dir(' -- TEM ROTA ANTERIOR -- ');
            //         console.dir('path_exists: ');
            //         console.dir(path_exists);

            //         path_exists[0].callback_exit();
            //     } else {
            //         console.dir(' -- NAO TEM ROTA ANTERIOR -- ');
            //     }
            }

            return 'A';
        },
        getEnterCallback: function () {
            console.dir('getExitCallback()');

            return 'B';
        },
        // exitPreviousRoute: function () {
        //     // console.clear();
        //     console.dir('exitPreviousRoute()');

        //     if (this.previous_route) {
        //         console.dir(this.previous_route);
        //         var path_exists = this.checkPathExists(this.previous_route);

        //         if (path_exists) {
        //             console.dir(' -- TEM ROTA ANTERIOR -- ');
        //             console.dir('path_exists: ');
        //             console.dir(path_exists);

        //             path_exists[0].callback_exit();
        //         } else {
        //             console.dir(' -- NAO TEM ROTA ANTERIOR -- ');
        //         }
        //     }
        // },
        checkPathExists: function (current_hash) {
            console.dir('checkPathExists(' + current_hash + ')');

            var path = this.clearPath(current_hash);
            path = this.splitPath(path);
            console.dir('path: ' + JSON.stringify(path));

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
                        console.dir('route.path_elements: ' + JSON.stringify(route.path_elements) + ' : ' + equal + ' : ' + JSON.stringify(vars));
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