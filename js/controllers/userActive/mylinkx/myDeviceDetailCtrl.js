define([
    "../../controllers"
], function(controllers) {
    'use strict';

    controllers.controller('myDeviceDetailCtrl', [
    '$scope',
    'ob',
    'mapProvider',
    'uploadImageProvider',
    '$timeout',
    'mylinkxProvider',
    '$interval',
    '$routeParams',
    '$window',
    function($scope,ob,mapProvider,uploadImageProvider,$timeout,mylinkxProvider,$interval, $routeParams,$window) {
        /***********************************************************************
        publish & subscribe
       ***********************************************************************/
        var util = _util,
            misc = util.misc;
        $scope.device = {
            sensors: []
        };
        $scope.getSensorFlag = false;

        $scope.$on('event.event_mylinkx_goto_page', function () {
          $scope.showCarousel = false;
        });

        ob.unsubscribe('event.event_mylinkx_getMyDeviceDetail');
        ob.subscribe('event.event_mylinkx_getMyDeviceDetail', function(data) {
            $scope.device = data;

            mylinkxProvider.getDeviceStatus({deviceId:data.id})
                .success(function(ret) {
                    if ($scope.device.status && ret.data.status != $scope.device.status) {
                        $scope.deviceForSensor.status = ret.data.status;
                        var deviceList = angular.fromJson(store.get('mydevice_list'));
                        for (var i in deviceList) {
                            if (deviceList[i].id == data.id) {
                                deviceList[i].status = ret.data.status;
                            }
                        }
                        store.set('mydevice_list', angular.toJson(deviceList));

                        ob.publish('event.alert.pull', {
                            type: 'info',
                            message:$window.i18n('device_status_changed'),
                            timeout:5000
                        });
                    }
                })
                .error(function(ret) {
                    ob.publish('event.alert.pull', {
                        type: 'danger',
                        message: $window.i18n('common.server.error')
                    });
                });

            uploadImageProvider.getBindedImgOfDevice({deviceId:data.id})
                .success(function (ret) {
                    misc.resultDelegate(ret,
                        function() {
                            var _list = ret.data.imgPaths;
                            _list = _list || [];
                            $scope.showCarousel = true;
                            $scope.device.imgPath = _list;
                            $scope.device.carousel = _list;
                        }, function() {
                            ob.publish('event.alert.pull', {
                                type: 'danger',
                                message: ret.message
                            });
                        });
                });
            $scope._renderSensorAndMap(data);

       });

        $scope._renderSensorAndMap = function (data) {
            $scope.getSensorFlag = true;
            $timeout(function () {
                $("#my_owen_linkx_device").wait(function () {
                    if(!!data.longitude && !!data.latitude) {
                        var _point = mapProvider.getPoint(data.longitude, data.latitude);
                        $scope.map = mapProvider.getInstance("my_owen_linkx_device", {
                            center: _point,
                            zoom: 16
                        });
                        var _marker = mapProvider.createMarker($scope.map, _point, {
                            scopeType: mapProvider.SCOPETYPE.TTRANSIENT,
                            dragable: false
                        });

                        var _infoWindow = mapProvider.createInfoWindow($scope.device.position);
                        _infoWindow.enableCloseOnClick();
                        mapProvider.attachEvent(_marker, "mouseover", function () {
                            mapProvider.openInfoWindow(_marker, _infoWindow);
                        });
                    } else {
                        $scope.map = mapProvider.getInstance("my_owen_linkx_device", {
                            center: "上海"
                        });
                    }
                    mapProvider.addControl($scope.map, mapProvider.CONTROLTYPE.navigation);

                });
            }, 200);
        }

        $scope.oper = {
            goEditDevice: function() {
                var dataValue = _.pick($scope.device,
                        'id', 'title', 'type', 'position',
                        'isExposed', 'placeType', 'latitude',
                        'longitude', 'statusTag',
                        'description', 'tags', 'imgPath', 'status', 'imgId');
                $scope.$emit('event.event_edit_my_device_flag', true);
                ob.publish('event.event_mylinkx_editMyDevice', dataValue);
                $scope.showCarousel = false;
            }
        }

        $scope.followDevice = function () {
            mylinkxProvider.addFollowDevice({deviceId: $scope.device.id})
                .success(function(ret) {
                    misc.resultDelegate(ret, function() {
                        $scope.device.statusTag = "FOLLOWED";
                    }, function () {
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
        }
        $scope.unFollowDevice = function () {
            mylinkxProvider.unfollowDevice({deviceId: $scope.device.id})
                .success(function(ret) {
                    misc.resultDelegate(ret, function() {
                        $scope.device.statusTag = "NONE";
                        ob.publish('event.event_mylinkx_remove_item', {
                            id : $scope.device.id,
                            key: "followsdevice_list"
                        })
                    }, function () {
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
        }


        $scope.$on('event.event_view_original', function (p, e, i) {
            $scope.$broadcast('prepard-for-lightbox', i, $scope.device.imgPath);
            $('#myOwnDeviceLightbox').modal({
                keyboard: false,
                backdrop: 'static',
                show: true
            });
        });

        $scope.closeSupersized = function () {
          $scope.$broadcast('close-light-box');
        }

        var category = $routeParams.category,
            detailId = $routeParams.detailId;
        if((category == "device") && !!detailId  && (detailId != "new")) {
            ob.publish('event.loading.start');
            mylinkxProvider.getMyDevice({deviceId: detailId}).success(function(ret) {
                misc.resultDelegate(ret, function() {
                    $scope.$emit("event.event_view_device_detail_by_statusTag", ret.data.statusTag);
                    $scope.device = ret.data;
                    $scope.showCarousel = true;
                    (!!$scope.device.imgPath) ? ($scope.device.carousel = [].concat($scope.device.imgPath)) : "";
                    $scope._renderSensorAndMap($scope.device);
                    ob.publish('event.loading.stop');
                }, function() {
                    $scope.device = null;
                    $scope.$emit("event.event_view_device_detail_by_statusTag");
                    ob.publish('event.loading.stop');
                });
            })
            .error(function () {
                ob.publish('event.alert.pull', {
                        type: 'danger',
                       message: $window.i18n('common.server.error')
                    });
                ob.publish('event.loading.stop');
            });
        }
    }]);
})