function SimplePopbox () {
    var SimplePopbox = function(options) {
        this.options = {
            container: null,
            bar: null,
            box: null
        };
        this.dom = {};
        this.init(options);
    };

    SimplePopbox.prototype = {
        init: function(options) {
            for (var key in options) {
                this.options[key] = options[key];
            }
            this.isOpen = false;
            this.initUI();
            this.initEvents();
        },
        initUI: function() {

        },
        initEvents: function() {
            var self = this;
            $(window).click(function(e) {
                var target = e.target;
                if (self.options.container) {
                    if (!$.contains(self.options.container, target) && self.options.container != target) {
                        self.close();
                    }
                } else {
                    if (!$.contains(self.options.pop, target) && self.options.pop != target && self.options.bar != target && !$.contains(self.options.bar, target)) {
                        self.close();
                    }
                }
            });
            $(this.options.bar).click(function(e) {
                !self.isOpen ? self.open() : self.close();
                e.preventDefault();
            });
        },
        open: function() {
            $(this.options.pop).show();
            $(this.options.bar).addClass('select');
            this.isOpen = true;
        },
        close: function() {
            $(this.options.pop).hide();
            $(this.options.bar).removeClass('select');
            this.isOpen = false;
        }
    };

    return SimplePopbox;
}

function elements() {
    var eles = {
        div: document.createElement('div'),
        ul: document.createElement('ul'),
        li: document.createElement('li'),
        span: document.createElement('span'),
        p: document.createElement('p'),
        a: document.createElement('a'),
        fragment: document.createDocumentFragment(),
        input: document.createElement('input')
    }
    /**
     * create element
     * @param tagName
     * @param id
     * @param className
     * @returns {null}
     */
    var $c = function(tagName, id, className) {
        var ele = null;
        if (!eles[tagName]) {
            eles[tagName] = document.createElement(tagName);
            ele = eles[tagName].cloneNode(true);
        } else {
            ele = eles[tagName].cloneNode(true);
        }
        if (id) {
            ele.id = id;
        }
        if (className) {
            ele.className = className;
        }
        return ele;
    };

    return $c;
});

