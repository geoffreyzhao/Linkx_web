define([
    'require',
    'angular',
    './vendor',     // load third-party labraries or plugins
    './config',
    './util',
    'app',          // load angular application
    'routes'        // load router configuration
], function (require, ng) {
    'use strict';

    /*
     * place operations that need to initialize prior to app start here
     * using the `run` function on the top-level module
     */

    require(['domReady!'], function (document) {
        ng.bootstrap(document, ['linkxapp']);
    });
});