var app = angular.module('LinkX',
    ['LinkX.controllers', 'LinkX.directives', 'LinkX.services', 'LinkX.filters', 'ngI18n']);

app.value('ngI18nConfig', {
    //defaultLocale should be in lowercase and is required!!
    defaultLocale : 'zh',
    //supportedLocales is required - all locales should be in lowercase!!
    supportedLocales : ['zh', 'en'],
    //without leading and trailing slashes, default is i18n
    basePath : 'i18n',
    //default is false
    cache : true
});

app.config(['$routeProvider', '$httpProvider',
function($routeProvider, $httpProvider) {
    $routeProvider.when('/', {
        templateUrl: 'views/user/home.html',
        controller: 'homepageController'
    });
    $routeProvider.when('/mydevice', {
        templateUrl: 'views/device/myDevice.html',
        controller: 'myDeviceController'
    });
    $routeProvider.when('/account', {
        templateUrl: 'views/user/account.html',
        controller: 'accountController'
    });
    $routeProvider.when('/login', {
        templateUrl: 'views/login.html',
        controller: 'loginController'
    });
    $routeProvider.when('/register', {
        templateUrl: 'views/register.html',
        controller: 'registerController'
    });
    $routeProvider.when('/searchDevice', {
        templateUrl: 'views/deviceSearch/searchDevice.html',
        controller: 'searchDeviceController'
    });
    $routeProvider.when('/findDevice', {
        templateUrl: 'views/deviceSearch/findDevice.html',
        controller: 'findDeviceController'
    });
    $routeProvider.when('/forget', {
        templateUrl: 'views/forget.html',
        controller: 'forgetController'
    });
    $routeProvider.otherwise({
        redirectTo: '/'
    });
    /*
    $httpProvider.responseInterceptors.push(function($q, $rootScope) {
        return function(promise) {
            return promise.then(function(response) {
                $rootScope.request = response.config;
                return response;
            }, function(response) {
                return $q.reject(response);
            });
        };
    });
    */
}]);