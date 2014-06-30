var services = angular.module('LinkX.services', ['ngResource']);

services.factory('loginService', ['$resource',
function($resource) {
    return $resource(linkx.api.loginService, {}, {// v2.0/user/login
        login: {
            method: 'POST',
            params: {},
            isArray: false
        }
    });
}]);

services.factory('registerService', ['$resource',
function($resource) {
    return $resource(linkx.api.registerService, {}, {// v2.0/user/register
        register: {
            method: 'POST',
            params: {}
        }
    });
}]);

services.factory('logoutService', ['$resource',
function($resource) {
    return $resource(linkx.api.logoutService, {}, {// v2.0/user/logout
        logout: {
            method: 'GET',
            params: {},
            isArray: false
        }
    });
}]);

/*
 * services.factory('getCurrentUserService', ['$resource', function($resource) {
 * return $resource('mockData/getCurrentUser.json', {}, { getCurrentUser: {
 * method: 'GET', params: {}, isArray: false } }); }]);
 */

services.factory('getDeviceListService', ['$resource',
function($resource) {
    return $resource(linkx.api.getDeviceListService, {}, {
        getDeviceList: {
            method: 'GET',
            params: {},
            isArray: false
        }
    });
}]);

services.factory('addDeviceService', ['$resource',
function($resource) {
    return $resource(linkx.api.addDeviceService, {}, {
        addDevice: {
            method: 'POST',
            params: {},
            isArray: false
        }
    });
}]);

services.factory('updateDeviceService', ['$resource',
function($resource) {
    return $resource('v2.0/device/:id', {
        id: '@id'
    }, {
        updateDevice: {
            method: 'PUT',
            params: {},
            isArray: false
        }
    });
}]);

services.factory('removeDeviceService', ['$resource',
function($resource) {
    return $resource(linkx.api.removeDeviceService + '/:id', {
        id: '@id'
    }, {
        removeDevice: {
            method: 'DELETE',
            params: {},
            isArray: false
        }
    });
}]);

services.factory('addSensorService', ['$resource',
function($resource) {
    return $resource(linkx.api.addDeviceService + '/:deviceId/sensor', {
        deviceId: '@deviceId'
    }, {
        addSensor: {
            method: 'POST',
            params: {},
            //isArray: false
        }
    });
}]);

services.factory('updateSensorService', ['$resource',
function($resource) {
    return $resource(linkx.api.addDeviceService + '/:deviceId/sensor/:id', {
        deviceId: '@deviceId',
        id: '@id'
    }, {
        updateSensor: {
            method: 'PUT',
            params: {},
            isArray: false
        }
    });
}]);

services.factory('removeSensorService', ['$resource',
function($resource) {
    return $resource(linkx.api.addDeviceService + '/:deviceId/sensor/:id', {
        deviceId: '@deviceId',
        id: '@id'
    }, {
        removeSensor: {
            method: 'DELETE',
            params: {},
            isArray: false
        }
    });
    //----
}]);

services.factory('listSensorsService', ['$resource',
function($resource) {
    return $resource(linkx.api.addDeviceService + '/:deviceId/sensor/list', {
        deviceId: '@deviceId'
    }, {
        listSensors: {
            method: 'GET',
            params: {}// ,
            // isArray: false
        }
    });
}]);

services.factory('trackBackGpsService', ['$http',
function($http) {
    return {
        trackBack: function(url, params, callsucess, callfailure) {
            $http.get(url, params).success(callsucess).error(callfailure);
        }
    };
}]);

services.factory('loadDpsService', ['$resource',
function($resource) {
    return $resource(linkx.api.addDeviceService + '/:deviceId/sensor/:id/datapoints/load', {
        deviceId: '@deviceId',
        id: '@id'
    }, {
        loadDps: {
            method: 'GET',
            params: {}// ,
            // isArray: false
        }
    });
}]);

