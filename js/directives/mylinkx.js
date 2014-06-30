define(['./directives'], function(directives) {
    'use strict';

    // Deprecated directive
    directives.directive('collapsing', [
    function() {
        return {
            link : function (scope, element, attrs) {
                scope.$watch(function() {
                    return attrs
                }, function(newValue, oldValue) {
                    console.log(newValue);
                });

                scope.$watch(attrs.collapse, function(value) {
                    console.log(value);
                });
            }
        };
    }]);

    directives.directive('collapseSwitcher', [
    function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {

                /*element.on('click', '.panel-heading', function() {
                    scope.currentCategory = $(this).attr('category');
                    scope.$eval(attrs.categoryChange);
                });*/
                element = $(element);
                element.on('click', 'a', function() {
                    element.find('.active').removeClass('active');
                    $(this).addClass('active');

                    /*scope.currentItem = $(this).attr('item');
                    scope.$eval(attrs.itemChange);*/
                });
            }
        }
    }]);
});
