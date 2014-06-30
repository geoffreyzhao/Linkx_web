define(['./filters'], function(filters) {
    'use strict';

    filters.filter('imageUrlFilter', ['$filter',
    function($filter) {
        var exports = function(input, index, len) {
            var _result = '';
            input = input || '';
            if(len === 0) {
                _result = input;
            } else if ((len > 0) && (len < 3)) {
                _result = input.replace(".jpg", '_l.jpg');
            } else {
                _result = input.replace(".jpg", '_s.jpg');
            }
            return _result;
        };

        return exports;
    }]);

    filters.filter('deviceCover', ['$filter',
    function($filter) {
        var exports = function(input) {
            var _result = '',
                len;
            input = input || '';
            len = input.lastIndexOf(".");
            if(len == -1) {
              return _result;
            }
            _result = input.substring(0,len) + "_l" + input.substring(len);
            return _result;
        };
        return exports;
    }]);

    filters.filter('resetDeviceCover', ['$filter',
    function($filter) {
        var exports = function(input, data) {
            var _result = '',
                config = _config,
                len;
            if (!data) {
              _result = config.consts.deviceDefaultCover;
            } else if(data.length == 0) {
              _result = config.consts.addCover4Device;
            } else {
              len = data[0].lastIndexOf(".");
              _result = input + data[0].substring(0,len) + "_l" + data[0].substring(len);
            }
            return _result;
        };
        return exports;
    }]);

    filters.filter('userAvatar', ['$filter',
    function($filter) {
        var exports = function(input, baseUrl) {
            var _result = '';
            !!input ? (_result = baseUrl + input) : (_result = 'images/mylinkx/avatar.jpg');
            return _result;
        };

        return exports;
    }]);

    filters.filter('to_trusted', ['$sce', function ($sce) {
    return function (text) {
      return $sce.trustAsHtml(text);
      };
    }]);

    filters.filter('deviceTagFilter', ['$filter',
    function($filter) {
        var exports = function(input) {
            input = input || "";
            if(input.substr(-1) == ",") {
                input = input.substring(0, input.length -1);
            }
            return input;
        };
        return exports;
    }]);

    filters.filter('positionFilter', ['$filter',
    function($filter) {
        var exports = function(input) {
            (null == input) ? (input = "N/A") : "";
            return input;
        };
        return exports;
    }]);

    filters.filter('userLoginFilter', ['$filter', 'store',
    function ($filter, store) {
        var exports = function (input) {
            var consts = _config.consts,
                userInfo = angular.fromJson(store.get(consts.storeKey.USER_INFO));
            if(!userInfo || !userInfo.apiKey) {
                input = "#/user_login";
            }
            return input;
        }
        return exports;
    }]);

    filters.filter('sensorNumFilter', ['$filter',
    function ($filter) {
        var exports = function (input, deviceType) {
            if(deviceType == "ALLJOYN_DEVICE") return "N/A";
            return input || 0;
        }
        return exports;
    }]);
});