services.factory('getLastSwitchdpService', ['$resource',
function($resource) {
    return $resource(linkx.api.addDeviceService + '/:deviceId/sensor/:id/datapoints', {
        deviceId: '@deviceId',
        id: '@id'
    }, {
        getLastSwitchdp: {
            method: 'GET',
            params: {},
            isArray: false
        }
    });
}]);

services.factory('dpService', ['$http',
function($http) {
    return {
        createdp: function(url, params, callSuccess, callFailure) {
            $http.post(url, params).success(callSuccess).error(callFailure);
        },
        loadDps: function(url, params, callSuccess, callFailure) {
            $http.get(url, params).success(callSuccess).error(callFailure);
        },
        imageDps: function(url, params, callSuccess, callFailure) {
            $http.get(url, params).success(callSuccess).error(callFailure);
        }
    };
}]);

services.factory('uploadImageService', ['$resource',
function($resource) {

    return {
        uploadImage: function(fileId, typeId, foreignId, callback) {
            var fileInput = $('#' + fileId).get(0);
            console.log(fileInput);
            if (fileInput.files.length > 0) {
                var file = fileInput.files[0];
                var isImage = file.type.indexOf("image") == 0 || (!file.type && /\.(?:jpg|png|gif)$/.test(file.name) /*
                 * for
                 * IE10
                 */);
                if (!isImage) {
                    alert('文件"' + file.name + '"不是图片。');
                    return;
                }
                if (isImage) {
                    if (file.size >= 512000) {
                        alert('您这张"' + file.name + '"图片大小过大，应小于500k');
                        return;
                    }
                }
                // try sending
                var reader = new FileReader();
                // Trigger it when finish reading file.
                reader.onloadend = function() {
                    if (reader.error) {
                        console.log(reader.error);
                    } else {
                        // document.getElementById("bytesRead").textContent =
                        // file.size;
                        var xhr = new XMLHttpRequest();
                        xhr.open('POST', 'v2.0/image/device/'+foreignId );
                        //xhr.overrideMimeType("application/octet-stream");
                        xhr.overrideMimeType("multipart/form-data");
                        if (!XMLHttpRequest.prototype.sendAsBinary) {
                            XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
                                function byteValue(x) {
                                    return x.charCodeAt(0) & 0xff;
                                }

                                var ords = Array.prototype.map.call(datastr, byteValue);
                                var ui8a = new Uint8Array(ords);
                                this.send(ui8a.buffer);
                            };
                        }
                        xhr.sendAsBinary(reader.result);
                        xhr.onreadystatechange = callback;
                    }
                };
                // read file
                reader.readAsBinaryString(file);
            }
        },
        getFileName: function(formId, fileId, typeId) {
            var form = document.forms[formId];
            if (form[fileId].files.length > 0) {
                var file = form[fileId].files[0];
                if (typeId == 1) {
                    return "upload/" + file.name;
                } else if (typeId == 2) {
                    return "upload/" + file.name;
                }
            } else {
                return "";
            }
        }
    };
}]);

