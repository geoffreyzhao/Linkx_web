define(['./directives'], function(directives) {
    'use strict';

    directives.directive('navigator', [
    '$location',
    function($location) {
        return {
            restrict : 'A',
            link : function postLink(scope, element, attrs) {
                scope.$watch(function() {
                    return $location.path();
                }, function(newValue, oldValue) {
                    $('li[data-match-route]', element).each(function(k, li) {
                        var $li = angular.element(li),
                            pattern = $li.attr('data-match-route'),
                            regexp = new RegExp('^' + pattern, ['i']);

                        if (regexp.test(newValue)) {
                            //$li.addClass('active').find('.collapse.in').collapse('hide');
                            $li.addClass('active');
                        } else {
                            $li.removeClass('active');
                        }
                    });
                });
            }
        };
    }]);
});
