define([
    '../../controllers'
], function(controllers) {
    'use strict';

    controllers.controller('followsDeviceCategoryCtrl', [
    '$scope',
    'ob',
    'store',
    'mylinkxProvider',
    '$timeout',
    '$routeParams',
    '$window',
    '$location',
    function($scope, ob, store, mylinkxProvider, $timeout, $routeParams,$window,$location) {

        var _nPageSize = 9,
            _nPageNum = 1,
            config = _config,
            consts = config.consts,
            util = _util,
            misc = util.misc;

        ob.unsubscribe('event.event_mylinkx_followsdevice_list_search_tag');
        ob.subscribe('event.event_mylinkx_followsdevice_list_search_tag', function(data) {
            $scope.searchTag = data;
        });

        ob.unsubscribe('event.event_mylinkx_initial_follow_device_list');
        ob.subscribe('event.event_mylinkx_initial_follow_device_list', function(page) {
            mylinkxProvider.getFollowsDeviceList().success(function(ret) {
                misc.resultDelegate(ret, function() {
                     store.set('followsdevice_list', angular.toJson(ret.data));
                    _nPageNum = page.pageNum;
                    _getDeviceByPage(page.pageNum, page.pageSize);
                }, function() {
                    ob.publish('event.alert.pull', {
                        type: 'danger',
                        message: ret.message
                    });
                });
            });
        });

        ob.unsubscribe('event.event_mylinkx_loadmore_followdevice');
        ob.subscribe('event.event_mylinkx_loadmore_followdevice', function() {
            _nPageNum++;
            ob.publish('event.event_mylinkx_initial_follow_device_list', {pageNum:_nPageNum,pageSize:_nPageSize});
        });

        var triggerFlag;
        var _getDeviceByPage = function(pageNum, pageSize) {
            $('loading-img-block').removeClass('display-none');
            var items = angular.fromJson(store.get('followsdevice_list'));
            var totalNumbers = pageNum * pageSize;

            if (items.length + pageSize < totalNumbers && !triggerFlag) {
                ob.publish('event.alert.pull', {
                    type: 'info',
                    message: $window.i18n('common.no_more_data'),
                    timeout:5000
                });
                triggerFlag = true;
            }
            if(!$scope.$$phase && !$scope.$root.$$phase) {
                $scope.$apply(function() {
                    $scope.myFollowedDeviceList = items;
                    $scope.myShowFollowedDeviceList = items.slice(0, totalNumbers);
                });
            } else {
                $scope.myFollowedDeviceList = items;
                $scope.myShowFollowedDeviceList = items.slice(0, totalNumbers);
            }
            $('loading-img-block').addClass('display-none');
        }

        ob.unsubscribe('event.event_mylinkx_update_followsdevice_list_search');
        ob.subscribe('event.event_mylinkx_update_followsdevice_list_search', function(data) {

            $scope.myShowFollowedDeviceList = _.filter(angular.fromJson(store.get('followsdevice_list')), function(item) {
                return ((item.title.toLowerCase()).indexOf(data) > -1) || ((item.description.toLowerCase()).indexOf(data) > -1) ;
            });
            $scope.myFollowedDeviceList = $scope.myShowFollowedDeviceList;
            var _highLightReg = new RegExp(data, "ig");
            var keyLength = data.length;
            _.each($scope.myShowFollowedDeviceList, function (v, i) {
                var titleIndex = v.title.toLowerCase().indexOf(data);
                var descIndex = v.description?v.description.toLowerCase().indexOf(data):-1;
                v.searchTitle = v.title;
                v.searchDesc = v.description;
                var titleKey = v.title.slice(titleIndex, titleIndex + data.length);
                var descKey = v.description?v.description.slice(descIndex, descIndex + data.length):'';
                if (titleIndex > -1) {
                    if (titleIndex + data.length <= 10) {  //keyIndex within 10
                        v.searchTitle = $scope.highLightStr(v.searchTitle.slice(0,10),_highLightReg,titleKey);

                    } else {
                        v.searchTitle = "...<div class='search-highlight'>" + titleKey + "</div>"+ 
                        $scope.highLightStr(v.searchTitle.substr(titleIndex + data.length, 10 - data.length),_highLightReg,titleKey);
                    }
                    if (v.title.length > 10) {
                        v.searchTitle += "...";
                    }
                }
                if (descIndex > -1) {
                    if (descIndex + data.length<= 20) {
                        v.searchDesc = $scope.highLightStr(v.searchDesc.slice(0,10),_highLightReg,descKey);
                    } else{
                        v.searchDesc = "...<div class='search-highlight'>" + descKey + "</div>"+ 
                        $scope.highLightStr(v.searchDesc.substr(descIndex + data.length, 20 - data.length),_highLightReg,descKey);
                    }
                    if (v.description.length > 20) {
                        v.searchDesc += "...";
                    }
                }
            });
             ob.publish('event.event_mylinkx_render_result', {category:'followsdevice',num:$scope.myFollowedDeviceList.length});
        });

        ob.unsubscribe('event.event_mylinkx_update_followsdevice_list');
        ob.subscribe('event.event_mylinkx_update_followsdevice_list', _loadFollowedDeviceList);

        /*ob.unsubscribe('event.event_mylinkx_refresh_follow_device_list');
        ob.subscribe('event.event_mylinkx_refresh_follow_device_list', function(data) {
            for (var index in $scope.myFollowedDeviceList) {
                if ($scope.myFollowedDeviceList[index].id === data.id) {
                    $scope.myFollowedDeviceList.splice(index, 1);
                }
            }
            $scope.myShowFollowedDeviceList = $scope.myFollowedDeviceList.slice((_nPageNum - 1) * _nPageSize, _nPageNum * _nPageSize);
        });*/

        //ob.publish('event.event_mylinkx_initial_follow_device_list', {pageNum:1,pageSize:3});

        function _loadFollowedDeviceList(list) {
            $scope.myFollowedDeviceList = list;
            $scope.myShowFollowedDeviceList = list.slice((_nPageNum - 1) * _nPageSize, _nPageNum * _nPageSize);
        }

        $scope.getFollowedDeviceDetail = function(item, index) {
            if ($scope.searchTag) {
                window.open($location.$$protocol +"://"+ $location.$$host +":"+ $location.$$port + "/linkx_web/#/user_mylinkx/device/" + item.id);//, '_blank'
            } else {
                $location.path('user_mylinkx/device/' + item.id);
                $location.search("from", "followsdevice");
            }
        }
        $scope.$watch(function () {
            return $location.absUrl();
        }, function (newValue) {
            var category = $routeParams.category,
                detailId = $routeParams.detailId,
                _reg = new RegExp("user_mylinkx", "ig");
            if(!(_reg.test(newValue))) {
                return;
            }
            if(!category) {
                ob.publish('event.event_mylinkx_initial_follow_device_list', {pageNum:1,pageSize:3});
            } else if((category == "followsdevice") && !detailId) {
                ob.publish('event.event_mylinkx_initial_follow_device_list', {pageNum:1,pageSize:9});
            } else if(category == "search") {
                $scope.searchKey = $location.search().keyword || "";
                ob.publish('event.event_mylinkx_update_followsdevice_list_search', $scope.searchKey.toLowerCase());
            }
        });
    }]);
});
