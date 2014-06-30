define([
    '../controllers'
], function(controllers) {
    'use strict';

    controllers.controller('user_registerCtrl', [
    '$scope',
    '$location',
    'userProvider',
    'store',
    'ob',
    function($scope, $location, userProvider, store, ob) {

        var util = _util,
            misc = util.misc;

        $scope.form = {
            email: '',
            username: '',
            password: '',
            repassword: '',
            verifycode: '',
            code: _generateCode(),
            rules: true
        };

        $scope.verifyField = function (e) {
            var _reg,
                _bFlag,
                _val = e.target.value;
            switch(e.target.id) {
                case "email":
                    _reg = /\w+[@]{1}\w+[.]\w+/;
                    _bFlag = _reg.test(_val);
                    if(!!_bFlag) {
                        $("#username").toggleClass('error', false);
                    }
                    break;
                case "password":
                    _reg = /^\w{6,20}$/;
                    _bFlag = _reg.test(_val);
                    var _v = $("#repassword").val();
                    if(!_bFlag && !!_v) {
                        $("#repassword").toggleClass('error', true);
                    }
                    if(!!_bFlag && !!_v && (_v != _val)) {
                        $("#repassword").toggleClass('error', true);
                        _bFlag = false;
                    }
                    if(!!_bFlag && !!_v && (_v == _val)) {
                        $("#repassword").toggleClass('error', false);
                    }
                    break;
                case "repassword":
                    _reg = /^\w{6,20}$/;
                    _bFlag = _reg.test(_val);
                    var _v = $("#password").val();
                    _bFlag = _bFlag && (_v == _val);
                    if(!!_bFlag) {
                        $("#password").toggleClass('error', false);
                    }
                    break;
                case "username":
                    _bFlag = !!($.trim(_val));
                    break;
                case "verifycode":
                    _bFlag = ($scope.form.verifycode.toLowerCase() === $scope.form.code.toLowerCase());
                    break;
            }
            $(e.target).toggleClass('error', !_bFlag);
        }

        $scope.register = function() {
            var data = _.pick($scope.form, 'email', 'password', 'username');

            ob.publish('event.alert.clear');
            if(!$scope.form.rules) {
                ob.publish('event.alert.pull', {
                    type: 'info',
                    message: '请先阅读并同意LinkX使用条款'
                });
                return;
            }
            // `userName` hack
            var userName = data['username'];
            delete data.username;
            data.userName = userName;

            ob.publish('event.loading.start');
            userProvider.userRegister(data)
                .success(function(ret) {
                    misc.resultDelegate(ret,
                    function() {
                        $location.url('/user_login');
                        ob.publish('event.alert.pull', {
                            type: 'success',
                            message: '注册成功，欢迎来到LinkX。'
                        });
                    }, function() {
                        ob.publish('event.alert.pull', {
                            type: 'danger',
                            message: "用户名已存在"
                        });
                    });
                    ob.publish('event.loading.stop');
                })
                .error(function () {
                    ob.publish('event.alert.pull', {
                        type: 'danger',
                        message: "服务器异常"
                    });
                    ob.publish('event.loading.stop');
                });
        };

        $scope.getDefaultUserName = function() {
            if (!$scope.form.email) {
                return;
            }
            var username = $scope.form.email.match(/.+@/);
            username = username[0];

            if (username) {
                username = username.slice(0, username.length - 1);
                $scope.form.username = username;
            }
        };

        $scope.generateCode = function() {
            $scope.form.code = _generateCode();
        };

        function _generateCode() {
            $scope.form && ($scope.form.verifycode = '');

            var code = '',
                length = 8,
                charlist = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

            for(var i = 0;i < length; i++) {
                code += charlist.charAt(Math.floor(Math.random() * 36))[Math.floor(Math.random() * 2) === 1 ? 'toUpperCase' : 'toLowerCase']();
            }
            return code;
        }

    }]);
});
