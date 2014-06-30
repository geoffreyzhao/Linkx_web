define([
    '../../controllers'
], function(controllers) {
    'use strict';

    controllers.controller('addSensorCtrl', [
    '$scope',
    'mylinkxProvider',
    'ob',
    '$window',
    function($scope, mylinkxProvider, ob,$window) {

        var util = _util,
            misc = util.misc;
        $scope.editTag = false;

        $scope.sensor = {};

        $scope.sensorTypes = [{
            name: '数值型传感器',
            value: 'NUMBER'
        }, {
            name: 'GPS传感器',
            value: 'GPS'
        }];

        $scope.sensorType = $scope.sensorTypes[0];


        /***********************************************************************
         * publish & subscribe
         **********************************************************************/
        ob.subscribe('event.event_mylinkx_goadd', function(data) {
            $scope.device = data;
            $scope.sensorType = $scope.sensorTypes[0];
            $scope.showNumberProperty = true;
            $scope.addTag = true;
            $scope.editTag = false;
            $scope.delTag = false;
            $scope.sensor = {};
            $scope.errorSensorMessage = null;
            _renderSensorTag();
            $scope.showNumberProperty = true;
            $scope.titleError = false;
            $scope.symbolError = false;
            $scope.unitNameError = false;
        });

        ob.subscribe('event.event_mylinkx_mysensor_goedit', function(data) {
            $scope.errorSensorMessage = null;
            $scope.sensor = data;
            $scope.titleError = false;
            for (var temp in $scope.sensorTypes) {
                if ($scope.sensorTypes[temp].value === data.type) {
                    $scope.sensorType = $scope.sensorTypes[temp];
                }
            }
            _renderSensorTag();
            $scope.editTag = true;
            $scope.addTag = false;
            $scope.delTag = false;
        });

        ob.subscribe('event.event_mylinkx_mysensor_godel', function(data) {
            $scope.errorSensorMessage = null;
            $scope.sensor = data;
            for (var temp in $scope.sensorTypes) {
                if ($scope.sensorTypes[temp].value === data.type) {
                    $scope.sensorType = $scope.sensorTypes[temp];
                }
            }
            _renderSensorTag();
            $scope.delTag = true;
            $scope.editTag = false;
            $scope.addTag = false;
        });

        $scope.$watch('sensorType', function() {
            
            if ($scope.sensorType.value === 'NUMBER') {
                $scope.showNumberProperty = true;
            } else {
                $scope.sensor.properties = {};
                $scope.showNumberProperty = false;
            };
        });

        $scope.selectSensorTag  = function(tags) {
            $scope.sensor.tags = tags;
        }

        function _renderSensorTag() {
            mylinkxProvider.getSensorTags()
                .success(function(ret) {
                    misc.resultDelegate(ret,
                        function() {
                            $scope.sensorTags = ret.data;
                            if (!$scope.sensor.tags) {
                                $scope.sensor.tags = ret.data[0];
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
        }

        function _pickSensorValue(){
            var sensor = _.pick($scope.sensor, 'title', 'description', 'tags', 'properties');
            sensor.type = $scope.sensorType.value;
            sensor.tags = $scope.sensor.tags;
            return sensor;
        }

        function _resetSensor() {
            $scope.sensor = {};
            $scope.sensor.tags = {};
        }

        $scope.cancel = function () {
            ob.publish('event.alert.clear');
            $('.sensor-title').removeClass('error');
            $scope.sensor = {tags:$scope.sensor.tags};
            ob.publish('event.event_mylinkx_showSensorDetail', false);
        };

        $scope.cancelEditSensor = function(data) {
            ob.publish('event.alert.clear');
            ob.publish('event.event_mylinkx_showSensorDetail', false);          
        }

        function _errorLog(id,key) {
          $("." + id).addClass("error");
            $scope.throwFlag = true;        
            ob.publish('event.alert.pull', {
                type: 'danger',
                message: i18n(key)
            });
        }
        function _gatherSensorData() {
            var title = $scope.sensor.title,
                description = $scope.sensor.description,
                tags = $scope.sensor.tags;
            $scope.throwFlag = false;      
            if(title == undefined ||title.replace(/(^\s*)|(\s*$)/g, "") =='') {
                _errorLog('sensor-title','sensor_title_empty');
                      
            } else if (title.length > 50) {
                _errorLog('sensor-title','sensor_title_50'); 
            }
            if (description&&description.length > 500) {
                _errorLog('sensor-desc','sensor_desc_500');         
            }
            if ($scope.throwFlag) {
                throw 'error';
            }

            $('.sensor-title').removeClass('error');
            $('.sensor-desc').removeClass('error');
        }

        $scope.addSensor = function () {
            ob.publish('event.alert.clear');
            try {
                _gatherSensorData();
            } catch (ex) {
                return;
            }
            var data = _pickSensorValue();
            var flag ;
            mylinkxProvider.addSensor(data, {deviceId: $scope.device.id})
            .success(function(ret) {
                    misc.resultDelegate(ret,
                        function() {
                            ob.publish('event.alert.pull', {
                                type: 'success',
                                message: $window.i18n('sensor_add_success')
                            });
                            data.id = ret.data.id;
                            flag = true;
                            ob.publish('event.event_mylinkx_showSensorDetail', false);
                            ob.publish('event.event_mylinkx_mysensor_add', data);
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
                if (flag) {
                    _resetSensor();
                }
                
        }

        $scope.editSensor = function () {
            ob.publish('event.alert.clear');
            try {
                _gatherSensorData();
            } catch (ex) {
                return;
            }

            var data = _pickSensorValue();
            mylinkxProvider.editSensor(data, {deviceId: $scope.device.id,sensorId:$scope.sensor.id})
            .success(function(ret) {
                    misc.resultDelegate(ret,
                        function() {
                            ob.publish('event.alert.pull', {
                                type: 'success',
                                message: $window.i18n('sensor_edit_success')
                            });
                            data.id = $scope.sensor.id;
                            ob.publish('event.event_mylinkx_showSensorDetail', false);
                            ob.publish('event.event_mylinkx_mysensor_edit', data);
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
        }

        $scope.delSensor = function () {
            ob.publish('event.alert.clear');
            mylinkxProvider.delSensor({"deviceId":$scope.deviceForSensor.id ,"sensorId": $scope.sensor.id})
            .success(function(ret) {
                    misc.resultDelegate(ret,
                        function() {
                            ob.publish('event.alert.pull', {
                                type: 'success',
                                message: $window.i18n('sensor_del_success')
                            });
                            ob.publish('event.event_mylinkx_showSensorDetail', false);
                            ob.publish('event.event_mylinkx_mysensor_del',$scope.sensor);
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
        }

        //data validation when add&edit sensor

        $scope.$watchCollection('sensor.properties', function() {
            if ($scope.sensor.properties == undefined) {
                return;
            }
            $scope.symbolError = $scope.sensor.properties.symbol == undefined ? $scope.symbolError != undefined && $scope.symbolError != false: false ;
            $scope.unitNameError = $scope.sensor.properties.unit == undefined ? $scope.unitNameError != undefined && $scope.unitError != false: false ;
        });
        $scope.$watch('$location.path()',function() {
            ob.publish('event.alert.clear');
        });

        $scope.verifyTitle = function() {
            if ($scope.sensor&&$scope.sensor.title && $scope.sensor.title.replace(/(^\s*)|(\s*$)/g, "") !='') {
                $('.sensor-title').removeClass('error');
            } else {
                $('.sensor-title').addClass('error');
            }
        }
    }]);
})