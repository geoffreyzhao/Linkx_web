define([
    './services'
], function(services) {
   'use strict';

   services.factory('urlAdapterProvider', ['$window', 'i18nProvider',
   function($window, i18nProvider) {
        var exports = {};

        function _getSearchParams() {
            var location = $window.location,
                params = location.search.slice(1).split('&'),
                settings = {};

            _.each(params, function(param) {
                var pair = param.split('=');
                var key = decodeURIComponent(pair[0]);

                // allow just a key to turn on a flag, e.g., test.html?debug
                var value = pair[1] ? decodeURIComponent(pair[1]) : true;
                settings[key] = value;
            });
            return settings;
        }

        function _devModeAdapter() {
            var settings = _getSearchParams();
            if ('online' in settings) {
                _config.api.online = !(settings['online'] === 'false');
            }
            if ('offline' in settings) {
                _config.api.online = (settings['offline'] === 'false');
            }

            // TODO console for dev mode
            console.debug('online', '=', _config.api.online);
        }

        function _localeModeAdapter() {
            var settings = _getSearchParams(),
                locale = 'locale' in settings && _.contains(_config.locale.locales, settings['locale']) ?
                        settings['locale'] : _config.locale.defaults.locale;

            i18nProvider.setLocale(locale);

            // TODO console for dev mode
            console.debug('locale', '=', locale);
        }

        exports = {
            devModeAdapter: _devModeAdapter,
            localeModeAdapter: _localeModeAdapter
        };

        return exports;
   }]);
});
