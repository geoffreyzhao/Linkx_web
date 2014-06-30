define([
    '../controllers',
    './mylinkx/myDeviceCategoryCtrl',
    './mylinkx/followsDeviceCategoryCtrl',
    './mylinkx/followsDataCategoryCtrl'
], function(controllers) {
    'use strict';

    controllers.controller('user_mylinkxCtrl', [
        '$scope',
        '$location',
        'ob',
        'store',
        'mylinkxProvider',
        '$window',
        '$anchorScroll',
        '$routeParams',
        function($scope, $location, ob, store, mylinkxProvider, $window, $anchorScroll, $routeParams) {

            /***********************************************************************
         publish & subscribe
        ***********************************************************************/

            //UnSubscribe the init chart method when enter this page.
            ob.unsubscribe('event.event_mylinkx_initChart');

            ob.subscribe('event.event_mylinkx_showAddDevice', function(data) {
                $scope.showAddDevice = data;
            });

            ob.subscribe('event.event_mylinkx_showEditDevice', function(data) {
                $scope.showEditDevice = data;
            });

            ob.subscribe('event.event_mylinkx_redirect_mylinkx', function(data) {
                $scope.currentCategory = '';
                $scope.currentItem = '';
            });

            ob.subscribe('event.event_mylinkx_mydevice_add', function(data) {
                $scope.category['mydevice'].items.push(data);
            });

            ob.subscribe('event.event_mylinkx_mydevice_edit', function(data) {
                for (var index in $scope.category['mydevice'].items) {
                    if ($scope.category['mydevice'].items[index].id === data.id) {
                        _editMyDevice(index,data);
                        //$scope.category['mydevice'].items[index] = data;
                        break;
                    }
                }
                var items = angular.fromJson(store.get('mydevice_list'));
                for (var index in items) {
                    if (items[index].id === data.id) {
                        items[index] = data;
                        break;
                    }
                }
                store.set('mydevice_list', angular.toJson(items));
                if ( !! $scope.currentItem) {
                    if($scope.currentCategory != 'followsdata') {
                        $scope.currentItem = "设备详情";
                    } else {
                        $scope.currentItem = "数据详情";
                    }
                }
                ob.publish('event.event_mylinkx_refresh_my_device_list', items);
            });

            ob.unsubscribe('event.event_mylinkx_remove_item');
            ob.subscribe('event.event_mylinkx_remove_item', function(d) {
                var items = angular.fromJson(store.get(d.key));
                for (var index in items) {
                    if (items[index].id === d.id) {
                        items.splice(index, 1);
                        break;
                    }
                }
                store.set(d.key, angular.toJson(items));
            });

            ob.subscribe('event.event_mylinkx_item_select', function(itemId) {
                if($scope.currentCategory != 'followsdata') {
                    $scope.currentItem = "设备详情";
                } else {
                    $scope.currentItem = "数据详情";
                }
                $scope.current = { id: itemId };
                $scope.showAddDevice = false;
                $scope.showEditDevice = false;
            });

            ob.subscribe('event.event_mylinkx_render_result', function(data) {
                switch (data.category) {
                    case "mydevice":
                        $scope.searchMyDeviceNum = data.num;
                        break;
                    case "followsdevice":
                        $scope.searchFollowDeviceNum = data.num;
                        break;
                    case "followsdata":
                        $scope.searchFollowDataNum = data.num;
                        break;
                }
                $scope.searchNum = $scope.searchMyDeviceNum + $scope.searchFollowDeviceNum + $scope.searchFollowDataNum;
            });

            var util = _util,
                misc = util.misc;
            $scope.searchMyDeviceNum = $scope.searchFollowDeviceNum = $scope.searchFollowDataNum = 0;

            //
            $('.search-block-after,.search-block').hover(function() {
                $(this).find('input').focus();
            },function() {
            });

            $scope.items = []; // optional values for search auto complete
            $scope.category = {
                'mydevice': {
                    title: 'menu.my_device',
                    id: 'MyDevice',
                    items: [],
                    provider: 'getMyDeviceList'
                },
                'followsdevice': {
                    title: 'menu.my_follow_device',
                    id: 'FollowsDevice',
                    items: [],
                    provider: 'getFollowsDeviceList'
                },
                'followsdata': {
                    title: 'menu.my_follow_data',
                    id: 'FollowsData',
                    items: [],
                    provider: 'getFollowDataList'
                }
            };

            $scope.currentCategory = '';
            $scope.currentItem = '';
            $scope.$on("event.event_view_device_detail_by_statusTag", function (ev, statusTag) {
                $scope.showDeviceDetail = true;
                switch (statusTag) {
                    case "OWN":
                        $scope.currentCategory = "mydevice";
                        $location.search("from", "mydevice");
                        break;
                    case "FOLLOWED":
                        $scope.currentCategory = "followsdevice";
                        $location.search("from", "followsdevice");
                        break;
                    case "NONE":
                    default:
                        $scope.currentCategory = "";
                        $location.search("from", null);
                        break;
                }
                ob.publish('event.event_mylinkx_category', $scope.currentCategory);
            });

            $scope.$on('event.event_edit_my_device_flag', function (ev, flag) {
                $scope.showAddDevice = false;
                $scope.showEditDevice = flag;
                $scope.showDeviceDetail = !flag;
            });

            $scope.itemSelected = function(category, itemId) {
                $scope.showDeviceDetail = false;
                if(category != 'device') {
                    $scope.currentCategory = category;
                } else {
                    $scope.currentCategory = $location.search().from;
                }
                ob.publish('event.event_mylinkx_item_select', itemId);
                if((itemId == "new")) {
                    if(category == "mydevice") {
                        $scope.showAddDevice = true;
                        $scope.showEditDevice = false;
                        $scope.currentItem = 'add_device';
                        $scope.currentCategory = 'mydevice';
                    } else {
                        $scope.showAddRule = true;
                        $scope.currentCategory = "rulelist";
                        $scope.currentItem = "add_rule";
                        $scope.showRuleList = false;
                        $scope.searchTag = false;
                        $scope.addRuleFlag = true;
                        $scope.editRuleFlag = false;
                    }
                    return;
                }
                if(category == "rulelist"){
                    $scope.showAddRule = true;
                    $scope.addRuleFlag = false;
                    $scope.editRuleFlag = true;
                    $scope.currentCategory = "rulelist";
                    $scope.currentItem = "edit_rule";
                    $scope.showRuleList = false;
                    $scope.searchTag = false;
                }
            };

            $scope.selectCategory = function(categoryClass) {
                $scope.$broadcast('event.event_mylinkx_goto_page');

                $scope.currentItem = '';
                $scope.currentCategory = categoryClass;
                $scope.searchTag = false;

                $scope.showAddDevice = false;
                $scope.showEditDevice = false;
                $scope.addRuleFlag = false;
                $scope.editRuleFlag = false;
                switch (categoryClass) {
                    case "mydevice":
                    case "followsdevice":
                    case "followsdata":
                        $scope.showRuleList = false;
                        break;
                    case "rulelist":
                        $scope.showRuleList = true;
                        break;
                }
            };
            $scope.renderSearchPage = function () {
                $scope.showRuleList = false;
                $scope.showAddRule = false;
                $scope.currentItem = '';
                $scope.currentCategory = '';
                $scope.searchTag = true;
                $scope.searchKey = $location.search().keyword;
            }

            $scope.searchDevice = function() {
                $location.path("user_mylinkx/search");
                var _temp = $scope.searchKey;
                (!!_temp) ? "" : (_temp = null);
                $location.search("keyword", _temp);
                $location.search("_", new Date().getTime());
            }

            $scope.keySearchDevice = function(evt) {
                var evt = evt ? evt : (window.event ? window.event : null); //兼容IE和FF
                if (evt.keyCode == 13) {
                    $scope.searchDevice();
                }
            }

            $scope.goSpecifiedResult = function(id) {
                $location.hash(id);
                $anchorScroll();
            }

            var _editMyDevice = function(index,device) {
                $scope.category['mydevice'].items[index].title = device.title;
                $scope.category['mydevice'].items[index].description = device.description;
                $scope.category['mydevice'].items[index].isExposed = device.isExposed;
                $scope.category['mydevice'].items[index].latitude = device.latitude;
                $scope.category['mydevice'].items[index].longitude = device.longitude;
                $scope.category['mydevice'].items[index].placeType = device.placeType;
                $scope.category['mydevice'].items[index].position = device.position;
                $scope.category['mydevice'].items[index].status = device.status;
                $scope.category['mydevice'].items[index].tags = device.tags;
                $scope.category['mydevice'].items[index].type = device.type;
            }

            $(".scrollspy-search").on('scroll', function(){
                if (!$scope.currentCategory) {
                    return;
                }
                if(!!$routeParams.detailId) {
                    return;
                }
                var scrollHight = this.scrollHeight;
                var scrollTop = this.scrollTop;
                var divHight = $(this).height();
                if (scrollTop + divHight >= scrollHight) {
                    //load data, 18 each time
                    console.log('buttom!');
                    $scope.$apply(function () {
                      switch ($scope.currentCategory) {
                          case "mydevice":
                              ob.publish('event.event_mylinkx_loadmoredevice');
                              break;
                          case "followsdevice":
                              ob.publish('event.event_mylinkx_loadmore_followdevice');
                              break;
                          case "followsdata":
                              if($("#myFollowedData .list-item-block").length > 3) {
                                ob.publish('event.event_mylinkx_loadmore_followdata');
                              }
                              break;
                      }
                    });
                }
            });

            $scope.highLightStr = function(souStr,regStr, keyword) {
                return souStr.replace(regStr, "<div class='search-highlight'>" + keyword + "</div>");
            }

            var category = $routeParams.category,
                detailId = $routeParams.detailId;
            if(!!category && !!detailId) {
                $scope.itemSelected(category, detailId);
            } else {
                switch (category) {
                    case "mydevice":
                    case "followsdevice":
                    case "followsdata":
                    case "rulelist":
                        $scope.selectCategory(category);
                        break;
                    case "search":
                        $scope.renderSearchPage();
                        break;
                    default:
                        break;
                }
            }
        }
    ]);
});