controllers.controller('accountController', ['$scope', 'userIdentifyService', 'coreService','dataPoolServ',
function($scope, userIdentifyService,coreService,dataPoolServ) {
//     if (!userIdentifyService.identify()) {
//         return;
//     }
	$scope.socialURL = 'v2.0/sns';
	$scope.snsImagePath= 'css/img/sns';
    $scope.showAccountMenu = 'userInfo';
     coreService.get("v2.0/user/currentUser", {}, 
             function(ret){
         $scope.currentUser = ret.data;
         },null);
     
     $scope.oper = {
         showUserInfo: function () {
             $scope.showAccountMenu = 'userInfo';
         },
         showChangePassword: function () {
             $scope.showAccountMenu = 'changePassword';
         },
     };
}]);


controllers.controller('accountInfoController', ['$scope', 'dataPoolServ',
function($scope,dataPoolServ) {
//    dataPoolServ.showAccountMenu.add (data) {
//        $scope.currentUser = data;
//    };
}]);

controllers.controller('accountMenuController', ['$scope', 'dataPoolServ', 'coreService',
function($scope,dataPoolServ,coreService) {
}]);

controllers.controller('changePasswordController', ['$scope', 'dataPoolServ', 'coreService',
function($scope,dataPoolServ,coreService) {
    $scope.form = {
        password :{
            data: ''
        },
        newpassword : {
            data: '',
            passwordMatched : false,
            passwordChange: passwordChange
        },
        repassword : {
            data: ''
        }
    };
    
    function passwordChange() {
        if ($scope.form.newpassword.data !== null && $scope.form.repassword.data !== null) {
            $scope.form.newpassword.passwordMatched = ($scope.form.newpassword.data === $scope.form.repassword.data) ? true : false;
        } else {
            $scope.form.newpassword.passwordMatched = false;
        }
    };
}]);