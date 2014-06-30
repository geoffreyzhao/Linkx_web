define([
	'../../controllers',
], function(controllers) {
	'user strict';

	controllers.controller('ruleListCtrl', [
		'$scope',
		'mylinkxProvider',
		'ob',
		'$routeParams',
		'$window',
		function($scope, mylinkxProvider, ob, $routeParams,$window) {
			var config = _config,
				consts = config.consts,
				util = _util,
				misc = util.misc,
				ruleContentArr = [];

			$scope.filterRuleCondition = "";
			$scope.orderFlagByExecuteTimes = "";
			$scope.orderFlagByLastExecuteTime = "";


			ob.subscribe('event.event_mylinkx_getMyRuleList', function() {
				$scope.displayRuleList = [];
				mylinkxProvider.getMyRuleList().success(function(ret) {
					misc.resultDelegate(ret, function() {

						$scope.ruleList = ret.data;
						for (var i = 0; i < ret.data.length; i++) {

							var displayRule = {};
							displayRule.id = ret.data[i].id;
							displayRule.ruleStatus = ret.data[i].ruleStatus;
							displayRule.ruleContent = _generateRuleContent(ret.data[i]);
							displayRule.executeTimes = ret.data[i].executeTimes;
							displayRule.lastExecuteTime = convertTimestamp(ret.data[i].lastExecuteTime);
							displayRule.realLastExecuteTime = ret.data[i].lastExecuteTime;

							$scope.displayRuleList.push(displayRule);
						}
						$scope.ruleListBySearch = $scope.displayRuleList;
					}, function() {
						ob.publish('event.alert.pull', {
							type: 'danger',
							message: ret.message
						});
					});
				});
			});

			//ob.publish('event.event_mylinkx_getMyRuleList');

			function _generateRuleContent(data) {
				var ruleContent = "当 ";

				var deviceStatusTag = data.jsonText.triggers[0].device.statusTag;
				if (deviceStatusTag == "OWN") {
					ruleContent += "<b>我的设备 ";
				} else if (deviceStatusTag == "FOLLOWED") {
					ruleContent += "<b>我关注的设备 ";
				}

				ruleContent += data.jsonText.triggers[0].device.title;
				ruleContent += "</b> 监测到 <b>";
				ruleContent += data.jsonText.triggers[0].sensor.title;

				var compare = "";
				switch (data.jsonText.triggers[0].compare) {
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
				ruleContent += compare;
				ruleContent += data.jsonText.triggers[0].val + "</b>";
				ruleContent += data.jsonText.triggers[0].sensor.symbol;
				ruleContent += ", 则 <b>";

				if (data.actions[0].actionType == "EMAIL") {
					ruleContent += "发送邮件</b> ";
					ruleContent += " 内容<b>\"";
					ruleContent += data.actions[0].properties.content;
					ruleContent += "\"</b>";

					ruleContent += " 到邮箱 <b>";
					ruleContent += data.actions[0].properties.address + "</b>";
				} else if (data.actions[0].actionType == "SHARE") {
					ruleContent += "分享到</b> ";
					_.each(data.actions[0].properties.accounts, function(v) {
						if (v.provider == "weibo") {
							ruleContent += "<b>微博</b> ";
						} else if (v.provider == "qzone") {
							ruleContent += "<b>QQ空间</b> ";
						}
					});
					ruleContent += " 内容<b>\"";
					ruleContent += data.actions[0].properties.data;
					ruleContent += "\"</b>";
				} else if (data.actions[0].actionType == "PUSH") {
          ruleContent += "控制设备 ";
          ruleContent += data.actions[0].properties.device_name;
          ruleContent += "</b> 中的控制单元 <b>";
          ruleContent += data.actions[0].properties.unit_name;
          ruleContent += "</b> 中的控制面板 <b>";
          ruleContent += data.actions[0].properties.panel_name;
          if (!data.actions[0].properties.value) {
          	ruleContent += "</b>, 设置 <b>";
          	ruleContent += data.actions[0].properties.element_label + "</b>";
          } else {
	          ruleContent += "</b> 设置 <b>";
	          ruleContent += data.actions[0].properties.element_label;
	          ruleContent += "</b> 为<b>";
	          ruleContent += data.actions[0].properties.value_label + "</b>";
          }
        }
				return ruleContent;
			}

			function _filterRuleByKeyword(keyword) {
				var tempArr = _.filter($scope.displayRuleList, function(val) {
					var _aValues = _.values(val),
						_bResult = false;
					_.each(_aValues, function(v, i) {
						v = v + "";
						if ( !! v.trim() &&
							v.toLowerCase().indexOf(keyword.toLowerCase()) != -1) {

							_bResult = true;
						}
					})
					return _bResult;
				});
				return tempArr;
			}
			$scope.clearKeyword = function() {
				$scope.filterRuleCondition = "";
				$scope.filterRule();
			}

			$scope.orderRule = function(condition) {

				if (condition == "executeTimes") {

					$scope.orderFlagByLastExecuteTime = "";

					if ($scope.orderFlagByExecuteTimes == "") {
						$scope.orderFlagByExecuteTimes = "desc";

						$scope.ruleListBySearch = _.sortBy($scope.ruleListBySearch, function(rule) {
							return rule.executeTimes;
						}).reverse();
					} else {

						$scope.orderFlagByExecuteTimes == "desc" ? $scope.orderFlagByExecuteTimes = "asc" :
							$scope.orderFlagByExecuteTimes = "desc";

						if ($scope.orderFlagByExecuteTimes == "desc") {
							$scope.ruleListBySearch = _.sortBy($scope.ruleListBySearch, function(rule) {
								return rule.executeTimes;
							}).reverse()
						} else if ($scope.orderFlagByExecuteTimes == "asc") {
							$scope.ruleListBySearch = _.sortBy($scope.ruleListBySearch, function(rule) {
								return rule.executeTimes;
							});
						}

					}

				} else if (condition == "lastExecuteTime") {

					$scope.orderFlagByExecuteTimes = "";

					if ($scope.orderFlagByLastExecuteTime == "") {
						$scope.orderFlagByLastExecuteTime = "desc";

						$scope.ruleListBySearch = _.sortBy($scope.ruleListBySearch, function(rule) {
							return rule.realLastExecuteTime;
						}).reverse();
					} else {

						$scope.orderFlagByLastExecuteTime == "desc" ? $scope.orderFlagByLastExecuteTime = "asc" :
							$scope.orderFlagByLastExecuteTime = "desc";

						if ($scope.orderFlagByLastExecuteTime == "desc") {
							$scope.ruleListBySearch = _.sortBy($scope.ruleListBySearch, function(rule) {
								return rule.realLastExecuteTime;
							}).reverse();
						} else if ($scope.orderFlagByLastExecuteTime == "asc") {
							$scope.ruleListBySearch = _.sortBy($scope.ruleListBySearch, function(rule) {
								return rule.realLastExecuteTime;
							});
						}
					}
				} else {

					/**
						default order by rule id(create time) desc
					*/
					$scope.orderFlagByExecuteTimes = "";
					$scope.orderFlagByLastExecuteTime = "";

					$scope.ruleListBySearch = _.sortBy($scope.ruleListBySearch, function(rule) {
						return rule.id;
					}).reverse();
				}
			}

			function _keepOrderRule(ruleList) {
				if ($scope.orderFlagByExecuteTimes == "desc") {
					return _.sortBy(ruleList, function(rule) {
						return rule.executeTimes;
					}).reverse();
				} else if ($scope.orderFlagByExecuteTimes == "asc") {
					return _.sortBy(ruleList, function(rule) {
						return rule.executeTimes;
					});
				} else if ($scope.orderFlagByLastExecuteTime == "desc") {
					return _.sortBy(ruleList, function(rule) {
						return rule.realLastExecuteTime;
					}).reverse();
				} else if ($scope.orderFlagByLastExecuteTime == "asc") {
					return _.sortBy(ruleList, function(rule) {
						return rule.realLastExecuteTime;
					});
				} else {
					return _.sortBy(ruleList, function(rule) {
						return rule.id;
					}).reverse();
				}
			}

			$scope.filterRule = function() {
				var condition = $scope.filterRuleCondition;
				if (condition.trim() != "") {
					$scope.ruleListBySearch = _keepOrderRule(_filterRuleByKeyword(condition));
				} else {
					$scope.ruleListBySearch = _keepOrderRule($scope.displayRuleList);
				}
			}

			$scope.filterRuleByKeypress = function(event) {
				if (event.keyCode == 13) {
					$scope.filterRule();
				}
			}

			function convertTimestamp(t) {
				if ( !! t) {
					var d = new Date(t);
					var month = d.getMonth() + 1;
					var date = d.getDate();
					var hour = d.getHours();
					var minute = d.getMinutes();
					var second = d.getSeconds();

					month = month < 10 ? "0" + month : month;
					date = date < 10 ? "0" + date : date;
					hour = hour < 10 ? "0" + hour : hour;
					minute = minute < 10 ? "0" + minute : minute;
					second = second < 10 ? "0" + second : second;

					return month + "/" + date + " " + hour + ":" + minute + ":" + second;
				} else {
					return "";
				}
			}

			ob.subscribe('event_mylinkx_clearKeyword', function() {
				$scope.filterRuleCondition = "";
			});

			ob.subscribe('event_mylinkx_resetRuleListOrder', function() {
				$scope.orderFlagByExecuteTimes = "";
				$scope.orderFlagByLastExecuteTime = "";
				var arr = $scope.ruleListBySearch;

				$scope.ruleListBySearch = _.sortBy(arr, function(rule) {
					return rule.id;
				}).reverse();
			});

			$scope.delRule = function(id) {
				mylinkxProvider.delRule({
					ruleId: id
				}).success(function(ret) {
					misc.resultDelegate(ret, function() {
						ob.publish('event.sucess.pull', {
							type: 'sucess',
							message: $window.i18n('rule_del_success')
						});
						ob.publish("event.event_mylinkx_getMyRuleList");
						ob.publish("event_mylinkx_clearKeyword");
						ob.publish("event_mylinkx_resetRuleListOrder");

					}, function() {
						ob.publish('event.alert.pull', {
							type: 'danger',
							message: ret.message
						});
					});
				});
			}

			$scope.prepareDel = function(id) {
				$scope.readyDeleteRule = _.findWhere($scope.ruleListBySearch, {
					id: id
				});
			}

            var category = $routeParams.category,
                detailId = $routeParams.detailId;
            if((category == "rulelist") && !detailId) {
                ob.publish('event.event_mylinkx_getMyRuleList');
            }
		}
	])
});