define([
    '../../controllers'
], function(controllers) {
    'use strict';

    controllers.controller('followDataDetailCtrl', [
    '$scope',
    'ob',
    'store',
    'mylinkxProvider',
    'mapProvider',
    '$routeParams',
    '$location',
    '$window',
    function($scope, ob, store, mylinkxProvider,mapProvider, $routeParams, $location,$window) {

        var util = _util,
            misc = util.misc;
        $scope.loading = {
            data: true
        };
        ob.subscribe('event.event_mylinkx_getFollowedDataDetail', function(data) {
            $scope.followDataDetail = data;
            $scope.loading.data = false;
            var user = angular.fromJson(store.get("user_info"));
            $scope.followDataDetail.statusTag = (!!user.id && (user.id == $scope.followDataDetail.userId));
            $("#follows_data_detail_map").wait(function(){
                var _point = mapProvider.getPoint(data.longitude, data.latitude);
                $scope.map = mapProvider.getInstance("follows_data_detail_map", {
                    center: _point,
                    zoom: 16
                });
                mapProvider.addControl($scope.map, mapProvider.CONTROLTYPE.navigation);

                var _marker = mapProvider.createMarker($scope.map, _point, {
                    scopeType: mapProvider.SCOPETYPE.TTRANSIENT,
                    dragable: false
                });

                mapProvider.getAddressByLocation(data.latitude, data.longitude, function(_address) {
                    $scope.$apply(function() {
                        $scope.followDataDetail.position = _address;
                    })
                    var _infoWindow = mapProvider.createInfoWindow(_address);
                    _infoWindow.enableCloseOnClick();
                    mapProvider.attachEvent(_marker, "mouseover", function () {
                        mapProvider.openInfoWindow(_marker, _infoWindow);
                    });
                });
            });
        });
        function _redirector() {
            $location.url("/user_mylinkx");
            $(".modal-backdrop.fade.in").remove();
        }
        $scope.unfollowData = function () {
            var _id = $scope.followDataDetail.id;
            mylinkxProvider.unfollowData({followDataId: _id})
                .success(function(ret) {
                    misc.resultDelegate(ret, function() {
                        ob.publish('event.event_mylinkx_remove_item', {
                            id: _id,
                            category: 'followsdata_list'
                        });
                        _redirector();
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
                        message: 'Error occurred on server!'
                    });
                });
        }
        var category = $routeParams.category,
            detailId = $routeParams.detailId;
        if((category == "followsdata") && !!detailId) {
            ob.publish('event.loading.start');
            mylinkxProvider.getFollowDataDetail({followDataId: detailId}).success(function(ret) {
                misc.resultDelegate(ret, function() {
                    ob.publish('event.event_mylinkx_getFollowedDataDetail', ret.data);
                    ob.publish('event.loading.stop');
                }, function() {
                    ob.publish('event.alert.pull', {
                        type: 'danger',
                        message: ret.message
                    });
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
});