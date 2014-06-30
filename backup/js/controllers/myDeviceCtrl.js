controllers.controller('myDeviceController', ['$scope', 'userIdentifyService','gpsService',
function($scope, userIdentifyService,gpsService) {
    if (!userIdentifyService.identify()) {
         return;
    }
    
    //$scope.initializeGIS = gpsService.initializeGIS(obj);
        
}]);

controllers.controller('devicesController', ['$scope', '$cookies', 'handleService',
function($scope, $cookies, handleService) {
    $scope.showAddDeviceView = false;
    $scope.showAddSensorView = false;

    handleService.showAddDevice.add(function(data) {
        $scope.showAddDeviceView = data;
    });
    
    handleService.showAddSensor.add(function(data) {
        $scope.showAddSensorView = data;
    });
    
    handleService.selectDeviceHideSensor.add(function(data) {
        $scope.showAddDeviceView = data;
        $scope.showAddSensorView = data;
    });

    /*$scope.$on('updateAddDeviceView', function(ev, data) {
        $scope.showAddDeviceView = data;
    });*/

    /*$scope.$on('updateSelectedDevice', function(ev, data) {
        // get the selected device item
        $scope.$broadcast('broadcastSelectedDevice', data);
    });*/
}]);

controllers.controller('actionsController', ['$scope',
function($scope) {
    
}]);

controllers.controller('deviceListController', ['$scope', '$cookies', 'getDeviceListService', 'handleService','gpsService','dataPoolServ',
function($scope, $cookies, getDeviceListService, handleService,gpsService,dataPoolServ) {
    $scope.disableDeviceSelected = false;

    $scope.selectedDevice = undefined;
    $scope.deviceList = null;
    
    $scope.addDevice = function() {// add device
        handleService.showAddDevice.set(true);
        
        var data = {};
        data.status = config.properties.device.status;
        data.type = config.properties.device.type;
        data.location = config.properties.device.location;
        data.isExposed = config.properties.device.isExposed;
        data.longitude = config.properties.device.lng;
        data.latitude = config.properties.device.lat;
        handleService.updateDevice.set(data);
        $scope.disableDeviceSelected = true;
        
        console.log(config.properties.device.lat);
        console.log(config.properties.device.lng);
        gpsService.initializeGIS({
            lat : config.properties.device.lat,
            lng : config.properties.device.lng,
            marker: {
                draggable: true
            }
        });
    };
    
    $scope.selectDevice = function() {
        $scope.selectedDevice = this.device;
        $scope.selectedDevice.uploadPhotoUrl = "v2.0/image/device/"+$scope.selectedDevice.id;
        handleService.selectDevice.set($scope.selectedDevice);
        handleService.selectDeviceForSensors.set($scope.selectedDevice);
        handleService.selectDeviceHideSensor.set(false);
    };
    
    handleService.refreshDeviceList.add(function(data) {
        $scope.deviceList = data;
    });

    /*$scope.$watch('selectedDevice', function(a) {
        $scope.$emit('updateSelectedDevice', $scope.selectedDevice);
    });*/

    getDeviceListService.getDeviceList(
        {},
        {},
        function(ret) {
            if(ret.code === 200) {
                $scope.deviceList = ret.data;
                handleService.selectDevice.set($scope.deviceList[0]);
                handleService.selectDeviceForSensors.set($scope.deviceList[0]);
            }
        },
        function(error) {
            dataPoolServ.bsAlert.set({
                type: 'error',
                num: 1,
                append: error.data.message
            });
        }
    );
    
}]);

