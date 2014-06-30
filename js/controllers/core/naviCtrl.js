define(['../controllers'], function(controllers) {
    'use strict';

    controllers.controller('naviCtrl', [
    '$scope',
    '$location',
    '$window',
    'userProvider',
    'store',
    'ob',
    function($scope, $location, $window, userProvider, store, ob) {

        /***********************************************************************
         * subscribe observer
         **********************************************************************/
        ob.subscribe('event.navi.update', _updateNavi);


        var util = _util,
            misc = util.misc,
            config = _config,
            consts = config.consts;

        $scope.user = {
            signin: false,
            homepage: true,
            userName : ''
        };
        var userInfo = angular.fromJson(store.get(consts.storeKey.USER_INFO)),
            _path = $location.path();
        if (!!userInfo && !!userInfo.userName) {
            $scope.user = {
                signin: true,
                homepage: false,
                userName : userInfo.userName
            }
            if (_path == '/') {
                $location.url('/user_mylinkx')
            };
        } else {
            if((_path != '/user_login') && (_path != '/user_register') && (_path != '/get_password')) {
                $location.path('/user_login');
            }
            ob.publish('event.navi.update', {
                signin: false,
                homepage: true,
                userName: ''
            });
        }

        $scope.gobackMylinkx = function() {
            ob.publish('event.navi.update', {
                homepage: false
            });
            $location.url('/user_mylinkx');
        };

        $scope.clearMessage = function () {
            ob.publish('event.alert.clear');
        }

        $scope.logout = function() {
            var data = _.clone(angular.fromJson(store.get('user_info')));

            data && userProvider.userLogout(data)
                .success(function(ret) {
                    misc.resultDelegate(ret,
                    function() {
                        store.set('user_info', null);
                        $location.url('/user_login');
                        ob.publish('event.navi.update', {
                            signin: false,
                            homepage: true,
                            userName: ''
                        });
                    }, function() {
                        ob.publish('event.alert.pull', {
                            type: 'danger',
                            message: ret.message
                        });
                    });
                })
                .error(function(ex) {
                    ob.publish('event.alert.pull', {
                        type: 'danger',
                        message: 'Error occurred on server!'
                    });
                });
        };

        function _updateNavi(params) {
            _.extend($scope.user, params);
        }
    }]);
});
