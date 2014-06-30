define([
    'angular',
    './controllers/index',
    './directives/index',
    './filters/index',
    './services/index'
], function (angular) {
    'use strict';

    return angular.module('linkxapp', [
        'linkxapp.controllers',
        'linkxapp.directives',
        'linkxapp.filters',
        'linkxapp.services',
        'ngRoute',
        'ngCookies',
        'ngAnimate'
        /*'$strap.directives'*/
    ]);
});

