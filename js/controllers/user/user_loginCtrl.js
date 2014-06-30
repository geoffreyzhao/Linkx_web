define([
    '../controllers'
], function(controllers) {
    'use strict';

    controllers.controller('user_loginCtrl', [
    '$scope',
    '$location',
    'userProvider',
    'store',
    'ob',
    function($scope, $location, userProvider, store, ob) {

        var util = _util,
            config = _config,
            misc = util.misc,
            consts = config.consts;

        $scope.form = {
            email: '',
            password: '',
            remember: false
        };

        $scope.login = function() {
            var data = _.pick($scope.form, 'email', 'password', 'remember');

            ob.publish('event.loading.start');
            userProvider.userLogin(data)
                .success(function(ret) {
                    misc.resultDelegate(ret,
                    function() {
                        // TODO `remember me` need to discuss
                        store.set(consts.storeKey.USER_INFO, angular.toJson(ret.data));
                        $location.path('/user_mylinkx');
                        ob.publish('event.alert.pull', {
                            type: 'success',
                            message: 'Welcome, ' + ret.data.userName
                        });
                        ob.publish('event.navi.update', {
                            signin: true,
                            homepage: false,
                            userName: ret.data.userName
                        });
                    }, function() {
                        ob.publish('event.alert.pull', {
                            type: 'danger',
                            message: ret.message
                        });
                    });
                    ob.publish('event.loading.stop');
                })
                .error(function(ex) {
                    ob.publish('event.alert.pull', {
                        type: 'danger',
                        message: 'Error occurred on server!'
                    });
                    ob.publish('event.loading.stop');
                });
        };
    }]);
});