services.factory('gpsdpService', [
function() {
    var map;
    var loadGPSFunc = function(gpsDiv, beginPoint) {
        // var chicago = new google.maps.LatLng(41.879535, -87.624333);
        var chicago = beginPoint;
        var mapOptions = {
            zoom: 7,
            center: chicago,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(document.getElementById(gpsDiv), mapOptions);

        var polyOptions = {
            strokeColor: '#000000',
            strokeOpacity: 1.0,
            strokeWeight: 3
        };
        var poly = new google.maps.Polyline(polyOptions);
        poly.setMap(map);

        // Add a listener for the click event
        /*
         * google.maps.event.addListener(map, 'click', function(event) {
         * addLatLng(event, poly); });
         */
        return poly;
    };
    /**
     * Handles click events on a map, and adds a new point to the Polyline.
     *
     * @param {google.maps.MouseEvent}
     *            event
     */
    function addLatLng(event, poly) {
        var path = poly.getPath();
        // Because path is an MVCArray, we can simply append a new coordinate
        // and it will automatically appear
       // var temp = new google.maps.LatLng(-25.363882, 131.044922);
        path.push(event.latLng);
        // Add a new marker at the new plotted point on the polyline.
        marker = new google.maps.Marker({
            position: event.latLng,
            title: '#' + path.getLength(),
            map: poly.map
        });
    }

    var putDataFunc = function(dataPoint, poly) {
        var myLatLng = new google.maps.LatLng(dataPoint.value.lat, dataPoint.value.lng);
        var path = poly.getPath();
        path.push(myLatLng);
        var showInfo = '时间:' + dataPoint.timestamp + '   ' + '速度：' + dataPoint.value.speed;
        var infowindow = new google.maps.InfoWindow();
        infowindow.setContent(showInfo);
        marker = new google.maps.Marker({
            //var marker = new google.maps.Marker({
            position: myLatLng,
            title: showInfo,
            map: poly.map,
            icon: 'http://www.yeelink.net/front/images/marker_data.png'
        });
        // infowindow.open(poly.map, marker);
    };
    var putLastDataFunc = function(dataPoint, poly) {
        //refocus center
        
//        var map = poly.getMap();
//        map.setOptions({mapMaker:{}});
//        poly.setMap(map);
        
        var myLatLng = new google.maps.LatLng(dataPoint.value.lat, dataPoint.value.lng);
        var path = poly.getPath();
        path.push(myLatLng);
        var showInfo = '时间:' + dataPoint.timestamp + '   ' + '速度：' + dataPoint.value.speed;
        
        marker = new google.maps.Marker({
            position: myLatLng,
            title: showInfo,
            map: poly.map
        });
    };
    var trackBackFunc = function(gpsDiv, dataPoints) {
        console.log(dataPoints);
        var beginPointer = new google.maps.LatLng(dataPoints[0].value.lat, dataPoints[0].value.lng);
        var poly = loadGPSFunc(gpsDiv, beginPointer);
        putLastDataFunc(dataPoints[0], poly);
        for (var i = 1; i < dataPoints.length; i++) {
            // var tempPointer = new google.maps.LatLng(dataPoints[i].value.lat,
            // dataPoints[i].value.lng);
            putDataFunc(dataPoints[i], poly);
        }
        // var lastPointer = new
        // google.maps.LatLng(dataPoints[dataPoints.length-1].value.lat,
        // dataPoints[dataPoints.length-1].value.lng);

    };
    return {
        loadGPS: loadGPSFunc,
        putData: putDataFunc,
        putLastData: putLastDataFunc,
        trackBack: trackBackFunc
    };
}]);

services.factory('gpsService', ['$resource',
function($resource) {
    return {
        initializeGIS: function(obj) {
            if ( typeof (google) == 'undefined') {
                console.log('internet error');
                return;
            }
            //$('#map-canvas').show();
            var mapOptions = {
                center: new google.maps.LatLng(obj.lat, obj.lng),
                zoom: obj.marker.zoom == undefined ? 8 :obj.marker.zoom,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }, 
            geoCoder = new google.maps.Geocoder(), 
            infowindow = new google.maps.InfoWindow(), 
            map = new google.maps.Map($("#map-canvas").get(0), mapOptions), 
            marker = new google.maps.Marker({
                position: new google.maps.LatLng(obj.lat, obj.lng),
                map: map
            });
            //google.maps.Animation.DROP
            marker.setAnimation(obj.marker.animation == undefined ? google.maps.Animation.DROP :obj.marker.animation);
            marker.setDraggable(obj.marker.draggable == undefined ? false :obj.marker.draggable);
            marker.setVisible(obj.marker.visible == undefined ? true :obj.marker.visible);
            google.maps.event.addListener(map, 'click', function(event) {
                _placeMarker(event.latLng);
//                _displayLocation(marker);
                _displayLocation(event.latLng);
                console.log(event);
                getPositionByLngLat(event.latLng.ob,event.latLng.pb);
            });
            //marker drag
            google.maps.event.addListener(marker, 'dragstart', function(event) {
                console.log('event.latLng' + event.latLng);
            });
            google.maps.event.addListener(marker, 'drag', function(event) {
                //console.log('event.latLng');
                //getPositionByLngLat(event.latLng.lb,event.latLng.mb);
                $("#txt_address").val('');
            });
            google.maps.event.addListener(marker, 'dragend', function(event) {
                _displayLocation(event.latLng);
                console.log(event);
                getPositionByLngLat(event.latLng.ob,event.latLng.pb);
            });

            function _placeMarker(location) {
                marker.setPosition(location);
                marker.setVisible(true);
            }

            function _displayLocation(marker) {
                $('#lat').val(marker.ob);
                $('#lng').val(marker.pb);
            }
            
            getPositionByLngLat(obj.lat,obj.lng);
            
            function _getGeoCoder() {// google maps geocode service
                var searchAddress = $("#txt_address").val();
                if (searchAddress) {
                    geoCoder.geocode({
                        'address': searchAddress
                    }, function(results, state) {
                        if ( state = google.maps.GeocoderStatus.OK) {
                            if (results[0]) {
                                console.log(results[0].formatted_address);
                                var point = results[0].geometry.location;
                                marker.setPosition(point);
                                marker.setVisible(true);
                                infowindow.close();
                                var str = results[0].formatted_address + '<br>' + '经度:' + point.ob + '<br>纬度:' + point.pb;
                                infowindow.setContent(str);
                                infowindow.open(map, marker);
                                map.setCenter(point);
                                _displayLocation(point);
                                $('#lat').val(marker.ob);
                                $('#lng').val(marker.pb); 
                                results[0].formatted_address;
                                $('#position').val(getDetailPosition(results[0].formatted_address));
                            }
                        }
                    });
                }
            }


            $('#searchPosition').click(function() {
                _getGeoCoder();
            });
            $('#txt_address').bind('keyup', function(event) {
                event.stopPropagation();
                if (event.keyCode == 13) {
                    _getGeoCoder();
                }
            });
            
            function getPositionByLngLat(lat,lng) {
                geoCoder.geocode({
                    location:new google.maps.LatLng(lat,lng)
                }, function(results, state) {
                    if ( state = google.maps.GeocoderStatus.OK) {
                        if (results[0]) {
                            console.log(results[0].formatted_address);
                            $('#position').val(getDetailPosition(results[0].formatted_address));
                            //$("#txt_address").val(getDetailPosition(results[0].formatted_address));
                            infowindow.close();
                            infowindow.setContent(getDetailPosition(results[0].formatted_address));
                            infowindow.open(map, marker);
                        }
                    }
                });
            }
        }
    };
    
    function getDetailPosition(position) {
        var index = position.indexOf("邮政编码");
        if (index != -1) {
            position = position.substr(0,index);
        }
        return(position);
    };
    

}]);
services.factory('imagedpService', ['$resource',
function($resource) {
    // google.load("visualization", "1");
    //
    // // Set callback to run when API is loaded
    // google.setOnLoadCallback(drawTimeline);
    var timeline = null;
    var data;
    var beforeHour = config.properties.dp.image.beforeNowHour;
    var afterHour = config.properties.dp.image.afterNowHour;
    var now = new Date();
    var nowTime = now.getTime() + afterHour * 1000 * 60 * 60;
    var midnightTime = now.getTime() - beforeHour * 1000 * 60 * 60;
    return {
        // Called when the Visualization API is loaded.
        drawTimeline: function(sensorId, imgData) {
            // Create and populate a data table.
            data = getTimelineData(imgData, sensorId);

            // specify options
            var options = {
                width: "100%",
                height: "250px",
                // height: "auto",
                editable: false, // enable dragging and editing items
                // axisOnTop: true,
                style: "box",
                start: new Date(midnightTime),
                end: new Date(nowTime)
            };

            // Instantiate our timeline object.
            timeline = new links.Timeline(document.getElementById('timelineDiv' + sensorId));

            // Add event listeners
            google.visualization.events.addListener(timeline, 'rangechange', onrangechange);

            // ours
            // timeline.setScale(links.Timeline.StepDate.SCALE.SECOND, 1);

            // Draw our timeline with the created data and options
            timeline.draw(data, options);

            document.getElementById('startDate' + sensorId).value = dateFormat(new Date(midnightTime));
            document.getElementById('endDate' + sensorId).value = dateFormat(new Date(nowTime));
            // onrangechange();
            return timeline;
        },
        setTime: function(mytimeline, newStartDate, newEndDate, imgData, sensorId) {
            console.log('select time');
            if (!mytimeline)
                return;
            data = getTimelineData(imgData, sensorId);
            mytimeline.setData(data);
            mytimeline.setVisibleChartRange(newStartDate, newEndDate);
            mytimeline.redraw();
        },
        setCurrentTime: function(mytimeline, imgData, sensorId) {
            console.log('current time');
            if (!mytimeline)
                return;
            data = getTimelineData(imgData, sensorId);
            mytimeline.setData(data);
            mytimeline.setVisibleChartRangeNow();
            mytimeline.redraw();
            // onrangechange();
        },
        refreshTimeline: function(sensorId, mytimeline, imgData) {
            data = getTimelineData(imgData, sensorId);
            mytimeline.setData(data);
            mytimeline.redraw();
        },
    };

    function getTimelineData(imgData, sensorId) {
        var myData = [];
        var date;
        for (var i = 0; i < imgData.length; i++) {
            date = getDate(imgData[i].timestamp);
            myData.push({
                'start': new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()),
                'content': '<a href = "' + config.properties.dp.image.bathPath + sensorId + '/' + imgData[i].fileName + '" target="_blank"><img src="' + config.properties.dp.image.bathPath + sensorId + '/' + imgData[i].fileName + '" style = "height:32px;width:33px;cursor:pointer;" title="点击查看大图"></a>'
            });
        }
        return myData;
    }

    function getSelectedRow() {
        var row = undefined;
        var sel = timeline.getSelection();
        if (sel.length) {
            if (sel[0].row != undefined) {
                row = sel[0].row;
            }
        }
        return row;
    };

    function onrangechange() {
        // adjust the values of startDate and endDate
        // console.log((myTimeline, mySensorId));
        console.log('on range change');
        // var range = myTimeline.getVisibleChartRange();
        // console.log("--------------------------mysensorId2-----"+sensorId);
        // console.log(myTimeline);
        // document.getElementById('startDate'+sensorId).value =
        // dateFormat(range.start);
        // document.getElementById('endDate'+sensorId).value =
        // dateFormat(range.end);
    };

    function onrangechanged() {
        console.log('onrangechanged');
        // document.getElementById("info").innerHTML += "range changed<br>";
    };

    // Format given date as "yyyy-mm-dd hh:ii:ss"
    // @param datetime A Date object.
    function dateFormat(date) {
        var datetime = date.getFullYear() + "-" + ((date.getMonth() < 9) ? "0" : "") + (date.getMonth() + 1) + "-" + ((date.getDate() < 10) ? "0" : "") + date.getDate() + " " + ((date.getHours() < 10) ? "0" : "") + date.getHours() + ":" + ((date.getMinutes() < 10) ? "0" : "") + date.getMinutes() + ":" + ((date.getSeconds() < 10) ? "0" : "") + date.getSeconds();
        return datetime;
    }

    function getDate(timeStr) {
        timeStr = timeStr.replace(/-/g, "/");
        timeStr = timeStr.replace("T", " ");
        return new Date(timeStr);
    };
}]);

