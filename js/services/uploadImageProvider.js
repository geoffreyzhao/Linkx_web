define(['./services'], function(services) {
    'use strict';

    services.factory('uploadImageProvider', [
    '$window',
    'httpfactory',
    '$http',
    function($window, httpfactory, $http) {
        var exports = {},
            config = _config,
            url = config.api.getServiceURL;

        function _uploadDeviceImage(file) {
            var form = new FormData(),
                serviceKey = 'mylinkx_upload_img_4_device',
                serviceUrl = url(serviceKey),
                expert = {},
                _success, _error;
            form.append("file", file);
            //JQuery AJAX type.
            $.ajax({
                url: serviceUrl,
                type: 'POST',
                data: form,
                cache: false,
                dataType: 'json',
                headers: httpfactory.extendAPIKey(),
                processData: false,
                contentType: false,
                complete: function (data) {
                    var result;
                    if((data.readyState === 4) && (data.status === 200)) {
                        result = angular.fromJson(data.responseText);
                        if(result.code === 200) {
                            console.info(_success);
                            if(!!_success && _success instanceof Function) {
                                _success(result);
                            }
                        } else {
                            console.info(_error);
                            if(!!_error && _error instanceof Function) {
                                _error(result);
                            }
                        }
                    }
                }
            });
            expert.success = function (fn) {
                _success = fn;
            }
            expert.error = function (fn) {
                _error = fn;
            }
            return expert;
            // XMLHttpRequest Type.
            // var xhr = new XMLHttpRequest();
            // xhr.open("post", serviceUrl, true);
            // xhr.overrideMimeType("multipart/form-data");
            // var _userInfo = httpfactory.extendAPIKey();
            // $.each(_userInfo, function (i, v) {
                // xhr.setRequestHeader(i,v);
            // });
            // xhr.onload = function (data) {
                // console.info(data);
            // };
            // xhr.onreadystatechange = function () {
                // if (xhr.readyState == 4) {
                    // console.info(xhr.status, xhr.statusText + "--");
                    // console.info(xhr.responseText)
                // }
            // };
            // xhr.send(form);
        }

        function _bindImgToDevice(params, paramKey) {
            var serviceKey = 'mylinkx_bindImgToDevice',
                serviceUrl = url(serviceKey, paramKey);

            return httpfactory.factory(serviceUrl, 'post', params);
        }

        function _getBindedImgOfDevice(paramKey) {
            var serviceKey = 'mylinkx_getBindedImgOfDevice',
                serviceUrl = url(serviceKey, paramKey);

            return httpfactory.factory(serviceUrl, 'get');
        }

        function _unBindImgToDevice(paramKey) {
          var serviceKey = 'mylinkx_unBindImgToDevice',
                serviceUrl = url(serviceKey, paramKey);

            return httpfactory.factory(serviceUrl, 'delete');
        }

        function _cutDeviceImage(params) {
            var serviceKey = 'mylinkx_cutImg',
                serviceUrl = url(serviceKey);

            return httpfactory.factory(serviceUrl, 'post', params);
        }

        exports = {
            uploadDeviceImage: _uploadDeviceImage,
            bindImgToDevice: _bindImgToDevice,
            getBindedImgOfDevice: _getBindedImgOfDevice,
            cutDeviceImage: _cutDeviceImage,
            unBindImgToDevice: _unBindImgToDevice
        }
        return exports;
    }]);
});