define(['./directives'], function(directives) {
    'use strict';

    directives.directive('loading', [
    'ob',
    function(ob) {
        return {
            replace : true,
            transclude : true,
            template :
                '<div>' +
                    '<div class="loading-icon"></div>' +
                    '<div ng-transclude class="loading-context"></div>' +
                '</div>',
            link : function(scope, element, attrs) {
                element.addClass('loading');
                element.addClass('hide');

                ob.subscribe('event.loading.start', function() {
                    element.removeClass('hide');
                });
                ob.subscribe('event.loading.stop', function() {
                    element.addClass('hide');
                });

            }
        };
    }]);
});