services.factory('chartdpService', ['$resource',
function($resource) {
    var chart;
    var chartData = [];
    var chartCursor;
    return {
        drawChart: function(sensorId, data) {
            setChartData(data);

            // SERIAL CHART
            chart = new AmCharts.AmSerialChart();
            chart.pathToImages = "./css/img/chart/";
            chart.zoomOutButton = {
                backgroundColor: '#000000',
                backgroundAlpha: 0.15
            };
            chart.dataProvider = chartData;
            chart.categoryField = "date";
            chart.balloon.bulletSize = 5;
            chart.minSelectedTime = 1000;
            // chart.maxSelectedTime = 259200000;

            // listen for "dataUpdated" event (fired when chart is rendered) and
            // call
            // zoomChart method when it happens
            chart.addListener("dataUpdated", zoomChart);

            // AXES
            // category
            var categoryAxis = chart.categoryAxis;
            categoryAxis.parseDates = true;
            // as our data is date-based, we set
            // parseDates to true
            categoryAxis.minPeriod = "fff";
            // our data is daily, so we set
            // minPeriod to
            // DD
            categoryAxis.dashLength = 1;
            categoryAxis.gridAlpha = 0.15;
            categoryAxis.position = "top";
            categoryAxis.axisColor = "#DADADA";
            categoryAxis.ignoreAxisWidth = true;

            // value
            var valueAxis = new AmCharts.ValueAxis();
            valueAxis.axisAlpha = 0;
            valueAxis.dashLength = 1;
            chart.addValueAxis(valueAxis);

            // GRAPH
            var graph = new AmCharts.AmGraph();
            graph.title = "red line";
            graph.valueField = "value";
            graph.bullet = "round";
            graph.bulletBorderColor = "#FFFFFF";
            graph.bulletBorderThickness = 2;
            graph.lineThickness = 2;
            graph.lineColor = "#5fb503";
            graph.negativeLineColor = "#efcc26";
            graph.hideBulletsCount = 50;
            // this makes the chart to hide
            // bullets when
            // there are more than 50 series in
            // selection
            chart.addGraph(graph);

            // CURSOR
            chartCursor = new AmCharts.ChartCursor();
            chartCursor.cursorPosition = "middle";
            chartCursor.pan = true;
            // set it to fals if you want the cursor to
            // work in
            // "select" mode
            chartCursor.categoryBalloonDateFormat = "YYYY-MM-DD JJ:NN:SS";
            chart.addChartCursor(chartCursor);

            // SCROLLBAR
            var chartScrollbar = new AmCharts.ChartScrollbar();
            chart.addChartScrollbar(chartScrollbar);

            chart.invalidateSize();
            // WRITE
            chart.write("chartdiv" + sensorId);
            chartData = [];
            return chart;
        },
        refreshChart: function(sensorId, data, myChart) {
            console.log(sensorId + '----' + data + '------' + myChart);
            var newData = setChartData(data);
            myChart.dataProvider = newData;
            myChart.validateData();
        }
    };

    function setChartData(data) {
        chartData = [];
        for (var i = data.length - 1; i > -1; i--) {
            chartData.push({
                date: getDate(data[i].timestamp),
                value: parseInt(data[i].data.val)
            });
        }
        return chartData;
    }

    function getDate(timeLong) {
        return dateFormat(new Date(parseFloat(timeLong)));
    }
    
    function dateFormat(date) {
        var datetime =   date.getFullYear() + "-" +
                ((date.getMonth()   <  9) ? "0" : "") + (date.getMonth() + 1) + "-" +
                ((date.getDate()    < 10) ? "0" : "") +  date.getDate() + " " +
                ((date.getHours()   < 10) ? "0" : "") +  date.getHours() + ":" +
                ((date.getMinutes() < 10) ? "0" : "") +  date.getMinutes() + ":" +
                ((date.getSeconds() < 10) ? "0" : "") +  date.getSeconds();
        return datetime;
    }

    // this method is called when chart is first inited as we listen for
    // "dataUpdated" event
    function zoomChart() {
        chart.zoomToIndexes(chartData.length - 40, chartData.length - 1);
    }

}]);

