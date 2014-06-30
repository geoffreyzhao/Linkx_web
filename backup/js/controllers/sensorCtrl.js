controllers.controller('addSensorController', ['$scope', '$location','handleService','addSensorService','listSensorsService','updateSensorService','coreService',
function($scope, $location, handleService, addSensorService, listSensorsService,updateSensorService,coreService) {
    $scope.form = {};
    $scope.Add = true;
    
    var typeArrays = [{value:'NUMBER', name:'数值型传感器'}, 
                      {value:'SWITCH', name:'开关'}, 
                      {value:'GPS', name:'Gps'},
                      {value:'GEN', name:'泛传感器'}, 
                      {value:'IMAGE', name:'图像传感器'}, 
                      {value:'WEIBO', name:'微博抓取器'}];

    $scope.providers = [{name:'新浪微博',value:'SINA'}];
    
    $scope.showUnitDiv = true;
    $scope.showProviderDiv = false;
    
    $scope.$watch('form.type', function(obj) {
        if (obj === 'NUMBER') {
            $scope.showUnitDiv = true;
            $scope.showProviderDiv = false;
        } else if (obj === 'WEIBO') {
            $scope.showUnitDiv = false;
            $scope.showProviderDiv = true;
        } else {
            $scope.showUnitDiv = false;
            $scope.showProviderDiv = false;
        }
    });
    
    handleService.updateSensor.add(function(data) {
        $scope.form = data;
        //var form = angular.element('#sensorForm');
        //console.log(form);
        //form.$setValidity();
        //$scope['sensorForm'].$setPristine();
        
        if(data.title) {
            $scope.Add = false;//For update button
            if ('NUMBER' === data.type) {
                $scope.types = [{value:'NUMBER', name:'数值型传感器'}];
            } else if ('SWITCH' === data.type) {
                $scope.types = [{value:'SWITCH', name:'开关'}];
            } else if ('GPS' === data.type) {
                $scope.types = [{value:'GPS', name:'Gps'}];
            } else if ('GEN' === data.type) {
                $scope.types = [{value:'GEN', name:'泛传感器'}];
            } else if ('IMAGE' === data.type) {
                $scope.types = [{value:'IMAGE', name:'图像传感器'}];
            } else if ('WEIBO' === data.type) {
                $scope.types = [{value:'WEIBO', name:'微博抓取器'}];
            }
        } else {
            $scope.Add = true;//For save button
            $scope.types = typeArrays;
        }
        $scope.form.provider = config.properties.sensor.provider;
        //$scope.form.provider = "SINA";
    });
    
    $scope.addSensor = function() {
        var params = {};
        if ('NUMBER' === $scope.form.type) {
            params = {
                    type:$scope.form.type,
                    title:$scope.form.title,
                    description:$scope.form.description,
                    tags:$scope.form.tags,
                    properties: {
                        unitName:$scope.form.properties.unitName,
                        symbol:$scope.form.properties.symbol
                    }
                };
        } else if ('WEIBO' === $scope.form.type) {
            params = {
                    type:$scope.form.type,
                    title:$scope.form.title,
                    description:$scope.form.description,
                    tags:$scope.form.tags,
                    properties: {
                        provider:$scope.form.properties.provider
                    }
                };
        } else {
            params = {
                    type:$scope.form.type,
                    title:$scope.form.title,
                    description:$scope.form.description,
                    tags:$scope.form.tags,
                };
        }
        console.log(params);
        coreService.post(
            "v2.0/device/"+$scope.form.deviceId+"/sensor",
            params,
            function(ret) {
                console.log(ret);
                if(ret.code === 200) {
                    handleService.bsAlert.set({
                        type: 'success',
                        title: 'Add Sensor Success!',
                        content: ''
                    });
                    var temp = {"id":$scope.form.deviceId};
                    console.log(temp);
                    handleService.selectDeviceForSensors.set(temp);
                    handleService.showAddSensor.set(false);
                } else {
                    handleService.bsAlert.set({
                        type: 'fail',
                        title: 'Add Sensor Fail!',
                        content: ''
                    });
                }
            },
            function (error){
                handleService.bsAlert.set({
                        type: 'fail',
                        title: 'Server error!',
                        content: ''
                });
                $location.path('/');
            }
        );
    };
    
    $scope.updateSensor = function() {
        var params = {};
        if ('NUMBER' === $scope.form.type) {
            params = {
                    type:$scope.form.type,
                    title:$scope.form.title,
                    description:$scope.form.description,
                    tags:$scope.form.tags,
                    properties: {
                        unitName:$scope.form.properties.unitName,
                        symbol:$scope.form.properties.symbol
                    }
                };
        } else if ('WEIBO' === $scope.form.type) {
            params = {
                    type:$scope.form.type,
                    title:$scope.form.title,
                    description:$scope.form.description,
                    tags:$scope.form.tags,
                    properties: {
                        provider:$scope.form.properties.provider
                    }
                };
        } else {
            params = {
                    type:$scope.form.type,
                    title:$scope.form.title,
                    description:$scope.form.description,
                    tags:$scope.form.tags,
                };
        }
        coreService.put(
            "v2.0/device/"+$scope.form.deviceId+"/sensor/"+$scope.form.id,
            params,
            function(ret) {
                console.log(ret);
                if(ret.code === 200) {
                    var temp = {"id":$scope.form.deviceId};
                    handleService.selectDeviceForSensors.set(temp);
                    handleService.showAddSensor.set(false);
                    handleService.bsAlert.set({
                        type: 'success',
                        title: 'Update Sensor Success!',
                        content: ''
                    });
                   //$scope.refreshSensorList();
                } else {
                    handleService.bsAlert.set({
                        type: 'fail',
                        title: 'Update Sensor Fail!',
                        content: ''
                    });
                }
            },
            function(error) {
                    
            }
        );
    };
    
    $scope.discard = function() {
        handleService.showAddSensor.set(false);
    };
}]);