controllers.controller('deviceDetailController', ['$scope', 'removeImageService', 'listSensorsService', 'refreshImageService', 'getDeviceListService', 'removeDeviceService', 'updateDeviceService', 'handleService', 'uploadImageService','gpsService','dataPoolServ',
function($scope, removeImageService, listSensorsService, refreshImageService, getDeviceListService, removeDeviceService, updateDeviceService, handleService, uploadImageService,gpsService,dataPoolServ) {
    /*$scope.$on('broadcastSelectedDevice', function(ev, data) {
        $scope.selectedDevice = data;
    });*/
    $scope.imageIndex = 0;
    $scope.imageActive = [];
    handleService.selectDevice.add(function(data) {
        $scope.selectedDevice = data;
        if($scope.selectedDevice.status == 'ONWORKING') {
            $scope.selectedDevice.statusStr = '正在运行';
        } else if($scope.selectedDevice.status == 'SHUTDOWN') {
            $scope.selectedDevice.statusStr = '停止运行';
        }
        if($scope.selectedDevice.type == 'OWN_DEVICE') {
            $scope.selectedDevice.typeStr = '自制设备';
        } else if($scope.selectedDevice.type == 'LINKX_DEVICE') {
            $scope.selectedDevice.typeStr = 'LinkX设备';
        }
        if($scope.selectedDevice.placeType == 'OUTSIDE') {
            $scope.selectedDevice.placeTypeStr = '户外';
        } else if($scope.selectedDevice.type == 'INSIDE') {
            $scope.selectedDevice.placeTypeStr = '室内';
        }
        $scope.imageActive[0] = 'active';
        if(data.imgPath != null) {
            for(var i=1; i<data.imgPath.length; i++) {
                $scope.imageActive[i] = ' ';
            }
            $scope.imageIndex = data.imgPath.length-1;//reset
        }
    });
    function clone(myObj){
        if(typeof(myObj) != 'object' || myObj == null) {
            return myObj;
        }
        var newObj = new Object();
        for(var i in myObj){
          newObj[i] = clone(myObj[i]);
        }
        return newObj;
    }
    
    $("#upload_image").change(function () {
        if($("#upload_image").val() != '') {
            $("#uploadDevicePhoto").submit();
        }
    });

    $scope.oper = {
        removeDevice: function() {
            if(!confirm('confirm delete?')) {
                return;
            }
            removeDeviceService.removeDevice(
                {},
                {
                    id: $scope.selectedDevice.id
                },
                function(ret) {
                    if(ret.code === 200) {
                        //TODO update the deviceList and clear the sensor list
                        handleService.bsAlert.set({
                            type: 'success',
                            title: 'Remove Success!',
                            content: ret.message
                        });
                        //Refresh device list;
                        getDeviceListService.getDeviceList(
                            {},
                            {},
                            function(ret) {
                                if(ret.code === 200) {
                                    handleService.refreshDeviceList.set(ret.data);
                                    if (ret.data.length === 0) {
                                        dataPoolServ.haveDevice.set(false);
                                    }else {
                                        dataPoolServ.haveDevice.set(true);
                                    }
                                    $scope.selectedDevice = ret.data[0];//set data empty
                                    var temp = {"id":$scope.selectedDevice.id};
                                    handleService.selectDeviceForSensors.set(temp);
                                } 
                            },
                            function(error) {
                                dataPoolServ.bsAlert.set({
                                    type: 'error',
                                    num: 1,
                                    append: error.data.message
                                });
                            }
                        );                        
                    } else {
                        dataPoolServ.bsAlert.set({
                            type: 'error',
                            num: 1,
                            append: error.data.message
                        });
                    }
                },
                function(error) {
                    dataPoolServ.bsAlert.set({
                        type: 'error',
                        num: 1,
                        append: error.data.message
                    });
                }
            );
        },
        editDevice: function() {
            handleService.showAddDevice.set(true);
            handleService.updateDevice.set(clone($scope.selectedDevice));
            gpsService.initializeGIS({
                lat: $scope.selectedDevice.latitude, 
                lng: $scope.selectedDevice.longitude,
                marker: {
                    draggable:true
                }});
        },
        addSensor: function() {
            handleService.showAddSensor.set(true);
            handleService.updateSensor.set({
                deviceId: $scope.selectedDevice.id,
                type : config.properties.sensor.type
                //type : "NUMBER"
                //provider : 'SINA',
            });
            $scope.disableDeviceSelected = true;
        },
        changeImage: function(index) {
            $scope.imageIndex += index;
            if($scope.imageIndex <0 ) {
                $scope.imageIndex = 0;
            } else if($scope.imageIndex > $scope.selectedDevice.imgPath.length-1) {
                $scope.imageIndex = $scope.selectedDevice.imgPath.length -1;
            }
        },
//        uploadImage: function() {
//            uploadImageService.uploadImage('imageUpload', '1', $scope.selectedDevice.id, function() {
//                refreshImageService.refresh({}, {deviceId: $scope.selectedDevice.id}, function(ret) {
//                                if(ret.code === 200) {
//                                    $scope.selectedDevice.imgPath = ret.imgPaths;
//                                    $scope.selectedDevice.imgId = ret.imgId;
//                                }
//                            },
//                            function(error) {
//                                dataPoolServ.bsAlert.set({
//                                    type: 'error',
//                                    num: 1,
//                                    append: error.data.message
//                                });
//                            });
//            });
//        }, 
        removeImage: function(index) {
            removeImageService.remove({}, {id: $scope.selectedDevice.imgId[index], typeId: '1'}, function(ret) {
                                if(ret.code === 200) {
                                    handleService.bsAlert.set({
                                        type: 'success',
                                        title: 'Delete image success.',
                                        content: ret.message
                                    });
                                    //Refresh
                                    refreshImageService.refresh({}, {deviceId: $scope.selectedDevice.id}, function(ret) {
                                            if(ret.code === 200) {
                                                $scope.selectedDevice.imgPath = ret.imgPaths;
                                                $scope.selectedDevice.imgId = ret.imgId;
                                            } else {
                                                handleService.bsAlert.set({
                                                    type: 'error',
                                                    title: 'Get Device List Failed',
                                                    content: ret.message
                                                });
                                            }
                                        },
                                        function(error) {
                                            console.log('error');
                                        }
                                    );
                                }
                            },
                            function(error) {
                                dataPoolServ.bsAlert.set({
                                    type: 'error',
                                    num: 1,
                                    append: error.data.message
                                });
                            });
        },
        deviceImageHover: function() {
            if($scope.selectedDevice.imgPath.length > 1) {
                $('.imagePre').show();
                $('.imageNext').show();
            }
        },
        deviceImageLeave: function() {
            $('.imagePre').hide();
            $('.imageNext').hide();
        }
    };
}]);

