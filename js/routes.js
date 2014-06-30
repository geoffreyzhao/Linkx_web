define(['./app'], function (linkxapp) {
    'use strict';
    return linkxapp.config(['$routeProvider', function ($routeProvider) {
        var routers = _config.routers;

        for(var router in routers) {
            $routeProvider.when(router, {
                templateUrl: routers[router].partial,
                controller: routers[router].ctrl,
                reloadOnSearch: false
            });
        }

        $routeProvider.otherwise({
            redirectTo: '/'
        });
    }]);
});