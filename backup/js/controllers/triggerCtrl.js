controllers.controller('triggerController', ['$scope', 'triggerService','actionService','$cookies',
function($scope, triggerService,actionService,$cookies) {
    $scope.triggerValue = '';
    $scope.actionId = '';
    $scope.content = '';
    $scope.triggerId = 0;
    var triggerCallBack = function(ret, sensorId) {
        if(ret.code === 200) {
            $('#sensor-addTrigger' + sensorId).toggle(100);
            $('#tri_operator option[value=' + 'BIGGER' + ']').attr('selected', 'selected');
            $scope.triggerValue = '';
            $scope.actionId = '';
            $scope.content = '';
            //triggerListArray
            triggerService.list(linkx.api.listTrigger, {sersorId: sensorId}, function(ret){
                $scope.triggerListArray[sensorId] = ret.data;
            }, function(error){});
        }
    };
    $scope.addTrigger = function(sensorId) {
        var condition = $scope.triggerType;
        var symbol;
        switch(condition) {
            case 'BIGGER':
                symbol = '大于';
                break;
            case 'BIGGER_EQUAL':
                symbol = '大于等于';
                break;
            case 'SMALLER':
                symbol = '小于';
                break;
            case 'SMALLER_EQUAL':
                symbol = '小于等于';
                break;
            case 'EQUAL':
                symbol = '等于';
                break;
        }
        var myvalue = $scope.triggerValue;
        var actionId = $scope.actionId;
        var content = $scope.content;
        var myaction = {};
        myaction.id = actionId;
        var mysensor = {};
        mysensor.id = sensorId;
        var params = {
            name: '当数值' + symbol + myvalue + '时,',
            triggerType: condition,
            value: myvalue,
            message: content,
            action: myaction,
            sensor: mysensor
        };
        if($scope.triggerId != 0) {
            //alert('update');
            params['id'] = $scope.triggerId;
            triggerService.update(linkx.api.addTrigger, params, function(ret) {
                triggerCallBack(ret, sensorId);
            }, function(error){console.log(error);});
            return;
        }
        triggerService.add(linkx.api.addTrigger, params, function(ret) {
            triggerCallBack(ret, sensorId);
        }, function(error){console.log(error);});
    };

    $scope.showAddTrigger = function(sensorId) {
        actionService.list(linkx.api.getActinoListService, {apiKey: JSON.parse($cookies.user).apiKey}, function(ret) {
          $scope.actionList = ret.data;
      }, function(){alert('Action List error.');});
        $scope.triggerValue = '';
        $scope.actionId = '';
        $scope.content = '';
        $scope.triggerId = 0;
        $('#sensor-addTrigger' + sensorId).toggle(100);
    };

    $scope.showEditTrigger = function(sensorId, trigger) {
        //$('#tri_operator').val(trigger.triggerType);
        $scope.triggerId = trigger.id;
        $scope.triggerType = trigger.triggerType;
        $scope.triggerValue = trigger.value;
        $scope.actionId = trigger.actionId;
        $scope.content = trigger.message;
        $('#sensor-addTrigger' + sensorId).slideDown(100);
    };
    
    $scope.removeTrigger = function(triggerId, sensorId) {
        if(!confirm('confirm delete?')) {
            return;
        }
        triggerService.remove(linkx.api.addTrigger + '/' + triggerId, {}, function(ret) {
            triggerCallBack(ret, sensorId);
        }, function(error){console.log(error);});
    };
}]);