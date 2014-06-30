define(['../controllers'], function(controllers) {
    'use strict';

    controllers.controller('homepageCtrl', [
    '$scope',
    'store',
    'ob',
    function($scope, store, ob) {

        var userInfo = angular.fromJson(store.get('user_info')),
            naviStatus = {};

        ob.publish('event.navi.update', {
            signin: !!userInfo,
            homepage: true,
            userName: !!userInfo ? userInfo.userName : ''
        });


    }]);
});