services.factory('ctrlcvService', ['$resource',
function($resource) {
    var clip = null;
    function $(id) {
        return document.getElementById(id);
    }

    return {
        init: function(sensorId) {
            clip = new ZeroClipboard.Client();
            clip.setHandCursor(true);
            clip.addEventListener('mouseOver', function(client) {
                // update the text on mouse over
                // clip.setText( angular.element('#url'+sensorId).value
                // );$('fe_text').value
                clip.setText($('url' + sensorId).value);
            });

            clip.addEventListener('complete', function(client, text) {
                // debugstr("Copied text to clipboard: " + text );
                alert("该地址已经复制，你可以使用Ctrl+V 粘贴。");
            });

            clip.glue('clip_button' + sensorId, 'clip_container' + sensorId);
        },
    };
}]);

services.factory('selectAllService', ['$http',
function($http) {
    return {
        verifySelectedAll: function(tagName) {
            var selectedModel = document.getElementsByName(tagName);
            for(var i in selectedModel) {
                if (selectedModel[i].checked == true) {
                    return false ;
                }
            }
            return true;
        },
        getSelectedValue: function(tagName) {
            var selectedModel = document.getElementsByName(tagName);
            var value = "";
            for(var i in selectedModel) {
                if (selectedModel[i].checked == true) {
                    value += "|" + selectedModel[i].value;
                }
            }
            return value;
        },
        selectAll: function(name,modelId) {
            var selectedModel = document.getElementsByName(name);
            for(var i =0 ;i <selectedModel.length; i++) {
                selectedModel[i].checked = false;
            }
            $('#'+modelId).addClass("search-all-selected");
        }
    };
}]);

