controllers.controller('actionController', ['$scope', 'actionService', 'dataPassService',
function($scope, actionService, dataPassService) {
    $scope.showAddAction = false;
    $scope.showDetail = false;
    $scope.selectedAction = {};
    $scope.action = {};
    $scope.actionList = {};
    $scope.isAdd = true;
    
    function clone(myObj){
        if(typeof(myObj) != 'object' || myObj == null) {
            return myObj;
        }
        var newObj = new Object();
        for(var i in myObj) {
          newObj[i] = clone(myObj[i]);
        }
        return newObj;
    }
    
    $scope.showAddActionView = function() {
        //actionService.add('v2.0/actiohehen/delete/2', {id:'hehe', name: 'delete'}, function(){alert('yes')}, function(){alert('no')});
        //actionService.remove('v2.0/actiohehen/delete/2', {id:'hehe', name: 'delete'},function(){alert('yes')}, function(){alert('no')});
        $scope.showDetail = false;
        $scope.showAddAction = true;
        $scope.action = {};
        $scope.action.type = 'EMAIL';
        $scope.isAdd = true;
    };
    $scope.showUpdateActionView = function() {
        $scope.showDetail = false;
        $scope.showAddAction = true;
        //$scope.action = $scope.selectedAction;
        $scope.action = clone($scope.selectedAction);
        $scope.isAdd = false;
    };
    $scope.hideAddActionView = function() {
        $scope.showDetail = true;
        $scope.showAddAction = false;
    };
    $scope.showDetailView = function(data) {
        $scope.showDetail = true;
        $scope.showAddAction = false;
        $scope.selectedAction = data;
    };
    $scope.getActionListCallback = function(ret) {
        if(ret.code === 200) {
            $scope.actionList = ret.data;
            $scope.selectedAction = ret.data[0];
        }
    };
}]);

controllers.controller('actionListController', ['$scope', 'actionService', 'handleService', '$cookies',
function($scope, actionService, handleService, $cookies) {
    
    var serverErrorCallback = function() {
        handleService.bsAlert.set({
            type: 'error',
            title: 'Server error when do Action Request',
            content: ret.data.message
        });
    };
    
    
    //actionService.list(linkx.api.getActinoListService, {apiKey: JSON.parse($cookies.user).apiKey}, $scope.getActionListCallback, serverErrorCallback);
    
    $scope.selectAction = function() {
        console.log(this.action);
        $scope.showDetailView(this.action);
    };

}]);

controllers.controller('actionDetailController', ['$scope', 'actionService', '$cookies', 'handleService',
function($scope, actionService, $cookies, handleService) {
    $scope.showEmail = false;
    $scope.showWeibo = false;
    $scope.showPush = false;
    $scope.$watch('selectedAction.actionType', function(obj) {
        switch(obj) {
            case 'EMAIL':
                $scope.showEmail = true;
                $scope.showWeibo = false;
                $scope.showPush = false;
                break;
            case 'WEIBO':
                $scope.showEmail = false;
                $scope.showWeibo = false;
                $scope.showPush = false;
                break;
            case 'WEBSITE_PUSHING':
                $scope.showEmail = false;
                $scope.showWeibo = false;
                $scope.showPush = true;
                break;
        }
    });
    var serverError = function() {
        handleService.bsAlert.set({
            type: 'error',
            title: 'Server is broke down',
            content: 'Please try later'
        });
    };
    $scope.removeAction = function() {
        if(!confirm('confirm remove this \"' + $scope.selectedAction.name + '\" Action?')) {
            return;
        }
        actionService.remove('v2.0/action/' + $scope.selectedAction.id, {}, function(ret){
            if(ret.code === 200) {
                handleService.bsAlert.set({
                    type: 'success',
                    title: 'Remove action success',
                    content: ''
                });
                actionService.list(linkx.api.getActinoListService, {apiKey: JSON.parse($cookies.user).apiKey}, $scope.getActionListCallback, serverError);
            }
        }, serverError);
    };
}]);

