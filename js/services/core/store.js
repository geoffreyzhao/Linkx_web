define(['../services'], function(services) {
    'use strict';

    services.factory('store', [function() {
        var storage = window.localStorage, exports;

        exports = {
            get : function(key) {
                return storage.getItem(key);
            },
            set : function(key, value) {
                storage.setItem(key, value);
            },
            all : function() {
                return storage;
            }
        };

        return exports;
    }]);
});