services.factory('coreService', ['$http',
function($http) {
    return {
        post: function(url, params, callSuccess, callFailure) {
            $http.post(url, params).success(callSuccess).error(callFailure);
        },
        get: function(url, params, callSuccess, callFailure) {
            $http.get(url, params).success(callSuccess).error(callFailure);
        },
        put: function(url, params, callSuccess, callFailure) {
            $http.put(url, params).success(callSuccess).error(callFailure);
        },
        delete: function(url, params, callSuccess, callFailure) {
            $http.delete(url, params).success(callSuccess).error(callFailure);
        }
    };
}]);

services.factory('handleService', function() {
    var storage = {
        bsAlert: null,
        loginInfo: null,
        i18nResource: null,
        showAddDevice: null,
        selectDevice: null,
        selectDeviceForSensors: null,
        selectDeviceHideSensor: null,
        updateDevice: null,
        showAddSensor: null,
        updateSensor: null,
        refreshSensorList: null,
    };
    return {
        bsAlert: {
            add: function(callback) {
                storage.bsAlert = callback;
            },
            set: function(data) {
                data && storage.bsAlert && storage.bsAlert(data);
            }
        },
        loginInfo: {
            add: function(callback) {
                storage.loginInfo = callback;
            },
            set: function(data) {
                data != undefined && storage.loginInfo && storage.loginInfo(data);
            }
        },
        i18nResource: {
            set: function(i18nResource) {
                storage.i18nResource = i18nResource;
            },
            get: function() {
                return storage.i18nResource;
            }
        },
        showAddDevice: {
            add: function(callback) {
                storage.showAddDevice = callback;
            },
            set: function(data) {
                data != undefined && storage.showAddDevice && storage.showAddDevice(data);
            }
        },
        selectDevice: {
            add: function(callback) {
                storage.selectDevice = callback;
            },
            set: function(data) {
                data && storage.selectDevice && storage.selectDevice(data);
            }
        },
        updateDevice: {
            add: function(callback) {
                storage.updateDevice = callback;
            },
            set: function(data) {
                data && storage.updateDevice && storage.updateDevice(data);
            }
        },
        refreshDeviceList: {
            add: function(callback) {
                storage.refreshDeviceList = callback;
            },
            set: function(data) {
                data && storage.refreshDeviceList && storage.refreshDeviceList(data);
            }
        },
        showAddSensor: {
            add: function(callback) {
                storage.showAddSensor = callback;
            },
            set: function(data) {
                data != undefined && storage.showAddSensor && storage.showAddSensor(data);
            }
        },
        updateSensor: {
            add: function(callback) {
                storage.updateSensor = callback;
            },
            set: function(data) {
                data != undefined && storage.updateSensor && storage.updateSensor(data);
            }
        },
        selectDeviceForSensors: {
            add: function(callback) {
                storage.selectDeviceForSensors = callback;
            },
            set: function(data) {
                data != undefined && storage.selectDeviceForSensors && storage.selectDeviceForSensors(data);
            }
        },
        selectDeviceHideSensor: {
            add: function(callback) {
                storage.selectDeviceHideSensor = callback;
            },
            set: function(data) {
                data != undefined && storage.selectDeviceHideSensor && storage.selectDeviceHideSensor(data);
            }
        }
    };
});

