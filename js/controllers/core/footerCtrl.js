define(['../controllers'], function(controllers) {
    'use strict';

    controllers.controller('footerCtrl', [
    '$scope',
    '$location',
    '$window',
    'store',
    'ob',
    'i18nProvider',
    function($scope, $location, $window, store, ob, i18nProvider) {

        /***********************************************************************
         * publish and subscribe
         **********************************************************************/
        ob.subscribe('event.locale.update', _updateLocale)

        var util = _util,
            config = _config,
            locale = config.locale;

        $scope.locale = {
            locales: locale.locales,
            defaults: locale.defaults.locale
        };

        $scope.updateLocale = function() {
            ob.publish('event.locale.update', {
                locale: $scope.locale.defaults
            });
        };

        function _updateLocale(params) {
            if (params.locale === i18nProvider.getLocale()) {
                return;
            }
            i18nProvider.setLocale(params.locale);
            i18nProvider.getI18NResource();
        }

    }]);
});
