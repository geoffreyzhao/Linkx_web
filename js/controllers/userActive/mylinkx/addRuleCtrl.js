define(['../../controllers'], function(controllers) {
		'use strict';

		controllers.controller('addRuleCtrl', [
			'$scope',
			'ob',
			'mylinkxProvider',
			'store',
			'$compile',
			'$timeout',
			'$location',
			'$routeParams',
			'$window',
			function($scope, ob, mylinkxProvider, store, $compile, $timeout, $location, $routeParams,$window) {
				var util = _util,
					misc = util.misc,
					config = _config,
					consts = config.consts,
					ruleList = null,
					myDevices = null,
					followedDevices = null;
				/*  init statusTag  */
				$scope.statusTagOptions = [{
					value: "OWN",
					label: "我自己的设备"
				}, {
					value: "FOLLOWED",
					label: "我关注的设备"
				}];

				/*  init compare operator  */
				$scope.compareOptions = [{
					value: "SMALLER",
					label: "\<"
				}, {
					value: "SMALLER_EQUAL",
					label: "\<="
				}, {
					value: "EQUAL",
					label: "="
				}, {
					value: "BIGGER_EQUAL",
					label: "\>="
				}, {
					value: "BIGGER",
					label: "\>"
				}];

				/*  init action types  */
				$scope.actionTypeOptions = [{
					value: "EMAIL",
					label: "发送邮件"
				}, {
					value: "SHARE",
					label: "分享到"
				}, {
					value: "PUSH",
					label: "控制设备"
				}];

				/*  init share to  */
				$scope.shareSocialOptions = [{
					value: "weibo",
					label: "微博"
				}, {
					value: "qzone",
					label: "QQ空间"
				}];

				var triggerTemp = {
					statusTagOption: $scope.statusTagOptions[0],
					compareOption: $scope.compareOptions[0]
				};

				ob.subscribe('event.event_mylinkx_initAddRule', function() {
					$scope.triggerArr = [];
					ob.publish('event.event_mylinkx_prepareDate_getRuleList');
					ob.publish('event.event_mylinkx_getDeviceList');
				});

				ob.subscribe('event.event_mylinkx_prepareDate_getRuleList', function() {
					if(!!ruleList) {
						ob.publish('event.event_mylinkx_getTriggerHistory');
						ob.publish('event.event_mylinkx_getActionHistory');
						ob.publish('event.event_mylinkx_getEmailAddressHistory');
						return;
					}
					mylinkxProvider.getMyRuleList().success(function(ret) {
						misc.resultDelegate(ret, function() {
							ruleList = ret.data;

							ob.publish('event.event_mylinkx_getTriggerHistory');
							ob.publish('event.event_mylinkx_getActionHistory');
							ob.publish('event.event_mylinkx_getEmailAddressHistory');
						}, function() {
							ob.publish('event.alert.pull', {
								type: 'danger',
								message: ret.message
							});
						});
					});
				});

				ob.subscribe('event.event_mylinkx_getDeviceList', function(){
					mylinkxProvider.getMyDeviceList().success(function(ret) {
						misc.resultDelegate(ret, function() {
							$scope.myDeviceList = [];
							_.each(ret.data, function(v) {
								var d = _.pick(v, 'id', 'title', 'imgPath');
								$scope.myDeviceList.push(d);
							});
						}, function() {
						});
					});

					mylinkxProvider.getFollowsDeviceList().success(function(ret) {
						misc.resultDelegate(ret, function() {
							$scope.followedDeviceList = [];
							_.each(ret.data, function(v) {
								var d = _.pick(v, 'id', 'title', 'imgPath');
								$scope.followedDeviceList.push(d);
							});
						}, function() {
						});
					});
				});

				ob.subscribe('event.event_mylinkx_getTriggerHistory', function() {
					$scope.historyTrigger = [];

					if ( !! ruleList && ruleList.length > 0) {
						_.each(ruleList, function(v) {
							_.each(v.jsonText.triggers, function(val) {
								var displayTrigger = {
									jsonData: val,
									text: convertTriggerToString(val)
								};
								$scope.historyTrigger.push(displayTrigger);
							});
						});
					}
				});

				function convertTriggerToString(t) {
					var res = "";
					res += "当 ";
					if (t.device.statusTag == "OWN") {
						res += "<b>我自己的设备</b> ";
					} else if (t.device.statusTag == "FOLLOWED") {
						res += "<b>我关注的设备</b> ";
					}
					res += "<b>" + t.device.title + "</b> ";
					res += "监测到 ";
					res += "<b>" + t.sensor.title + "</b>";
					res += convertCompare(t.compare);
					res += "<b>" + t.val + "</b>";
					res += "<b>" + t.sensor.symbol + "</b>";
					return res;
				}

				function convertCompare(s) {
					var compare = "";
					switch (s) {
						case "BIGGER":
							compare = ">";
							break;
						case "BIGGER_EQUAL":
							compare = ">=";
							break;
						case "EQUAL":
							compare = "=";
							break;
						case "SMALLER_EQUAL":
							compare = "<=";
							break;
						case "SMALLER":
							compare = "<";
							break;
					}
					return "<b>" + compare + "</b>";
				}

				ob.subscribe('event.event_mylinkx_getActionHistory', function() {
					$scope.historyAction = [];

					if ( !! ruleList && ruleList.length > 0) {
						_.each(ruleList, function(v) {
							_.each(v.actions, function(val) {
								var displayAction = {
									jsonData: val,
									text: _convertAtionToString(val)
								};
								$scope.historyAction.push(displayAction);
							});
						});
					}
				});

				function _convertAtionToString(a) {
					var res = "";
					res += "则 ";
					if (a.actionType == "EMAIL") {
						res += "<b>发送邮件</b> ";
						res += "内容 ";
						res += "<b>\"" + a.properties.content + "\"</b> ";
						res += "到 ";
						res += "<b>" + a.properties.address + "</b>";
					} else if (a.actionType == "SHARE") {
						res += "<b>分享到</b> ";
						_.each(a.properties.accounts, function(v) {
							if (v.provider == "weibo") {
								res += "<b>微博</b> ";
							} else if (v.provider == "qzone") {
								res += "<b>QQ空间</b> ";
							}
						});
						res += "内容 ";
						res += "<b>\"" + a.properties.data + "\"</b>";
					} else if (a.actionType == "PUSH") {
						res += "<b>控制设备 </b>";
						res += "<b>" + a.properties.device_name + "</b> ";
						res += " 中的控制单元 ";
						res += "<b>" + a.properties.unit_name + "</b> ";
						res += " 中的控制面板 ";
						res += "<b>" + a.properties.panel_name + "</b> ";
						if (!a.properties.value) {
							res += ", 设置 ";
							res += "<b>" + a.properties.element_label + "</b> ";
						} else {
							res += " 设置 ";
							res += "<b>" + a.properties.element_label + "</b> ";
							res += " 为";
							res += "<b>" + a.properties.value_label + "</b>";
						}
					}
					return res;
				}

				ob.subscribe('event.event_mylinkx_getEmailAddressHistory', function() {
					$scope.emailAddressArr = [];
					if ( !! ruleList && ruleList.length > 0) {
						_.each(ruleList, function(v) {
							_.each(v.actions, function(val) {
								if (val.actionType == "EMAIL") {
									var eArr = val.properties.address.split(";");
									/* remove repeated email  */
									if ($scope.emailAddressArr.length > 0) {
										_.each($scope.emailAddressArr, function(eValue) {
											if (_.contains(eArr, eValue.email)) {
												eArr = _.without(eArr, eValue.email);
											}
										});
									}
									_.each(eArr, function(value) {
										var emailObj = {
											flag: false,
											email: value
										};
										$scope.emailAddressArr.push(emailObj);
									});
								}
							});
						});
					}
				});
				
				/*  trigger history part  */
				$scope.checkHistoryTrigger = function(t, index) {
					$scope.checkedHistoryTrigger = t;
					$scope.triggerItemIndex = index;
				}

				$scope.addHistoryTrigger = function(index) {
					_convertTriggerToOption($scope.checkedHistoryTrigger, index);
					$("#showHistoryTrigger").modal('hide');
				}

				$scope.closeModal = function(id) {
					$(id).modal('hide');
				}

				function _convertTriggerToOption(t, index) {
					$scope.createTriggerEnd = true;
					if (t.device.statusTag == "OWN") {
						$scope.checkedDeviceType = "OWN";
						$scope.statusTagOption = $scope.statusTagOptions[0];
						$scope.deviceList = $scope.myDeviceList;

					} else if (t.device.statusTag == "FOLLOWED") {
						$scope.checkedDeviceType = "FOLLOWED";
						$scope.statusTagOption = $scope.statusTagOptions[1];
						$scope.deviceList = $scope.followedDeviceList;
					}
					$.each($scope.deviceList, function(i, v) {
						if (t.device.id == v.id) {
							$scope.checkedDeviceItem = v;
							$scope.checkedDeviceItemIndex = i;

							$scope.sensorList = [];
							mylinkxProvider.getSensorList({
								deviceId: v.id
							}).success(function(ret) {
								misc.resultDelegate(ret, function() {
									_.each(ret.data, function(v) {
										var s = _.pick(v, 'id', 'title', 'properties');
										$scope.sensorList.push(s);
									});

									$.each($scope.sensorList, function(i, v) {
										if (t.sensor.id == v.id) {
											$scope.checkedSensorItem = v;
											$scope.checkedSensorItemIndex = i;
										}
									});

									$scope.completeCreateTrigger();
								}, function() {});
							});
						}
					});
					$.each($scope.compareOptions, function(i, v) {
						if (v.value == t.compare) {
							$scope.checkedCompareItemIndex = i;
							$scope.compareOption = v;
						}
					});
					$scope.compareValue = t.val;				
				}

				/*  action history part  */
				$scope.checkHistoryAction = function(a, index) {
					$scope.checkedHistoryAction = a;
					$scope.actionItemIndex = index;
				}

				$scope.addHistoryAction = function() {
					_convertActionToOption($scope.checkedHistoryAction);
					$("#showHistoryAction").modal('hide');
				}

				function _convertActionToOption(a) {
					$scope.createActionEnd = true;
					$scope.displayAction = {};
					$scope.tempActionStore = {};
					$scope.checkedActionType = a.actionType;
					if (a.actionType == "EMAIL") {
						$scope.actionTypeOption = $scope.actionTypeOptions[0];
						$scope.emailContent = a.properties.content;
						$scope.emailAddress = a.properties.address;
						$scope.completeCreateAction();
					} else if (a.actionType == "SHARE") {
						$scope.actionTypeOption = $scope.actionTypeOptions[1];
						$scope.shareContent = a.properties.data;
						_.each(a.properties.accounts, function(v) {
							if (v.provider == "weibo") {
								$scope.checkedWeiboSocial = true;
								$scope.weiboAccount = v.accountId;
							} else if (v.properties == "qzone") {
								$scope.checkedQzoneSocial = true;
								$scope.weiboAccount = v.accountId;
							}
						});
						$scope.completeCreateAction();
					} else if (a.actionType == "PUSH") {
						$scope.actionTypeOption = $scope.actionTypeOptions[2];
						$scope.completeCreateActionFlag = true;
						ob.publish('event.event_mylinkx_prepare_deivce_control', a);
					}					
				}

				$scope.selectFromTriggerHistory = function(index) {
					$scope.triggerIndex = index;
				}

				$scope.openWin4BindSocialAccount = function() {
					var url = config.api.getServiceURL('mylinkx_bindSocial', {
						provider: $scope.provider
					});
					var userInfo = angular.fromJson(store.get(consts.storeKey.USER_INFO));
					window.open(url + "?apiKey=" + userInfo.apiKey, $scope.provider, "height=600, width=720, top=100, left=200, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
				}
				window.setAccountId = function(accountId) {
					$scope.accountId = accountId;
					console.info(accountId);
				}

				ob.subscribe('event.event_mylinkx_convertRuleToOption', function(r) {
					$scope.ruleId = r.id;
					var triggers = r.jsonText.triggers;
					var actions = r.actions;

					_convertTriggerToOption(triggers[0], 0);
					_convertActionToOption(actions[0]);
				});

				$scope.editRule = function() {
					_wrapRule();
					mylinkxProvider.editRule($scope.rule, {
						ruleId: $scope.ruleId
					}).success(function(ret) {
						misc.resultDelegate(ret, function() {
							ob.publish('event.alert.pull', {
								type: 'success',
								message: $window.i18n('rule_edit_success')
							});
							$timeout(function(){
								$location.path("user_mylinkx/rulelist");
							}, 600);
						}, function() {
							// TODO: edit rule failed
						});
					}).error(function() {
						ob.publish('event.alert.pull', {
							type: 'danger',
							message: 'Error occurred on server!'
						});
						$location.path("user_mylinkx/rulelist");
					});
				}

				$scope.cancelEditRule = function() {
					$location.path("user_mylinkx/rulelist");
				}

				ob.subscribe('event.event_mylinkx_prepare_deivce_control', function(a) {
					if ( !! $scope.controlDevices && ($scope.controlDevices.length > 0)) {
						if ( !! a) {
							$scope.controlDevice = _.filter($scope.controlDevices, function(device) {
								return device.value == a.properties.device_id;
							})[0];
						} else {
							$scope.controlDevice = $scope.controlDevices[0];
						}
						$scope.changeControlDevice(a);
						return;
					}
					$scope.controlDevices = [];
					var _aDeviceList = angular.fromJson(store.get('mydevice_list')),
						_aTempDevices = _.filter(_aDeviceList, function(device) {
							return device.type == 'ALLJOYN_DEVICE';
						});
					_.each(_aTempDevices, function(v, i) {
						$scope.controlDevices.push({
							value: v.id,
							title: v.title,
							imgPath: v.imgPath
						});
					});
					if ($scope.controlDevices.length > 0) {
						if ( !! a) {
							$scope.controlDevice = _.filter($scope.controlDevices, function(device) {
								return device.value == a.properties.device_id;
							})[0];
						} else {
							$scope.controlDevice = $scope.controlDevices[0];
						}
						$scope.changeControlDevice(a);
						return;
					}
				});

				$scope.changeControlDevice = function(a) {
					if ( !! $scope.controlDevice.units && ($scope.controlDevice.units.length > 0)) {
						if ( !! a) {
							$scope.controlUnit = _.filter($scope.controlDevice.units, function(unit) {
								return unit.name == a.properties.unit_name;
							})[0];
						} else {
							$scope.controlUnit = $scope.controlDevice.units[0];
						}
						$scope.changeControlUnit(a);
						return;
					}
					mylinkxProvider.getControlPanel({
						deviceId: $scope.controlDevice.value
					}).success(function(ret) {
						misc.resultDelegate(ret, function() {

							var _aTempUnits = ret.data.units;
							_.each(_aTempUnits, function(v, i) {
								v.label = v.name;
								v.value = i;
							})
							$scope.controlDevice.units = _aTempUnits;
							if (_aTempUnits.length > 0) {
								if ( !! a) {
									$scope.controlUnit = _.filter($scope.controlDevice.units, function(unit) {
										return unit.name == a.properties.unit_name;
									})[0];
								} else {
									$scope.controlUnit = $scope.controlDevice.units[0];
								}
								$scope.changeControlUnit(a);
								if ($scope.completeCreateActionFlag) {
									$scope.completeCreateAction();
								}
								$scope.completeCreateActionFlag = false;
								return;
							}
						}, function() {
						});
					}).error(function() {
						ob.publish('event.alert.pull', {
							type: 'danger',
							message: $window.i18n('common.server.error')
						});
					});
				}
				$scope.changeControlUnit = function(a) {
					var _aTempPanels = $scope.controlUnit.panels;
					_.each(_aTempPanels, function(v, i) {
						v.label = v.name;
						v.value = i;
					})
					$scope.controlPanels = _aTempPanels;
					if (_aTempPanels.length > 0) {
						if ( !! a) {
							$scope.controlPanel = _.filter($scope.controlPanels, function(panel) {
								return panel.name == a.properties.panel_name;
							})[0];
						} else {
							$scope.controlPanel = $scope.controlPanels[0];
						}
						$scope.changeControlPanel(a);
						return;
					}
				}
				var controlFn = {};
				controlFn.findChild = function(d) {
					var _temp = _.filter(d, function(v, key) {
						if (key == 'child') return v;
					});
					return (_temp.length > 0) ? _temp[0] : _temp;
				}
				controlFn.calc = function(d, _aTempElements) {
					for (var i = 0, len = d.length; i < len; ++i) {
						var _aTemp,
							v = d[i];
						_aTemp = controlFn.findChild(v);
						_aTempElements = _aTempElements.concat(_aTemp);
						if (_aTemp.length == 0) {
							continue;
						} else {
							controlFn.calc(_aTemp, _aTempElements);
						}
					}
					return _aTempElements;
				}
				$scope.changeControlPanel = function(a) {
					var _aTempElements = [],
						_aFirstChilds = controlFn.findChild($scope.controlPanel.rootWidget),
						_aResult,
						_aDisplay = [];
					_aTempElements = controlFn.calc(_aFirstChilds, _aTempElements);
					// _aResult = _aTempElements.concat(_aFirstChilds);
					_aResult = _.union(_aFirstChilds, _aTempElements);
					_aResult = _.filter(_aResult, function(v, i) {
						return !v.child && !! v.enable;
					})
					_.each(_aResult, function(v, i) {
						v.value = i;
					});
					$scope.controlElements = _aResult;
					if (_aResult.length > 0) {
						if ( !! a) {
							$scope.controlElement = _.filter($scope.controlElements, function(ele) {
								return ele.path == a.properties.path;
							})[0];
							$scope.deviceControlData = {
								path: a.properties.path,
								label: a.properties.value_label,
								value: a.properties.value || ""
							};
						} else {
							$scope.controlElement = $scope.controlElements[0];
						}
						$scope.changeControlElement(a);
						return;
					}
				}
				$scope.changeControlElement = function(a) {
					// var _ids = "" + $scope.controlDevice.value + $scope.controlUnit.value + $scope.controlPanel.value + $scope.controlElement.value,
					// 	_eleClass = "ele" + new Date().getTime(),
					// 	$container = $(".cec" + _ids),
					// 	_childElement,
					// 	_tempValue;
					var _eleClass = "ele" + new Date().getTime(),
						_tempValue;
					( !! a) ? (_tempValue = a.properties.value) : (_tempValue = $scope.controlElement.value);

					$scope.elementTypeClass = _eleClass;
					$scope.tempValue = _tempValue;
					// switch ($scope.controlElement.type) {
					// 	case "spinner_enum":
					// 		_childElement = $compile("<select linkx-spinner class='" + _eleClass + "' options='controlElement.constraint' path='controlElement.path' value='" + _tempValue + "'></select>")($scope);
					// 		break;
					// 	case "slider":
					// 		_childElement = $compile("<div><div linkx-slider class='" + _eleClass + "' min='controlElement.min' max='controlElement.max' increment='controlElement.increment' value='" + _tempValue + "' path='controlElement.path'></div><div class='slider-label'><span>{{controlElement.unit}}</span></div></div>")($scope);
					// 		break;
					// }
					// $container.wait(function() {
					// 	this.empty();
					// 	this.append(_childElement);
					// });
				}
				$scope.$on('event.device_control_select_value_change', function(d, data) {
					if (!$scope.$$phase && !$scope.$root.$$phase) {
						$scope.$apply(function() {
							$scope.deviceControlData = data;
						});
					}
				});

				$scope.createTrigger = function() {
					ob.publish('event.event_mylinkx_initDeviceType');
				};

				ob.subscribe('event.event_mylinkx_initDeviceType', function() {
					$scope.triggerCurrentStep = 1;
					$scope.checkedDeviceType = "";
					$scope.unfoldDeviceType = true;
					$(".device-type-checked-copy").remove();
					$(".device-item-checked-copy").remove();
					$(".sensor-item-checked-copy").remove();
					$scope.checkedCompareItemIndex = -1;
					$scope.compareValue = "";

					$scope.showTriggerStepTwo = false;
					$scope.showTriggerStepThree = false;
					$scope.showTriggerStepFour = false;

					$scope.createTriggerEnd = false;
					$scope.prevDeviceTypeValue = "";
				});

				$scope.checkDeviceType = function(flag) {
					if ($scope.prevDeviceTypeValue !== flag) {
						$scope.deviceList = [];

						if (flag == 'own') {
							$scope.checkedDeviceType = "OWN";
							$scope.deviceList = $scope.myDeviceList;
						} else if (flag == 'follow') {
							$scope.checkedDeviceType = "FOLLOWED";
							$scope.deviceList = $scope.followedDeviceList;
						}
						$scope.checkedDeviceItemIndex = -1;
					}
					$scope.prevDeviceTypeValue = flag;
					$scope.statusTagOption = _.findWhere($scope.statusTagOptions, {value:$scope.checkedDeviceType});
				}

				function _completeDeviceType() {
					$scope.unfoldDeviceType = false;
					$scope.unfoldDevice = true;
					$scope.triggerCurrentStep = 2;
					$scope.prevDeviceValue = "";

					var $preCopy;
					if ($scope.checkedDeviceType == 'OWN') {
						$preCopy = $(".device-type-own-bg-active");
					} else if ($scope.checkedDeviceType == 'FOLLOWED') {
						$preCopy = $(".device-type-follow-bg-active");
					}
					var posX = $preCopy.position().left;
					var posY = $preCopy.position().top;
					$preCopy.clone().addClass("device-type-checked-copy").insertAfter(".trigger-step-1-body");
					$(".device-type-checked-copy").css({
						"position": "absolute",
						"top": posY + "px",
						"left": posX + "px",
						"-webkit-transition": "all linear 0.5s"
					});
					$timeout(function(){
						$(".device-type-checked-copy").addClass("device-type-checked-copy-move");
					}, 20);

					$timeout(function() {
						$scope.showTriggerStepTwo = true;
					}, 600);
					$scope.showEditCheckedDeviceType = false;
					$scope.showEditCheckedDevice = false;
					$scope.showEditCheckedSensor = false;
				}

			$scope.recoverDeviceType = function() {
				$scope.triggerCurrentStep = 1;
				$scope.unfoldDeviceType = true;
				$(".device-type-checked-copy").remove();
				$scope.showTriggerStepTwo = false;
				$scope.showTriggerStepThree = false;
				$scope.showTriggerStepFour = false;

				$scope.showEditCheckedDeviceType = false;
				$scope.showEditCheckedDevice = false;
				$scope.showEditCheckedSensor = false;
			}

			$scope.goTriggerNextStep = function() {
				if ($scope.triggerCurrentStep == 1) {
					_completeDeviceType();
				} else if ($scope.triggerCurrentStep == 2) {
					_completeDevice();
				} else if ($scope.triggerCurrentStep == 3) {
					_completeSensor();
				}
			}

			$scope.goTriggerPrevStep = function() {
				if ($scope.triggerCurrentStep == 2) {
					$scope.recoverDeviceType();
				} else if ($scope.triggerCurrentStep == 3) {
					$scope.recoverDevice();
				} else if ($scope.triggerCurrentStep == 4) {
					$scope.recoverSensor();
				}
			}

			$scope.checkDevice = function(index, deviceId) {
				if ($scope.prevDeviceValue !== deviceId) {
					$scope.sensorList = [];
					mylinkxProvider.getSensorList({
						deviceId: deviceId
					}).success(function(ret) {
						misc.resultDelegate(ret, function() {
							_.each(ret.data, function(v) {
								var s = _.pick(v, 'id', 'title', 'properties');
								$scope.sensorList.push(s);
							});
						}, function() {});
					});
					$scope.checkedSensorItemIndex = -1;
				}
				$scope.checkedDeviceItemIndex = index;
				$scope.prevDeviceValue = deviceId;
				$scope.checkedDeviceItem = $scope.deviceList[index];
			}

			function _completeDevice() {
				var $active = $(".device-item-active");
				var posX = $active.position().left;
				var posY = $active.position().top;
				$(".trigger-step-2-header").parent().append($active.clone().addClass("device-item-checked-copy"));
				
				$(".device-item-checked-copy").css({
					"position": "absolute",
					"left": posX + "px",
					"top": posY + "px",
					"-webkit-transition": "all linear 0.5s"
				});
				$timeout(function() {
					$(".device-item-checked-copy").addClass("device-item-checked-copy-move");
					if ($scope.checkedDeviceItemIndex > 1) {
						$(".device-item-checked-copy-move").css("margin-top", "0px");
					}
				}, 20);
				$scope.unfoldDevice = false;
				$scope.unfoldSensor = true;
				$scope.triggerCurrentStep = 3;
				$timeout(function() {
					$scope.showTriggerStepThree = true;
				}, 600);				
				$scope.showEditCheckedDeviceType = false;
				$scope.showEditCheckedDevice = false;
				$scope.showEditCheckedSensor = false;
			}

			$scope.recoverDevice = function() {
				if (!!$scope.tempTriggerStore) {
					$scope.deviceList = $scope.tempTriggerStore.deviceInfo.deviceList;
					$scope.checkedDeviceItemIndex = $scope.tempTriggerStore.deviceInfo.checkedDeviceItemIndex;
					$scope.checkedDeviceItem = $scope.tempTriggerStore.deviceInfo.checkedDeviceItem;
				} 
				$scope.triggerCurrentStep = 2;
				$scope.unfoldDevice = true;
				$scope.showTriggerStepThree = false;
				$scope.showTriggerStepFour = false;
				$(".device-item-checked-copy").remove();
				$scope.showEditCheckedDeviceType = true;
				$scope.showEditCheckedDevice = false;
				$scope.showEditCheckedSensor = false;
			}

			$scope.checkSensor = function(index) {
				$scope.checkedSensorItemIndex = index;
				$scope.checkedSensorItem = $scope.sensorList[index];

				$scope.checkedCompareItemIndex = -1;
				$scope.compareValue = "";
			}

			function _completeSensor() {
				$scope.triggerCurrentStep = 4;
				$scope.unfoldSensor = false;
				$scope.unfoldValue = true;

				var $active = $(".sensor-item-active");
				var posX = $active.position().left;
				var posY = $active.position().top;
				$(".trigger-step-3-header").parent().append($active.clone().addClass("sensor-item-checked-copy"));
				
				$(".sensor-item-checked-copy").css({
					"position": "absolute",
					"left": posX + "px",
					"top": posY + "px",
					"-webkit-transition": "all linear 0.5s"
				});
				$timeout(function() {
					$(".sensor-item-checked-copy").addClass("sensor-item-checked-copy-move");
					if ($scope.checkedSensorItemIndex < 5) {
						$(".sensor-item-checked-copy-move").css({
							"margin-top": "20px",
							"margin-left": "57px"
						});
					} else if ($scope.checkedSensorItemIndex % 5 == 0) {
						$(".sensor-item-checked-copy-move").css("margin-top", "20px");
					}
				}, 20);

				$timeout(function() {
					$scope.showTriggerStepFour = true;
				}, 600);
				$scope.showEditCheckedDeviceType = false;
				$scope.showEditCheckedDevice = false;
				$scope.showEditCheckedSensor = false;
			}

			$scope.recoverSensor = function() {
				if (!!$scope.tempTriggerStore) {
					$scope.sensorList = $scope.tempTriggerStore.sensorInfo.sensorList;
					$scope.checkedSensorItemIndex = $scope.tempTriggerStore.sensorInfo.checkedSensorItemIndex;
					$scope.checkedSensorItem = $scope.tempTriggerStore.sensorInfo.checkedSensorItem;
				}
				$scope.triggerCurrentStep = 3;
				$scope.unfoldSensor = true;
				$scope.showTriggerStepFour = false;
				$(".sensor-item-checked-copy").remove();
				$scope.showEditCheckedDeviceType = true;
				$scope.showEditCheckedDevice = true;
				$scope.showEditCheckedSensor = false;
			}

			$scope.checkCompareItem = function(index) {
				$scope.checkedCompareItemIndex = index;
				$scope.compareOption = $scope.compareOptions[index];
			}
			$scope.recoverTriggerStep = function(from, to) {
				// recover trigger step from sensor to device type
				if (from == 3 && to == 1) {
					$scope.recoverDeviceType();
					$(".device-item-checked-copy").remove();
				}
				// recover trigger step from compareItem to device type
				else if (from == 4 && to == 1) {
					$scope.recoverDeviceType();
					$(".device-item-checked-copy").remove();
					$(".sensor-item-checked-copy").remove();
				} 
				// recover trigger step from compareItem to device
				else if (from == 4 && to == 2) {
					$scope.recoverDevice();
					$(".sensor-item-checked-copy").remove();
				} 
				// recover trigger step from compareItem to sensor
				else if (from == 4 && to == 3) {
					$scope.recoverSensor();
				}
				// recover trigger step from sensor to device type
				 else if (from == 3 && to == 2) {
					$scope.recoverDevice();
				}
				// recover trigger step from device to device type
				 else if (from == 2 && to == 1) {
					$scope.recoverDeviceType();
				}
			}
			function _recoverCompareItem() {
				$scope.triggerCurrentStep = 4;
				$scope.showTriggerStepFour = true;
			}

			$scope.displayTriggerArr = [{}];
			$scope.completeCreateTrigger = function() {
				$scope.tempTriggerStore = {
					checkedDeviceType: $scope.checkedDeviceType,
					deviceInfo: {
						deviceList: $scope.deviceList,
						checkedDeviceItem: $scope.checkedDeviceItem,
						checkedDeviceItemIndex: $scope.checkedDeviceItemIndex
					},
					sensorInfo: {
						sensorList: $scope.sensorList,
						checkedSensorItem: $scope.checkedSensorItem,
						checkedSensorItemIndex: $scope.checkedSensorItemIndex
					},
					compareInfo: {
						checkedCompareItemIndex: $scope.checkedCompareItemIndex,
						compareOption: $scope.compareOption,
						compareValue: $scope.compareValue
					}
				};

				$scope.triggerArr = [];
				$scope.displayTriggerArr = [];

				$scope.triggerArr.push({
					device: {
						id: $scope.tempTriggerStore.deviceInfo.checkedDeviceItem.id,
						title: $scope.tempTriggerStore.deviceInfo.checkedDeviceItem.title,
						statusTag: $scope.tempTriggerStore.checkedDeviceType
					},
					sensor: {
						id: $scope.tempTriggerStore.sensorInfo.checkedSensorItem.id,
						title: $scope.tempTriggerStore.sensorInfo.checkedSensorItem.title,
						symbol: $scope.tempTriggerStore.sensorInfo.checkedSensorItem.properties.symbol
					},
					compare: $scope.tempTriggerStore.compareInfo.compareOption.value,
					val: $scope.tempTriggerStore.compareInfo.compareValue
				});

				$scope.displayTriggerArr.push({
					statusTagOption: _.findWhere($scope.statusTagOptions, {value: $scope.tempTriggerStore.checkedDeviceType}),
					deviceTitle: $scope.tempTriggerStore.deviceInfo.checkedDeviceItem.title,
					sensorTitle: $scope.tempTriggerStore.sensorInfo.checkedSensorItem.title,
					compareOption: _.findWhere($scope.compareOptions, {value: $scope.tempTriggerStore.compareInfo.compareOption.value}),
					value: $scope.tempTriggerStore.compareInfo.compareValue,
					symbol: $scope.tempTriggerStore.sensorInfo.checkedSensorItem.properties.symbol
				});

				$scope.createTriggerEnd = true;
				$("#createTrigger").modal("hide");
			}

			function _recoverDataForEditTrigger(t) {
				$(".device-type-checked-copy").remove();
				$(".device-item-checked-copy").remove();
				$(".sensor-item-checked-copy").remove();

				$scope.checkedDeviceType = t.checkedDeviceType;
				$scope.statusTagOption = _.findWhere($scope.statusTagOptions, {value: t.checkedDeviceType});
				
				$scope.deviceList = t.deviceInfo.deviceList;
				$scope.checkedDeviceItem = t.deviceInfo.checkedDeviceItem;
				$scope.checkedDeviceItemIndex = t.deviceInfo.checkedDeviceItemIndex;

				$scope.sensorList = t.sensorInfo.sensorList;
				$scope.checkedSensorItem = t.sensorInfo.checkedSensorItem;
				$scope.checkedSensorItemIndex = t.sensorInfo.checkedSensorItemIndex;

				$scope.checkedCompareItemIndex = t.compareInfo.checkedCompareItemIndex;
				$scope.compareOption = $scope.compareOptions[$scope.checkedCompareItemIndex];
				$scope.compareValue = t.compareInfo.compareValue;
			}

			$scope.editTriggerStep = function(step) {
				if (step == 1) {
					$scope.triggerCurrentStep = 1;

					$scope.unfoldDeviceType = true;
					$scope.unfoldDevice = false;
					$scope.unfoldSensor = false;
					$scope.unfoldValue = false;
					
					$scope.showTriggerStepTwo = false;
					$scope.showTriggerStepThree = false;
					$scope.showTriggerStepFour = false;

					$scope.showEditCheckedDeviceType = false;
					$scope.showEditCheckedDevice = false;
					$scope.showEditCheckedSensor = false;
				} else if (step == 2) {

					$scope.triggerCurrentStep = 2;

					$scope.unfoldDevice = true;
					$scope.unfoldDeviceType = false;
					$scope.unfoldSensor = false;
					$scope.unfoldValue = false;

					$scope.showTriggerStepTwo = true;
					$scope.showTriggerStepThree = false;
					$scope.showTriggerStepFour = false;
					
					$scope.showEditCheckedDeviceType = true;
					$scope.showEditCheckedDevice = false;
					$scope.showEditCheckedSensor = false;
				} else if (step == 3) {
					if ($scope.unfoldDevice) {
						$(".trigger-step-2-body").css("display", "none");
					}
					$scope.triggerCurrentStep = 3;

					$scope.unfoldDeviceType = false;
					$scope.unfoldDevice = false;
					$scope.unfoldSensor = true;
					$scope.unfoldValue = false;

					$scope.showTriggerStepTwo = true;
					$scope.showTriggerStepThree = true;
					$scope.showTriggerStepFour = false;

					$(".device-item").removeClass("device-item-active");

					$scope.showEditCheckedDeviceType = true;
					$scope.showEditCheckedDevice = true;
					$scope.showEditCheckedSensor = false;
				} else if (step == 4) {
					if ($scope.unfoldDevice) {
						$(".trigger-step-2-body").css("display", "none");
					}
					if ($scope.unfoldSensor) {
						$(".trigger-step-3-body").css("display", "none");
					}

					$scope.triggerCurrentStep = 4;

					$scope.unfoldDeviceType = false;
					$scope.unfoldDevice = false;
					$scope.unfoldSensor = false;
					$scope.unfoldValue = true;

					$scope.showTriggerStepTwo = true;
					$scope.showTriggerStepThree = true;
					$scope.showTriggerStepFour = true;

					$(".device-item").removeClass("device-item-active");
					$(".sensor-item").removeClass("sensor-item-active");

					$scope.showEditCheckedDeviceType = true;
					$scope.showEditCheckedDevice = true;
					$scope.showEditCheckedSensor = true;
				}

				_recoverDataForEditTrigger($scope.tempTriggerStore);
			}

			var category = $routeParams.category,
                detailId = $routeParams.detailId;
            if((category == "rulelist") && (detailId == "new")) {
				ob.publish('event.event_mylinkx_initAddRule');
            } else if((category == "rulelist") && !!detailId) {
				ob.publish('event.event_mylinkx_initAddRule');
                mylinkxProvider.getRule({ruleId: detailId}).success(function(ret) {
                    misc.resultDelegate(ret, function() {
                        ob.publish('event.event_mylinkx_convertRuleToOption', ret.data);
                    }, function() {
                    });
                });
        }

        ob.subscribe('event.event_mylinkx_initActionType', function() {
        	$scope.actionCurrentStep = 1;
        	$scope.createActionEnd = false;

        	$scope.unfoldDiv = "actionType";
        });
        ob.publish('event.event_mylinkx_initActionType');

        $scope.checkActionType = function(flag) {
        	$scope.checkedActionType = flag;
	        $scope.actionCurrentStep = 1;
        	if (flag == "EMAIL" || flag == "SHARE") {
	        	$scope.actionStepNum = 3;
        	} else if (flag == "PUSH") {
        		$scope.actionStepNum = 6;
        	}
        	if (!$scope.tempActionStore) {
        		$scope.actionTypeOption = _.findWhere($scope.actionTypeOptions, {value: flag});
        	}
        }

        function _completeActionType() {
        	$scope.unfoldDiv = "";
        	$scope.actionCurrentStep = 2;

        	var $active;
        	$.each($(".action-type-bg"), function(i){
        		if ($($(".action-type-bg")[i]).hasClass("action-type-bg-active")) {
        			$active = $($(".action-type-bg")[i]);
        		}
        	});
        	var posX = $active.position().left;
        	var posY = $active.position().top;
        	
        	$(".action-step-1-header").parent().append($active.clone().addClass("checked-action-type-copy"));
        	$(".checked-action-type-copy").css({
				"position": "absolute",
				"left": posX + "px",
				"top": posY + "px",
				"-webkit-transition": "all linear 0.5s"
			});

			$timeout(function() {
				$(".checked-action-type-copy").addClass("checked-action-type-copy-move");
			}, 20);

			$timeout(function() {
				if ($scope.checkedActionType == 'EMAIL') {
					$scope.showEmailContent = true;
					$scope.unfoldDiv = "emailContent";
				} else if ($scope.checkedActionType == 'SHARE') {
					$scope.showShareSocial = true;
					$scope.unfoldDiv = "shareSocial";
				} else if ($scope.checkedActionType == 'PUSH') {
					ob.publish('event.event_mylinkx_prepare_deivce_control', $scope.realAction);
					$scope.showControlDevice = true;
					$scope.unfoldControlDevice = true;
				}
			}, 600);
        }

        function _recoverActionType() {
        	// recover action type part
        	$scope.actionCurrentStep = 1;
        	$scope.showActionTypeCopy = false;
        	$(".checked-action-type-copy").remove();
        	if ($scope.tempActionStore !== undefined) {
        		$scope.checkedActionType = $scope.tempActionStore.actionTypeOption.value;
        	}
        	$scope.unfoldDiv = "actionType";
        	
        	if ($scope.checkedActionType == "EMAIL"
        		|| $scope.checkedActionType == "SHARE") {
        		$scope.actionStepNum = 3;
        	} else if ($scope.checkedActionType == "PUSH") {
        		$scope.actionStepNum = 6;
        	}

        	// clear email part
        	$scope.showEmailContent = false;
        	$scope.showEmailAddress = false;
        	$scope.showEmailContentCopy = false;

        	// clear share social part
        	$scope.showShareSocial = false;
        	$scope.showShareContent = false;
        	$(".social-weibo-copy").remove();
        	$(".social-qzone-copy").remove();
        	$scope.showWeiboSocialCopy = false;
        	$scope.showQzoneSocialCopy = false;

        	// clear device control part
        	$scope.showControlDevice = false;
        	$scope.showControlDeviceCopy = false;
        	$scope.showControlUnit = false;
        	$scope.showControlUnitCopy = false;
        	$scope.showControlPanel = false;
        	$scope.showControlPanelCopy = false;
        	$scope.showControlElement = false;
        	$scope.showControlElementCopy = false;
        	$scope.showControlValue = false;
        	$(".control-device-copy").remove();
        	$(".control-unit-copy").remove();
        	$(".control-panel-copy").remove();
        	$(".control-element-copy").remove();
        }

        function _completeEmailContent() {
        	$scope.unfoldDiv = "emailAddress";
        	$scope.actionCurrentStep = 3;

        	$(".email-content-textarea-move").wait(function() {
        		this.children("textarea").text($scope.emailContent);
        	});
        	$timeout(function(){
        		$scope.showEmailContentCopy = true;
        		$scope.showEmailAddress = true;
        	}, 600);
        }

        function _recoverEmailContent() {
        	$scope.actionCurrentStep = 2;
        	$(".checked-action-type-copy").remove();
        	$scope.showActionTypeCopy = true;

        	$(".email-content-textarea-move").css("display", "none");
        	$scope.showEmailContent = true;
        	$scope.showEmailContentCopy = false;
        	$scope.showEmailAddress = false;
        	$scope.unfoldDiv = "emailContent";

        	if ($scope.tempActionStore !== undefined) {
        		$scope.emailContent = $scope.tempActionStore.emailContent;
        		$scope.checkedActionType = $scope.tempActionStore.actionTypeOption.value;
        		$scope.emailAddress = $scope.tempActionStore.emailAddress;
        	}

        	if ($scope.emailAddress !== "") {
        		var emailArr = $scope.emailAddress.split(";");
        		$.each($scope.emailAddressArr, function(i, v) {
        			var index = emailArr.indexOf(v.email);
        			if (index != -1) {
        				v.flag = true;
        				emailArr.splice(index, 1);
        			} else {
        				v.flag = false;
        			}
        		});
        		$scope.inputEmailAddress = emailArr.join(";");
        	}
        }

        $scope.checkEmail = function(index) {
        	$.each($scope.emailAddressArr, function(i, v){
        		if (index == i) {
        			v.flag = !v.flag;
        		}
        	});
        }

        function _recoverEmail() {
        	$(".checked-action-type-copy").remove();
        	$scope.showActionTypeCopy = true;
        	$scope.actionCurrentStep = 3;

        	$scope.unfoldDiv = "emailAddress";
        	$scope.showEmailContent = true;
        	$scope.showEmailAddress = true;

        	$scope.checkedActionType = $scope.tempActionStore.actionTypeOption.value;
        	$scope.showEmailContentCopy = true;
        	$scope.emailContent = $scope.tempActionStore.emailContent;
        	$scope.emailAddress = $scope.tempActionStore.emailAddress;

        	if ($scope.emailAddress !== "") {
        		var emailArr = $scope.emailAddress.split(";");
        		$.each($scope.emailAddressArr, function(i, v) {
        			var index = emailArr.indexOf(v.email);
        			if (index != -1) {
        				v.flag = true;
        				emailArr.splice(index, 1);
        			} else {
        				v.flag = false;
        			}
        		});
        		$scope.inputEmailAddress = emailArr.join(";");
        	}
        }

        $scope.completeCreateAction = function() {

        	if ($scope.createActionEnd === true && $scope.checkedActionType == "EMAIL") {
        		$scope.emailAddress = "";
	        	$.each($scope.emailAddressArr, function(i, v){
	        		if (v.flag) {
	        			$scope.emailAddress += v.email + ";";
	        		}
	        	});
	        	if (!!$scope.inputEmailAddress) {
	        		$scope.emailAddress += $scope.inputEmailAddress;
	        	} else {
	        		$scope.emailAddress = $scope.emailAddress.slice(0, $scope.emailAddress.length - 1);
	        	}
        	}

        	$scope.actionTypeOption = _.findWhere($scope.actionTypeOptions, {value:$scope.checkedActionType});
        	
        	// temp action store
        	$scope.tempActionStore = {
        		actionTypeOption: $scope.actionTypeOption,
        		checkedActionType: $scope.checkedActionType
        	};

        	if ($scope.tempActionStore.actionTypeOption.value == "EMAIL") {
        		$scope.tempActionStore.emailContent = $scope.emailContent;
        		$scope.tempActionStore.emailAddress = $scope.emailAddress;
        	} else if ($scope.tempActionStore.actionTypeOption.value == "SHARE") {
        		$scope.tempActionStore.shareContent = $scope.shareContent;
        		$scope.tempActionStore.checkedWeiboSocial = $scope.checkedWeiboSocial;
        		$scope.tempActionStore.checkedQzoneSocial = $scope.checkedQzoneSocial;
        		$scope.tempActionStore.weiboAccount = $scope.weiboAccount;
        		$scope.tempActionStore.qzoneAccount = $scope.qzoneAccount;
        	} else if ($scope.tempActionStore.actionTypeOption.value == "PUSH") {
        		$scope.tempActionStore.controlDevices = $scope.controlDevices;
        		$scope.tempActionStore.controlDevice = $scope.controlDevice;
        		if (!$scope.checkedControlDeviceIndex) {
    				$.each($scope.tempActionStore.controlDevices, function(i, v) {
    					if (v.value == $scope.tempActionStore.controlDevice.value) {
    						$scope.checkedControlDeviceIndex = i;
    					};
    				});
        		}
        		$scope.tempActionStore.checkedControlDeviceIndex = $scope.checkedControlDeviceIndex;
        		
        		$scope.tempActionStore.controlUnit = $scope.controlUnit;
        		if (!$scope.checkedControlUnitIndex) {
        			$.each($scope.tempActionStore.controlDevice.units, function(i, v) {
        				if (v.label == $scope.tempActionStore.controlUnit.label) {
        					$scope.checkedControlUnitIndex = i;
        				}
        			});
        		}
        		$scope.tempActionStore.checkedControlUnitIndex = $scope.checkedControlUnitIndex;

        		$scope.tempActionStore.controlPanel = $scope.controlPanel;
        		if (!$scope.checkedControlPanelIndex) {
        			$.each($scope.tempActionStore.controlUnit.panels, function(i, v) {
        				if (v.label == $scope.tempActionStore.controlPanel.label) {
        					$scope.checkedControlPanelIndex = i;
        				}
        			});
        		}
        		$scope.tempActionStore.checkedControlPanelIndex = $scope.checkedControlPanelIndex;

        		$scope.tempActionStore.controlElements = $scope.controlElements;
        		$scope.tempActionStore.controlElement = $scope.controlElement;
        		if (!$scope.checkedControlElementIndex) {
        			$.each($scope.tempActionStore.controlElements, function(i, v){
        				if (v.label == $scope.tempActionStore.controlElement.label) {
        					$scope.checkedControlElementIndex = i;
        				}
        			});
        		}
        		$scope.tempActionStore.checkedControlElementIndex = $scope.checkedControlElementIndex;

        		if ($scope.tempActionStore.controlElement.type == "spinner_enum") {
        			$scope.tempActionStore.controlValue = $scope.controlValue;
        			if (!$scope.checkedControlValueIndex) {
        				$.each($scope.tempActionStore.controlElement.constraint, function(i, v){
        					if (v.label == $scope.deviceControlData.label) {
        						$scope.checkedControlValueIndex = i;
        					}
        				});
        			}
        			$scope.tempActionStore.checkedControlValueIndex = $scope.checkedControlValueIndex;
        		} else if ($scope.tempActionStore.controlElement.type == "slider") {
        			$scope.tempActionStore.tempValue = $scope.tempValue;
        			$scope.tempActionStore.elementTypeClass = $scope.elementTypeClass;
        		}

        		$scope.tempActionStore.controlData = {
					path: $scope.deviceControlData.path,
					value: $scope.deviceControlData.value,
					value_label: $scope.deviceControlData.label
        		};
        	}

			// display action
			if ($scope.tempActionStore.actionTypeOption.value == 'EMAIL') {
				$scope.displayAction = {
					actionTypeLabel: $scope.tempActionStore.actionTypeOption.label,
					emailContent: $scope.tempActionStore.emailContent,
					emailAddress: $scope.tempActionStore.emailAddress
				};
			} else if ($scope.tempActionStore.actionTypeOption.value == "SHARE") {
				var shareSocialLabel = "";
				if ($scope.tempActionStore.checkedWeiboSocial) {
					shareSocialLabel += "微博 ";
				} else if ($scope.tempActionStore.checkedQzoneSocial) {
					shareSocialLabel += "QQ空间";
				}

				$scope.displayAction = {
					actionTypeLabel: $scope.tempActionStore.actionTypeOption.label,
					shareSocialLabel: shareSocialLabel,
					shareContent: $scope.tempActionStore.shareContent
				};
			} else if ($scope.tempActionStore.actionTypeOption.value == "PUSH") {
				$scope.displayAction = {
					actionTypeLabel: $scope.tempActionStore.actionTypeOption.label,
					device: $scope.tempActionStore.controlDevice.title,
					unit: $scope.tempActionStore.controlUnit.label,
					panel: $scope.tempActionStore.controlPanel.label,
					element: $scope.tempActionStore.controlElement.label,
					value: $scope.tempActionStore.controlData.value_label
				};
				if ($scope.controlElement.type == "button") {
					$scope.displayAction.value = "";
				}
			}

			// real action value
			var properties = {};
			if ($scope.actionTypeOption.value == "EMAIL") {
				properties.content = $scope.emailContent;
				properties.address = $scope.emailAddress;
			}
			else if ($scope.actionTypeOption.value == "SHARE") {
				properties.data = $scope.shareContent;
				properties.accounts = [];
				if ($scope.checkedWeiboSocial) {
					properties.accounts.push($scope.weiboAccount);
				} else if ($scope.checkedQzoneSocial) {
					properties.accounts.push($scope.qzoneAccount);
				}
			} 
			else if ($scope.actionTypeOption.value == "PUSH") {
				properties.device_name = $scope.controlDevice.title;
				properties.device_id = $scope.controlDevice.value;
				properties.unit_name = $scope.controlUnit.label;
				properties.panel_name = $scope.controlPanel.label;
				properties.element_label = $scope.controlElement.label;

				properties.path = $scope.deviceControlData.path;
				properties.value = $scope.deviceControlData.value;
				properties.value_label = $scope.deviceControlData.label;
			}
			$scope.realAction = {
				actionType: $scope.checkedActionType,
				properties: properties
			};
			
			$scope.createActionEnd = true;
			$("#createAction").modal('hide');
        }

        $scope.goActionNextStep = function() {
        	if ($scope.actionCurrentStep == 1) {
        		$scope.actionCurrentStep ++;
        		_completeActionType();
        	} else if ($scope.actionCurrentStep == 2) {
        		$scope.actionCurrentStep ++;
        		if (!!$scope.tempActionStore) {
	        		if ($scope.tempActionStore.actionTypeOption.value == "EMAIL") {
	        			_completeEmailContent();
	        		} else if ($scope.tempActionStore.actionTypeOption.value == "SHARE") {
	        			_completeCheckSocial();
	        		} else if ($scope.tempActionStore.actionTypeOption.value == "PUSH") {
	        			_completeControlDevice();
	        		}
        		} else {
        			if ($scope.checkedActionType == "EMAIL") {
	        			_completeEmailContent();
	        		} else if ($scope.checkedActionType == "SHARE") {
	        			_completeCheckSocial();
	        		} else if ($scope.checkedActionType == "PUSH") {
	        			_completeControlDevice();
	        		}
        		}
        	} else if ($scope.actionCurrentStep == 3) {
        		$scope.actionCurrentStep ++;
        		_completeControlUnit();
        	} else if ($scope.actionCurrentStep == 4) {
        		$scope.actionCurrentStep ++;
        		_completeControlPanel();
        	} else if ($scope.actionCurrentStep == 5) {
        		$scope.actionCurrentStep ++;
        		_completeControlElement();
        	}
        }

        $scope.goActionPrevStep = function() {
        	if ($scope.actionCurrentStep == 3) {
        		$scope.actionCurrentStep --;
        		if (!!$scope.tempActionStore) {
	        		if ($scope.tempActionStore.actionTypeOption.value == "EMAIL") {
	        			_recoverEmailContent();
	        		} else if ($scope.tempActionStore.actionTypeOption.value == "SHARE") {
	        			_recoverShareSocial();
	        		} else if ($scope.tempActionStore.actionTypeOption.value == "PUSH") {
	        			_recoverControlDevice();
	        		}
        		} else {
        			if ($scope.checkedActionType == "EMAIL") {
	        			_recoverEmailContent();
	        		} else if ($scope.checkedActionType == "SHARE") {
	        			_recoverShareSocial();
	        		} else if ($scope.checkedActionType == "PUSH") {
	        			_recoverControlDevice();
	        		}
        		}
        	} else if ($scope.actionCurrentStep == 2) {
        		$scope.actionCurrentStep --;
        		_recoverActionType();
        	} else if ($scope.actionCurrentStep == 6) {
        		$scope.actionCurrentStep --;
        		_recoverControlElement();
        	} else if ($scope.actionCurrentStep == 5) {
        		$scope.actionCurrentStep --;
        		_recoverControlPanel();
        	} else if ($scope.actionCurrentStep == 4) {
        		$scope.actionCurrentStep --;
        		_recoverControlUnit();
        	}
        }

        $scope.recoverEmailContent = function() {
        	$scope.actionStepNum = 3;
        	_recoverEmailContent();
        }
        $scope.recoverActionType = function() {
        	_recoverActionType();
        }
        $scope.recoverEmail = function() {
        	$scope.actionStepNum = 3;
        	_recoverEmail();
        }

        function _wrapRule() {
			var properties = {};
			if ($scope.actionTypeOption.value == "EMAIL") {
				properties.content = $scope.emailContent;
				properties.address = $scope.emailAddress;
			}
			else if ($scope.actionTypeOption.value == "SHARE") {
				properties.data = $scope.shareContent;
				properties.accounts = [];
				if ($scope.checkedWeiboSocial) {
					properties.accounts.push($scope.weiboAccount);
				} else if ($scope.checkedQzoneSocial) {
					properties.accounts.push($scope.qzoneAccount);
				}
			} 
			else if ($scope.actionTypeOption.value == "PUSH") {
				properties.device_name = $scope.controlDevice.title;
				properties.device_id = $scope.controlDevice.value;
				properties.unit_name = $scope.controlUnit.label;
				properties.panel_name = $scope.controlPanel.label;
				properties.element_label = $scope.controlElement.label;

				properties.path = $scope.deviceControlData.path;
				properties.value = $scope.deviceControlData.value;
				properties.value_label = $scope.deviceControlData.label;
			}

			$scope.rule = {
				jsonText: {
					action: {
						actionType: $scope.actionTypeOption.value,
						properties: properties
					},
					triggers: $scope.triggerArr
				}
			};
		}

		$scope.addRule = function() {
			_wrapRule();
			mylinkxProvider.addRule($scope.rule).success(function(ret) {
				misc.resultDelegate(ret, function() {
					ob.publish('event.alert.pull', {
						type: 'success',
						message: $window.i18n('rule_add_success')
					});
					$location.path("user_mylinkx/rulelist");
				}, function() {
				});
			}).error(function() {
				ob.publish('event.alert.pull', {
					type: 'danger',
					message: 'Error occurred on server!'
				});
				$location.path("user_mylinkx/rulelist");
			});
		}
		$scope.cancelAddRule = function() {
			$location.path("user_mylinkx/rulelist");
		}

		$scope.checkedWeiboSocial = false;
		$scope.checkedQzoneSocial = false;
		$scope.checkSocial = function(type) {
			if (type == 'weibo') {
				if ($scope.hasWeiboPermission) {
					$scope.checkedWeiboSocial = !$scope.checkedWeiboSocial;
				} else {
					$scope.provider = "weibo";
					$scope.openWin4BindSocialAccount();
				}
			} else if (type == 'qzone') {
				if ($scope.hasQzonePermission) {
					$scope.checkedQzoneSocial = !$scope.checkedQzoneSocial;
				} else {
					$scope.provider = "qzone";
					$scope.openWin4BindSocialAccount();
				}
			}
		}
		function _completeCheckSocial() {
			$scope.unfoldDiv = "shareContent";
        	$scope.actionCurrentStep = 3;
			if ($scope.checkedWeiboSocial) {
				var $active = $(".share-weibo");
				var posX = $active.position().left,
        			posY = $active.position().top;

        		$(".share-social").parent().append($active.clone().addClass("social-weibo-copy"));
        		$(".social-weibo-copy").css({
        			"position": "absolute",
        			"left": posX + "px",
        			"top": posY + "px",
        			"-webkit-transition": "all linear 0.5s"
        		});
			}
			if ($scope.checkedQzoneSocial) {
				var $active = $(".share-qzone");
				var posX = $active.position().left,
        			posY = $active.position().top;

        		$(".share-social").parent().append($active.clone().addClass("social-qzone-copy"));
        		$(".social-qzone-copy").css({
        			"position": "absolute",
        			"left": posX + "px",
        			"top": posY + "px",
        			"-webkit-transition": "all linear 0.5s"
        		});
			}

			if ($scope.checkedWeiboSocial && $scope.checkedQzoneSocial) {
				$timeout(function() {
					$(".social-weibo-copy").addClass("social-weibo-copy-both-move");
					$(".social-qzone-copy").addClass("social-qzone-copy-both-move");
				}, 20);
			} else if ($scope.checkedWeiboSocial && !$scope.checkedQzoneSocial) {
				$timeout(function() {
					$(".social-weibo-copy").addClass("social-weibo-copy-move");
				}, 20);
			} else if (!$scope.checkedWeiboSocial && $scope.checkedQzoneSocial) {
				$timeout(function() {
					$(".social-qzone-copy").addClass("social-qzone-copy-move");
				}, 20);
			}

			$timeout(function() {
				$scope.showShareContent = true;
			}, 600);
		}

		function _recoverShareSocial() {
			$scope.actionCurrentStep = 2;
			$(".social-weibo-copy").remove();
			$(".social-qzone-copy").remove();
			$scope.showShareSocial = true;
			$scope.showShareContent = false;
			$scope.unfoldDiv = "shareSocial";
			$(".checked-action-type-copy").remove();
        	$scope.showActionTypeCopy = true;
        	$scope.showWeiboSocialCopy = false;
        	$scope.showQzoneSocialCopy = false;
		}

		$scope.recoverShareSocial = function() {
			$scope.actionStepNum = 3;
			_recoverShareSocial();
			// reset social value
			$scope.checkedWeiboSocial = $scope.tempActionStore.checkedWeiboSocial;
			$scope.checkedQzoneSocial = $scope.tempActionStore.checkedQzoneSocial;

			// clear email part
			$scope.showEmailContent = false;
			$scope.showEmailAddress = false;
		}
		$scope.recoverShareContent = function() {
			$scope.actionStepNum = 3;
			$scope.actionCurrentStep = 3;
			// action type part
			$(".checked-action-type-copy").remove();
			$scope.showActionTypeCopy = true;

			// share social part
			$scope.showShareSocial = true;
			if ($scope.checkedWeiboSocial) {
				$scope.showWeiboSocialCopy = true;
			}
			if ($scope.checkedQzoneSocial) {
				$scope.showQzoneSocialCopy = true;
			}

			// share content part
			$scope.showShareContent = true;
			$scope.unfoldDiv = "shareContent";

			// clear email part
			$scope.showEmailContent = false;
			$scope.showEmailAddress = false;
		}

		$scope.checkControlDevice = function(index) {
			$scope.checkedControlDeviceIndex = index;
			$scope.controlDevice = $scope.controlDevices[index];
		}

		function _completeControlDevice() {
			var $active = $(".control-device-item-active");
			var posX = $active.position().left,
				posY = $active.position().top;
			$(".control-device-body").parent().append($active.clone().addClass("control-device-copy"));
			
			$(".control-device-copy").css({
				"position": "absolute",
				"left": posX + "px",
				"top": posY + "px",
				"-webkit-transition": "all linear 0.5s"
			});
			$timeout(function() {
				$(".control-device-copy").addClass("control-device-copy-move");
				if ($scope.checkedControlDeviceIndex > 1) {
					$(".control-device-copy-move").css("margin-top", "0px");
				}
				if ($scope.checkedControlDeviceIndex % 2 == 0) {
					$(".control-device-copy-move").css("margin-left", "10px");
				}
			}, 20);

			$scope.changeControlDevice($scope.realAction);
			// $scope.actionCurrentStep = 3;
			$scope.unfoldControlDevice = false;
			$scope.unfoldControlUnit = true;
			$timeout(function() {
				$scope.showControlUnit = true;
			}, 600);
		}

		function _recoverControlDevice() {
			// recover control device unit
			// $scope.actionCurrentStep = 2;
			$scope.unfoldControlDevice = true;
			$scope.showControlDeviceCopy = false;
			$(".control-device-copy").remove();

			// keep data
			if (!!$scope.tempActionStore) {
				$scope.controlDevices = $scope.tempActionStore.controlDevices;
				$scope.controlDevice = $scope.tempActionStore.controlDevice;
				$scope.checkedControlDeviceIndex = $scope.tempActionStore.checkedControlDeviceIndex;
			}

			// clear control unit part
			$scope.showControlUnit = false;
		}

		$scope.checkControlUnit = function(index) {
			$scope.checkedControlUnitIndex = index;
			$scope.controlUnit = $scope.controlDevice.units[index];
		}

		function _completeControlUnit() {
			var $active = $(".control-unit-item-active");
			var posX = $active.position().left,
				posY = $active.position().top;
			$(".control-unit-body").parent().append($active.clone().addClass("control-unit-copy"));
			
			$(".control-unit-copy").css({
				"position": "absolute",
				"left": posX + "px",
				"top": posY + "px",
				"-webkit-transition": "all linear 0.5s"
			});
			$timeout(function() {
				$(".control-unit-copy").addClass("control-unit-copy-move");
				if ($scope.checkedControlUnitIndex > 1) {
					$(".control-unit-copy-move").css("margin-top", "0px");
				}
				if ($scope.checkedControlUnitIndex % 2 == 0) {
					$(".control-unit-copy-move").css("margin-left", "10px");
				}
			}, 20);

			// $scope.actionCurrentStep = 4;

			$scope.changeControlUnit($scope.realAction);
			$scope.unfoldControlDevice = false;
			$scope.unfoldControlUnit = false;
			$scope.unfoldControlPanel = true;

			$timeout(function() {
				$scope.showControlPanel = true;
			}, 600);
		}

		function _recoverControlUnit() {
			// recover control unit part
			// $scope.actionCurrentStep = 3;
			$scope.unfoldControlUnit = true;
			$scope.showControlUnitCopy = false;
			$(".control-unit-copy").remove();

			// keep data
			if (!!$scope.tempActionStore) {
				$scope.controlUnit = $scope.tempActionStore.controlUnit;
				$scope.controlDevice = $scope.tempActionStore.controlDevice;
				$scope.checkedControlUnitIndex = $scope.tempActionStore.checkedControlUnitIndex;
			}

			// clear control panel part
			$scope.showControlPanel = false;
		}

		$scope.checkControlPanel = function(index) {
			$scope.checkedControlPanelIndex = index;
			$scope.controlPanel = $scope.controlUnit.panels[index];
		}

		function _completeControlPanel() {
			var $active = $(".control-panel-item-active");
			var posX = $active.position().left,
				posY = $active.position().top;
			$(".control-panel-body").parent().append($active.clone().addClass("control-panel-copy"));
			
			$(".control-panel-copy").css({
				"position": "absolute",
				"left": posX + "px",
				"top": posY + "px",
				"-webkit-transition": "all linear 0.5s"
			});
			$timeout(function() {
				$(".control-panel-copy").addClass("control-panel-copy-move");
				if ($scope.checkedControlPanelIndex > 1) {
					$(".control-panel-copy-move").css("margin-top", "0px");
				}
				if ($scope.checkedControlPanelIndex % 2 == 0) {
					$(".control-panel-copy-move").css("margin-left", "10px");
				}
			}, 20);

			// $scope.actionCurrentStep = 5;
			// hard code
			if ($scope.controlElement.type == "button") {
				$scope.actionStepNum = 5;
				$scope.actionCurrentStep = $scope.actionStepNum;
			}

			$scope.changeControlPanel($scope.realAction);
			$scope.unfoldControlDevice = false;
			$scope.unfoldControlUnit = false;
			$scope.unfoldControlPanel = false;
			$scope.unfoldControlElement = true;

			$timeout(function() {
				$scope.showControlElement = true;
			}, 600);
		}

		function _recoverControlPanel() {
			// recover control panel part
			// $scope.actionCurrentStep = 4;
			$scope.unfoldControlPanel = true;
			$scope.showControlPanelCopy = false;
			$(".control-panel-copy").remove();

			if (!!$scope.tempActionStore) {
				$scope.controlPanel = $scope.tempActionStore.controlPanel;
				$scope.controlUnit = $scope.tempActionStore.controlUnit;
				$scope.checkedControlPanelIndex = $scope.tempActionStore.checkedControlPanelIndex;
			}

			// clear control element part
			$scope.showControlElement = false;
		}

		$scope.checkControlElement = function(index) {
			$scope.checkedControlElementIndex = index;
			$scope.controlElement = $scope.controlElements[index];
			if ($scope.controlElement.type == "button") {
				$scope.deviceControlData = {
					path: $scope.controlElement.path,
					value: "",
					label: $scope.controlElement.label
				};
			}
		}

		function _completeControlElement() {
			var $active = $(".control-element-item-active");
			var posX = $active.position().left,
				posY = $active.position().top;
			$(".control-element-body").parent().append($active.clone().addClass("control-element-copy"));
			
			$(".control-element-copy").css({
				"position": "absolute",
				"left": posX + "px",
				"top": posY + "px",
				"-webkit-transition": "all linear 0.5s"
			});
			$timeout(function() {
				$(".control-element-copy").addClass("control-element-copy-move");
				if ($scope.checkedControlElementIndex > 1) {
					$(".control-element-copy-move").css("margin-top", "0px");
				}
				 if ($scope.checkedControlElementIndex % 2 == 0) {
					$(".control-element-copy-move").css("margin-left", "10px");
				}
			}, 20);

			// $scope.actionCurrentStep = 6;

			$scope.changeControlElement($scope.realAction);
			$scope.unfoldControlDevice = false;
			$scope.unfoldControlUnit = false;
			$scope.unfoldControlPanel = false;
			$scope.unfoldControlElement = false;
			$scope.unfoldControlValue = true;

			$timeout(function() {
				$scope.showControlValue = true;
			}, 600);
		}

		function _recoverControlElement() {
			// recover control element part
			// $scope.actionCurrentStep = 5;
			$scope.unfoldControlElement = true;
			$scope.showControlElementCopy = false;
			$(".control-element-copy").remove();

			if (!!$scope.tempActionStore) {
				$scope.controlElements = $scope.tempActionStore.controlElements;
				$scope.controlElement = $scope.tempActionStore.controlElement;
				$scope.checkedControlElementIndex = $scope.tempActionStore.checkedControlElementIndex;
			}

			// clear control value part
			$scope.showControlValue = false;
		}

		$scope.checkControlValue = function(index) {
			$scope.checkedControlValueIndex = index;
			$scope.controlValue = $scope.controlElement.constraint[index];
			if ($scope.controlElement.type == "spinner_enum") {
				$scope.deviceControlData = {
					path: $scope.controlElement.path,
					value: $scope.controlValue.value,
					label: $scope.controlValue.label
				};
			}
		}

		$scope.recoverControlValue = function() {
			$scope.actionStepNum = 6;
			//recover control value part
			$scope.actionCurrentStep = 6;
			$scope.showControlValue = true;
			$scope.unfoldControlValue = true;

			// keep control element part
			$scope.showControlElement = true;
			$scope.unfoldControlElement = false;
			$scope.showControlElementCopy = true;
			$(".control-element-copy").remove();

			// keep control panel part
			$scope.showControlPanel = true;
			$scope.unfoldControlPanel = false;
			$scope.showControlPanelCopy = true;
			$(".control-panel-copy").remove();

			// keep control unit part
			$scope.showControlUnit = true;
			$scope.unfoldControlUnit = false;
			$scope.showControlUnitCopy = true;
			$(".control-unit-copy").remove();

			// keep control device part
			$scope.showControlDevice = true;
			$scope.unfoldControlDevice = false;
			$scope.showControlDeviceCopy = true;
			$(".control-device-copy").remove();

			// keep action type part
			$scope.showActionTypeCopy = true;
			$scope.unfoldDiv = "";
			$(".checked-action-type-copy").remove();

			if (!!$scope.tempActionStore) {
				$scope.checkedActionType = $scope.tempActionStore.checkedActionType;
				$scope.controlDevice = $scope.tempActionStore.controlDevice;
				$scope.controlUnit = $scope.tempActionStore.controlUnit;
				$scope.controlPanel = $scope.tempActionStore.controlPanel;
				$scope.controlElements = $scope.tempActionStore.controlElements;
				$scope.controlElement = $scope.tempActionStore.controlElement;
				if ($scope.controlElement == "spinner_enum") {
					$scope.controlValue = $scope.tempActionStore.controlValue;
					$scope.checkedControlValueIndex = $scope.tempActionStore.checkedControlValueIndex;
				} else if ($scope.controlElement == "slider") {
					$scope.tempValue = $scope.tempActionStore.tempValue;
					$scope.elementTypeClass = $scope.tempActionStore.elementTypeClass;
				}
			}
		}

		$scope.recoverControlElement = function() {
			$scope.tempActionStore.controlElement.type
				== "button" ? $scope.actionStepNum = 5
				: $scope.actionStepNum = 6;
			// clear control value part
			$scope.showControlValue = false;

			// recover control element part
			$scope.actionCurrentStep = 5;
			$scope.showControlElement = true;
			$scope.unfoldControlElement = true;
			$scope.showControlElementCopy = false;
			$(".control-element-copy").remove();

			// keep control panel part
			$scope.showControlPanel = true;
			$scope.unfoldControlPanel = false;
			$scope.showControlPanelCopy = true;
			$(".control-panel-copy").remove();

			// keep control unit part
			$scope.showControlUnit = true;
			$scope.unfoldControlUnit = false;
			$scope.showControlUnitCopy = true;
			$(".control-unit-copy").remove();

			// keep control device part
			$scope.showControlDevice = true;
			$scope.unfoldControlDevice = false;
			$scope.showControlDeviceCopy = true;
			$(".control-device-copy").remove();

			// keep action type part
			$scope.showActionTypeCopy = true;
			$scope.unfoldDiv = "";
			$(".checked-action-type-copy").remove();

			if (!!$scope.tempActionStore) {
				$scope.checkedActionType = $scope.tempActionStore.checkedActionType;
				$scope.controlDevice = $scope.tempActionStore.controlDevice;
				$scope.controlUnit = $scope.tempActionStore.controlUnit;
				$scope.controlPanel = $scope.tempActionStore.controlPanel;
				$scope.controlElements = $scope.tempActionStore.controlElements;
				$scope.checkedControlElementIndex = $scope.tempActionStore.checkedControlElementIndex;
			}
		}

		$scope.recoverControlPanel = function() {
			$scope.actionStepNum = 6;
			// clear control value part
			$scope.showControlValue = false;

			// clear control element part
			$scope.showControlElement = false;
			$scope.showControlElementCopy = false;
			$(".control-element-copy").remove();

			// recover control panel part
			$scope.actionCurrentStep = 4;
			$scope.showControlPanel = true;
			$scope.unfoldControlPanel = true;
			$scope.showControlPanelCopy = false;
			$(".control-panel-copy").remove();

			// keep control unit part
			$scope.showControlUnit = true;
			$scope.unfoldControlUnit = false;
			$scope.showControlUnitCopy = true;
			$(".control-unit-copy").remove();

			// keep control device part
			$scope.showControlDevice = true;
			$scope.unfoldControlDevice = false;
			$scope.showControlDeviceCopy = true;
			$(".control-device-copy").remove();

			// keep action type part
			$scope.showActionTypeCopy = true;
			$scope.unfoldDiv = "";
			$(".checked-action-type-copy").remove();
			
			if (!!$scope.tempActionStore) {
				$scope.checkedActionType = $scope.tempActionStore.checkedActionType;
				$scope.controlDevice = $scope.tempActionStore.controlDevice;
				$scope.controlUnit = $scope.tempActionStore.controlUnit;
				$scope.controlPanel = $scope.tempActionStore.controlPanel;
				$scope.checkedControlPanelIndex = $scope.tempActionStore.checkedControlPanelIndex;
			}
		}

		$scope.recoverControlUnit = function() {
			$scope.actionStepNum = 6;
			// clear control value part
			$scope.showControlValue = false;

			// clear control element part
			$scope.showControlElement = false;
			$scope.showControlElementCopy = false;
			$(".control-element-copy").remove();

			// clear control panel part
			$scope.showControlPanel = false;
			$scope.showControlPanelCopy = false;
			$(".control-panel-copy").remove();

			// recover control unit part
			$scope.actionCurrentStep = 3;
			$scope.showControlUnit = true;
			$scope.showControlUnitCopy = false;
			$scope.unfoldControlUnit = true;
			$(".control-unit-copy").remove();

			//keep control device part
			$scope.showControlDevice = true;
			$scope.unfoldControlDevice = false;
			$scope.showControlDeviceCopy = true;
			$(".control-device-copy").remove();

			// keep action type part
			$scope.showActionTypeCopy = true;
			$scope.unfoldDiv = "";
			$(".checked-action-type-copy").remove();

			if (!!$scope.tempActionStore) {
				$scope.checkedActionType = $scope.tempActionStore.checkedActionType;
				$scope.controlDevice = $scope.tempActionStore.controlDevice;
				$scope.controlUnit = $scope.tempActionStore.controlUnit;
				$scope.checkedControlUnitIndex = $scope.tempActionStore.checkedControlUnitIndex;
			}
		}

		$scope.recoverControlDevice = function() {
			$scope.actionStepNum = 6;
			// clear control value part
			$scope.showControlValue = false;

			// clear control element part
			$scope.showControlElement = false;
			$scope.showControlElementCopy = false;
			$(".control-element-copy").remove();

			// clear control panel part
			$scope.showControlPanel = false;
			$scope.showControlPanelCopy = false;
			$(".control-panel-copy").remove();

			// clear control unit part
			$scope.showControlUnit = false;
			$scope.showControlUnitCopy = false;
			$(".control-unit-copy").remove();

			//recover control device part
			$scope.actionCurrentStep = 2;
			$scope.showControlDevice = true;
			$scope.unfoldControlDevice = true;
			$scope.showControlDeviceCopy = false;
			$(".control-device-copy").remove();

			// keep action type part
			$scope.showActionTypeCopy = true;
			$scope.unfoldDiv = "";
			$(".checked-action-type-copy").remove();

			if (!!$scope.tempActionStore) {
				$scope.checkedActionType = $scope.tempActionStore.checkedActionType;
				$scope.controlDevices = $scope.tempActionStore.controlDevices;
				$scope.controlDevice = $scope.tempActionStore.controlDevice;
				$scope.checkedControlDeviceIndex = $scope.tempActionStore.checkedControlDeviceIndex;
			}
		}

	}])
});