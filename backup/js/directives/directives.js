var directives = angular.module('LinkX.directives',
    ['LinkX.services', '$strap.directives']);

directives.directive('list', [function($document) {
    return function(scope, elem, attrs) {
        var prevDevice;
        elem.on('click', 'li', function() {
            if (prevDevice) {
                prevDevice.removeClass('active');
            }
            $(this).addClass('active');
            prevDevice = $(this);
            //scope.selectedDevice = prevDevice.attr('name');
            //scope.$emit('updateSelectedDevice', scope.selectedDevice);
        });
    };
}]);

directives.directive('uploadAndPreview', [function($document) {
    return function(scope, elem, attrs) {
        elem.change(function() {
            var file = this.files[0],
                url = null;
            if (window.createObjectURL != undefined) {// basic
                url = window.createObjectURL(file);
            }else if (window.webkitURL != undefined) {// webkit or chrome
                url = window.webkitURL.createObjectURL(file);
            } else if (window.URL != undefined) {// mozilla(firefox)
                url = window.URL.createObjectURL(file);
            }
            console.log("objUrl = " + url);
            if (url) {
                $("#uploadImg").attr("src", url);
            }
        });
    };
}]);

directives.directive('my-select', [function($document) {
    return function(scope, elem, attrs) {
        alert('wori');
        elem.on('click', 'option', function() {
            alert('haha');
        });
    };
}]);

//split by comma
directives.directive("tags", function () {
    return {
        require:"ngModel",//NgModelController
        link:function(scope,ele,attrs,ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {//$parsers，View到Model的更新
                var index = viewValue.lastIndexOf(',');
                if(index == (viewValue.length-1)) {
                    ctrl.$setValidity("tags", false);
                } else {
                    ctrl.$setValidity("tags", true);
                    return viewValue;
                }
            });
        }
    };
});

