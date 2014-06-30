// 定义自定义覆盖物的构造函数
function SquareOverlay(center, length, color) {
    this._center = center;
    this._length = length;
    this._color = color;
}

// 继承API的BMap.Overlay
SquareOverlay.prototype = new BMap.Overlay();
SquareOverlay.prototype.constructor = SquareOverlay;

// 实现初始化方法
SquareOverlay.prototype.initialize = function(map) {
    // 保存map对象实例
    this._map = map;
    // 创建div元素，作为自定义覆盖物的容器
    var div = document.createElement("div");
    div.style.position = "absolute";
    // 可以根据参数设置元素外观
    div.style.width = this._length + "px";
    div.style.height = this._length + "px";
    div.style.background = this._color;
    // 将div添加到覆盖物容器中
    map.getPanes().markerPane.appendChild(div);
    // 保存div实例
    this._div = div;
    // 需要将div元素作为方法的返回值，当调用该覆盖物的show、
    // hide方法，或者对覆盖物进行移除时，API都将操作此元素。
    return div;
};

SquareOverlay.prototype.draw = function() {
    // 根据地理坐标转换为像素坐标，并设置给容器
    var position = this._map.pointToOverlayPixel(this._center);
    this._div.style.left = position.x - this._length / 2 + "px";
    this._div.style.top = position.y - this._length / 2 + "px";
}
// 实现显示方法
SquareOverlay.prototype.show = function() {
    if (this._div) {
        this._div.style.display = "";
    }
}
// 实现隐藏方法
SquareOverlay.prototype.hide = function() {
    if (this._div) {
        this._div.style.display = "none";
    }
}
// 添加自定义方法
SquareOverlay.prototype.toggle = function() {
    if (this._div) {
        if (this._div.style.display == "") {
            this.hide();
        } else {
            this.show();
        }
    }
}