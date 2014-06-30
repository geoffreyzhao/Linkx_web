define(['../services'], function(services) {
    'use strict';

    services.factory('httpfactory', [
    '$http',
    'store',
    function($http, store) {
        // Maybe to enhance

        var exports = {},
            config = _config,
            consts = config.consts;

        function _factory(url, method, data) {
            var httpPromise,
                config = {
                    headers: _extendAPIKey()
                };

            if (url && method) {
                httpPromise = (data !== undefined)
                    ? $http[method](url, data, config)
                    : $http[method](url, config);

                return httpPromise;
            }

            return new Error('http factory error');
        }

        function _extendAPIKey(data) {
            var userInfo = angular.fromJson(store.get(consts.storeKey.USER_INFO));

            return {
                apiKey: userInfo ? userInfo.apiKey : ''
            };
        }

        exports = {
            factory: _factory,
            extendAPIKey: _extendAPIKey
        };

        return exports;
    }]);
});
