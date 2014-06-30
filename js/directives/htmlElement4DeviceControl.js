define(['./directives'], function(directives) {
    'use strict';

    directives.directive('linkxSpinner', ['ob',
      function(ob) {

          var config = _config;
          return {
              restrict: 'A',
              replace: true,
              scope:{
                  options:'=',
                  class:'@',
                  path:'=',
                  value:'@',
                  abc:'='
              },
              link: function (scope, element, attrs) {
                var $target = $("."+scope.class);
                $target.wait(function () {
                  (!!scope.value) ? "" : (scope.value = scope.abc);
                  this.empty();
                  for(var i = 0, len = scope.options.length; i < len; ++i) {
                    this.append("<option value='"+scope.options[i].value+"'>"+scope.options[i].label+"</option>");
                  }
                  element.on('change', function () {
                    scope.$emit('event.device_control_select_value_change', {
                      name: scope.class,
                      label: $(this.selectedOptions).text(),
                      value: $(this).val(),
                      path: scope.path
                    });
                  });
                  if(!!scope.value) {
                    element.val(scope.value);
                  }
                  if(scope.options.length > 0) {
                    scope.$emit('event.device_control_select_value_change', {
                      name: scope.class,
                      label: $($(element)[0].selectedOptions).text(),
                      value: this.val(),
                      path: scope.path,
                      init: true
                    });
                  }
                });
              }
          }
      }]);
      
    directives.directive('linkxSlider', ['ob',
      function(ob) {

          var config = _config;
          return {
              restrict: 'A',
              scope:{
                  min:'=',
                  max:'=',
                  increment:'=',
                  value:'@',
                  class:'@',
                  path:'=',
                  abc:'='
              },
              link: function (scope, element, attrs) {
                
                var $target = $("."+scope.class);
                $target.wait(function () {
                  (!!scope.value) ? "" : (scope.value = scope.abc);
                  this.empty();
                  this.slider({
                      min: scope.min,
                      max: scope.max,
                      step: scope.increment,
                      value: scope.value,
                      create: function( event, ui ) {
                          var $_this = $(this),
                              _v = $_this.slider("value");
                          $_this.find("a").append("<span class='search-range-value'>" + _v + "</span>");
                      },
                      change: function (event, ui) {
                        $(this).find(".search-range-value").text(ui.value);
                        scope.$emit('event.device_control_select_value_change', {
                          name: scope.class,
                          label: ui.value,
                          value: ui.value,
                          path: scope.path
                        });
                      }
                  });
                  scope.$emit('event.device_control_select_value_change', {
                    name: scope.class,
                    label: $(this).slider("value"),
                    value: $(this).slider("value"),
                    path: scope.path,
                    init: true
                  });
                });
              }
          }
      }]);

      directives.directive('linkxButton', ['ob', 
        function(ob) {
          var config = _config;
          return {
              restrict: 'A',
              replace: true,
              scope:{
                  class:'@',
                  path:'=',
                  value:'='
              },
              link: function (scope, element, attrs) {
                var $target = $("."+scope.class);
                $target.wait(function () {
                  element.on('click', function () {
                    scope.$emit('event.device_control_select_value_change', {
                      name: scope.class,
                      label: $(this).text(),
                      value: scope.value,
                      path: scope.path
                    });
                  });
                });
              }
            }
        }]);

      directives.directive('linkxBtmulti', ['ob', 
        function(ob) {
          var config = _config;
          return {
              restrict: 'A',
              replace: true,
              scope:{
                  class:'@',
                  path:'@'
              },
              link: function (scope, element, attrs) {
                var $target = $("."+scope.class);
                $target.wait(function () {
                  element.on('click', function () {
                    scope.$emit('event.device_control_select_value_change', {
                      name: scope.class,
                      label: $(this).text(),
                      value: "",
                      path: scope.path
                    });
                  });
                });
              }
            }
        }]);
});

