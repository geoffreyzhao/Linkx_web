define([
    '../controllers'
], function(controllers) {
    'use strict';

    controllers.controller('get_passwordCtrl', [
    '$scope',
    'userProvider',
    function($scope, userProvider) {

        $scope.getPassword = function() {
            // TODO
            userProvider.getPassword($scope.email);
        };
    }]);
});