controllers.controller('actionAddController', ['$scope', 'handleService', 'actionService', '$cookies',
function($scope, handleService, actionService, $cookies) {
    $scope.types = [{value:'EMAIL', name:'电子邮件'}, {value:'WEBSITE_PUSHING', name:'网址推送'}, 
                    {value:'WEIBO', name:'分享'}];
    $scope.weibos = [{value:'SINA', name:'新浪微博'}, {value:'TECENTWEIBO', name:'腾讯微博'}, {value:'RENREN', name:'人人'}, {value:'DOUBAN', name:'豆瓣'}, {value:'QZONE', name:'QQ'}];
    $scope.showEmail = true;
    $scope.showWebsite = false;
    $scope.showWeibo = false;
    $scope.switchSensors = {};
    
    $scope.$watch('action.actionType', function(obj) {
        switch(obj) {
        case 'EMAIL':
            $scope.showEmail = true;
            $scope.showWebsite = false;
            $scope.showWeibo = false;
            break;
        case 'WEIBO':
            $scope.showEmail = false;
            $scope.showWebsite = false;
            $scope.showWeibo = true;
            $scope.action.weibo = 'SINA';
            break;
        case 'WEBSITE_PUSHING':
            $scope.showEmail = false;
            $scope.showWebsite = true;
            $scope.showWeibo = false;
            $scope.action.pushType = 'PUSHTO_SENSOR';
            break;
        }
    });
    $scope.showSensor = true;
    $scope.$watch('action.pushType', function(obj) {
        if(obj == 'PUSHTO_SENSOR') {
            $scope.showSensor = true;
        } else if(obj == 'PUSHTO_WEBSITE') {
            $scope.showSensor = false;
        }
    });
    var serverError = function() {
        handleService.bsAlert.set({
            type: 'error',
            title: 'Server is broke down',
            content: 'Please try later'
        });
    };
//    actionService.getSwitchSersor('v2.0/action/getSwitchSensors', {}, function(ret){
//        if(ret.code === 200) {
//            $scope.switchSensors = ret.data;
//        }
//    }, serverError);
    
    var currentUser = {};
    if($cookies.user) {
        currentUser.id = JSON.parse($cookies.user).id;
    }
    $scope.addAction = function() {
        var params;
        if($scope.action.actionType == 'EMAIL') {
            params = {
                    name: $scope.action.name,
                    actionType: $scope.action.actionType,
                    email: $scope.action.email,
                    user: currentUser
                };
        } else if($scope.action.actionType == 'WEIBO') {
            params = {
                    name: $scope.action.name,
                    actionType: $scope.action.actionType,
                    provider: $scope.action.weibo,
                    user: currentUser
                };
        } else if($scope.action.actionType == 'WEBSITE_PUSHING') {
            var ss = {};
            if($scope.action.switchSensor) {
                ss.id = $scope.action.switchSensor.id;//Id of the switch
                params = {
                        name: $scope.action.name,
                        actionType: $scope.action.actionType,
                        pushType: $scope.action.pushType,
                        pushWebsite: $scope.action.pushWebsite,
                        switchSensor: ss,
                        user: currentUser
                    };
            } else {
                params = {
                        name: $scope.action.name,
                        actionType: $scope.action.actionType,
                        pushType: $scope.action.pushType,
                        pushWebsite: $scope.action.pushWebsite,
                        user: currentUser
                    };
            }
        }
        
        console.log(params);
        actionService.add('v2.0/action', params, function(ret){
            if(ret.code === 200) {
                handleService.bsAlert.set({
                    type: 'success',
                    title: 'Add Action success',
                    content: ''
                });
                $scope.hideAddActionView();
                //actionService.list(linkx.api.getActinoListService, {apiKey: JSON.parse($cookies.user).apiKey}, $scope.getActionListCallback, serverError);
            }
        }, serverError);
    };
    
    $scope.updateAction = function() {
        var params;
        if($scope.action.actionType == 'EMAIL') {
            params = {
                    id: $scope.action.id,
                    name: $scope.action.name,
                    actionType: $scope.action.actionType,
                    email: $scope.action.email,
                    user: currentUser
                };
        } else if($scope.action.actionType == 'WEBSITE_PUSHING') {
            var ss = {};
            if($scope.action.switchSensor) {
                ss.id = $scope.action.switchSensor.id;//Id of the switch
                params = {
                        id: $scope.action.id,
                        name: $scope.action.name,
                        actionType: $scope.action.actionType,
                        pushType: $scope.action.pushType,
                        pushWebsite: $scope.action.pushWebsite,
                        switchSensor: ss,
                        user: currentUser
                    };
            } else {
                params = {
                        id: $scope.action.id,
                        name: $scope.action.name,
                        actionType: $scope.action.actionType,
                        pushType: $scope.action.pushType,
                        pushWebsite: $scope.action.pushWebsite,
                        user: currentUser
                    };
            }
        }
        actionService.update('v2.0/action/', params, function(ret){
            if(ret.code === 200) {
                handleService.bsAlert.set({
                    type: 'success',
                    title: 'Update Action success',
                    content: ''
                });
                $scope.hideAddActionView();
                actionService.list(linkx.api.getActinoListService, {apiKey: JSON.parse($cookies.user).apiKey}, $scope.getActionListCallback, serverError);
            }
        }, serverError);
    };
}]);