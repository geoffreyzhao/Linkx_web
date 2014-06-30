define([
    './services'
], function(services) {
    'use strict';

    services.factory('i18nProvider', [
    '$window',
    function($window) {
        var exports = {};

        function _setLocale(locale) {
            $window.localStorage && $window.localStorage.setItem('locale', locale);
        }

        function _getLocale() {
            return $window.localStorage && $window.localStorage.getItem('locale') || _config.locale.defaults.locale;
        }

        function _setResource(locale, i18nObject) {
            // Deprecated Functions
            var o = {
                locale : locale,
                resource : i18nObject
            };

            $window.localStorage && $window.localStorage.setItem('locale_resource', JSON.stringify(o));
        }

        function _getResource(locale) {
            // Deprecated Functions
            var res = $window.localStorage && $window.localStorage.getItem('locale_resource'),
                o = res && res !== "" && JSON.parse(res);

            if (o && (o.locale === locale)) {
                return o.resource;
            } else {
                return null;
            }
        }

        function _isJsonResource() {
            // Deprecated Functions
            return _config.locale.suffix === '.json';
        }

        function _isPropertiesResource() {
            // Deprecated Functions
            return _config.locale.suffix === '.properties';
        }

        function _i18nAdapter(res) {
            // Deprecated Functions
            if (_isJsonResource()) {
                return res;
            }

            var lines = res.split('\n'),
                pair,
                obj = {};

            _.each(lines, function(line) {
                if (!(line.charAt(0) === '#' || line === '')) {
                    pair = line.split('=');
                    obj[pair[0].trim()] = pair[1].trim();
                }
            });

            return obj;
        }

        function _getI18NResource(callback) {
            var localeConfig = _config.locale,
                settings = {
                    prefix: localeConfig.defaults.prefix,
                    language : _getLocale(),
                    path : localeConfig.defaults.path
                },
                xhr;

            xhr = $.i18n.properties({
                name: settings.prefix,
                path: settings.path + '/',
                language: settings.language,
                mode: 'map'
            });
            xhr.done(function(data) {
                callback && callback(data);
            }).fail(function(data) {
                console.log('load language resource file failed!');
            });

            // TODO console for dev mode
            console.debug('locale', '=', settings.language);
        }

        function _i18n(i18nObject) {
            // Deprecated Functions
            return function(property) {
                var str = i18nObject[property];
                var params = _.toArray(arguments).slice(1);
                if (params.length) {
                    var placeholder = /\{([^\}]+)\}/g;
                    // {key}
                    var template = str;
                    str = template.replace(placeholder, function(str, key) {
                        var result = str;
                        if ( key in params) {
                            result = params[key];
                        }
                        return result;
                    });
                }
                return str;
            };
        }

        exports = {
            setLocale: _setLocale,
            getLocale: _getLocale,
            setResource: _setResource,
            getResource: _getResource,
            getI18NResource: _getI18NResource,
        };

        return exports;
    }]);
});
