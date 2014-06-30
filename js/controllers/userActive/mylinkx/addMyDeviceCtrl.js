define([
    '../../controllers'
], function(controllers) {
    'use strict';

    controllers.controller('addMyDeviceCtrl', [
    '$scope',
    '$location',
    'mylinkxProvider',
    'ob',
    'mapProvider',
    'uploadImageProvider',
    '$window',
    '$routeParams',
    '$timeout',
    function($scope, $location,  mylinkxProvider, ob, mapProvider, uploadImageProvider, $window, $routeParams, $timeout) {

        /***********************************************************************
         * publish & subscribe
         **********************************************************************/
        var util = _util,
            misc = util.misc,
            config = _config,
            consts = config.consts,
            uploadImgs = [],
            imageData = {
                "photos": []
            },
            _marker,
            _infoWindow,
            _tempDeviceJSON,
            _aDelDeviceIds,
            _oPublishDeviceData;

        // "1" means that binding image request.
        var DEFAULT_DELAY_REQUEST_NUM = 1;
        $scope.requestSignal = DEFAULT_DELAY_REQUEST_NUM;
        function _callback(_address) {
            $scope.$apply(function() {
                $scope.device.position = _address;
                mapProvider.infoWindowSetContent(_infoWindow, _address);
            });
        }
        function _doAfterMarkerDone(e){
            $scope.device.longitude = e.point.lng;
            $scope.device.latitude = e.point.lat;
            mapProvider.getAddressByLocation(e.point.lat, e.point.lng, _callback);
        }
        var _addMarker = function(e) {
            _marker = mapProvider.createMarker($scope.map, e.point, {
                scopeType: mapProvider.SCOPETYPE.TTRANSIENT,
                dragable: true
            });
            mapProvider.getAddressByLocation(e.point.lat, e.point.lng, function(p) {
                mapProvider.setCenter($scope.map, {
                    center: e.point,
                    zoom: mapProvider.getZoom($scope.map)
                });
                _infoWindow = mapProvider.createInfoWindow(p);
                _infoWindow.enableCloseOnClick();
                mapProvider.attachEvent(_marker, "mouseover", function () {
                    mapProvider.openInfoWindow(_marker, _infoWindow);
                });
                $scope.device.position = p;
            });
            _doAfterMarkerDone(e);
        }

        ob.unsubscribe('event.event_mylinkx_goAddDecive');
        ob.subscribe('event.event_mylinkx_goAddDecive', function(data) {
            $scope.device = {};
            imageData.photos = [];
            $scope.errorDeviceMessage = null;
            $scope.device.imgPath = [];
            $scope.devicePaths = [].concat($scope.device.imgPath);
            _aDelDeviceIds = [];
            $scope.deviceIds = [];
            $scope.requestSignal = DEFAULT_DELAY_REQUEST_NUM;
            $scope.tags = [
                {
                    value: ''
                }
            ];

            $scope.device.placeType = "INSIDE";
            $scope.device.isExposed = 1;
            $scope.device.type = "OWN_DEVICE";

            $timeout(function () {
                _renderMap();
            }, 200)
        });
        function _renderMap(longitude, latitude) {
            $("#my_owen_linkx_device_add").wait(function(){
                var map;
                if(!!longitude && !!latitude) {
                    var _point = mapProvider.getPoint(longitude, latitude);
                    map = mapProvider.getInstance("my_owen_linkx_device_add", {
                        center: _point,
                        zoom: 16
                    });
                    var _marker = mapProvider.createMarker(map, _point, {
                        scopeType: mapProvider.SCOPETYPE.TTRANSIENT,
                        dragable: true
                    });
                } else {
                    map = mapProvider.getInstance("my_owen_linkx_device_add", {
                        center: "上海"
                    });
                }

                mapProvider.addControl(map, mapProvider.CONTROLTYPE.navigation);

                mapProvider.attachEvent(map, "dblclick", _addMarker);
                ob.unsubscribe('map_marker_dragend');
                ob.subscribe('map_marker_dragend', _doAfterMarkerDone);
                $scope.map = map;
            });
        }

        ob.unsubscribe('event.event_mylinkx_editMyDevice');
        ob.subscribe('event.event_mylinkx_editMyDevice', function(data) {
            $scope.errorDeviceMessage = null;
            $scope.device = data;
            imageData.photos = [];
            _aDelDeviceIds = [];
            $scope.deviceIds = $scope.device.imgId || [];
            var tagsValue = _getSplitTags($scope.device.tags);
            $scope.tags = [];
            $scope.device.imgPath = $scope.device.imgPath || [];
            $scope.devicePaths = [].concat($scope.device.imgPath);
            $scope.requestSignal = DEFAULT_DELAY_REQUEST_NUM;
            for (var index in tagsValue) {
                if ('' !== tagsValue[index]) {
                    $scope.tags.push({value: tagsValue[index]});
                }
            }

            $timeout(function () {
                _renderMap(data.longitude, data.latitude);
            }, 200);
            _tempDeviceJSON = angular.toJson(_gatherDeviceData());
        });

        $scope.placeTypes = [{
            name:'户内',
            value:'INSIDE'
        }, {
            name:'户外',
            value:'OUTSIDE'
        }];

        $scope.isExposeds = [{
            name:'公开',
            value:1
        }, {
            name:'私有',
            value:0
        }];

        $scope.types = [{
            name:'自制设备',
            value:'OWN_DEVICE'
        }, {
            name:'LINKX设备',
            value:'LINKX_DEVICE'
        }];

        ob.unsubscribe("mylinkx_img_bind_to_device");
        ob.subscribe("mylinkx_img_bind_to_device", function(d) {
            if(imageData.photos.length == 0) {
              --($scope.requestSignal);
              return;
            }
            uploadImageProvider.bindImgToDevice(imageData, {deviceId: d.id})
                .success(function (ret) {
                    misc.resultDelegate(ret,
                        function() {
                          --($scope.requestSignal);
                        },
                        function() {
                            ob.publish('event.alert.pull', {
                                type: 'danger',
                                message: ret.message
                            });
                        });
                })
        });

        function _gatherDeviceData() {
            //verification
            var title = $scope.device.title,
                type = $scope.device.type,
                position = $scope.device.position,
                isExposed = $scope.device.isExposed,
                placeType = $scope.device.placeType,
                latitude = $scope.device.latitude,
                longitude = $scope.device.longitude,
                description = $scope.device.description,
                tags = _getTags();
            $scope.throwFlag = false;
            if(title == undefined ||title.replace(/(^\s*)|(\s*$)/g, "") =='') {
                _errorLog('device-title','device_title_empty');
            } else if (title.length > 50) {
                _errorLog('device-title','device_title_50');
            }
            if(tags == undefined ||tags.replace(/(^\s*)|(\s*$)/g, "") =='') {
                _errorLog('device-tags','device_tags_empty');
            } else if (tags.length > 50) {
                _errorLog('device-tags','device_tags_50');
            }
            if (description&&description.length > 10000) {
                _errorLog('device-desc','device_desc_10000');
            }
            if (position && position.length > 100) {
                _errorLog('device-position','device_position_100');
            }
            if ($scope.throwFlag) {
                throw 'error';
            }

            $('.device-title').removeClass('error');
            $('.device-tags').removeClass('error');
            $('.device-desc').removeClass('error');
            $('.device-position').removeClass('error');
            return {
                title: title,
                type: type,
                position: position,
                isExposed: isExposed,
                placeType: placeType,
                latitude: latitude,
                longitude: longitude,
                description: description,
                tags: tags
            };
        }

        function _errorLog(id,key) {
            if(id) {
                $("." + id).addClass("error");
                $scope.throwFlag = true;
                ob.publish('event.alert.pull', {
                    type: 'danger',
                    message: i18n(key)
                });
            }
        }

        $scope.addDevice = function() {
            ob.publish('event.alert.clear');
            try {
                var device = _gatherDeviceData();
            } catch (ex) {
                return;
            }

            var data = _.pick(device,
                    'title', 'type', 'position',
                    'isExposed', 'placeType', 'latitude',
                    'longitude',
                    'description', 'tags');

            mylinkxProvider.addMyDevice(data)
                .success(function(ret) {
                    misc.resultDelegate(ret,
                        function() {
                            data.id = ret.data.id;
                            data.imgPath = $scope.device.imgPath;
                            ob.publish("mylinkx_img_bind_to_device", {id: data.id});
                            ob.publish('event.event_mylinkx_mydevice_add', data);
                            ob.publish('event.event_mylinkx_item_select', data);
                            _oPublishDeviceData = data;
                        }, function() {
                            $scope.errorDeviceMessage = ret.message;
                            ob.publish('event.event_mylinkx_showAddDevice', true);
                            $timeout(function () {
                                _renderMap(data.longitude, data.latitude);
                            }, 200);
                            ob.publish('event.alert.pull', {
                                type: 'danger',
                                message: ret.message
                            });
                        });
                })
                .error(function(ex) {
                    ob.publish('event.alert.pull', {
                        type: 'danger',
                        message: $window.i18n('common.server.error')
                    });
                    $timeout(function () {
                        _renderMap(data.longitude, data.latitude);
                    }, 200);
                });

            ob.publish('event.event_mylinkx_showAddDevice', false);
        }

        $scope.$watch('requestSignal', function (newValue) {
          if(newValue > 0) {
            return;
          }
          _oPublishDeviceData.statusTag = "OWN";
          if($routeParams.detailId == "new") {
            $location.path("user_mylinkx/device/" + _oPublishDeviceData.id);
            $location.search("from", "mydevice");
            $scope.$on('$locationChangeSuccess', function () {
                $timeout(function () {
                    ob.publish('event.alert.pull', {
                        type: 'success',
                        message: $window.i18n('device_add_success')
                    });
                }, 800);
            });
          } else {
            $scope.$emit('event.event_edit_my_device_flag', false);
            ob.publish('event.event_mylinkx_getMyDeviceDetail', _oPublishDeviceData);
          }
        });

        // Delete image cover of device reqeuests.
        function _delDeviceCover() {
            _.each(_aDelDeviceIds, function (imgId) {
              uploadImageProvider.unBindImgToDevice({deviceId: $scope.device.id, imgId: imgId})
                  .success(function (ret) {
                      misc.resultDelegate(ret,
                          function() {
                            // this means that this request completed.
                            --($scope.requestSignal);
                          },
                          function() {
                              ob.publish('event.alert.pull', {
                                  type: 'danger',
                                  message: ret.message
                              });
                          });
                  })
            })
        }

        $scope.editDevice = function() {
            ob.publish('event.alert.clear');
            try {
                var device = _gatherDeviceData();
            } catch (ex) {
                return;
            }

            // Set signal for get Device detail.
            $scope.requestSignal = _aDelDeviceIds.length + DEFAULT_DELAY_REQUEST_NUM;

            var data = _.pick(device,
                    'title', 'type', 'position',
                    'isExposed', 'placeType', 'latitude',
                    'longitude',
                    'description', 'tags');

            if(_tempDeviceJSON == angular.toJson(_gatherDeviceData())) {
              data.id = $scope.device.id;
              _delDeviceCover();
              ob.publish("mylinkx_img_bind_to_device", {id: data.id});
              _oPublishDeviceData = data;
              return;
            }
            mylinkxProvider.editMyDevice(data, {deviceId: $scope.device.id})
                .success(function(ret) {
                    misc.resultDelegate(ret,
                        function() {
                            ob.publish('event.alert.pull', {
                                type: 'success',
                                message: $window.i18n('device_edit_success')
                            });
                            data.id = $scope.device.id;
                            data.status = $scope.device.status;
                            _delDeviceCover();
                            ob.publish("mylinkx_img_bind_to_device", {id: data.id});
                            _oPublishDeviceData = data;
                            ob.publish('event.event_mylinkx_mydevice_edit', data);
                        }, function() {
                            $scope.errorDeviceMessage = ret.message;
                        });
                })
                .error(function(ex) {
                    ob.publish('event.alert.pull', {
                        type: 'danger',
                        message: $window.i18n('common.server.error')
                    });
                });
        }

        function _redirector() {
            $location.url("/user_mylinkx");
            $(".modal-backdrop.fade.in").remove();
            $scope.$on('$locationChangeSuccess', function () {
                $timeout(function () {
                    ob.publish('event.alert.pull', {
                        type: 'success',
                        message: $window.i18n('device_del_success')
                    });
                }, 800);
            });
        }

        $scope.delDevice = function() {

            mylinkxProvider.delMyDevice({deviceId:$scope.device.id})
                .success(function(ret) {
                    misc.resultDelegate(ret,
                        function() {
                            ob.publish('event.event_mylinkx_remove_item', {
                                id : $scope.device.id,
                                key: "mydevice_list"
                            });
                            _redirector();
                        }, function() {
                            ob.publish('event.alert.pull', {
                                type: 'danger',
                                message: ret.message
                            });
                        });
                })
                .error(function(ex) {
                    ob.publish('event.alert.pull', {
                        type: 'danger',
                        message: $window.i18n('common.server.error')
                    });
                });
        };

        function _getTags() {
            var returnTags = '';
            for (var index in $scope.tags) {
                if ($scope.tags[index].value !== '') {
                    returnTags += $scope.tags[index].value + ",";
                }
            }
            return returnTags;
        }

        function _getSplitTags(tags) {
            return tags.split(",");
        }

        $scope.searchPointByAddress = function() {
            var _position = $scope.device.position;
            if (!_position || ($.trim(_position) == "")) {
                return;
            }
            mapProvider.getLocationByAddress(_position, function(d) {
                d = d || {};
                if(!!d.lng && !!d.lat) {
                    d.lng = d.lng.toFixed(6);
                    d.lat = d.lat.toFixed(6);
                    _addMarker({point: mapProvider.getPoint(d.lng, d.lat)});
                } else {
                    ob.publish('event.alert.pull', {
                        type: 'danger',
                        message: $window.i18n('device_position_no_data')
                    });
                }
            });
        }

        $scope.cancel = function() {
            if($scope.showAddDevice) {
                $location.path("user_mylinkx/mydevice");
                return;
            }
            $scope.$emit('event.event_edit_my_device_flag', false);
            ob.publish('event.event_mylinkx_getMyDeviceDetail', $scope.device);
        };

        $scope.showDeleteModal = function() {
             $("#deviceDeviceModal").modal({
                keyboard: false,
                backdrop: true,
                show: true
             });
        }

        $scope.$on('upload-device-cover-cut', function(ev, _cutPic) {
            var imgUrl = uploadImgs.pop();
            if(!!imgUrl) {
                uploadImageProvider.cutDeviceImage({path: imgUrl, cutImages: _cutPic})
                    .success(function (ret) {
                        imageData.photos.push({path: ret.data});
                        $scope.devicePaths = $scope.devicePaths.concat(ret.data);
                        $scope.$broadcast('prepard-for-lightbox', 0, $scope.devicePaths, true);
                    })
                    .error(function (ret) {
                        ob.publish('event.alert.pull', {
                            type: 'danger',
                            message: ret.message
                        });
                    });
            }
        });

        ob.unsubscribe("upload-image-file");
        ob.subscribe("upload-image-file", function (e) {
            var _target = e[0],
                _file = _target.files.item(0);
            var isImage = _file.type.indexOf("image") == 0 || (!_file.type && /\.(?:jpg|jpeg|jpe|png|gif)$/.test(_file.name));
            if (!isImage) {
                ob.publish('event.alert.pull', {
                    type: 'danger',
                    message: '"' + _file.name + '"'+ $window.i18n('device_not_img')
                });
                return;
            }
            if (_file.size >= 512000) {
                ob.publish('event.alert.pull', {
                    type: 'danger',
                    message: '"' + _file.name + '"' +$window.i18n('device_img_too_large')
                });
                return;
            }
            uploadImageProvider.uploadDeviceImage(_file)
                .success(function (ret) {
                    uploadImgs.push(ret.data);
                })
                .error(function (ret) {
                    ob.publish('event.alert.pull', {
                        type: 'danger',
                        message: ret.message
                    });
                });
        });


        $scope.deviceImageManagement = function () {
          /*
           * We Management the cover of the device, need start with the first image. 
           * The last argument is a sign for the light box build for manage the cover of device.
           */
          $scope.$broadcast('prepard-for-lightbox', 0, $scope.devicePaths, true);
          $('#deviceLightbox').modal({
              keyboard: false,
              backdrop: 'static',
              show: true
          });
        }
        $scope.closeSupersized = function () {
            $scope.$broadcast('close-light-box');
        }
        $scope.$on('del-cover-in-light-box', function (ev, index) {
          var _delUrl = $scope.devicePaths.splice(index, 1);
          imageData.photos = _.reject(imageData.photos, function (num) { return num == _delUrl[0]; });
          _aDelDeviceIds = _aDelDeviceIds.concat($scope.deviceIds.splice(index, 1));
          $scope.$broadcast('prepard-for-lightbox', 0, $scope.devicePaths, true);
        });

        var category = $routeParams.category,
            detailId = $routeParams.detailId;
        if((category == "mydevice") && (detailId == "new")) {
            ob.publish('event.event_mylinkx_goAddDecive', {});
        }

        $scope.$watch('$location.path()',function() {
            ob.publish('event.alert.clear');
        });

        $scope.verifyTitle = function() {
            if ($scope.device&&$scope.device.title && $scope.device.title.replace(/(^\s*)|(\s*$)/g, "") !='') {
                $('.device-title').removeClass('error');
            } else {
                $('.device-title').addClass('error');
            }
        }

    }]);
})
