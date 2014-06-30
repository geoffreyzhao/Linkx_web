define(['./directives'], function(directives) {
    'use strict';

    directives.directive('deviceImageCarousel', [
    function() {

        var config = _config;
        return {
            templateUrl: config.partials.device_image_carousel,
            restrict: 'A',
            scope:{
                imgPath:'=value',
                imageBaseUrl:'=baseurl'
            },
            link : function(scope, element, attrs) {
                scope.tip = "点击查看大图";
                scope.imgPath = scope.imgPath || [];
                scope.$on('event.event_mylinkx_goto_page', function () {
                  scope.imgPath = [];
                });
                function _carouselHandler(e) {
                  scope.$apply(function () {
                    scope.currentImgIndex = $(e.relatedTarget).find("span").text();
                  });
                }
                scope.viewOriginal = function (e, i) {
                  scope.$emit('event.event_view_original', e, i);
                }
                scope.$watch('imgPath', function() {
                    scope.imgPath = scope.imgPath || [];
                    (scope.imgPath.length == 0) ? (scope.currentImgIndex = 0) : (scope.currentImgIndex = 1);
                    if(scope.imgPath.length > 0) {
                      $('.device-detail-images').wait(function() {
                        this.on('slide.bs.carousel', _carouselHandler);
                        this.carousel({
                          interval: 5000
                        });
                      })
                    }
                });
            }
        }
    }]);
});

