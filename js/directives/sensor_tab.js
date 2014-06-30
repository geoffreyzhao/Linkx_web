define(['./directives'], function(directives) {
    'use strict';

    directives.directive('sensortab', [
        'ob',
        function(ob) {
            return {
                templateUrl: 'partials/directemplate/sensor_tab.html',
                scope: {
                    tab_sensors : '=tabsensors',
                    tab_detail: '=tabdetail',
                    tab_addSensor: '=tabaddsensor',
                    tab_goEditSensor: '&goEdit',
                    tab_goDelSensor: '&goDel',
                    tab_device:'=tabdevice',
                    tab_category:'=tabcategory',
                    page:'=tabpage',
                    pageTotal: '=tabpagetotal'
                },
                link : function(scope, element, attrs) {

                    ob.subscribe('event.event_mylinkx_cancel_editSensor', function (data) {
                        scope.tab_detail = data;
                    });

                    // ob.subscribe('event.event_mylinkx_initSensorTab', function (data) {
                    //     var _len = data.list.length;
                    //     scope.tab_sensors = data.list;
                    //     if(_len > 0) {
                    //         scope.pageTotal = Math.ceil(_len / 7);
                    //     } else {
                    //         scope.tab_detail = {};
                    //         scope.pageTotal = 1;
                    //     }
                    //     if(data.type == "init") {
                    //         scope.page = 1;
                    //         scope.tab_detail = scope.tab_sensors[0];
                    //     } else if(data.type == "add") {
                    //         scope.page = scope.pageTotal;
                    //         scope.tab_detail = scope.tab_sensors[_len - 1];
                    //     }
                    //     _changeSensorsForPage();
                    //     //scope.selectSensor(scope.tab_detail);
                    // });

                    scope.$watch('page', function() {
                        _changeSensorsForPage();
                    });

                    scope.selectSensor = function(item, event) {
                        scope.tab_detail = item;
                        scope.$parent.sensor = item;
                        scope.tab_addSensor = false;
                        if (scope.tab_detail.title != '新建传感器') {
                            var _className = $(event.target).closest(".device-sensor-block").data("info");
                           // ob.publish('event.event_mylinkx_initChart',{deviceId:scope.tab_device.id,sensor:scope.tab_detail, chartSelector: "." + _className + " #chart" + scope.tab_detail.id});
                        }
                    };

                    scope.changeSensorsForPage = function(page) {
                        scope.page = page;
                    };

                    function _changeSensorsForPage() {
                        if((scope.page > scope.pageTotal) || (scope.page < 0)) {
                            return;
                        }
                        if (scope.tab_sensors != undefined) {
                            scope.sensorsForPage = scope.tab_sensors.slice( (scope.page - 1) * 7 , 7 * scope.page );
                        }
                    }

                }
            }
        }
    ]);
});