controllers.controller('addDeviceController', ['$scope', '$location', 'getDeviceListService', 'addDeviceService', 'updateDeviceService', 'uploadImageService', 'handleService','gpsService','dataPoolServ',
function($scope, $location, getDeviceListService, addDeviceService, updateDeviceService, uploadImageService, handleService,gpsService,dataPoolServ) {
    $scope.form = {};
    $scope.Add = true;
    //TODO use directives instead of the hardcode data
    $scope.status = [{value:'ONWORKING', name:'正在运行'}, {value:'SHUTDOWN', name:'停止运行'}];
    $scope.types = [{value:'OWN_DEVICE', name:'自制设备'}, {value:'LINKX_DEVICE', name:'LinkX设备'}];
    
    $('#lat').val(config.properties.device.lat);
    $('#lng').val(config.properties.device.lng);

    handleService.updateDevice.add(function(data) {
        $scope.form = data;
        if(data.title) {
            $scope.Add = false;//For update button
        } else {
            $scope.Add = true;//For save button
        }
    });
    
    $scope.savePosition = function() {
        $scope.form.position = $('#txt_address').val();
    };

    $scope.$watch('form.status', function(obj) {
        console.log($scope.form.status);
    });

    $scope.loadImage = function(obj) {
        console.log(obj['file']);
    };

    $scope.addDevice = function() {
        //uploadImageService.uploadImage('deviceForm', 'file', 1);
        console.log($('#lng').val()+"--"+$('#lat').val());
        console.log($scope.form);
        addDeviceService.addDevice(
            {},
            {
                title: $scope.form.title,
                tags: $scope.form.tags,
                description: $scope.form.description,
                placeType: $scope.form.placeType,
                isExposed: $scope.form.isExposed,
                status: $scope.form.status,
                type: $scope.form.type,
                position: $('#position').val(),
//                longitude: $('#lng').val(),//TODO jquery will be removed, use angularjs model
//                latitude: $('#lat').val()
                longitude: $('#lng').val(),//TODO jquery will be removed, use angularjs model
                latitude: $('#lat').val()
            },
            function(ret) {
                console.log(ret);
                if(ret.code === 200) {
                    handleService.bsAlert.set({
                        type: 'success',
                        title: 'Add Device Success!',
                        content: ret.message
                    });
                    //Forward to list
                    $scope.forwardToDeviceList();
                }
            },
            function (error){
                dataPoolServ.bsAlert.set({
                    type: 'error',
                    num: 1,
                    append: error.data.message
                });
                $location.path('/home');
            }
        );
    };
    $scope.updateDevice = function() {
        //uploadImageService.uploadImage('deviceForm', 'file', 1);
        updateDeviceService.updateDevice({}, {
                id: $scope.form.id,
                title: $scope.form.title,
                tags: $scope.form.tags,
                description: $scope.form.description,
                placeType: $scope.form.placeType,
                isExposed: $scope.form.isExposed,
                status: $scope.form.status,
                type: $scope.form.type,
                position: $('#position').val(),
                longitude: $('#lng').val(),//TODO jquery will be removed, use angularjs model
                latitude: $('#lat').val()
            }, function(ret) {
                if(ret.code === 200) {
                    //TODO foward
                    handleService.bsAlert.set({
                        type: 'success',
                        title: 'Update success!',
                        content: ret.message
                    });
                    //Forward to list
                    $scope.forwardToDeviceList();
                }
            },
            function(error) {
                dataPoolServ.bsAlert.set({
                    type: 'error',
                    num: 1,
                    append: error.data.message
                });
        });
    };
    
    $scope.discard = function() {
        handleService.showAddDevice.set(false);
    };
    
    $scope.forwardToDeviceList = function() {
        //Refresh the device list
        getDeviceListService.getDeviceList(
            {},
            {},
            function(ret) {
                if(ret.code === 200) {
                    handleService.refreshDeviceList.set(ret.data);
                    handleService.selectDevice.set(ret.data[0]);//Set detail's Device
                    handleService.showAddDevice.set(false);//Hide form
                } 
            },
            function(error) {
                dataPoolServ.bsAlert.set({
                    type: 'error',
                    num: 1,
                    append: error.data.message
                });
            }
        );
    };
    
    $scope.searchPosition = function () {
        $scope.form.position = gpsService.getGeoCoder();
    };
    
}]);

