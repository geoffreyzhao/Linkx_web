define(['./services'], function(services) {
    'use strict';

    services.factory('userProvider', [
    '$window',
    '$cookieStore',
    '$location',
    'httpfactory',
    function($window, $cookieStore, $location, httpfactory) {
        var exports = {},
            config = _config,
            url = config.api.getServiceURL;

        function _userLogin(params) {
            var serviceKey = 'user_login',
                serviceUrl = url(serviceKey);

            return httpfactory.factory(serviceUrl, 'post', params);
        }

        function _userRegister(params) {
            var serviceKey = 'user_register',
                serviceUrl = url(serviceKey);

            return httpfactory.factory(serviceUrl, 'post', params);
        }

        function _userLogout() {
            var serviceKey = 'user_logout',
                serviceUrl = url(serviceKey)

            return httpfactory.factory(serviceUrl, 'get');
        }

        function _getPassword(params) {
            var serviceKey = 'get_password',
                serviceUrl = url(serviceKey),
                httpConfig = {},
                data = params;

            var deferred = $http.post(serviceUrl, data);

            return deferred;
        }

        function _setCookie(key, flag) {
            $cookieStore.put(key, flag);
        }

        function _getCookie(key) {
            return $cookieStore.get(key);
        };

        function _removeCookie(key) {
            return $cookieStore.remove(key);
        }

        function _setSession(flag) {
            $window.sessionStorage.setItem('login_status', flag);
        }

        function _getSession() {
            return $window.sessionStorage.getItem('login_status');
        }

        function _redirectHomepage() {
            $location.path('/');
        }

        function _redirectUserLogin() {
            $location.path('/user_login');
        }

        function _isLogin() {
            var isLogin = JSON.parse(_getSession()) || _getCookie('login_status');
            isLogin ? _redirectHomepage() : _redirectUserLogin();

            return isLogin;
        }

        exports = {
            userLogin: _userLogin,
            userRegister: _userRegister,
            userLogout: _userLogout,
            getPassword: _getPassword,

            setCookie: _setCookie,
            getCookie: _getCookie,
            removeCookie: _removeCookie,
            setSession: _setSession,
            getSession: _getSession,

            isLogin: _isLogin,

            redirectHomepage: _redirectHomepage,
            redirectUserLogin: _redirectUserLogin
        };

        return exports;
    }]);
});
