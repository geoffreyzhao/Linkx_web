define([
    '../../controllers'
], function(controllers) {
    'use strict';

    controllers.controller('sensorCtrl', [
    '$scope',
    'ob',
    'store',
    'mylinkxProvider',
    'datapointProvider',
    'chartProvider',
    'httpfactory',
    '$timeout',
    '$window',
    function($scope, ob, store, mylinkxProvider,datapointProvider,chartProvider,httpfactory,$timeout,$window) {
        var util = _util,
            misc = util.misc;

        $scope.loading = {
            sensors: true
        };
        /***********************************************************************
         * publish & subscribe
         **********************************************************************/
         ob.unsubscribe('event.event_mylinkx_getMySensor');
         ob.subscribe('event.event_mylinkx_getMySensor', function(data) {
            $scope.deviceForSensor = data;
            mylinkxProvider.getSensorList({deviceId: $scope.deviceForSensor.id})
            .success(function(ret) {
                    misc.resultDelegate(ret,
                        function() {
                            $scope.loading.sensors = false;
                            $scope.myDeviceTag = true;
                            $scope.sensors = ret.data;
                            $scope.sensor = ret.data[0];
                            _renderLatestData();

                            if (ret.data.length > 0) { //have sensor
                                $scope.sensor = ret.data[0];
                                ob.publish('event.event_mylinkx_initChart',{sensor:ret.data[0], chartSelector: '.my-device-sensor #chart' + $scope.sensor.id});
                            } else {
                                $scope.sensor = {};
                                ob.publish('event.event_mylinkx_initChart',{sensor:$scope.sensor, chartSelector: '.my-device-sensor #chart' + $scope.sensor.id});
                            }
                            //render sensor detail
                            $('.my-device-detail .list-sensors-block .border-radius-sensor-img').hover(
                                function () {
                                    $scope.$apply( function() {
                                        $scope.sensorTitleStatus = 'active';
                                    });
                                }, function () {
                                    $scope.$apply( function() {
                                        $scope.sensorTitleStatus = 'default';
                                    });
                                }
                            );

                            $('.sensor-detail-window-block').on('mouseover', function() {
                                if ($scope.sensor.title == undefined){
                                    return;
                                }
                                $('.sensor-detail-window').removeClass('display-none');
                                $('.triangle-up').removeClass('display-none');
                            });

                            $('.sensor-detail-window-block').on('mouseout', function() {
                                $('.sensor-detail-window').addClass('display-none');
                                $('.triangle-up').addClass('display-none');
                            });

                            // //render sensor hover message
                            $("#sensorTitle").popover({
                                trigger:'hover',
                                html:true
                            });

                            $scope.sensorTitleStatus = 'default';
                            $scope.sensorStatus = 'default';
                            $scope.range = '1h';
                            $scope.showSensorList = false;


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
             });

         ob.subscribe('event.event_mylinkx_mysensor_add', function(data) {
            if($scope.sensors) {
                $scope.sensors.push(data);
            }
            $scope.sensor = data;
            _renderLatestData();
            ob.publish('event.event_mylinkx_initChart',{"deviceId":$scope.device.id,'sensor': data, chartSelector: '.my-device-sensor #chart' + data.id});
         });

         ob.subscribe('event.event_mylinkx_mysensor_edit', function(data) {
            for (var index in $scope.sensors) {
                if (data.id === $scope.sensors[index].id) {
                    $scope.sensors[index] = data;
                }
            }
            $scope.sensor = data;
            ob.publish('event.event_mylinkx_initChart',{"deviceId":$scope.device.id,'sensor': data, chartSelector: '.my-device-sensor #chart' + data.id});
         });

         ob.subscribe('event.event_mylinkx_mysensor_del', function(localeSensor) {
            for (var index in $scope.sensors) {
                // if (localeSensor.id === $scope.latestdata_lists[index].id) {
                //     $scope.latestdata_lists.splice(index, 1);
                // }
                if (localeSensor.id === $scope.sensors[index].id) {
                    $scope.sensors.splice(index, 1);
                }
            }
            _renderLatestData();
            if ($scope.sensors.length > 0) {
                $scope.sensor = $scope.sensors[0];
            } else {
                $scope.sensor = {};
            }
            ob.publish('event.event_mylinkx_initChart',{deviceId:$scope.deviceForSensor.id,sensor:$scope.sensor, chartSelector: '.my-device-sensor #chart' + $scope.sensor.id});
         });

         ob.subscribe('event.event_mylinkx_showSensorDetail', function (data) {
            $scope.showSensorList = false;
            $timeout(function(){
                $scope.sensorStatus = 'default';
                $scope.sensorTitleStatus = 'default';
            }, 600);
         });

         ob.subscribe('event.event_mylinkx_category', function (data) {
            $scope.currentCategory = data;
         });

        function _renderLatestData() {
            $scope.latestdata_lists = new Array();
            var test = new Array();
            for (var index in $scope.sensors) {
                (function (i) {
                    $scope.latestdata_lists[i] = {'title': $scope.sensors[i].title};
                    datapointProvider.getLatestData({"deviceId": $scope.deviceForSensor.id, "sensorId":$scope.sensors[i].id})
                    .success(function(ret) {
                            misc.resultDelegate(ret,
                               function() {
                                    if (null != ret.data) {
                                        $scope.latestdata_lists[i].value = ret.data.data.val;
                                    } else {
                                        $scope.latestdata_lists[i].value = i18n('common.no_data');
                                    }
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
                    })(index);
            }
        }

        $scope.goAddSensor = function() {
            // if($scope.sensors.length != 0 && $scope.sensors[$scope.sensors.length - 1].title == '新传感器') {
            //     return;
            // }
            $scope.showAddSensor = true;
            $scope.sensorStatus = 'add';
            $scope.showSensorList = true;
            $scope.newSensorIndex = 1;
            ob.publish('event.event_mylinkx_goadd', $scope.deviceForSensor);
        }

        $scope.goEditSensor = function (sensor) {
            $scope.sensor = sensor;
            $scope.sensorTitleStatus = 'edit';
            $scope.sensorStatus = 'edit';
            $scope.showSensorList = true;
            this.showAddSensor = true;
            ob.publish('event.event_mylinkx_mysensor_goedit', $scope.sensor);
        }

        $scope.resetSensor = function(data) {
            $scope.sensorStatus = 'default';
            $scope.range = '1h';
            $scope.sensor = data;
            ob.publish('event.event_mylinkx_showSensorDetail', false);
            ob.publish('event.event_mylinkx_initChart',{sensor:data, chartSelector: '.my-device-sensor #chart' + $scope.sensor.id});
        }

        $scope.listSensors = function() {
            $scope.showSensorList = true;
            if ($scope.sensorStatus != 'list') {
                $scope.sensorStatus = 'list';
                $scope.sensorTitleStatus = 'active';
            } else {
                $scope.sensorStatus = 'default';
            }
        }

        $scope.hideSensors = function() {
            $scope.showSensorList = false;
            $timeout(function(){
                $scope.sensorStatus = 'default';
                $scope.sensorTitleStatus = 'default';
            }, 600);
        }

        $scope.readyDelSensor = function(sensor) {
            $scope.sensor = sensor;
            $scope.sensorTitleStatus = 'del';
            $scope.sensorStatus = 'del';
            $scope.showSensorList = true;
            ob.publish('event.event_mylinkx_mysensor_godel', $scope.sensor);
        }

        /***
        * Chart part
        */

        var config = _config,
                util = _util,
                misc = util.misc;

               $('.datetimepicker.datetimepicker-dropdown-bottom-right.dropdown-menu').wait(function () {
                    _.each(this, function(v,i) {
                        if ($('.fix-datepicker')[i].childElementCount == 0) {
                            $($('.fix-datepicker')[i]).append(v);
                        }
                    });
                });

            ob.unsubscribe('event.event_mylinkx_initChart');
            ob.subscribe('event.event_mylinkx_initChart', function(data) {

                //Format date picker
                $('.my-device-detail .form_datetime').datetimepicker({
                    weekStart: 1,
                    todayBtn:  1,
                    autoclose: 1,
                    todayHighlight: 1,
                    startView: 2,
                    forceParse: 0,
                    showMeridian: 1,
                    format:  'yyyy/mm/dd hh:ii:ss'
                });

                chartProvider.resetChart($scope.chartSelector,$scope.chart);

                $scope.sensor = data.sensor;
                $scope.deviceId = $scope.deviceForSensor.id;
                _resetBEtime();
                if (_.isEmpty(data.sensor)) {
                    return;
                }
                if ($scope.sensors.length > 0 ) {
                    $scope.timeRange.beginTime = _setTimeStr(new Date().getTime() - 60 * 60 * 1000);
                    $scope.timeRange.endTime = _setTimeStr(new Date().getTime());
                } else {
                    $scope.timeRange.beginTime = undefined;
                    $scope.timeRange.endTime = undefined;
                }

                $scope.chartData = null;
                $scope.chartSelector = data.chartSelector;
                _paintChart(data.sensor.id, _getTimestamp($scope.timeRange.beginTime), _getTimestamp($scope.timeRange.endTime));
            });

            $scope.timeErrorMessage = null;

            $scope.timeRange = {};
            $scope.refreshChart = function() {
                if(!$scope.sensor.id) {
                    return;
                }
                if (($scope.timeRange.beginTime == '' ||$scope.timeRange.beginTime == undefined || $scope.timeRange.endTime == '' ||$scope.timeRange.endTime == undefined) ||(_getTimestamp($scope.timeRange.beginTime) > _getTimestamp($scope.timeRange.endTime))) {
                    //$scope.timeErrorMessage = '请选择正确的起止时间.'
                    ob.publish('event.alert.pull', {
                        type: 'info',
                        message: $window.i18n('sensor_beginTime'),
                        timeout:5000
                    });
                } else {
                    $scope.timeErrorMessage = null;
                    _paintChart($scope.sensor.id,
                             _getTimestamp($scope.timeRange.beginTime), 
                             _getTimestamp($scope.timeRange.endTime)
                             );
                }
            };

            $scope.hideTimeError = function() {
                $scope.timeErrorMessage = null;
            };

            $scope.selectTimeRange = function(range) {
                if ($scope.sensor.id == undefined) {
                    return;
                }
                var now = new Date(),
                    nowTime = now.getTime();
                var beginTime = null;
                $scope.range = range;
                switch (range) {
                    case '1h' :
                        beginTime = nowTime - 1 * 60 * 60 * 1000;
                        break;
                    case '3h' :
                        beginTime = nowTime - 3 * 60 * 60 * 1000;
                        break;
                    case '12h' :
                        beginTime = nowTime - 12 * 60 * 60 * 1000;
                        break;
                    case '1d' :
                        beginTime = now.subtractDays(1);
                        break;
                    case '3d' :
                        beginTime = now.subtractDays(3);
                        break;
                    case '1w' :
                        beginTime = now.subtractWeeks(1);
                        break;
                    case '1m' :
                        beginTime = now.subtractMonths(1);
                        break;
                    case '3m' :
                        beginTime = now.subtractMonths(3);
                        break;
                    case '6m' :
                        beginTime = now.subtractMonths(6);
                        break;
                    case '1y' :
                        beginTime = now.subtractYears(1);
                        break;
                    case 'all' :
                        beginTime = 283968000000;
                        break;
                }

                _paintChart($scope.sensor.id, beginTime, nowTime);
            };

            function _paintChart(sensorId, beginTime, endTime) {

                chartProvider.resetChart($scope.chartSelector,$scope.chart);
                $('.sensor-dp-loading').removeClass('display-none');
                $scope.nodata = false;

                var params = {
                    'urlParam': {
                        'deviceId':$scope.deviceForSensor.id,
                        'sensorId': $scope.sensor.id
                    },
                    'beginTime':beginTime,
                    'endTime':endTime
                };

                datapointProvider.getDatapoints(params)
                    .success(function(ret) {
                        misc.resultDelegate(ret,
                            function() {
                                $scope.timeRange.beginTime = _setTimeStr(beginTime);
                                $scope.timeRange.endTime = _setTimeStr(endTime);
                                if (beginTime - _getTimestamp($scope.timeRange.beginTime) > 1000 || 
                                    beginTime - _getTimestamp($scope.timeRange.beginTime) < -1000) {//stop render chart
                                    return ;
                                }
                                if (null == ret.data || ret.data[0] == null|| ret.data.length == 0) {
                                    chartProvider.resetChart($scope.chartSelector,$scope.chart);
                                    $scope.nodata = true;
                                } else if (ret.data.length === 1){
                                    $scope.nodata = false;
                                    var chartData = new Array();

                                    chartData.push(ret.data[0]);
                                    chartData.push({
                                        "timestamp": endTime,
                                        "data": {
                                            "val": ret.data[0].data.val
                                        }
                                    });
                                    $scope.chartData = _initChartData(chartData);
                                    $scope.chart = chartProvider.initChart($scope.sensor, $scope.chartData, $scope.chartSelector);
                                } else {
                                    if (beginTime == 283968000000) {
                                        $scope.timeRange.beginTime = _setTimeStr(ret.data[0].timestamp);
                                    }
                                    $scope.nodata = false;
                                    $scope.chartData = _initChartData(ret.data);
                                    $scope.chart = chartProvider.initChart($scope.sensor, $scope.chartData, $scope.chartSelector);
                                }

                                $('.sensor-dp-loading').addClass('display-none');
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

            function _initChartData (data) {
                var xData = [];
                var yData= [];
                for (var i in data) {
                    xData.push(_getDate(data[i].timestamp));
                    yData.push(data[i].data.val);
                }
                return {'xData': xData, 'yData': yData};

            };

            function _getDate (timeNum) {
                var date = new Date(timeNum),
                    month = date.getMonth() > 9 ? (date.getMonth() + 1): "0" + (date.getMonth() + 1),
                    day = date.getDate() > 9 ? date.getDate() : "0" + date.getDate(),
                    hours = date.getHours() > 9 ? date.getHours() : "0" + date.getHours(),
                    minutes = date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes(),
                    seconds = date.getSeconds()> 9 ? date.getSeconds() : "0" + date.getSeconds();
                return date.getFullYear()+ "/" + month + "/" + day + " " + hours + ":" + minutes + ":" + seconds ;
            };

            function _setTimeStr(time) {
                return _getDate(time);
            }

            function _getTimestamp(timeStr) {
                var date = new Date(Date.parse(timeStr.replace(/-/g,   "/")));
                return date.getTime();
            };

            function _resetBEtime() {
                $scope.timeRange.beginTime = undefined;
                $scope.timeRange.endTime = undefined;
            }

            $scope.$watch('getSensorFlag', function (newValue) {
                if(!!newValue && $scope.device.type != "ALLJOYN_DEVICE") {
                    ob.publish('event.event_mylinkx_getMySensor', $scope.device);
                }
            });
    }]);
});