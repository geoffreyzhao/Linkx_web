/*
 * include mainController and user's controller
 *
 * */

controllers.controller('mainController', ['$scope', '$http', 'ngI18nResourceBundle', 'ngI18nConfig', 'dataPoolServ',
function($scope, $http, ngI18nResourceBundle, ngI18nConfig, dataPoolServ) {
    $scope.languages = [{
        id: "zh",
        locale: '\u4E2D\u6587'
    }, {
        id: 'en',
        locale: 'English'
    }];
    $scope.i18n= {
        language: $scope.languages[0]
    };
    //get locale language json file
    $scope.$watch('i18n.language', function (language) {
        ngI18nResourceBundle.get({
            locale: language.id
        }).success(function (resourceBundle) {
            $scope._rb = $scope.resourceBundle = resourceBundle;
            dataPoolServ.i18n.set(resourceBundle);
        });
    });

    $scope.bsAlert = {
        message: null,
        show: false,
        type: true
    };
    var bsalertElement = angular.element('#bsAlert');

    $http.get('data/message.json')
        .success(function(data, status, headers, config) {
            dataPoolServ.message.set(data);
            $scope.bsAlert.message = data;
        })
        .error(function(data, status, headers, config) {
            console.log('get ' + config.url + ' failed!');
        });
    $scope.$watch('bsAlert.message', function(msg) {
        if (!msg) {
            return;
        }
        dataPoolServ.bsAlert.add(function(data) {
            $scope.bsAlert.show = true;
            dataPoolServ.alertShow.set(true);
            $scope.bsAlert.data = {
                content: msg[data.num] + (data.append ? ' ' + data.append : '')
            };
            $scope.bsAlert.type = data.type === 'success' ? true : false;
            dataPoolServ.alertShow.get()
            && bsalertElement.slideDown(300).delay(data.timeout ? data.timeout : 2000).hide(0, function() {
                dataPoolServ.alertShow.set(false);
            });
        });
    });
    
    console.log(_);
}]);

controllers.controller('naviController', ['$scope', '$cookies', 'handleService',
function($scope, $cookies, handleService) {
    $scope.user = {};

    if(!$cookies.user) {
        $scope.user.logout = true;
        $scope.user.login = !$scope.user.logout;
    } else {
        $scope.user.userName = JSON.parse($cookies.user).userName;
        $scope.user.logout = false;
        $scope.user.login = !$scope.user.logout;
    }

    handleService.loginInfo.add(function(data) {
        $cookies.user = data.user;
        $scope.user.logout = data.logout;
        $scope.user.login = data.login;
        $scope.user.userName = data.userName;
    });
}]);

controllers.controller('loginController', ['$scope', '$location', 'dataPoolServ', 'loginService', 'handleService',
function ($scope, $location, dataPoolServ, loginService, handleService){
    $scope.form = {};
    $scope.tooltip = 'Auto login next time for one week!';

    $scope.login = function() {
        console.log($scope.form.email+"--"+$scope.form.password);
        loginService.login(
            {},
            {
                email: $scope.form.email,
                password: $scope.form.password
            },
            function (ret) {
                console.log(ret);
                if (ret.code === 200) {
                    handleService.loginInfo.set({
                        user: JSON.stringify(ret.data),
                        logout: false,
                        login: true,
                        userName: ret.data.userName
                    });
                    dataPoolServ.bsAlert.set({
                        type: 'success',
                        num: 0
                    });
                    $location.path('/home');
                } 
            },
            function (error){
                dataPoolServ.bsAlert.set({
                    type: 'error',
                    num: 1,
                    append: error.data.message
                });
            }
        );
    };
}]);

controllers.controller('registerController', ['$scope', '$location', 'registerService', 'handleService','dataPoolServ',
function($scope, $location, registerService, handleService,dataPoolServ) {
    $scope.form = {
        email: {
            data: ''
        },
        password: {
            data:'',
            passwordChanged: passwordChange,
            passwordMatched: false,
        },
        repassword: {
            data: ''
        },
        nickname: {
            data: ''
        },
        verification: {
            data: '',
            verify: verify,
            verified: false,
            generateCode: function() {
                $scope.form.verification.code = generateCode();
            },
            code: generateCode()
        },
        rules: {
            data: true
        }
    };

    function passwordChange() {
        if ($scope.form.password.data !== null && $scope.form.repassword.data !== null) {
            $scope.form.password.passwordMatched = ($scope.form.password.data === $scope.form.repassword.data) ? true : false;
        } else {
            $scope.form.password.passwordMatched = false;
        }
    };
    function verify() {
        if ($scope.form.verification.data !== null
                && $scope.form.verification.data.toLowerCase() === $scope.form.verification.code.toLowerCase()) {
            $scope.form.verification.verified = true;
        } else {
            $scope.form.verification.verified = false;
        }
    }
    function generateCode() {
        $scope.form && ($scope.form.verification.verified = false);
        var code = '',
            length = 8,
            selectChar = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for(var i = 0;i < length; i++) {
            code += selectChar.charAt(Math.floor(Math.random() * 36))[Math.floor(Math.random() * 2) === 1 ? 'toUpperCase' : 'toLowerCase']();
        }
        return code;
    }

    $scope.register = function() {
        registerService.register(
            {},
            {
                'userName': $scope.form.nickname.data,
                'nickName': $scope.form.nickname.data,
                'email': $scope.form.email.data,
                'password': $scope.form.password.data
            },
            function(ret) {
                console.log(ret);
                if (ret.code === 200){//'code' === 200
                    
                    handleService.bsAlert.set({
                        type: 'success',
                        title: 'Register Success!',
                        content: ''
                    });
                    $location.path('/login');
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

}]);

controllers.controller('logoutController', ['$scope', '$location', 'logoutService', 'handleService',
function($scope, $location, logoutService, handleService) {
    $scope.logout = function(ev) {
        if (!confirm($scope.resourceBundle.logoutConfirm)) {
            return;
        }
        logoutService.logout(
            {},
            {},
            function(ret) {
                if (ret.code === 200) {
                    handleService.loginInfo.set({
                        user: '',
                        logout: true,
                        login: false,
                        userName: ''
                    });
                    $location.path('/login');
                }
            },
            function() {
                dataPoolServ.bsAlert.set({
                    type: 'error',
                    num: 1,
                    append: error.data.message
                });
            }
        );
    };
}]);

controllers.controller('forgetController', ['$scope', '$location',
function($scope, $location) {
    $scope.getPassword = function() {
        console.log($scope.email);
    };
}]);