services.factory('userIdentifyService', ['$cookies', '$location',
function($cookies, $location) {
    return {
        identify: function() {
            if (!$cookies.user) {
                $location.path('/login');
                return false;
            } else {
                return true;
            }
        }
    };
}]);

services.factory('refreshImageService', ['$resource',
function($resource) {
    return $resource('v2.0/device/:deviceId/img', {
        deviceId: '@deviceId'
    }, {
        refresh: {
            method: 'GET',
            params: {},
            isArray: false
        }
    });
}]);

services.factory('removeImageService', ['$resource',
function($resource) {
    return $resource('v2.0/photo/:id/:typeId', {
        id: '@id',
        typeId: '@typeId'
    }, {
        remove: {
            method: 'DELETE',
            params: {},
            isArray: false
        }
    });
}]);

services.factory('actionService', ['$resource', '$http',
function($resource, $http) {
    return {
        myRe: $resource('/user/:userId', {
            userId: '@id'
        }),
        add: function(url, params, callsucess, callfailure) {
            $http.post(url, params).success(callsucess).error(callfailure);
        },
        update: function(url, params, callsucess, callfailure) {
            $http.put(url, params).success(callsucess).error(callfailure);
            // $http.post('uck', params, {headers: {'Content-Type':
            // 'application/json'}}).success(callsucess).error(callfailure);
            // $http({method: 'POST', url: url1, headers: {'Content-Type':
            // 'application/json'}});
            // $http.post(url1, params).success(callsucess).error(callfailure);
        },
        list: function(url, params, callsucess, callfailure) {
            $http.post(url, params).success(callsucess).error(callfailure);
        },
        remove: function(url, paramData, callsucess, callfailure) {
            $http.delete(url, {
                params: paramData
            }).success(callsucess).error(callfailure);
        },
        getSwitchSersor: function(url, params, callsucess, callfailure) {
            $http.get(url, params).success(callsucess).error(callfailure);
        }
    };
}]);

