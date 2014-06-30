define(['./directives'], function(directives) {
    'use strict';

    directives.directive('mylinkxtags', [
                                         
    function() {

        var config = _config;
        
        return {
            templateUrl: config.partials.direc_tags,
            
            scope:{
                tags:'=value'
            },  
            link : function(scope, element, attrs) {
                scope.focusIndex = -1;
                scope.i18n = window.i18n;
                scope.addTag = function (e) {
                    if (e.which !== 1) {
                        return;
                    }
                    scope.tags.push ({
                        value:''
                    });
                    //console.info(element);
                    setTimeout(function() {
                        //console.info(element.find(".device-tags-container input").eq(scope.tags.length - 1));
                        element.find(".device-tags-container input").eq(scope.tags.length - 1).focus();
                    }, 50)
                };
                
                scope.delTag = function (index, e) {
                    if (e.which !== 1) {
                        return;
                    }
                    //console.log(index);
                    scope.tags.splice(index,1)
                };
                
                scope.changeFocus = function (index) {
                    scope.focusIndex = index;
                };

                scope.verifyTags = function(value,single) {
                    var flag = value.replace(/(^\s*)|(\s*$)|(',')/g, "") =='';
                    if (!single) {
                        return flag;
                    } 
                    if (!flag) {
                        $('#device-tags-1').removeClass('error');
                    } else {
                        $('#device-tags-1').addClass('error');
                    }
                }
            }
        }
    }]);
});

