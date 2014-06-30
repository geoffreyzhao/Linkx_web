define([
	'../../controllers',
], function(controllers) {
	'user strict';

	controllers.controller('controlPanelCtrl', [
		'$scope',
		'mylinkxProvider',
		'ob',
        '$compile',
        '$window',
        '$routeParams',
        '$interval',
		function($scope, mylinkxProvider, ob, $compile, $window, $routeParams, $interval) {

        var util = _util,
            misc = util.misc;

        $scope.$on('event.device_control_select_value_change', function(d, data) {
          if(!!data.init) {
            return;
          }
            var param = {
                device_id:$routeParams.detailId,
                path:data.path,
                value:data.value
            };
            mylinkxProvider.sendDCCommand(param,{deviceId:param.device_id})
                .success(function (ret) {
                    misc.resultDelegate(ret,
                        function() {
                            console.log(ret.data.command_key);
                            ob.publish('event.event_mylinkx_controlpanel_response',ret);
                        }, function() {
                            ob.publish('event.alert.pull', {
                                type: 'danger',
                                message: ret.message
                            });
                        });
                });


        });

        ob.subscribe('event.event_mylinkx_getControlPanel', function(data) {
            mylinkxProvider.getControlPanel({deviceId:data.id}).success(function(ret) {
                    misc.resultDelegate(ret, function() {
                        if(!_.size(ret.data)) {
                            //TODO:: Add message for null control panel.
                            return;
                        }
                        $scope.units = ret.data.units;
                        if ($scope.units && $scope.units.length > 0) {
                            $scope.cUnit = $scope.units[0];
                            $scope.cPanel =  $scope.cUnit.panels[0];
                            _changePanel($scope.cPanel.rootWidget.child, 'root-container-panel', $scope.cPanel.rootWidget.vertical);
                        }
                    }, function() {
                        ob.publish('event.alert.pull', {
                            type: 'danger',
                            message: ret.message
                        });
                    });
                });
        });

        ob.subscribe('event.event_mylinkx_controlpanel_response', function(ret) {
            var cancelFlag ;
            var type;
            var message;
            var sendingErrorMsg;
            var promise = $interval(function() {
                mylinkxProvider.getDCCommandStatus({deviceId:$routeParams.detailId,commandKey:ret.data.command_key})
                .success(function (ret) {
                    misc.resultDelegate(ret,
                        function() {
                            if (ret.data.status == 'SUCCESS') {
                                type='success';
                                message=$window.i18n('control_succeed') ;
                            } else if (ret.data.status == 'FAILURE') {
                                type='danger';
                                message=$window.i18n('control_failed')
                            }
                            ob.publish('event.alert.pull', {
                                type: type,
                                message: message
                            });
                            $interval.cancel(promise);
                        }, function() {
                                ob.publish('event.alert.pull', {
                                type: 'info',
                                message: ret.message,
                                timeout:1000
                                });
                                sendingErrorMsg = true;
                        });
                });
            },2000);
        });

        $scope.changePanel = function(panel) {
            _changePanel(panel.rootWidget.child,'root-container-panel', panel.rootWidget.vertical);
        }

        var _changePanel = function(child,className,vertical) {
            var panelDom = $("." + className);
            panelDom.empty();
            var _labelElement ;
            _.each(child, function(v) {
                var _eleClass = "ele" + new Date().getTime();
                var _divDom ;
                var tempStr = "";
                if (!!vertical) {
                    _divDom = $compile("<div class='device-control-vertical-block'></div>")($scope);
                }else {
                    _divDom = $compile("<div class='device-control-horizontal-block'></div>")($scope);
                }
                if (v.type == 'spinner_enum') { //Not Container
                    _labelElement = $compile("<label class='device-control-label'>"+ v.label +"</label>")($scope);
                    _divDom.append(_labelElement);
                } else if (v.type == 'slider') {
                    _labelElement = $compile("<label class='device-control-label-slider'>"+ v.label +"</label>")($scope);
                    _divDom.append(_labelElement);
                }
                switch(v.type) {
                   case "spinner_enum":
                        var _scope = $scope.$new();
                        _scope.constraint = v.constraint;
                        _scope.path = v.path;
                        _scope.abc = v.value.value;
                        _childElement = $compile("<select linkx-spinner class='" + _eleClass + "' options='constraint' path='path' abc='abc'></select>")(_scope);
                        break;
                      case "slider":
                        var _scope = $scope.$new();
                        _scope.min = v.min;
                        _scope.max = v.max;
                        _scope.increment = v.increment;
                        _scope.value = v.value;
                        _scope.path = v.path;
                        _scope.unit = v.unit;
                        _childElement = $compile("<div class='control-element-container'><div linkx-slider class='" + _eleClass + "' min='min' max='max' increment='increment' abc='value' path='path'></div><div class='slider-label'></div></div>")(_scope);
                        break;
                      case "button":
                        var _scope = $scope.$new();
                            _scope.path = v.path;
                            _scope.value = "";
                            _childElement = $compile("<button linkx-button style='margin-left:10px;' value='value' class='" + _eleClass + "' path='path'>" + v.label+ "</button>")(_scope);
                            break;
                      case "container":
                        $.each(v.child, function(a, b) {
                            if (b.type == 'button') {
                                var _scope = $scope.$new();
                                tempStr += "<button linkx-btmulti class='" + _eleClass + a + "' path='" + b.path + "' style='margin-left:10px;'>" + b.label+ "</button>";
                                if (a == v.child.length - 1) {
                                    _childElement = $compile(tempStr)(_scope);
                                }
                            } 
                        });
                            break;
                      case undefined: //container
                        if (!v.rootWidget.type) {
                            return;
                        };
                        var subClassName = "subContainer" + new Date().getTime();
                        panelDom.append($compile("<div class='"+subClassName+"' style='border:1px solid;'></div>")($scope));
                        $("." +subClassName).wait(function () {
                           _childElement = _changePanel(v.rootWidget.child, subClassName,v.rootWidget.vertical);
                       });
                        break;
                }
                _divDom.append(_childElement);
                panelDom.wait(function () {
                   this.append(_divDom);
               });
			});
			return panelDom;
		}

        $scope.$watch('getSensorFlag', function (newValue) {
            if (!!newValue && $scope.device.type == 'ALLJOYN_DEVICE') {
                ob.publish('event.event_mylinkx_getControlPanel', $scope.device);
            }
        });
	}])
});