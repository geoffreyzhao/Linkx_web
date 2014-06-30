define([
    '../../controllers'
], function(controllers) {
    'use strict';

    controllers.controller('myDeviceCategoryCtrl', [
    '$scope',
    '$location',
    'ob',
    'store',
    'mylinkxProvider',
    '$timeout',
    '$compile',
    '$routeParams',
    '$window',
    function($scope,$location, ob, store, mylinkxProvider, $timeout, $compile,$routeParams,$window) {

        /***********************************************************************
         * publish & subscribe
         **********************************************************************/

        var _nPageSize = 9,
            _nPageNum = 1,
            util = _util,
            misc = util.misc;

        ob.unsubscribe('event.event_mylinkx_mydevice_list_search_tag');
        ob.subscribe('event.event_mylinkx_mydevice_list_search_tag', function(data) {
            $scope.searchTag = data;
        });

        ob.unsubscribe('event.event_mylinkx_update_mydevice_list_search');
        ob.subscribe('event.event_mylinkx_update_mydevice_list_search', function(data) {

            $scope.myShowDeviceList = _.filter(angular.fromJson(store.get('mydevice_list')), function(item) {
                return ((item.title.toLowerCase()).indexOf(data) > -1) || ((item.description.toLowerCase()).indexOf(data) > -1) ;
            });
            $scope.myDeviceList = $scope.myShowDeviceList;
            var _highLightReg = new RegExp(data, "ig");
            var keyLength = data.length;
            _.each($scope.myShowDeviceList, function (v, i) {
                var titleIndex = v.title.toLowerCase().indexOf(data);
                ///////
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
            ob.publish('event.event_mylinkx_render_result', {category:'mydevice',num:$scope.myDeviceList.length});
        });

        //for edit device
        ob.unsubscribe('event.event_mylinkx_refresh_my_device_list');
        ob.subscribe('event.event_mylinkx_refresh_my_device_list', function (data) {
            $scope.myDeviceList = data;
            $scope.myShowDeviceList = $scope.myDeviceList.slice((_nPageNum - 1) * _nPageSize, _nPageNum * _nPageSize);
        });

        /*ob.unsubscribe('event.event_mylinkx_my_device_item_delete');
        ob.subscribe('event.event_mylinkx_my_device_item_delete', function(data) {
            for (var index in $scope.myDeviceList) {
                if ($scope.myDeviceList[index].id === data.id) {
                    $scope.myDeviceList.splice(index, 1);
                }
            }
            $scope.myShowDeviceList = $scope.myDeviceList.slice((_nPageNum - 1) * _nPageSize, _nPageNum * _nPageSize);
        });*/

        ob.unsubscribe('event.event_mylinkx_initial_device_list');
        ob.subscribe('event.event_mylinkx_initial_device_list', function(page) {
             mylinkxProvider.getMyDeviceList().success(function(ret) {
                 misc.resultDelegate(ret, function() {
                    store.set('mydevice_list', angular.toJson(ret.data));
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

        ob.unsubscribe('event.event_mylinkx_loadmoredevice');
        ob.subscribe('event.event_mylinkx_loadmoredevice', function() {
            _nPageNum++;
            ob.publish('event.event_mylinkx_initial_device_list', {pageNum:_nPageNum,pageSize:_nPageSize});
        });

        var triggerFlag;
        var _getDeviceByPage = function(pageNum, pageSize) {
            $('loading-img-block').removeClass('display-none');
            var items = angular.fromJson(store.get('mydevice_list'));
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
                    $scope.myDeviceList = items;
                    $scope.myShowDeviceList = items.slice(0, totalNumbers);
                });
            } else {
                $scope.myDeviceList = items;
                $scope.myShowDeviceList = items.slice(0, totalNumbers);
            }
            $('loading-img-block').addClass('display-none');
        }


        var config = _config,
            consts = config.consts;

        $scope.getDeviceDetail = function(deviceObj, index) {
            if ($scope.searchTag) {
                window.open($location.$$protocol +"://"+ $location.$$host +":"+ $location.$$port + "/linkx_web/#/user_mylinkx/device/" + deviceObj.id);//, '_blank'
            } else {
                $location.path("user_mylinkx/device/" + deviceObj.id);
                $location.search("from", "mydevice");
            }
        };
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
                ob.publish('event.event_mylinkx_initial_device_list', {pageNum:1,pageSize:3});
            } else if((category == "mydevice") && !detailId) {
                ob.publish('event.event_mylinkx_initial_device_list', {pageNum:1,pageSize:9});
            } else if(category == 'search') {
                $scope.searchKey = $location.search().keyword || "";
                ob.publish('event.event_mylinkx_update_mydevice_list_search', $scope.searchKey.toLowerCase());
            }
        });

    }]);
});