controllers.controller('deviceController', ['$scope','dataPoolServ','triggerService', '$cookies', 'actionService', 'trackBackGpsService', 'gpsdpService', 'handleService','listSensorsService','removeSensorService','loadDpsService','chartdpService','getLastSwitchdpService','dpService','imagedpService','ctrlcvService','coreService','gpsService',
function($scope,dataPoolServ,triggerService, $cookies, actionService, trackBackGpsService, gpsdpService, handleService, listSensorsService,removeSensorService,loadDpsService,chartdpService,getLastSwitchdpService,dpService,imagedpService,ctrlcvService,coreService,gpsService ) {
    $scope.showDeviceIndex = false;
    $scope.showSensors = true;
    
    var gpsIntervalId = [];
    var gpsPolyId = [];
    var timelineMap = [];
    var chartMap = [];
    var intervalTimeline = [];
    $scope.actionList = {};
    $scope.triggerListArray = [];
    
    dataPoolServ.showDeviceIndex.add(function(data) { //取得device和sensor所有数据
        console.log(data);
        $scope.showDeviceIndex = true;
        $scope.device = data;
        listSensorsService.listSensors(
            {},
            {deviceId: data.id},
            function(ret) {
                console.log(ret.data);
                $scope.sensorList = ret.data;
                console.log($scope.sensorList.length);
                $scope.device.sensorCount = $scope.sensorList==undefined? 0 :$scope.sensorList.length;
                showSensorInfo();
                },
                function(error) {
                    dataPoolServ.bsAlert.set({
                        type: 'error',
                        num: 1,
                        append: error.data.message
                    });
                }
                );
            });
    
    $scope.oper = {
        changeTab: function(flag) {
            $scope.showSensors = flag;
            if (true === flag) {//显示sensor info
                showSensorInfo();
            } else { //显示device info
                showDeviceInfo();
                gpsService.initializeGIS({
                    lat : $scope.device.latitude,
                    lng : $scope.device.longitude,
                    marker: {
                        animation : null
                    }
                });
            }
        },
        setTime: function (sensorId) {
            console.log('select time');
            //var newStartDate = new Date(document.getElementById('startDate'+sensorId).value);
            var newStartDate = document.getElementById('startDate'+sensorId).value;
            var newEndDate   = document.getElementById('endDate'+sensorId).value;
            var timeline = timelineMap[sensorId];
            console.log(timeline);
            dpService.imageDps(
                    "v2.0/device/"+$scope.device.id+"/sensor/"+sensorId+"/datapoints/image?beginTime="+newStartDate + "&endTime=" +newEndDate,
                {},
                function(ret) {
                    console.log(ret.data);
                    imagedpService.setTime(timeline, newStartDate,newEndDate,ret.data, sensorId);
                }, 
                function(error) {
                    dataPoolServ.bsAlert.set({
                        type: 'error',
                        num: 1,
                        append: error.data.message
                    });
                });
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
                    "v2.0/device/"+$scope.device.id+"/sensor/"+sensorId+"/datapoints/image?beginTime="+newStartDate + "&endTime=" +newEndDate,
                {},
                function(ret) {
                    console.log(ret.data);
                    imagedpService.setCurrentTime(timeline,ret.data, sensorId);
                }, 
                function(error) {
                    dataPoolServ.bsAlert.set({
                        type: 'error',
                        num: 1,
                        append: error.data.message
                    });
                });
        },
        copyUrl: function (sensorId) {
            console.log($('#url'+sensorId).html());
        },
        setNumTime: function (sensorId) {
            var newStartDate = $('#numStartDate'+sensorId).val();
            var newEndDate   = $('#numEndDate'+sensorId).val();
            console.log("+++++++++++++++++++++++++++++++++");
            console.log(newStartDate);
            console.log(newEndDate);
            var interval = Math.ceil(( getDate(newEndDate).getTime() - getDate(newStartDate).getTime())/(config.properties.dp.sizeLimit * 1000));
            console.log(interval);
            var chart = chartMap[sensorId];
            console.log(chart);
            coreService.get(
                    "v2.0/device/"+$scope.device.id+"/sensor/"+sensorId+"/datapoints/number?beginTime="+newStartDate + "&endTime=" +newEndDate+"&interval="+interval,
                {},
                function(ret) {
                    console.log(ret.data);
                    chartdpService.refreshChart(sensorId, ret.data, chart);
                }, function(error) {
                    dataPoolServ.bsAlert.set({
                        type: 'error',
                        num: 1,
                        append: error.data.message
                    });
                });
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
            var interval = Math.ceil(( getDate(newEndDate).getTime() - getDate(newStartDate).getTime())/(config.properties.dp.sizeLimit * 1000));
            console.log(interval);
            $('#numStartDate' + sensorId).val(newStartDate);
            $('#numEndDate' + sensorId).val(newEndDate);
            var chart = chartMap[sensorId];
            console.log(chart);
            coreService.get(
                    "v2.0/device/"+$scope.device.id+"/sensor/"+sensorId+"/datapoints/number?beginTime="+newStartDate + "&endTime=" +newEndDate+"&interval="+interval,
                {},
                function(ret) {
                    console.log(ret.data);
                    chartdpService.refreshChart(sensorId, ret.data, chart);
                }, function(error) {
                    dataPoolServ.bsAlert.set({
                        type: 'error',
                        num: 1,
                        append: error.data.message
                    });
                });
        },
        selectNumberRange: function (sensorId,type) {
            var newEndDate = dateFormat(new Date());
            var newStartDate = null;
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
            }else if('all'===type) {
                //TODO
            }
            
            $('#numStartDate' + sensorId).val(newStartDate);
            $('#numEndDate' + sensorId).val(newEndDate);
            var chart = chartMap[sensorId];
            console.log(chart);
            coreService.get(
                    "v2.0/device/"+$scope.device.id+"/sensor/"+sensorId+"/datapoints/number?beginTime="+newStartDate + "&endTime=" +newEndDate,
                {},
                function(ret) {
                    console.log(ret.data);
                    chartdpService.refreshChart(sensorId, ret.data, chart);
                }, function(error) {
                    dataPoolServ.bsAlert.set({
                        type: 'error',
                        num: 1,
                        append: error.data.message
                    });
                });
        },
        returnSearchPage: function () {
            $scope.showDeviceIndex = false;
        }
        
    };
    
    function getDate(timeStr) {
        timeStr = timeStr.replace(/-/g, "/");
        timeStr = timeStr.replace("T", " ");
        return new Date(timeStr);
    }
    
    function showSensorInfo() {
//        actionService.list(linkx.api.getActinoListService, {apiKey: JSON.parse($cookies.user).apiKey}, function(ret) {
//            $scope.actionList = ret.data;
//        }, function(){alert('Action List error.');});
        $scope.gpsRadio = 'track';
        //$scope.showTrackBack = false;
        $scope.showTrackBack = [];
        $scope.clickTrack = function(trackType, sensorId) {
            if(trackType == 'track') {
                $scope.showTrackBack[sensorId] = false;
                loadDpsService.loadDps(
                        {},
                        {
                            deviceId:$scope.device.id,
                            id:sensorId
                        },
                        function(ret) {
                            trackFunc(ret, sensorId);
                        },
                        function(error){
                            dataPoolServ.bsAlert.set({
                                type: 'error',
                                num: 1,
                                append: error.data.message
                            });
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
            var url = 'v2.0/device/' + $scope.device.id + '/sensor/' + sensorId + '/datapoints/gps' + '?beginTime=' + $('#beginTime' + sensorId).val() +
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
                                    deviceId:$scope.device.id,
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
                                    dataPoolServ.bsAlert.set({
                                        type: 'error',
                                        num: 1,
                                        append: error.data.message
                                    });
                                });
                    }, config.properties.dp.gps.intervalMillisecond);
                }
            }
        };
        
        ////////////////////////////////////////////////////////////
        if (undefined !=$scope.sensorList) {
        for(var i = 0;i <$scope.sensorList.length;i++){
            console.log($scope.sensorList.length);
            $scope.showTrackBack = [];
            //copyService.copyInit('clip_button' + $scope.sensorList[i].id, 'url' + $scope.sensorList[i].id);
             (function (index) {
                console.log(index+"hehe");
                dpService.loadDps(
                    "v2.0/device/"+$scope.device.id+"/sensor/"+$scope.sensorList[index].id+"/datapoints/load",
                    {},
                    function(ret) {
                        console.log(ret);
                        console.log($scope.device.id);
                        $scope.sensorList[index].deviceId = $scope.device.id;
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
                                numStartDate = getDateStr(ret.data[0].key);
                                numEndDate = getDateStr(ret.data[1].key);
                            } else {//最近一小时有datapoint且数目超过2
                                numStartDate = ret.data[0].key;
                                numEndDate = ret.data[ret.data.length-1].key;
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
                                    deviceId:$scope.device.id,
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
                                                    "v2.0/device/"+$scope.device.id+"/sensor/"+$scope.sensorList[index].id+"/datapoints",
                                                {},
                                                function(ret) {
                                                    console.log(ret.data);
                                                    if (ret.data!= undefined && (imagedps.length === 0 || ret.data.key != imagedps[imagedps.length -1].key)) {
                                                        console.log(imagedps.length);
                                                        imagedps[imagedps.length] = ret.data;
                                                        console.log(timelineMap[$scope.sensorList[index].id]);
                                                        imagedpService.refreshTimeline($scope.sensorList[index].id, timelineMap[$scope.sensorList[index].id],imagedps);
                                                    }
                                                }, null);
                                        }
                                    }
                                    , config.properties.dp.image.intervalMillisecond);
                            
                        }else if ("WEIBO" === $scope.sensorList[index].type) {
                            $scope.sensorList[index].imgPath = "css/img/sensor/imagesensor.jpg";
                        }
                        coreService.get(
                            "v2.0/device/"+$scope.device.id+"/sensor/"+$scope.sensorList[index].id+"/datapoints/last",
                            {},
                            function(ret) {
                                $scope.sensorList[index].currentValue = ret.data.value;
                            },
                            function(error) {
                                dataPoolServ.bsAlert.set({
                                    type: 'error',
                                    num: 1,
                                    append: error.data.message
                                });
                            });
                        //ctrlcvService.init($scope.sensorList[index].id);
                    },
                    function(error) {
                        dataPoolServ.bsAlert.set({
                            type: 'error',
                            num: 1,
                            append: error.data.message
                        });
                    });
                })(i);
    }
        }
    };
    
    function getDateStr(timeStr) {
        //timeStr = timeStr.replace(/-/g, "/");
        timeStr = timeStr.replace("T", " ");
        return timeStr;
    }
    
    function dateFormat(date) {
        var datetime =   date.getFullYear() + "-" +
                ((date.getMonth()   <  9) ? "0" : "") + (date.getMonth() + 1) + "-" +
                ((date.getDate()    < 10) ? "0" : "") +  date.getDate() + " " +
                ((date.getHours()   < 10) ? "0" : "") +  date.getHours() + ":" +
                ((date.getMinutes() < 10) ? "0" : "") +  date.getMinutes() + ":" +
                ((date.getSeconds() < 10) ? "0" : "") +  date.getSeconds();
        return datetime;
    }
    
    function showDeviceInfo() {
        
    };
     
}]);

