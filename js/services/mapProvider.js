define([
    './services'
], function(services) {
    'use strict';

    services.factory('mapProvider', [
        'ob',
        function(ob) {
            var exports = {};

            var CONTROLTYPE = {
                navigation: "NavigationControl"
            };
            var SCOPETYPE = {
                TRANSIENT: "transient",
                DETACHED: "detached",
                PERSISTENT: "persistent"
            };

            //Return a new Map Object.
            function _newInstance(containerId, opts) {
                var map = new BMap.Map(containerId);
                map.enableScrollWheelZoom();
                map.disableDoubleClickZoom();

                if((typeof opts.center) === "string") {
                    map.centerAndZoom(opts.center);
                } else {
                    map.centerAndZoom(opts.center, opts.zoom);
                }

                return map;
            }

            //Get current zoom of the map.
            function _getZoom(map) {
                return map.getZoom();
            }

            //Get center of the BMap.
            function _getCenter(map) {
                return map.getCenter();
            }

            //Set the center of the BMap.
            function _setCenter(map, opts) {
                if((typeof opts.center) === "string") {
                    map.centerAndZoom(opts.center);
                } else {
                    map.centerAndZoom(opts.center, opts.zoom);
                }
            }

            //Get a BMap point.
            function _getPoint(lng, lat) {
                return new BMap.Point(lng, lat);  
            }

            //Create a BMap Marker.
            function _createMarker(map, point, opts) {
                var _tempOpts = {},
                    _iconSetting = {};
                opts = opts || {};
                if(!!opts.icon) {
                    if(!!opts.imageOffset) {
                        _iconSetting.imageOffset = new BMap.Size(opts.imageOffset.width, opts.imageOffset.height);
                    }
                    _tempOpts.icon = new BMap.Icon(opts.icon, {
                        width: opts.width || 15,
                        height: opts.height || 15
                    }, _iconSetting);
                } else {
                    _tempOpts.icon = new BMap.Icon("images/mylinkx/icon_map.png",{
                        "width" : 25,
                        "height" : 40
                    });
                }
                if(!opts.scopeType) {
                    opts.scopeType = SCOPETYPE.TRANSIENT;
                }
                if(opts.scopeType === SCOPETYPE.TRANSIENT) {
                    var _aOverlays = map.getOverlays();
                    $.each(_aOverlays, function(i, v){
                        if(v instanceof BMap.Marker) {
                            if(v.scopeType === SCOPETYPE.TRANSIENT) {
                                map.removeOverlay(v);
                            }
                        }
                    })
                }
                var marker = new BMap.Marker(point, _tempOpts);
                if(opts.scopeType === SCOPETYPE.PERSISTENT) {
                    marker.disableMassClear();
                }
                if(!!opts.dragable) {
                    marker.enableDragging();
                    marker.addEventListener("dragend", function(e){    
                        ob.publish("map_marker_dragend", e);
                    });
                }
                marker.scopeType = opts.scopeType;
                map.addOverlay(marker);
                return marker;
            }
            function _markerReSetIcon(marker, opts) {
                var _icon,
                    _iconSetting = {};
                if(!!opts.imageOffset) {
                    _iconSetting.imageOffset = new BMap.Size(opts.imageOffset.width, opts.imageOffset.height);
                }
                _icon = new BMap.Icon(opts.icon, {
                    width: opts.width || 15,
                    height: opts.height || 15
                }, _iconSetting);
                marker.setIcon(_icon);
            }

            //Create a BMap InfoWindow.
            /**
             *  @Param content string or HTMLElement.(display in the infoWindow)
             *  @Param opts object. (Set the options for the infoWindow).
             *  @Return BMap.InfoWindow
             */
            function _createInfoWindow(content, opts) {
                var _infoWindow;
                opts = opts || {};
                opts = $.extend({
                            enableMessage: false
                        }, opts);
                _infoWindow = new BMap.InfoWindow(content, opts);
                return _infoWindow;
            }

            function _infoWindowSetContent(infoWindow, content) {
                if(!infoWindow) {
                    return;
                }
                infoWindow.setContent(content);
            }

            //Create a Circle overlay.
            function _createCircle(map, point, radius, opts) {
                opts = opts || {};
                opts = $.extend({
                            fillColor: "#F6E0DD",
                            strokeColor:"#CF0303",
                            fillOpacity: 0.4,
                            strokeWeight: 1
                        }, opts)
                var circle = new BMap.Circle(point, radius, opts);
                map.addOverlay(circle);
                return circle;
            }

            //Add a overlay into BMap.
            function _addOverlay(map, content) {
                map.addOverlay(content);
            }

            //Remove the overlay or overlays from BMap.
            function _removeOverlay(map, content) {
                if (!!content){
                    map.removeOverlay(content);
                } else {
                    map.clearOverlays();
                }
            }

            //Add a control into BMap.
            function _addControl(map, _control) {
                map.addControl(new BMap[_control]());
            }

            //Attach a event into BMap{Map/ Marker}.
            function _attachEvent(eventContainer, eventType, callback){
                eventContainer.addEventListener(eventType, callback);
            }

            function _getAddressByLocation(lat, lng, callback) {
                 $.getJSON(
                    "http://api.map.baidu.com/geocoder/v2/?callback=?",
                    {
                        location: lat+","+lng,
                        output: "json",
                        ak: "M32F7xZ18PZ3571P7iiIuUUY"
                    },
                    function(data) {
                        callback.apply(this, [data.result.formatted_address]);
                    }
                );
            }
            function _getLocationByAddress(address, callback) {
                $.getJSON(
                    "http://api.map.baidu.com/geocoder/v2/?callback=?",
                    {
                        address: address,
                        output: "json",
                        ak: "M32F7xZ18PZ3571P7iiIuUUY"
                    },
                    function(data) {
                        callback.apply(this, [data.result.location]);
                    }
                );
            }

            function _openInfoWindow(container, infoWindow) {
                container.openInfoWindow(infoWindow);
            }

            function _closeInfoWindow(container) {
                container.closeInfoWindow();
            }

            exports = {
                SCOPETYPE: SCOPETYPE,
                CONTROLTYPE: CONTROLTYPE,

                getCenter: _getCenter,
                setCenter: _setCenter,

                getZoom: _getZoom,
                addControl: _addControl,

                getInstance: _newInstance,
                getPoint: _getPoint,

                addOverlay: _addOverlay,
                removeOverlay: _removeOverlay,

                attachEvent: _attachEvent,

                createCircle: _createCircle,
                createMarker: _createMarker,
                markerReSetIcon: _markerReSetIcon,

                createInfoWindow: _createInfoWindow,
                openInfoWindow: _openInfoWindow,
                closeInfoWindow: _closeInfoWindow,
                infoWindowSetContent: _infoWindowSetContent,

                getAddressByLocation: _getAddressByLocation,
                getLocationByAddress: _getLocationByAddress
            };

            return exports;
        }
    ]);
});
