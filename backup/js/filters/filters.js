/*
define(['angular', 'services'], function (angular, services) {
    
    angular.module('LinkX.filters', ['LinkX.services']);
        //.filter('interpolate', ['version', function(version) {
        //    return function(text) {
        //        return String(text).replace(/\%VERSION\%/mg, version);
        //    };
        //}]);
});
*/

var filters = angular.module('LinkX.filters',
    ['LinkX.services']);