controllers.controller('deviceIndexController', ['$scope','dataPoolServ',
function($scope,dataPoolServ) {
//    dataPoolServ.showDeviceIndex.add(function(data) { 
//        console.log(data);
//        console.log('device index receive----------');
//        $scope.showDeviceInde = true;
//        console.log($scope.showDeviceInde);
//    });
}]);

controllers.controller('sensorInfoController', ['$scope','dataPoolServ',
function($scope,dataPoolServ) {
}]);

controllers.controller('deviceInfoController', ['$scope','dataPoolServ',
function($scope,dataPoolServ) {
}]);

controllers.controller('searchDeviceController', ['$scope','selectAllService','coreService','dataPoolServ',
function($scope,selectAllService,coreService,dataPoolServ) {
    var typeArrays = [{type:'NUMBER', value:'数值型'}, 
                      {type:'SWITCH', value:'开关型'}, 
                      {type:'GPS', value:'GPS型'},
                      {type:'GEN', value:'泛型'}, 
                      {type:'IMAGE', value:'图像型'}, 
                      {type:'WEIBO', value:'微博型'}];
    
    $scope.types = typeArrays;
    
    $scope.selectAllType = true;
    
    $scope.selectAllTags = true;
    
    $scope.position = null;
    
    coreService.get("v2.0/devices/getHotTags",
            {},
            function(ret) {
                console.log(ret.data);
                $scope.tags = ret.data;
            }, 
            function(error) {
                dataPoolServ.bsAlert.set({
                    type: 'error',
                    num: 1,
                    append: error.data.message
                });
            });
    
    coreService.get("v2.0/devices/search",
          {},
          function(ret) {
              console.log(ret);
              $scope.deviceList = ret.data;
              $scope.page = ret.page;
          }, 
          function(error) {
              dataPoolServ.bsAlert.set({
                  type: 'error',
                  num: 1,
                  append: error.data.message
              });
          });
    
    $scope.toggleType = function() {
        $scope.selectAllType = selectAllService.verifySelectedAll("type");
    };
    
    $scope.toggleTags = function () {
        $scope.selectAllTags = selectAllService.verifySelectedAll("tags");
    };
    
    $scope.oper = {
        selectAll: function (tagName,modelId) {
            selectAllService.selectAll(tagName,modelId);
        },
        showDeviceIndex: function (device) {
            //$scope.showDeviceIndex = true;
            dataPoolServ.showDeviceIndex.set(device);
        },
        search: function(pageIndex) {
            console.log(pageIndex);
            if (undefined  == pageIndex) {
                return;
            }
            var type = selectAllService.getSelectedValue("type");
            var tags = selectAllService.getSelectedValue("tags");
            console.log(tags);
            console.log($scope.position);
            console.log($scope.title);
            if(pageIndex > $scope.page.pageTotal) {
                pageIndex = $scope.page.pageTotal;
                $scope.pageSelected = $scope.page.pageTotal;
            }
            var url = "v2.0/devices/search?page="+pageIndex;
            if (tags !== null) {
                url += "&tags="+encodeURIComponent(tags);
            }
            if (type !== null) {
                url += "&type="+encodeURIComponent(type);
            }
            if ($scope.title !== undefined && $scope.title != null &&$scope.title.replace(/\s/g,'') !== "") {
                url += "&title="+encodeURIComponent($scope.title);
            }
            if ($scope.position !== undefined && $scope.position != null && $scope.position.replace(/\s/g,'') !== "") {
                url += "&position="+encodeURIComponent($scope.position);
            }
            console.log("~~~~~~~~~~~~~~~~~~url after encode:"+url);
            coreService.get(url,
                    {},
                    function(ret) {
                        console.log(ret.data);
                        $scope.deviceList = ret.data;
                        $scope.page = ret.page;
                    }, 
                    function(error) {
                        dataPoolServ.bsAlert.set({
                            type: 'error',
                            num: 1,
                            append: error.data.message
                        });
                    });
        }
    };
}]);