function region() {
    if (!regionData) {
        console.log('regionData is undefined');
        return;
    }
    var $c = elements().$c;
    var region = {
        options: {
            s_container: '.region',
            s_province: '.province',
            s_city: '.city',
            s_searchbar: '.location .pop .searchbar_blue',
            s_searchbarinput: '.location .pop .searchbar_blue input',
            s_suggest: '.location .pop .quick_list'
        },
        cachedKeyword: null,
        cachedResults: {},
        isSuggestOpen: false,
        dom: {},
        init: function(options) {
            for (var key in options) {
                this.options[key] = options[key];
            }
            this.initUI();
            this.initEvents();
        },

        initUI: function() {
            this.initProvince();
            this.dom.input = $(this.options.s_searchbarinput)[0];
            this.dom.suggestUl = $(this.options.s_suggest)[0];
            $(this.options.s_province).show().css({
                left: 0
            });
            $(this.options.s_city).show().css({
                left: 400
            });

        },
        //初始化省份
        initProvince: function() {
            //<span><em>A</em><a>安徽</a><a>澳门</a></span>
            //<div class="province">
            for (var i = 0, len = areaData.l.length; i < len; i++) {
                var letter = areaData.l[i];
                var span = $c('span');
                span.py = letter;
                var em = $c('em');
                em.innerHTML = letter;
                span.appendChild(em);
                for (var j = 0, jlen = areaData.pl[letter].length; j < jlen; j++) {
                    var pro = areaData.pl[letter][j];
                    var a = $c('a');
                    a.innerHTML = areaData.pl[letter][j].t;
                    a.py = areaData.pl[letter][j].py;
                    span.appendChild(a);
                }
                $(this.options.s_province).append(span);
            }
        },
        /**
         *
         * @param {Array} citiesPY 城市首字母列表
         * @param {String} provincePY 省份拼音首字母
         */
        getCity: function(citiesPY, provincePY) {
            if (!this.dom[provincePY]) {
                var fragment = $c('fragment');
                for (var i = 0, len = citiesPY.length; i < len; i++) {
                    var a = $c('a');
                    var city = areaData.c[provincePY[0] + ':' + citiesPY[i]];
                    a.innerHTML = city.t;
                    a.setAttribute('py', city.py);
                    a.setAttribute('p', city.p);
                    fragment.appendChild(a);
                }
                this.dom[provincePY] = fragment;
            }
            return this.dom[provincePY].cloneNode(true);
        },

        initEvents: function() {
            var self = this;
            //省份点击事件
            $(this.options.s_province).click(function(e) {
                var target = e.target;
                if (target.tagName == "A") {
                    self.options.onProvinceSelect && self.options.onProvinceSelect({
                        pName: target.innerHTML
                    });
                    var pName = target.innserHTML;
                    var parent = target.parentNode;
                    var firstLetter = parent.py;
                    var pPY = target.py;
                    var citiesPY = areaData.p[pPY].s;
                    var fragment = self.getCity(citiesPY, pPY);
                    $('.current_province a').html(areaData.p[pPY].t + '[选择]');
                    $('.citylist').html('').append(fragment);

                    self.showCity();
                }
            });

            /**
             *城市点击事件
             */
            $(this.options.s_city + ' .citylist').click(function(e) {
                var target = e.target;
                if (target.tagName == 'A') {
                    var pname = areaData.p[target.getAttribute('p')].t;
                    self.options.onCitySelect && self.options.onCitySelect({
                        cName: pname + ' ' + target.innerHTML
                    });
                }
            });

            $(this.options.s_suggest).click(function(e) {
                var target = e.target;
                if (target.tagName == 'A') {
                    var name;
                    if (target.atype == 'p') {
                        name = areaData.p[target.py].t;
                    } else {
                        name = areaData.p[target.p].t + ' ' + areaData.c[target.p[0] + ':' + target.py].t;
                    }
                    self.options.onQuickSelect && self.options.onQuickSelect({
                        name: name
                    });
                }
            });

            $('.foot button.btn_return').click(function(e) {
                self.showProvince();
            });
            $('.foot button.btn_confirm').click(function(e) {
                self.options.onConfirm && self.options.onConfirm();
            });
            $('.foot button.btn_cancel').click(function(e) {
                self.options.onCancel && self.options.onCancel();
            });
            //开始观查
            $(this.options.s_searchbarinput).focus(function(e) {
                self.startObserve();
            });
            //停止观察
            $(this.options.s_searchbarinput).blur(function(e) {
                self.stopObserve();
            });
        },

        showCity: function() {
            $('.city').css({
                left: 400
            }).animate({
                left: 0
            });
            $('.province').animate({
                left: -400
            });
            $('.foot button.fl').show();
        },

        showProvince: function() {
            $('.city').animate({
                left: 400
            });
            $('.province').show().animate({
                left: 0
            });
            $('.foot button.fl').hide();
        },

        //开始观察输入框
        startObserve: function() {
            var self = this;
            if (!this.timer) {
                this.timer = setInterval(function() {
                    self.onChange();
                }, 100);
            }
        },
        //停止观察输入框
        stopObserve: function() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
            this.closeSuggest();
        },
        //输入框内容改变时
        onChange: function() {
            var value = $.trim(this.dom.input.value), self = this;
            if (value == '') {
                this.cacheResults = [];
                this.closeSuggest();
            }
            if (this.cachedKeyword !== null && this.cachedKeyword === value) {
                return;
            }
            var fromCachedResults = false;
            if (this.cachedKeyword != null && this.cachedKeyword.length < value.length) {
                fromCachedResults = true;
            }
            this.cachedKeyword = value;
            if (value != '') {
                this.getSearchResults(value, fromCachedResults, function(results) {
                    if (results.length !== 0) {
                        self.openSuggest(results);
                    }
                });
            } else {
                this.cacheResults = [];
                this.closeSuggest();
            }
        },

        getSearchResults: function(value, fromCachedResults, callback) {
            var data = areaData.c;
            /*
             if(fromCachedResults){
             data = this.cachedResults;
             }
             */
            var temp = {
                c: {},
                p: {}
            };
            var regexp = new RegExp("\\w\\:" + value, 'i');
            var pRegexp = new RegExp(value, 'i');
            var chineseRegexp = new RegExp(value);
            for (var i in data) {
                //var item = data[i];
                if (regexp.test(i) || chineseRegexp.test(areaData.c[i].t)) {
                    temp.c[i] = '';
                }
            }
            var pData = areaData.p;
            for (var p in pData) {
                if (pRegexp.test(p) || chineseRegexp.test(areaData.p[p].t)) {
                    temp.p[p] = '';
                }
            }
            this.cachedResults = temp;
            callback(temp);
        },
        //打开建议列表
        openSuggest: function(results) {
            this.isSuggestOpen = true;
            var cf = $c('fragment');
            var pf = $c('fragment');
            this.dom.suggestUl.innerHTML = '';

            for (var i in results.p) {
                var a = $c('a');
                a.innerHTML = areaData.p[i].t;
                //区域类型 atype 为p 是省份
                a.atype = 'p';
                a.py = areaData.p[i].py;
                pf.appendChild(a);
            }
            for (var i in results.c) {
                var a = $c('a');
                a.innerHTML = areaData.c[i].t;
                //区域类型 atype 为c 是城市
                a.atype = 'c'
                a.py = areaData.c[i].py;
                a.p = areaData.c[i].p;
                cf.appendChild(a);
            }
            this.dom.suggestUl.appendChild(pf);
            this.dom.suggestUl.appendChild(cf);
            $(this.dom.suggestUl).fadeIn('fast');
        },
        //关闭建议列表
        closeSuggest: function() {
            this.selectedIndex = -1;
            this.isSuggestOpen = false;
            $(this.dom.suggestUl).fadeOut('fast');
        },
    };

    return region;

};
