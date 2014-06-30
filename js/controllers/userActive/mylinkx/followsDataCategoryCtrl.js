define([
    '../../controllers'
], function(controllers) {
    'use strict';

    controllers.controller('followsDataCategoryCtrl', [
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

        $scope.update_follow_data_success = _nPageSize;
        ob.unsubscribe('event.event_mylinkx_followsdata_list_search_tag');
        ob.subscribe('event.event_mylinkx_followsdata_list_search_tag', function(data) {
            $scope.searchTag = data;
        });

        ob.unsubscribe('event.event_mylinkx_update_followsdata_list_search');
        ob.subscribe('event.event_mylinkx_update_followsdata_list_search', function(data) {
            $scope.myShowFollowedDataList = _.filter(angular.fromJson(store.get('followsdata_list')), function(item) {
                return ((item.title.toLowerCase()).indexOf(data) > -1) || ((item.tag.toLowerCase()).indexOf(data) > -1) ;
            });
            $scope.myFollowedDataList = $scope.myShowFollowedDataList;
            var _highLightReg = new RegExp(data, "ig");
            var keyLength = data.length;
            _.each($scope.myShowFollowedDataList, function (v, i) {
                var titleIndex = v.title.toLowerCase().indexOf(data);
                var tagsIndex = v.tag.toLowerCase().indexOf(data);
                v.searchTitle = v.title;
                v.searchTag = v.tag;
                var titleKey = v.title.slice(titleIndex, titleIndex + data.length);
                var tagKey = v.tag.slice(tagsIndex, tagsIndex + data.length);
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
                if (tagsIndex > -1) {
                    if (tagsIndex + data.length<= 20) {
                        v.searchTag = $scope.highLightStr(v.searchTag.slice(0,10),_highLightReg,tagKey);
                    } else{
                        v.searchTag = "...<div class='search-highlight'>" + tagKey + "</div>"+ 
                        $scope.highLightStr(v.searchTag.substr(tagsIndex + data.length, 20 - data.length),_highLightReg,tagKey);
                    }
                    if (v.tag.length > 20) {
                        v.searchTag += "...";
                    }
                }
            });
            setTimeout(function() {
                $(".carousel.show-carousel").carousel({
                    interval: 5000
                });
            }, 200);
            _loadFollowedDataList($scope.myFollowedDataList);
            ob.publish('event.event_mylinkx_render_result', {category:'followsdata',num:$scope.myFollowedDataList.length});
        });

        ob.unsubscribe('event.event_mylinkx_update_followsdata_list');
        ob.subscribe('event.event_mylinkx_update_followsdata_list', _loadFollowedDataList);

/*        ob.unsubscribe('event.event_mylinkx_refresh_follow_data_list');
        ob.subscribe('event.event_mylinkx_refresh_follow_data_list', function(data) {
            for (var index in $scope.myFollowedDataList) {
                if ($scope.myFollowedDataList[index].id === data.id) {
                    $scope.myFollowedDataList.splice(index, 1);
                }
            }
            $scope.myShowFollowedDataList = $scope.myFollowedDataList.slice((_nPageNum - 1) * _nPageSize, _nPageNum * _nPageSize);
        });*/

        ob.unsubscribe('event.event_mylinkx_initial_follow_data_list');
        ob.subscribe('event.event_mylinkx_initial_follow_data_list', function(page) {
            mylinkxProvider.getFollowDataList().success(function(ret) {
                misc.resultDelegate(ret, function() {
                    store.set('followsdata_list', angular.toJson(ret.data));
                    var _aList = ret.data.slice(0, page.pageNum * page.pageSize);
                    _nPageNum = page.pageNum;
                    $scope.myFollowedDataList = ret.data;
                    $scope.myShowFollowedDataList = $scope.myFollowedDataList.slice(0, page.pageNum * page.pageSize);
                    ob.publish('event.event_mylinkx_update_followsdata_list', _aList);
                    $scope._totleNum = _aList.length;
                }, function() {
                    ob.publish('event.alert.pull', {
                        type: 'danger',
                        message: ret.message
                    });
                });
            });
        });
        $scope.$watch('update_follow_data_success', function (newValue, oldValue) {
          if(newValue != 0) {
            return;
          }
          $timeout(function () {
            $(".carousel.show-carousel").carousel({
                interval: 5000
            });
          }, 200)
        });

        ob.unsubscribe('event.event_mylinkx_loadmore_followdata');
        ob.subscribe('event.event_mylinkx_loadmore_followdata', function() {
            _getDataByPage(++_nPageNum, _nPageSize);
        });


        var triggerFlag;
        var _getDataByPage = function(pageNum, pageSize) {
            $('loading-img-block').removeClass('display-none');
            var items = angular.fromJson(store.get('followsdata_list'));
            var totalNumbers = pageNum * pageSize,
                oldTotalNumbers = (pageNum - 1) * pageSize;
            if (items.length <= oldTotalNumbers && !triggerFlag) {
                ob.publish('event.alert.pull', {
                    type: 'info',
                    message: $window.i18n('common.no_more_data'),
                    timeout:5000
                });
                triggerFlag = true;
            }
            $scope.myFollowedDataList = items;
            $scope.myShowFollowedDataList = $scope.myFollowedDataList.slice(0, totalNumbers);
            ob.publish('event.event_mylinkx_update_followsdata_list', $scope.myFollowedDataList.slice(oldTotalNumbers, totalNumbers));

            $scope._totleNum = totalNumbers;
            $('loading-img-block').addClass('display-none');
        }

        //ob.publish('event.event_mylinkx_initial_follow_data_list', {pageNum:1,pageSize:3});

        function _refreshFollowedData(id, data) {
            var items = angular.fromJson(store.get('followsdata_list')),
                item = _.find(items, function (i) {return id === i.id;});
            item.data = data;
            store.set('followsdata_list', angular.toJson(items));
        }

        function _loadFollowedDataList(list) {
            $scope.update_follow_data_success = list.length;
            $.each(list, function(i, v) {
                if (!v.data) {
                    mylinkxProvider.getFollowDataValues({followDataId: v.id}).success(function(ret) {
                        misc.resultDelegate(ret, function() {
                            v.data = ret.data;
                            _refreshFollowedData(v.id, ret.data);
                            --$scope.update_follow_data_success;
                        }, function() {
                            ob.publish('event.alert.pull', {
                                type: 'danger',
                                message: ret.message
                            });
                        })
                    });
                } else {
                    --$scope.update_follow_data_success;
                }
            })
        }

        $scope.getFollowedDataDetail = function (item, index) {
            if ($scope.searchTag) {
                window.open($location.$$protocol +"://"+ $location.$$host +":"+ $location.$$port + "/linkx_web/#/user_mylinkx/followsdata/" + item.id);//, '_blank'
            } else {
                $location.path("user_mylinkx/followsdata/" + item.id);
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
                ob.publish('event.event_mylinkx_initial_follow_data_list', {pageNum:1,pageSize:3});
            } else if((category == "followsdata") && !detailId) {
                ob.publish('event.event_mylinkx_initial_follow_data_list', {pageNum:1,pageSize:9});
            } else if(category == "search") {
                $scope.searchKey = $location.search().keyword || "";
                ob.publish('event.event_mylinkx_update_followsdata_list_search', $scope.searchKey.toLowerCase());
            }
        });
    }]);
});
