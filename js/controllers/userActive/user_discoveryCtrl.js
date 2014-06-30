define(['../controllers'], function(controllers) {
    'use strict';

    controllers.controller('user_discoveryCtrl', [
    '$scope',
    'ob',
    'mylinkxProvider',
    'mapProvider',
    '$window',
    function($scope, ob, mylinkxProvider, mapProvider,$window) {

        var _arr = ['0m', '10m', '100m', '1km', '10km', '100km', '1000km', '10000km'],
            util = _util,
            misc = util.misc,
            deviceStatusTag = _config.consts.deviceStatusTag,
            deviceSearchForm, dataSearchForm,
            aSearchResultMarkers = [];
        $scope.search = {};
        $scope.search.radius = 1000;
        $scope.search.tag = "";
        $scope.display_range_label = _arr.slice(1, 7);
        $scope.showTutorial = false;

        mylinkxProvider.getFollowsDeviceList().success(function(ret) {
            misc.resultDelegate(ret, function() {
                if (ret.data.length == 0) {
                    $scope.showTutorial = true;
                    $("html").css("position", "relative");
                }
            }, function() {
                ob.publish('event.alert.pull', {
                    type: 'danger',
                    message: ret.message
                });
            });
        });
        // just for test toturial effect
        //$scope.showTutorial = true;

        $scope.closeDiscoverToturial = function() {
            $scope.showTutorial = false;
            $("html").css("position", "");
        }

        mylinkxProvider.getSensorTags()
            .success(function(ret) {
                    misc.resultDelegate(ret,
                        function() {
                            $scope.tags = ret.data;
                        }, function() {
                            ob.publish('event.alert.pull', {
                                type: 'danger',
                                message: $window.i18n('discovery_no_tag')
                            });
                        });
                })
                .error(function(ex) {
                    ob.publish('event.alert.pull', {
                        type: 'danger',
                        message: $window.i18n('common.server.error')
                    });
                });
        ob.unsubscribe("range_value_changed");
        ob.subscribe("range_value_changed", function(_result) {
            $scope.search.radius = _result.resp;
            if(!!_result.flag) {
                $scope.searchAction();
            }
        });

        /** function for display the range user checked.
          * @param v Number the value of the slider.
          */
        function _sliderCalculate(v, bSearchFlag) {
            var _p = Math.floor(v / 10),
                _n = v % 10,
                _prefix = parseInt(_arr[_p].match(/\d+/g), 10),
                _suffix = _arr[_p].match(/\D+/g),
                $_span = $(".search-range-value"),
                _result;
            (_prefix === 0) ? (_result = _n) : (_result = _prefix * _n + _prefix);
            $_span.html(_result + _suffix);
            $_span.css('left', "-" + ($_span.width() / 2 - 1) + "px");
            ob.publish("range_value_changed",
                {
                    resp: (_suffix[0].length === 1) ? _result : _result * 1000,
                    flag: bSearchFlag
                });
        }
        $("#range").slider({
            min: 0,
            max: 70,
            step: 1,
            value: 40,
            change: function( event, ui ) {
                _sliderCalculate(ui.value, true);
            },
            create: function( event, ui ) {
                var $_this = $(this),
                    _v = $_this.slider("value");
                $_this.find("a").append("<span class='search-range-value'></span>");
                _sliderCalculate(_v);
            }
        });

        /**
         * @Param index number the index of the tag we checked.
         */
        $scope.changeSearchTag = function(index, e) {
            var _tempTag = "",
                _target = e.target;
            $(_target).toggleClass('checked-tag-item');
            $.each($(".sensor-tags-container"), function(i, v) {
                if($(v).hasClass('checked-tag-item')) {
                    _tempTag += $scope.tags[i] + ",";
                }
            });
            _tempTag = _tempTag.slice(0,-1);
            $scope.search.tag = _tempTag;
            $scope.searchAction();
        }

        setTimeout(function(){
            var _map = mapProvider.getInstance("linkx_search_map", {
                center: "上海"
            });
            mapProvider.addControl(_map, mapProvider.CONTROLTYPE.navigation);

            function _callback(_address) {
                $scope.$apply(function() {
                    $scope.search.position = _address;
                });
            }

            function _doAfterMarkerRender(e) {
                $scope.search.lng = e.point.lng;
                $scope.search.lat = e.point.lat;
                mapProvider.getAddressByLocation(e.point.lat, e.point.lng, _callback);
            }

            function _createMarker (e) {
                ob.publish('event.alert.clear');
                var _marker = mapProvider.createMarker(_map, e.point, {
                    scopeType: mapProvider.SCOPETYPE.TTRANSIENT,
                    dragable: true,
                    icon: "./images/mylinkx/icon_map.png",
                    width: 25,
                    height: 40
                });
                if(!!$scope._followDataMarker) {
                    mapProvider.markerReSetIcon($scope._followDataMarker, {
                        icon: "./images/mylinkx/icon_map.png",
                        width: 15,
                        height: 20,
                        imageOffset: {
                            width: -4,
                            height: -48
                        }
                    });
                }
                ob.publish('event.alert.pull', {
                    type: 'info',
                    message: i18n('discovery_click_search')
                });
                _doAfterMarkerRender(e);
            }

            mapProvider.attachEvent(_map, "click", _createMarker);
            ob.unsubscribe('map_marker_dragend');
            ob.subscribe('map_marker_dragend', _doAfterMarkerRender);
            $scope.$apply(function() {
                $scope.map = _map;
            });
        }, 20);

        ob.unsubscribe("search_device_success");
        ob.unsubscribe("search_follow_data_points_success");
        ob.unsubscribe("linkx-user-follow-device");
        ob.unsubscribe("linkx-user-follow-data");

        ob.subscribe("linkx-user-follow-data", function (d) {

            function _success(r) {
                d = d || [];
                var _sHtmlStr = "<div class='BMap-bubble-left'><p class='BMap-bubble-content-title'>" + $scope.search.position + "</p>",
                    flag = false;
                $.each(d, function(i, v) {
                    if(!v.val) {
                        v.val = "暂无数据";
                    }
                    _sHtmlStr += "<p>" + v.tag + " : " + v.val + "</p>";
                });
                _sHtmlStr += "</div><div class='BMap-bubble-right'><div class='follow-icon map-followed-data-icon' title='此处不能取消关注'></div>" +
                             "<div class='followed-icon-tip'>已关注</div></div>";

                mapProvider.infoWindowSetContent($scope._followDataInfoWindow, _sHtmlStr);

                var paramObj = {
                    followedDataId: r,
                    followedData: d
                };

                $(".BMap_bubble_content div").undelegate(".map-followed-data-icon", "click");
                $(".BMap_bubble_content div").delegate(".map-followed-data-icon", "click", function(){
                    ob.publish("linkx-user-unfollow-data", paramObj);
                });
            }

            var data = _.pick(dataSearchForm, 'tag', 'lat', 'lng', 'radius');
            data.title = $scope.search.position + data.tag;

            mylinkxProvider.addFollowData(data).success(function(ret) {
                misc.resultDelegate(ret, function() {
                    _success(ret.data);
                }, function() {
                    ob.publish('event.alert.pull', {
                        type: 'danger',
                        message: ret.message
                    });
                });
            });
        });

        ob.subscribe('linkx-user-unfollow-data', function(paramObj){
            function _success(d) {
                var _sHtmlStr = "<div class='BMap-bubble-left'><p class='BMap-bubble-content-title'>" + $scope.search.position + "</p>",
                    flag = false;
                $.each(d, function(i, v) {
                    if(!v.val) {
                        v.val = "暂无数据";
                    }
                    _sHtmlStr += "<p>" + v.tag + " : " + v.val + "</p>";
                });
                _sHtmlStr += "</div><div class='BMap-bubble-right'><div class='follow-icon map-follow-data-icon' title='点击关注'></div>" +
                             "<div class='follow-icon-tip'>关注</div></div>";

                mapProvider.infoWindowSetContent($scope._followDataInfoWindow, _sHtmlStr);

                $(".BMap_bubble_content div").undelegate(".map-follow-data-icon", "click");
                $(".BMap_bubble_content div").delegate(".map-follow-data-icon", "click", function(){
                    ob.publish("linkx-user-follow-data", d);
                });
            }

            mylinkxProvider.unfollowData({followDataId:paramObj.followedDataId}).success(function(ret) {
                misc.resultDelegate(ret, function() {
                    _success(paramObj.followedData);
                }, function() {
                    ob.publish('event.alert.pull', {
                        type: 'danger',
                        message: ret.message
                    });
                });
            });
        });

        ob.subscribe("linkx-user-follow-device", function (d) {
            function _success() {
                var _index = d.index,
                    _oldObj = aSearchResultMarkers[_index];
                mapProvider.markerReSetIcon(_oldObj.marker, {
                    icon: "./images/mylinkx/icon_map.png",
                    imageOffset: {
                        width: -95,
                        height: -10
                    }
                });
                var _sHtmlStr = "<div class='BMap-bubble-left'><p class='BMap-bubble-content-title'>" + d.title + "</p>" +
                                "<p>" + d.position + "</p></div>" +
                                "<div class='BMap-bubble-right'><div class='follow-icon map-followed-icon' data-index='" + _index + "' title='点击取消关注'></div>" +
                                "<div class='followed-icon-tip'>已关注</div></div>";
                mapProvider.infoWindowSetContent(_oldObj.infoWindow, _sHtmlStr);

                $(".BMap_bubble_content div").undelegate(".map-followed-icon", "click");
                $(".BMap_bubble_content div").delegate(".map-followed-icon", "click", function(){
                    ob.publish("linkx-user-unfollow-device", d);
                });
            }

            mylinkxProvider.addFollowDevice({deviceId: d.id}).success(function(ret) {
                misc.resultDelegate(ret, function() {
                    _success();
                }, function() {
                    ob.publish('event.alert.pull', {
                        type: 'danger',
                        message: ret.message
                    });
                });
            });
        });

        ob.subscribe("linkx-user-unfollow-device", function (d) {
            function _success() {
                var _index = d.index,
                    _oldObj = aSearchResultMarkers[_index];
                mapProvider.markerReSetIcon(_oldObj.marker, {
                    icon: "./images/mylinkx/icon_map.png",
                    imageOffset: {
                        width: -95,
                        height: -10
                    }
                });
                var _sHtmlStr = "<div class='BMap-bubble-left'><p class='BMap-bubble-content-title'>" + d.title + "</p>" +
                                "<p>" + d.position + "</p></div>" +
                                "<div class='BMap-bubble-right'><div class='follow-icon map-follow-icon' data-index='" + _index + "' title='点击关注'></div>" + 
                                "<div class='follow-icon-tip'>关注</div></div>";
                mapProvider.infoWindowSetContent(_oldObj.infoWindow, _sHtmlStr);

                $(".BMap_bubble_content div").undelegate(".map-follow-icon", "click");
                $(".BMap_bubble_content div").delegate(".map-follow-icon", "click", function(){
                    ob.publish("linkx-user-follow-device", d);
                });
            }

            mylinkxProvider.unfollowDevice({deviceId: d.id}).success(function(ret) {
                misc.resultDelegate(ret, function() {
                    _success();
                }, function() {
                    ob.publish('event.alert.pull', {
                        type: 'danger',
                        message: ret.message
                    });
                });
            });
        });

        ob.subscribe("search_device_success", function(d) {
            d = d || {};
            aSearchResultMarkers = [];
            $.each(d, function (i, v) {
                var _point = mapProvider.getPoint(v.longitude, v.latitude),
                    _tempMarker = mapProvider.createMarker($scope.map, _point, {
                        scopeType: mapProvider.SCOPETYPE.DETACHED
                    }),
                    _sHtmlStr, _infoWindow;
                switch(v.statusTag){
                    case deviceStatusTag.NONE:
                        _sHtmlStr = "<div class='BMap-bubble-left'><p class='BMap-bubble-content-title'>" + v.title + "</p>" +
                                    "<p>" + d[i].position + "</p></div>" +
                                    "<div class='BMap-bubble-right'><div class='follow-icon map-follow-icon' data-index='" + i + "' title='点击关注'></div>" + 
                                    "<div class='follow-icon-tip'>关注</div></div>";
                        mapProvider.markerReSetIcon(_tempMarker, {
                            icon: "./images/mylinkx/icon_map.png",
                            imageOffset: {
                                width: -95,
                                height: -10
                            }
                        });
                        break;
                    case deviceStatusTag.FOLLOWED:
                        _sHtmlStr = "<div class='BMap-bubble-left'><p class='BMap-bubble-content-title'>" + v.title + "</p>" +
                                    "<p>" + d[i].position + "</p></div>" +
                                    "<div class='BMap-bubble-right'><div class='follow-icon map-followed-icon' data-index='" + i + "' title='点击取消关注'></div>" +
                                    "<div class='followed-icon-tip'>已关注</div></div>";
                        mapProvider.markerReSetIcon(_tempMarker, {
                            icon: "./images/mylinkx/icon_map.png",
                            imageOffset: {
                                width: -95,
                                height: -10
                            }
                        });
                        break;
                    case deviceStatusTag.OWN:
                        _sHtmlStr = "<p class='BMap-bubble-content-title'>" + v.title + "</p>" +
                                    "<p>" + d[i].position + "</p>";
                        mapProvider.markerReSetIcon(_tempMarker, {
                            icon: "./images/mylinkx/icon_map.png",
                            imageOffset: {
                                width: -55,
                                height: -10
                            }
                        });
                        break;
                }

                _infoWindow = mapProvider.createInfoWindow(_sHtmlStr);
                _infoWindow.enableCloseOnClick();

                v.index = i;
                mapProvider.attachEvent(_tempMarker, "mouseover", function () {
                    mapProvider.openInfoWindow(_tempMarker, _infoWindow);

                    if ($(".BMap_bubble_content div").hasClass("map-follow-icon")) {

                        $(".BMap_bubble_content div").undelegate(".map-follow-icon", "click");
                        $(".BMap_bubble_content div").delegate(".map-follow-icon", "click", function(){
                            ob.publish("linkx-user-follow-device", d[$(this).data("index")]);
                        });
                    } else if ($(".BMap_bubble_content div").hasClass("map-followed-icon")) {

                        $(".BMap_bubble_content div").undelegate(".map-followed-icon", "click");
                        $(".BMap_bubble_content div").delegate(".map-followed-icon", "click", function(){
                            ob.publish("linkx-user-unfollow-device", d[$(this).data("index")]);
                        });
                    }
                });

                aSearchResultMarkers.push({
                    marker: _tempMarker,
                    infoWindow: _infoWindow
                });
            });

        });
        ob.subscribe("search_follow_data_points_success", function(d) {
            d = d || [];
            var _sHtmlStr = "<div class='BMap-bubble-left'><p class='BMap-bubble-content-title'>" + $scope.search.position + "</p>",
                _infoWindow, flag = false;
            if(d.length) {
                $.each(d, function(i, v) {
                    if(!v.val) {
                        v.val = "暂无数据";
                    } else {
                        flag = true;
                    }
                    _sHtmlStr += "<p>" + v.tag + " : " + v.val + "</p>";
                });
            } else {
                _sHtmlStr = "<p>暂无数据</p>";
            }
            _sHtmlStr += "</div>";
            if (flag){
                _sHtmlStr += "<div class='BMap-bubble-right'><div class='follow-icon map-follow-data-icon' title='点击关注'></div>" + 
                             "<div class='follow-icon-tip'>关注</div></div>";
            }

            _infoWindow = mapProvider.createInfoWindow(_sHtmlStr);
            _infoWindow.enableCloseOnClick();

            mapProvider.attachEvent($scope._followDataMarker, "mouseover", function () {
                mapProvider.openInfoWindow($scope._followDataMarker, _infoWindow);
                $(".BMap_bubble_content").undelegate(".map-follow-data-icon", "click");
                $(".BMap_bubble_content").delegate(".map-follow-data-icon", "click", function(){
                    ob.publish("linkx-user-follow-data", d);
                });
            });
            $scope._followDataInfoWindow = _infoWindow;
        });

        $scope.$watch('search.position', function () {
            if(!!$scope.search.position) {
                $("#position").removeClass('error');
            }
        });
        
        $scope.searchAction = function() {
            ob.publish('event.alert.clear');
            if(!$scope.search.position) {
                 $("#position").addClass('error');
            }
            if(!$scope.search.lng || !$scope.search.lat) {
                ob.publish('event.alert.pull', {
                    type: 'danger',
                    message: i18n('discovery_position_message')
                });
                return false;
            }
            
            $scope.search.keywords = $scope.search.keywords || "";
            deviceSearchForm = _.pick($scope.search, 'keywords', 'lng', 'lat','radius'),
            dataSearchForm = _.pick($scope.search, 'lng', 'lat','radius', 'tag');
            deviceSearchForm.forFollow = true;

            $scope._followDataMarker = null;
            mapProvider.removeOverlay($scope.map);
            var _point = mapProvider.getPoint(dataSearchForm.lng, dataSearchForm.lat);

            mapProvider.setCenter(
                $scope.map, 
                {
                    center: _point,
                    zoom: mapProvider.getZoom($scope.map)
                }
            );

            $scope._followDataMarker = mapProvider.createMarker($scope.map, _point, {
                scopeType: mapProvider.SCOPETYPE.DETACHED,
                icon: "./images/mylinkx/icon_map.png",
                width: 25,
                height: 40
            });
            mapProvider.createCircle($scope.map, _point, dataSearchForm.radius);

            var aRequestAPI = [];

            aRequestAPI.push({
                key: "searchDevice",
                obKey: "search_device_success",
                data: deviceSearchForm
            });
            if(!!dataSearchForm.tag) {
                aRequestAPI.push({
                    key: "searchFollowDataPoints",
                    obKey: "search_follow_data_points_success",
                    data: dataSearchForm
                });
            }
            //TODO:: if no tag was choose, need we show the infoWindow with no data?
            // else {
                // ob.publish("search_follow_data_points_success");
            // }
            $.each(aRequestAPI, function(i, v) {
                mylinkxProvider[v.key](v.data).success((function(d){
                    return function(ret) {
                        misc.resultDelegate(ret, function() {
                            ob.publish('event.alert.clear');
                            ob.publish(d.obKey, ret.data);
                        }, function() {
                            ob.publish('event.alert.pull', {
                                type: 'danger',
                                message: ret.message
                            });
                        });
                    }
                })(v));
            });
        }
    }]);
});
