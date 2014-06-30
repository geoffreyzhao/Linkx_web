define(['./services'], function(services) {
    'use strict';

    services.factory('mylinkxProvider', [
    '$window',
    'httpfactory',
    function($window, httpfactory) {

        /***********************************************************************
         @params
            _optional_
            _object type_
            _used for `put` `post` etc. method's data_
         @paramKey
            _optional_
            _array type_
            _user for replace placeholder in service url_
        ***********************************************************************/

        var exports = {},
            config = _config,
            url = config.api.getServiceURL;

        function _getUserType() {
            // Deprecated function
            var serviceKey = 'mylinkx_getUserType',
                serviceUrl = url(serviceKey);

            return httpfactory.factory(serviceUrl, 'get');
        }

        function _getItemsOnMyDevice() {
            var serviceKey = 'mylinkx_getMyDeviceList',
                serviceUrl = url(serviceKey);

            return httpfactory.factory(serviceUrl, 'get');
        }

        function _getItemsOnFollowsDevice() {
            // TODO
            var serviceKey = 'mylinkx_getFollowsDeviceList',
                serviceUrl = url(serviceKey);

            return httpfactory.factory(serviceUrl, 'get');
        }
        function _getFollowedDeviceDetail(paramKey) {
            var serviceKey = 'mylinkx_getFollowsDevice',
                serviceUrl = url(serviceKey, paramKey);
            return httpfactory.factory(serviceUrl, 'get');
        }

        function _getItemsOnFollowsData() {
            // TODO
            var serviceKey = 'mylinkx_getFollowsDataList',
                serviceUrl = url(serviceKey);

            return httpfactory.factory(serviceUrl, 'get');
        }

        function _getFollowDataDetail(paramKey) {
            var serviceKey = 'mylinkx_getFollowsDataDetail',
                serviceUrl = url(serviceKey, paramKey);

            return httpfactory.factory(serviceUrl, 'get');
        }

        function _getFollowDataValues(paramKey) {
            var serviceKey = 'mylinkx_getFollowsDataValues',
                serviceUrl = url(serviceKey, paramKey);

            return httpfactory.factory(serviceUrl, 'get');
        }


        function _addMyDevice(params) {
            var serviceKey = 'mylinkx_addMyDevice',
                serviceUrl = url(serviceKey);

            return httpfactory.factory(serviceUrl, 'post', params);
        }

        function _editMyDevice(params, paramKey) {
            var serviceKey = 'mylinkx_editMyDevice',
                serviceUrl = url(serviceKey, paramKey);

            return httpfactory.factory(serviceUrl, 'put', params);
        }

        function _delMyDevice(paramKey) {
            var serviceKey = 'mylinkx_delMyDevice',
                serviceUrl = url(serviceKey, paramKey);

            return httpfactory.factory(serviceUrl, 'delete');
        }

        function _getMyDevice(paramKey) {
            var serviceKey = 'mylinkx_getMyDevice',
                serviceUrl = url(serviceKey, paramKey);

            return httpfactory.factory(serviceUrl, 'get');
        }

        function _saveDeviceImage(paramKey) {
            var serviceKey = 'mylinkx_saveDeviceImage',
                serviceUrl = url(serviceKey, paramKey);

            return httpfactory.factory(serviceUrl, 'post');
        }

        function _getSensorListOnDevice(paramKey) {
            var serviceKey = 'mylinkx_getSensorList',
                serviceUrl = url(serviceKey, paramKey);

            return httpfactory.factory(serviceUrl, 'get');
        }

        function _addSensor(params, paramKey) {
            var serviceKey = 'mylinkx_addSensor',
                serviceUrl = url(serviceKey, paramKey);

            return httpfactory.factory(serviceUrl, 'post', params);
        }

        function _editSensor(params, paramKey) {
            var serviceKey = 'mylinkx_editSensor',
                serviceUrl = url(serviceKey, paramKey);

            return httpfactory.factory(serviceUrl, 'put', params);
        }

        function _delSensor(paramKey) {
            var serviceKey = 'mylinkx_delSensor',
                serviceUrl = url(serviceKey, paramKey);

            return httpfactory.factory(serviceUrl, 'delete');
        }

        function _getSensor(paramKey) {
            var serviceKey = 'mylinkx_getSensor',
                serviceUrl = url(serviceKey, paramKey);

            return httpfactory.factory(serviceUrl, 'get');
        }

        function _getSensorTags() {
            var serviceKey = 'mylinkx_getSensorTags',
                serviceUrl = url(serviceKey);
            return httpfactory.factory(serviceUrl, 'get');
        }

        function _searchDevice(p) {
            var serviceKey = 'mylinkx_searchDevice',
                serviceUrl = url(serviceKey);
            serviceUrl = serviceUrl + '?lat=' + p.lat + '&lng=' + p.lng +
                        '&radius=' + p.radius + '&keywords=' + p.keywords + '&forFollow=' + p.forFollow;
            return httpfactory.factory(encodeURI(serviceUrl), 'get');
        }

        function _searchFollowDataPoints(p) {
            var serviceKey = 'mylinkx_searchFollowDataPoints',
                serviceUrl = url(serviceKey);
            serviceUrl = serviceUrl + '?lat=' + p.lat + '&lng=' + p.lng + '&radius=' + p.radius + '&tag=' + p.tag;
            return httpfactory.factory(encodeURI(serviceUrl), 'get');
        }

        function _addFollowData(p) {
            var serviceKey = 'mylinkx_followData',
                serviceUrl = url(serviceKey);
            return httpfactory.factory(serviceUrl, 'post', p);
        }

        function _addFollowDevice(p) {
            var serviceKey = 'mylinkx_followDevice',
                serviceUrl = url(serviceKey);
            return httpfactory.factory(serviceUrl, 'post', p);
        }

        function _unfollowData (p) {
            var serviceKey = 'mylinkx_unfollowData',
                serviceUrl = url(serviceKey);
            return httpfactory.factory(serviceUrl, 'post', p);
        }

        function _unfollowDevice (p) {
            var serviceKey = 'mylinkx_unfollowDevice',
                serviceUrl = url(serviceKey);
            return httpfactory.factory(serviceUrl, 'post', p);
        }

        function _getMyRuleList () {
            var serviceKey = 'mylinkx_getMyRuleList',
                serviceUrl = url(serviceKey);
            return httpfactory.factory(serviceUrl, 'get');
        }

        function _getDeviceStatus (paramKey) {
            var serviceKey = 'mylinkx_getDeviceStatus',
                serviceUrl = url(serviceKey,paramKey);
            return httpfactory.factory(serviceUrl, 'get');
        }

        function _delRule (paramKey) {
            var serviceKey = 'mylinkx_delRule',
                serviceUrl = url(serviceKey, paramKey);
            return httpfactory.factory(serviceUrl, 'delete');
        }

        function _addRule (params) {
            var serviceKey = 'mylinkx_addRule',
                serviceUrl = url(serviceKey);
            return httpfactory.factory(serviceUrl, 'post', params);
        }

        function _getRule (paramKey) {
            var serviceKey = 'mylinkx_getRule',
                serviceUrl = url(serviceKey, paramKey);
            return httpfactory.factory(serviceUrl, 'get');
        }

        function _getSnsPermission () {
            var serviceKey = 'mylinkx_getSnsPermission',
                serviceUrl = url(serviceKey);
            return httpfactory.factory(serviceUrl, 'get');
        }

        function _getControlPanel (params) {
            var serviceKey = 'mylinkx_getControlPanel',
                serviceUrl = url(serviceKey, params);
            return httpfactory.factory(serviceUrl, 'get');
        }

        function _sendDCCommand(params, paramKey) {
            var serviceKey = 'mylinkx_sendDCCommand',
                serviceUrl = url(serviceKey, paramKey);

            return httpfactory.factory(serviceUrl, 'post', params);
        }

        function _getDCCommandStatus (params) {
            var serviceKey = 'mylinkx_getDCCommandStatus',
                serviceUrl = url(serviceKey, params);
            return httpfactory.factory(serviceUrl, 'get');
        }

        function _editRule(params, paramKey) {
            var serviceKey = 'mylinkx_editRule',
                serviceUrl = url(serviceKey, paramKey);

            return httpfactory.factory(serviceUrl, 'put', params);
        }

        exports = {
            getUserType: _getUserType,

            getFollowsDeviceList: _getItemsOnFollowsDevice,
            getFollowDataList: _getItemsOnFollowsData,
            getFollowDataDetail: _getFollowDataDetail,
            getFollowDataValues: _getFollowDataValues,

            addMyDevice: _addMyDevice,
            editMyDevice: _editMyDevice,
            delMyDevice: _delMyDevice,
            getMyDevice: _getMyDevice,
            getMyDeviceList: _getItemsOnMyDevice,
            saveDeviceImage: _saveDeviceImage,

            addSensor: _addSensor,
            editSensor: _editSensor,
            delSensor: _delSensor,
            getSensor: _getSensor,
            getSensorList: _getSensorListOnDevice,
            getSensorTags: _getSensorTags,
            searchDevice: _searchDevice,

            searchFollowDataPoints: _searchFollowDataPoints,
            addFollowData: _addFollowData,
            addFollowDevice: _addFollowDevice,

            getFollowedDeviceDetail: _getFollowedDeviceDetail,

            unfollowData: _unfollowData,
            unfollowDevice: _unfollowDevice,

            getDeviceStatus: _getDeviceStatus,

            getMyRuleList: _getMyRuleList,
            delRule: _delRule,
            addRule: _addRule,
            editRule: _editRule,
            getRule: _getRule,

            getSnsPermission: _getSnsPermission,

            getControlPanel: _getControlPanel,
            sendDCCommand:_sendDCCommand,
            getDCCommandStatus:_getDCCommandStatus
        };

        return exports;
    }]);
});