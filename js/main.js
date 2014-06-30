'use strict';

require.config({

    paths: {
        'jquery': '../vendor/jquery/jquery-1.11.1',
        'underscore': '../vendor/underscore/underscore',

        // 'angular': '../vendor/angular/angular',
        // 'ng-route': '../vendor/angular/angular-route',
        // 'ng-cookies': '../vendor/angular/angular-cookies',
        // 'ng-animate': '../vendor/angular/angular-animate',
        'angular': '../vendor/angular-1.3.0-beta.8/angular',
        'ng-route': '../vendor/angular-1.3.0-beta.8/angular-route',
        'ng-cookies': '../vendor/angular-1.3.0-beta.8/angular-cookies',
        'ng-animate': '../vendor/angular-1.3.0-beta.8/angular-animate',

        'domReady': '../vendor/requirejs/domReady',
        'bootstrap': '../vendor/bootstrap3/js/bootstrap',

        'angular-strap': '../vendor/angular-strap/angular-strap', // this directive plugin will not be used in this app
        'jquery-i18n': '../vendor/jquery.i18n.properties/jquery.i18n.properties.custom',
        'jquery-slider': '../vendor/jquery.ui/js/jquery-ui-1.10.4.custom.min',
        'jquery-easing': '../vendor/jquery.supersized/js/jquery.easing.min',
        'jquery-supersized-shutter': '../vendor/jquery.supersized/js/supersized.shutter.min',
        'jquery-supersized': '../vendor/jquery.supersized/js/supersized.3.2.7',
        'jquery-img-area-select': '../vendor/jquery.imgAreaSelect/js/jquery.imgareaselect',

        'echarts':'../vendor/echarts/echarts-original',
        'echarts/chart/bar' : '../vendor/echarts/echarts-original',
        'echarts/chart/line': '../vendor/echarts/echarts-original',

        'bootstrap-datetimepicker': '../vendor/bootstrap3/js/bootstrap-datetimepicker',


        'jquery-extends': '../vendor/jquery/jquery-extends'
        // 'echarts/chart/map' : '../vendor/echarts/echarts'

    },

    shim: {
        'angular': {
            exports: 'angular'
        },
        'ng-route': {
            deps: ['angular']
        },
        'ng-cookies': {
            deps: ['angular']
        },
        'ng-animate': {
            deps: ['angular']
        },

        'underscore': {
            exports: '_'
        },
        'angular-strap': { // this directive plugin will not be used in this app
            deps: ['angular', 'jquery', 'bootstrap']
        },
        'bootstrap': {
            deps: ['jquery']
        },
        'jquery-slider': {
            deps: ['jquery']
        },
        'jquery-easing': {
            deps: ['jquery']
        },
        'jquery-supersized': {
            deps: ['jquery', 'jquery-easing']
        },
        'jquery-supersized-shutter': {
            deps: ['jquery', 'jquery-supersized']
        },
        'jquery-img-area-select': {
            deps: ['jquery']
        },
        'bootstrap-datetimepicker': {
            deps: ['jquery']
        },
        'jquery-extends': {
            deps: ['jquery']
        }
    },

    deps: [
        // kick start application... see bootstrap.js
        './boot'
    ]
});