services.factory('dataPassService', function() {
    var func = {};
    return {
        setCallBack: function(callback) {
            func = callback;
        },
        setData: function(data) {
            func(data);
        }
    };
});

services.factory('triggerService', ['$http',
function($http) {
    return {
        add: function(url, params, callsucess, callfailure) {
            $http.post(url, params).success(callsucess).error(callfailure);
        },
        list: function(url, params, callsucess, callfailure) {
            $http.post(url, params).success(callsucess).error(callfailure);
        },
        update: function(url, params, callsucess, callfailure) {
            $http.put(url, params).success(callsucess).error(callfailure);
        },
        remove: function(url, params, callsucess, callfailure) {
            $http.delete(url, params).success(callsucess).error(callfailure);
        }
    }
}]);

services.factory('copyService', [
function() {
    return {
        copyInit: function(buttonId, targetId) {
            clip = new ZeroClipboard.Client();
            clip.setHandCursor(true);
            clip.addEventListener('mouseOver', function(client) {
                // update the text on mouse over
                clip.setText($('#' + targetId).html());
            });
            clip.addEventListener('complete', function(client, text) {
                // debugstr("Copied text to clipboard: " + text );
                alert("该地址已经复制，你可以使用Ctrl+V 粘贴。");
            });
            clip.glue(buttonId);
        }
    };
}]);