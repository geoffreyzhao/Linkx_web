define([
    'require',
    './vendor'
], function(require) {
        'use strict';

    var util = {},
        config = _config;

    Date.prototype.subtractDays = function(d) {
        var _temp = new Date(this.getTime());
        return _temp.setDate(_temp.getDate() - d);
    }
    Date.prototype.subtractWeeks = function(w) {
        var _temp = new Date(this.getTime());
        return _temp.setDate(_temp.getDate() - w * 7);
    }
    Date.prototype.subtractMonths = function(m) {
        var _temp = new Date(this.getTime()),
            _y = _temp.getFullYear(),
            _m = _temp.getMonth() + 1;
        if(_m < m) {
            _y--;
            _m += 12;
        }
        var _a = new Date(_y, _m - m, 1),
            _maxDate = new Date(_a.subtractDays(1)).getDate();
        if(_temp.getDate() > _maxDate) {
            _temp.setDate(_maxDate);
        }
        return _temp.setMonth(this.getMonth() - m);
    }
    Date.prototype.subtractYears = function(y) {
        var _temp = new Date(this.getTime());;
        return _temp.subtractMonths(y * 12);
    }

    // add closure wrapped
    /*
        test and usage
        var foo = function(name) {
            console.log(this, name);
        };
        foo('jarred');
        var foo2 = _.closure(foo, {name: 'larry'}, 'larry');
        foo2();
    */
    _.mixin({
        closure : function() {
            var arg = arguments;
            return function() {
                arg[0].apply(arg[1], Array.prototype.slice.call(arg).slice(2));
            };
        }
    });

    /* Deprecated function
    util.service = {
        getServiceURL : function(serviceKey) {
            var apiURLs = config.api.apiURL[config.api.online ? "online" : "offline"],
                contextPath = config.api.contextPath(),
                serviceURL = contextPath + apiURLs[serviceKey];

            return serviceURL;
        }
    };
    */


    util.misc = {
        deepClone : function(obj) {
            if ( typeof (obj) !== 'object') {
                return obj;
            }
            var re = {};
            if (obj.constructor === Array) {
                re = [];
            }
            for (var i in obj) {
                re[i] = this.deepClone(obj[i]);
            }
            return re;
        },
        syncGetScript : function(url) {
            var xhr = $.ajax({
                url : url,
                type : 'GET',
                async : false,
                dataType : 'script'
            });

            return xhr;
        },
        resultDelegate: function(ret, ok, fail) {
            ret.code === 200 ? ok() : fail();
        }
    };

    util.reDrawImg = function (container, imageTarget, uri, fn) {
        var img = new Image(),
            hRatio, wRatio, nRatio = 1,
            maxWidth = container.width(),
            maxHeight = container.height();
        maxWidth = maxWidth || 300;
        maxHeight = maxHeight || 200;
        img.onload = function(){
            var w = this.width,
                h = this.height,
                _w, _h;
            wRatio = maxWidth / w;
            hRatio = maxHeight / h;
            nRatio = (wRatio<=hRatio?wRatio:hRatio);
            _w = w * nRatio;
            _h = h * nRatio;
            imageTarget.width(_w);
            imageTarget.height(_h);
            if(!!fn && fn instanceof Function) {
                fn.apply(this, [w, h, _w, _h, (wRatio>=hRatio?_w:_h*1.5)]);
            }
        }
        img.src = uri;
    }

    window._util = util;

    return util;
});