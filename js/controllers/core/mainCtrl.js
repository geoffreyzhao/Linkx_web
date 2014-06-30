define([
    '../controllers'
], function(controllers) {
    'use strict';

    controllers.controller('mainCtrl', [
    '$scope',
    'i18nProvider',
    'urlAdapterProvider',
    function($scope, i18nProvider, urlAdapterProvider) {
        /***********************************************************************
         * load url adapter
         **********************************************************************/
        urlAdapterProvider.devModeAdapter();
        urlAdapterProvider.localeModeAdapter();

        /***********************************************************************
         * load locale resource
         **********************************************************************/
        i18nProvider.getI18NResource(function() {
            // export to window and $scope
            window.i18n = $scope.i18n = $.i18n.prop;
        });

        /***********************************************************************
         * load partials url
         **********************************************************************/
        $scope.partials = _config.partials;

        $scope.consts = _config.consts;

        /***********************************************************************
         * verify user is login or not
         **********************************************************************/
         $scope.imageBaseUrl = "http://192.168.225.238:8080/linkx_third_img";
    }]);
});
