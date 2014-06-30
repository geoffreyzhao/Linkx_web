define(['./directives'], function(directives) {
    'use strict';

    directives.directive('lightbox', ['$timeout',
    function($timeout) {

        var config = _config,
            util = _util;
        return {
            templateUrl: config.partials.light_box,
            restrict: 'A',
            scope:{
                imageBaseUrl:'=baseurl'
            },
            link : function(scope, element, attrs) {

                var _cutPic = [];
                function appendSuffix(str, suffix) {
                    var len;
                    str = str || '';
                    len = str.lastIndexOf(".");
                    return (len == -1) ? str : (str.substring(0,len) + suffix + str.substring(len));
                }

                scope.$on('close-light-box', function () {
                  if(!!scope.flag && !!scope.showImageSelectArea) {
                    _cleanUploadHandler();
                  }
                  scope.showImageSelectArea = false;
                  scope.photos = {
                      original: [],
                      thumb: []
                  };
                });

                function _carouselHandler(e) {
                  var index = parseInt(e.relatedTarget.innerText,10),
                      _$indicators = $(".light-box .carousel-indicators"),
                      _targetOffset = 103 * (index + 1),
                      _step = parseInt(($(".light-box .carousel-light-box").width() + "").replace("px", ""), 10) - 150,
                      _times;
                  (_step <= 0) ? (_times = 0) : (_times = parseInt((_targetOffset / _step), 10));
                  _$indicators.css('left', -(_step * _times) + "px");
                }

                scope.delCurrentCover = function () {
                  scope.delCoverFade = false;
                  scope.$emit('del-cover-in-light-box', scope.delIndex, scope.paths);
                }

                scope.cancelDelCover = function () {
                  scope.delCoverFade = false;
                }

                scope.delCurrentCoverConfirm = function (index) {
                  scope.delCoverFade = true;
                  scope.delIndex = index;
                }

                scope.$on('prepard-for-lightbox', function (p, index, paths, flag) {
                    var _bLenFlag = !!paths && !!paths.length;
                    if(!!scope.showImageSelectArea) {
                      _cleanUploadHandler();
                    }
                    scope.showImageSelectArea = false;
                    scope.flag = !!flag;
                    scope.photos = {
                        original: [],
                        thumb: []
                    };

                    if(_bLenFlag) {
                        $.each(paths, function (i, v){
                            scope.photos.original.push(scope.imageBaseUrl + appendSuffix(v, "_l"));
                            scope.photos.thumb.push(scope.imageBaseUrl + appendSuffix(v, "_s"));
                        });

                        $(".light-box .carousel-light-box").wait(function() {
                          this.carousel({
                            interval: (!!flag ? false : 5000)
                          });
                          this.carousel(index);
                          _carouselHandler({
                            relatedTarget: {
                              innerText: index
                            }
                          });

                          if(!!flag) {
                            $(".light-box .carousel-indicators").css("width", (103 * (paths.length + 1)) + "px");
                          } else {
                            $(".light-box .carousel-indicators").css("width", 103 * paths.length + "px");
                          }
                          this.on('slide.bs.carousel', _carouselHandler);
                        });
                    }
                    $timeout(function () {
                      $(".light-box-original.ng-leave").remove();
                    }, 200);
                });

                scope.thumbBack = function () {
                  var _$indicators = $(".light-box .carousel-indicators"),
                      _left = parseInt((_$indicators.css('left') + "").replace("px", ""), 10),
                      _step = parseInt(($(".light-box .carousel-light-box").width() + "").replace("px", ""), 10) - 150;
                  if(_left == 0) {
                    return ;
                  }
                  _$indicators.css('left', (_left + _step) + "px");
                }

                scope.thumbForward = function () {
                  var _$indicators = $(".light-box .carousel-indicators"),
                      _left = parseInt((_$indicators.css('left') + "").replace("px", ""), 10),
                      _step = parseInt(($(".light-box .carousel-light-box").width() + "").replace("px", ""), 10) - 150;
                  if((_step - _left) >= parseInt(((_$indicators.width() + "").replace("px", "")), 10)) {
                    return ;
                  }
                  _$indicators.css('left', (_left - _step) + "px");
                }

                function _handler(ow, oh, w, h, nw) {
                    var initSelection = {
                            width:nw,
                            height:(2/3)*nw,
                            x1:0,
                            y1:0
                        };
                    function preview(img, selection){
                        _cutPic = [];
                        var scaleX = 300 / (selection.width || 1),
                            scaleY = 200 / (selection.height || 1);
                        var _wRate = ow / w,
                            _hRate = oh / h,
                            _tempW = parseInt(selection.width * _wRate),
                            _tempH = parseInt(selection.height * _hRate),
                            _tempY = parseInt(selection.y1 * _wRate);
                        _cutPic.push({
                            width: _tempW,
                            height: _tempH,
                            leftX: parseInt(selection.x1 * _wRate),
                            leftY: _tempY,
                            imageSuffix: '_l'
                        });
                        _cutPic.push({
                            width: _tempH,
                            height: _tempH,
                            leftX: parseInt((selection.x1 + selection.width / 6) * _wRate),
                            leftY: _tempY,
                            imageSuffix: '_s'
                        });
                    }
                    $('.original-photo').imgAreaSelect({
                        remove:true
                    });
                    $(".original-photo").imgAreaSelect({
                        aspectRatio: '3:2',
                        handles: true,
                        autoHide: false,
                        show:false,
                        minHeight:60,
                        minWidth:90,
                        x1: initSelection.x1,
                        y1: initSelection.y1,
                        x2: initSelection.x1 + initSelection.width,
                        y2: initSelection.y1 + initSelection.height,
                        parent: '.original-photo-container .light-box-original',
                        onSelectChange: preview
                    });
                    preview(null,initSelection);
                }

                function _cleanUploadHandler() {
                    var $originalPhoto = $(".original-photo-container .original-photo"),
                        $fileForm = $(".carousel-indicators .upload-img-form"),
                        $fileForm2 = $(".device-add-cover-container .light-box-original .upload-img-form");
                    $fileForm[0].reset();
                    if($fileForm2.length > 0) {
                      $fileForm2[0].reset();
                    }
                    $originalPhoto.imgAreaSelect({
                        remove: true
                    });
                    $originalPhoto.attr("src", null);
                    $originalPhoto.removeAttr("style");
                }

                scope.$on("show-img-area-select-device-img", function(ev, url) {
                  if(!scope.$$phase && !scope.$root.$$phase) {
                    scope.$apply(function() {
                      scope.showImageSelectArea = true;
                    });
                  } else {
                    scope.showImageSelectArea = true;
                  }

                  _cutPic = [];

                  $(".original-photo-container .original-photo").wait(function () {
                    this.attr('src', url);
                    util.reDrawImg($(".original-photo-container .light-box-original"), this, url, _handler);
                  });
                });

                scope.cutImage = function () {
                  if(!scope.$$phase && !scope.$root.$$phase) {
                    scope.$apply(function() {
                      scope.$emit('upload-device-cover-cut', _cutPic);
                    });
                  } else {
                    scope.$emit('upload-device-cover-cut', _cutPic);
                  }
                }

                scope.cancelCutImage = function () {
                  _cleanUploadHandler();
                  if(!scope.$$phase && !scope.$root.$$phase) {
                    scope.$apply(function() {
                      scope.showImageSelectArea = false;
                    });
                  } else {
                    scope.showImageSelectArea = false;
                  }
                }
            }
        }
    }]);
});