controllers.controller('findDeviceController', ['$scope','selectAllService','coreService','gpsService',
function($scope,selectAllService,coreService,gpsService) {
    var typeArrays = [{type:'NUMBER', value:'数值型'}, 
                      {type:'SWITCH', value:'开关型'}, 
                      {type:'GPS', value:'GPS型'},
                      {type:'GEN', value:'泛型'}, 
                      {type:'IMAGE', value:'图像型'}, 
                      {type:'WEIBO', value:'微博型'}];
    
    $scope.types = typeArrays;
    
    $scope.selectAllType = true;
    
    $scope.selectAllTags = true;
    
    $scope.position = null;
    
    coreService.get("v2.0/devices/getHotTags", 
            {},
            function(ret) {
                console.log(ret.data);
                $scope.tags = ret.data;
            }, 
            function(error) {
                dataPoolServ.bsAlert.set({
                    type: 'error',
                    num: 1,
                    append: error.data.message
                });
            });
    
    console.log(config.properties.device.lat);
    console.log(config.properties.device.lng);
    gpsService.initializeGIS({
        lat : config.properties.device.lat,
        lng : config.properties.device.lng,
        marker: {
            
        }
    });
    
    $scope.toggleType = function() {
        $scope.selectAllType = selectAllService.verifySelectedAll("type");
    };
    
    $scope.toggleTags = function () {
        $scope.selectAllTags = selectAllService.verifySelectedAll("tags");
    };
    
    $scope.oper = {
        selectAll: function (tagName,modelId) {
            console.log(tagName,modelId);
            selectAllService.selectAll(tagName,modelId);
        }
    };
    
}]);