controllers.controller('sensorListController', ['$scope', 'copyService', 'triggerService', '$cookies', 'actionService', 'trackBackGpsService', 'gpsdpService', 'handleService','listSensorsService','removeSensorService','loadDpsService','chartdpService','getLastSwitchdpService','dpService','imagedpService','ctrlcvService','coreService','dataPoolServ',
function($scope, copyService, triggerService, $cookies, actionService, trackBackGpsService, gpsdpService, handleService, listSensorsService,removeSensorService,loadDpsService,chartdpService,getLastSwitchdpService,dpService,imagedpService,ctrlcvService,coreService,dataPoolServ) {
    var deviceId = -1;
    var gpsIntervalId = [];
    var gpsPolyId = [];
    var timelineMap = [];
    var chartMap = [];
    var intervalTimeline = [];
    $scope.actionList = {};
    $scope.triggerListArray = [];
    
    $scope.haveDevice = true;
    dataPoolServ.haveDevice.add(function(data) {
        $scope.haveDevice = data;
    });
    //triggerService.list(linkx.api.listTrigger, {sersorId: }, function(){}, function(){});
//    actionService.list(linkx.api.getActinoListService, {apiKey: JSON.parse($cookies.user).apiKey}, function(ret) {
//        $scope.actionList = ret.data;
//    }, function(){alert('Action List error.');});
    $scope.gpsRadio = 'track';
    //$scope.showTrackBack = false;
    $scope.showTrackBack = [];
    $scope.clickTrack = function(trackType, sensorId) {
        if(trackType == 'track') {
            $scope.showTrackBack[sensorId] = false;
            loadDpsService.loadDps(
                    {},
                    {
                        deviceId:deviceId,
                        id:sensorId
                    },
                    function(ret) {
                        trackFunc(ret, sensorId);
                    },
                    function(error){
                    });
        } else {
            $scope.showTrackBack[sensorId] = true;
            var beforeHour = config.properties.dp.number.beforeTodayMidnightHour;
            var afterHour = config.properties.dp.number.afterNowHour;
            var now = new Date();
            var nowTime = now.getTime() + afterHour * 1000 * 60 * 60;
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setMilliseconds(0);
            var midnightTime = now.getTime() - beforeHour * 1000 * 60 * 60;
            
            var newStartDate = dateFormat(new Date(midnightTime));
            var newEndDate   = dateFormat(new Date(nowTime));
            $('#beginTime' + sensorId).val(newStartDate);
            $('#endTime' + sensorId).val(newEndDate);
            $('#datetimepicker' + sensorId + '1').datetimepicker();
            $('#datetimepicker' + sensorId + '2').datetimepicker();
        }
    };
    $scope.trackBackGPS = function(sensorId) {
        //console.log($('#beginTime' + sensorId).val());
        //console.log($('#endTime' + sensorId).val());
        var url = 'v2.0/device/' + deviceId + '/sensor/' + sensorId + '/datapoint/gps' + '?beginTime=' + $('#beginTime' + sensorId).val() +
            '&endTime=' + $('#endTime' + sensorId).val(); 
        trackBackGpsService.trackBack(url, {}, function(ret){
            if(ret.data.length > 0) {
                gpsdpService.trackBack('gpsdiv'+sensorId, ret.data);
            } else {
                var gpsAlert = $('#gpsAlert' + sensorId);
                //gpsAlert.addClass("in");
                
                gpsAlert.slideDown(300).delay(ret.timeout ? ret.timeout : 3000).slideUp(300);
            }
        }, function(error){});
    };
    
    var trackFunc = function(ret, sensorId){
        var gpsDiv = 'gpsdiv' + sensorId;
        //var sensorId = ret.url;
        if(ret.code === 200) {
            var data = ret.data;
            //var poly;
            var lastPointTime = null;
            if(data.length != 0) {
                var newestPointer = new google.maps.LatLng(data[0].value.lat, data[0].value.lng);
                lastPointTime = data[0].key;
                //poly = gpsdpService.loadGPS(gpsDiv, newestPointer);
                gpsPolyId[sensorId] = gpsdpService.loadGPS(gpsDiv, newestPointer);
                gpsdpService.putData(data[0], gpsPolyId[sensorId]);
            } else {
                var newestPointer = new google.maps.LatLng(31.20692875060323, 121.61453247070312);
                gpsPolyId[sensorId] = gpsdpService.loadGPS(gpsDiv, newestPointer);
                //lastPointTime = '';
            }
            //Set a Timer
            if(!gpsIntervalId[sensorId]) {
                gpsIntervalId[sensorId] = setInterval(function(){
                    loadDpsService.loadDps(
                            {},
                            {
                                deviceId:deviceId,
                                id:sensorId
                            },
                            function(ret){
                                if(ret.code === 200) {
                                    var data = ret.data;
                                    //gpsdpService.loadGPS(gpsDiv, newestPointer);
                                    if(data.length!=0 && lastPointTime != data[0].key) {
                                        //var newestPointer = new google.maps.LatLng(data[0].value.lat, data[0].value.lng);
                                        console.log(lastPointTime + 'new data' + data[0].key);
                                        console.log( 'poly' + gpsPolyId[sensorId]);
                                        gpsdpService.putLastData(data[0], gpsPolyId[sensorId]);
                                        lastPointTime = data[0].key;
                                    } else {
                                        console.log('old data');
                                    }
                                }
                            },
                            function(error){
                                
                            });
                }, config.properties.dp.gps.intervalMillisecond);
            }
        }
    };
    
    handleService.selectDeviceForSensors.add(function(data) {
        listSensorsService.listSensors(
            {},
            {deviceId: data.id},
            function(ret) {
                if(ret.code === 200) {
                    deviceId = data.id;
                    $scope.sensorList = ret.data;
                    console.log(ret);
                    for(var i = 0;i <$scope.sensorList.length;i++){
                        console.log($scope.sensorList.length);
                        $scope.showTrackBack = [];
                        //copyService.copyInit('clip_button' + $scope.sensorList[i].id, 'url' + $scope.sensorList[i].id);
                         (function (index) {
                            console.log(index+"hehe");
                            dpService.loadDps(
                                "v2.0/device/"+deviceId+"/sensor/"+$scope.sensorList[index].id+"/datapoint/load",
                                {},
                                function(ret) {
                                    console.log(ret);
                                    console.log(deviceId);
                                    $scope.sensorList[index].deviceId = deviceId;
                                    $scope.sensorList[index].url = "http://"+location.host+"/linkx/v2.0/device/"+deviceId+"/sensor/"+$scope.sensorList[index].id+"/datapoint";
                                    if ("NUMBER" === $scope.sensorList[index].type) {
                                        $scope.sensorList[index].imgPath = "css/img/sensor/numbersensor.jpg";
                                        chartMap[$scope.sensorList[index].id] = chartdpService.drawChart($scope.sensorList[index].id, ret.data);
                                        
                                        triggerService.list(linkx.api.listTrigger, {sersorId: $scope.sensorList[index].id}, function(ret){
                                            $scope.triggerListArray[$scope.sensorList[index].id] = ret.data;
                                        }, function(error){});
                                        console.log(ret.data);//.replace("T", " ")
                                        console.log(ret.data[0]);
                                        var numStartDate = null;
                                        var numEndDate = null;
                                        if (ret.data.length === 2){ //最近一小时datapoint数目为2或最近一小时无dp
//                                            numStartDate = getDateStr(ret.data[0].timestamp);
//                                            numEndDate = getDateStr(ret.data[1].timestamp);
                                            numStartDate = getDate(ret.data[0].timestamp);
                                            numEndDate = getDate(ret.data[1].timestamp);
                                        } else {//最近一小时有datapoint且数目超过2
                                            numStartDate = getDate(ret.data[0].timestamp);
                                            numEndDate = getDate(ret.data[ret.data.length-1].timestamp);
                                        }
                                        $('#numStartDate' + $scope.sensorList[index].id).val(numEndDate);
                                        $('#numEndDate' + $scope.sensorList[index].id).val(numStartDate);
                                        $('#numPicker' + $scope.sensorList[index].id + '1').datetimepicker();
                                        $('#numPicker' + $scope.sensorList[index].id + '2').datetimepicker();
                                    }
                                    else if ("GPS" === $scope.sensorList[index].type) {
                                        $scope.sensorList[index].imgPath = "css/img/sensor/gpssensor.jpg";
                                        var sensorId = $scope.sensorList[index].id;
                                        loadDpsService.loadDps(
                                                {},
                                                {
                                                    deviceId:deviceId,
                                                    id:sensorId
                                                },
                                                function(ret) {
                                                    trackFunc(ret, sensorId);
                                                },
                                                function(error){
                                                });
                                    }else if ("SWITCH" === $scope.sensorList[index].type) {
                                        console.log(ret.data.value);
                                        $scope.sensorList[index].imgPath = "css/img/sensor/switchsensor.jpg";
//                                        if (ret.data[0].value == undefined) {
//                                            ret.data[0].value = "OFF";
//                                        }
                                        $scope.sensorList[index].status = ret.data[0].value;
                                    }else if ("GEN" === $scope.sensorList[index].type) {
                                        $scope.sensorList[index].imgPath = "css/img/sensor/gensensor.jpg";
                                    } else if ("IMAGE" === $scope.sensorList[index].type) {
                                        var imagedps = ret.data;
                                        $scope.sensorList[index].imgPath = "css/img/sensor/imagesensor.jpg";
                                        $('#timelinePicker' + $scope.sensorList[index].id + '1').datetimepicker();
                                        $('#timelinePicker' + $scope.sensorList[index].id + '2').datetimepicker();
                                        var timeline = imagedpService.drawTimeline($scope.sensorList[index].id, imagedps);
                                        timelineMap[$scope.sensorList[index].id] = timeline;
                                        intervalTimeline[$scope.sensorList[index].id] = setInterval(
                                                function() {
                                                    if ($scope.sensorList[index] != undefined && "IMAGE" === $scope.sensorList[index].type) {
                                                        var newStartDate = $("#startDate" + $scope.sensorList[index].id).val();
                                                        console.log(newStartDate);
                                                        dpService.imageDps(
                                                                "v2.0/device/"+deviceId+"/sensor/"+$scope.sensorList[index].id+"/datapoint",
                                                            {},
                                                            function(ret) {
                                                                console.log('sensor ctrl 356');
                                                                console.log(ret.data);
                                                                if (ret.data!= undefined && (imagedps.length === 0 || ret.data.key != imagedps[imagedps.length -1].key)) {
                                                                    console.log(imagedps.length);
                                                                    imagedps[imagedps.length] = ret.data;
                                                                    console.log(imagedps);
                                                                    imagedpService.refreshTimeline($scope.sensorList[index].id, timelineMap[$scope.sensorList[index].id],imagedps);
                                                                }
                                                            }, null);
                                                    }
                                                }
                                                , config.properties.dp.image.intervalMillisecond);
                                        
                                    }else if ("WEIBO" === $scope.sensorList[index].type) {
                                        $scope.sensorList[index].imgPath = "css/img/sensor/imagesensor.jpg";
                                    }
                                    //ctrlcvService.init($scope.sensorList[index].id);
                                },
                                null);
                            })(i);
                        } 
                    }else {
                    handleService.bsAlert.set({
                        type: 'error',
                        title: 'Get Sensor List Failed',
                        content: ''
                    });
                }
            }
        );
    });
    
    $scope.oper = {
            editSensor: function(sensor) {
                sensor.deviceId = deviceId;
                handleService.showAddSensor.set(true);
//                if ("NUMBER" === sensor.type ) {
//                    sensor.unitName = unitName;
//                    sensor.symbol = symbol;
//                }
                handleService.updateSensor.set(clone(sensor));
            },
            removeSensor: function(sensor) {
            if(!confirm('confirm delete?')) {
                return;
            }
            if ("GPS" === sensor.type) {
                clearInterval(gpsIntervalId[sensor.id]);
            } else if ("IMAGE" === sensor.type) {
                clearInterval(intervalTimeline[sensor.id]);
            }
            removeSensorService.removeSensor(
                {},
                {
                    deviceId: deviceId,
                    id:sensor.id,
                },
                function(ret) {
                    if(ret.code === 200) {
                        handleService.bsAlert.set({
                            type: 'success',
                            title: 'Remove Success!',
                            content: ''
                        });
                        listSensorsService.listSensors(
                                {},
                                {deviceId: deviceId},
                                function(ret) {
                                    if (200 == ret.code) {
                                        console.log(ret);
                                        ret.id = deviceId;
                                        handleService.selectDeviceForSensors.set(ret);
                                    } else {
                                        handleService.bsAlert.set({
                                            type: 'error',
                                            title: 'Refresh Sensor List Failed',
                                            content: ret.message
                                        });
                                    }
                                },
                                function(error) {
                                    
                                }
                        );
                    } else {
                        handleService.bsAlert.set({
                            type: 'error',
                            title: 'Remove Failed!',
                        });
                    }
                },
                function(error) {
                    console.log(error);
                }
            );
        },
        changeSwitchStatus: function (sensor) {
            var currentStatus = sensor.status;
            var nextStatus;
            if ("ON" === currentStatus) {
                nextStatus = "OFF";
            } else {
                nextStatus = "ON";
            }
            sensor.processing = true;
            console.log(dateFormat(new Date()).replace(" ","T"));
            dpService.createdp("v2.0/device/"+deviceId+"/sensor/"+sensor.id+"/datapoint",
                 {
                //key: (new Date()).pattern("yyyy-MM-dd HH:mm:ss"),
                key: dateFormat(new Date()).replace(" ","T"),
                value: nextStatus
                }, function(ret) {
                    sensor.status = nextStatus;
                    sensor.processing = false;
                },null);
        },
        //var val = timelineMap.get("key");
        setTime: function (sensorId) {
            console.log('select time');
            //var newStartDate = new Date(document.getElementById('startDate'+sensorId).value);
            var newStartDate = document.getElementById('startDate'+sensorId).value;
            var newEndDate   = document.getElementById('endDate'+sensorId).value;
            var timeline = timelineMap[sensorId];
            console.log(timeline);
            dpService.imageDps(
                    "v2.0/device/"+deviceId+"/sensor/"+sensorId+"/datapoint/image?beginTime="+newStartDate + "&endTime=" +newEndDate,
                {},
                function(ret) {
                    console.log(ret.data);
                    imagedpService.setTime(timeline, newStartDate,newEndDate,ret.data, sensorId);
                }, null);
        },
        setCurrentTime: function (sensorId) {
            console.log('current time');
            var beforeHour = config.properties.dp.image.beforeNowHour;
            var afterHour = config.properties.dp.image.afterNowHour;
            var now = new Date();
            var nowTime = now.getTime() + afterHour * 1000 * 60 * 60;
            var midnightTime = now.getTime() - beforeHour * 1000 * 60 * 60;
            var newStartDate = dateFormat(new Date(midnightTime));
            var newEndDate   = dateFormat(new Date(nowTime));
            $('#startDate' + sensorId).val(newStartDate);
            $('#endDate' + sensorId).val(newEndDate);
            var timeline = timelineMap[sensorId];
            dpService.imageDps(
                    "v2.0/device/"+deviceId+"/sensor/"+sensorId+"/datapoint/image?beginTime="+newStartDate + "&endTime=" +newEndDate,
                {},
                function(ret) {
                    console.log(ret.data);
                    imagedpService.setCurrentTime(timeline,ret.data, sensorId);
                }, null);
        },
        copyUrl: function (sensorId) {
            console.log($('#url'+sensorId).html());
            //ctrlcvService.init(sensorId);
        },
        setNumTime: function (sensorId) {
            var newStartDate = $('#numStartDate'+sensorId).val();
            var newEndDate   = $('#numEndDate'+sensorId).val();
            console.log("+++++++++++++++++++++++++++++++++");
            console.log(newStartDate);
            console.log(newEndDate);
            var interval = Math.ceil(( newEndDate - newStartDate)/(config.properties.dp.sizeLimit * 1000));
            console.log(interval);
            var chart = chartMap[sensorId];
            console.log(chart);
            coreService.get(
                    "v2.0/device/"+deviceId+"/sensor/"+sensorId+"/datapoint/number?beginTime="+newStartDate + "&endTime=" +newEndDate+"&interval="+interval,
                {},
                function(ret) {
                    console.log(ret.data);
                    chartdpService.refreshChart(sensorId, ret.data, chart);
                }, null);
        },
        setNumCurrentTime: function (sensorId) {
            var beforeHour = config.properties.dp.number.beforeTodayMidnightHour;
            var afterHour = config.properties.dp.number.afterNowHour;
            var now = new Date();
            var nowTime = now.getTime() + afterHour * 1000 * 60 * 60;
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setMilliseconds(0);
            var midnightTime = now.getTime() - beforeHour * 1000 * 60 * 60;
            
            var newStartDate = dateFormat(new Date(midnightTime));
            var newEndDate   = dateFormat(new Date(nowTime));
            var interval = Math.ceil(( newEndDate - newStartDate)/(config.properties.dp.sizeLimit * 1000));
            console.log(interval);
            $('#numStartDate' + sensorId).val(newStartDate);
            $('#numEndDate' + sensorId).val(newEndDate);
            var chart = chartMap[sensorId];
            console.log(chart);
            coreService.get(
                    "v2.0/device/"+deviceId+"/sensor/"+sensorId+"/datapoint/number?beginTime="+newStartDate + "&endTime=" +newEndDate+"&interval="+interval,
                {},
                function(ret) {
                    console.log(ret.data);
                    chartdpService.refreshChart(sensorId, ret.data, chart);
                }, null);
        },
        selectNumberRange: function (sensorId,type) {
            var newEndDate = dateFormat(new Date());
            var newStartDate = null;
            //var interval = null;
            if('1h'===type) {
                newStartDate = dateFormat(new Date(new Date().getTime() - 60 * 60 * 1000));
            }else if('3h'===type) {
                newStartDate = dateFormat(new Date(new Date().getTime() - 3* 60 * 60 * 1000));
            }else if('12h'===type) {
                newStartDate = dateFormat(new Date(new Date().getTime() - 12 * 60 * 60 * 1000));
            }else if('1d'===type) {
                newStartDate = dateFormat(new Date(new Date().getTime() - 24 * 60 * 60 * 1000));
            }else if('3d'===type) {
                newStartDate = dateFormat(new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000));
            }else if('1w'===type) {
                newStartDate = dateFormat(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000));
            }else if('1m'===type) {
                newStartDate = dateFormat(new Date(new Date().getTime() - 30 * 24 *60 * 60 * 1000));
            }else if('3m'===type) {
                newStartDate = dateFormat(new Date(new Date().getTime() - 3 * 30 * 24 *60 * 60 * 1000));
            }else if('6m'===type) {
                newStartDate = dateFormat(new Date(new Date().getTime() - 6 * 30 * 24 *60 * 60 * 1000));
            }else if('1y'===type) {
                newStartDate = dateFormat(new Date(new Date().getTime() - 12 * 30 * 24 *60 * 60 * 1000));
            }
            
            $('#numStartDate' + sensorId).val(newStartDate);
            $('#numEndDate' + sensorId).val(newEndDate);
            var chart = chartMap[sensorId];
            console.log(chart);
            coreService.get(
                    "v2.0/device/"+deviceId+"/sensor/"+sensorId+"/datapoint/number?beginTime="+newStartDate + "&endTime=" +newEndDate,
                {},
                function(ret) {
                    if('all'===type) {
                        $('#numStartDate' + sensorId).val(ret.data[ret.data.length - 1].key);
                    }
                    console.log(ret.data);
                    chartdpService.refreshChart(sensorId, ret.data, chart);
                }, null);
        }
    };
    function clone(myObj){ 
        if(typeof(myObj) != 'object' || myObj == null) { 
            return myObj; } var newObj = new Object(); 
            for(var i in myObj){ 
                newObj[i] = clone(myObj[i]); 
            } 
            return newObj; 
        }
    
    function getDate(timeLong) {
        return dateFormat(new Date(parseFloat(timeLong)));
    }
 // Format given date as "yyyy-mm-dd hh:ii:ss"
    // @param datetime   A Date object.
    function dateFormat(date) {
        var datetime =   date.getFullYear() + "-" +
                ((date.getMonth()   <  9) ? "0" : "") + (date.getMonth() + 1) + "-" +
                ((date.getDate()    < 10) ? "0" : "") +  date.getDate() + " " +
                ((date.getHours()   < 10) ? "0" : "") +  date.getHours() + ":" +
                ((date.getMinutes() < 10) ? "0" : "") +  date.getMinutes() + ":" +
                ((date.getSeconds() < 10) ? "0" : "") +  date.getSeconds();
        return datetime;
    }
    
    function refreshTimeline(sensorId, mytimeline, newStartDate) {
        console.log(sensorId+"-"+mytimeline+"-"+newStartDate);
        dpService.imageDps(
                "v2.0/device/"+deviceId+"/sensor/"+sensorId+"/datapoint/image?beginTime="+newStartDate,
            {},
            function(ret) {
                console.log(ret.data);
                imagedpService.refreshTimeline(sensorId, mytimeline,ret.data);
            }, null);
    }
}]);
