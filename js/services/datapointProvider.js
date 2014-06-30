define(['./services'], function(services) {
    'use strict';

    services.factory('datapointProvider', [
    '$window',
    'httpfactory',
    function($window, httpfactory) {

        var exports = {},
            config = _config,
            url = config.api.getServiceURL;

        function _getLatestData(paramKey) {
            // Deprecated function
            var serviceKey = 'mylinkx_getLatestDatapoint',
                serviceUrl = url(serviceKey, paramKey);

            return httpfactory.factory(serviceUrl, 'get');
        }

        function _getDatapoints(params) {
            // Deprecated function
            var serviceKey = 'mylinkx_getDatapoints',
                serviceUrl = url(serviceKey, params.urlParam);

                serviceUrl = serviceUrl + "?beginTime=" + params.beginTime + "&endTime=" + params.endTime;

            return httpfactory.factory(serviceUrl, 'get');
        }

         exports = {
            getLatestData: _getLatestData,
            getDatapoints: _getDatapoints

        };

        return exports;
    }]);
});