define(['./directives'], function(directives) {
    'use strict';
    
    directives.directive('uploadfile', [
        '$document',
        'ob',
        function($document, ob) {
            return function(scope, elem) {
                var util = _util;
                elem = $(elem);
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
                        scope.$emit("show-img-area-select-device-img", url);
                        //elem.closest("#uploadDeviceImgContainer").find(".original-photo").attr("src", url);
                        //elem.closest("#uploadDeviceImgContainer").find(".img-area-select-photo").attr("src", url);
                        //elem.closest("#uploadDeviceImgContainer").find(".img-area-select2-photo").attr("src", url);
                        //ob.publish("img-area-select-device-img", url);
                        ob.publish("upload-image-file", elem);
                    }
                });
            };
        }
    ]);

    directives.directive('redrawimg', [
        '$document',
        'ob',
        function($document, ob) {
            return {
              scope: {
                selector: '@name'
              },
              link: function(scope, elem, attrs) {
                  var util = _util,
                      url;
                  scope.selector = ("." + scope.selector) || ".device-img";
                  elem = $(elem);
                  url = attrs.ngSrc;
                  if(!!url) {
                      util.reDrawImg(elem.closest(scope.selector), elem, url);
                  }
              }
            }
        }
    ]);

});
