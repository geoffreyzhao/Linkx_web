define([
    './services',
    'echarts',
    'echarts/chart/bar',
    'echarts/chart/line'
], function(services, echarts) {
    'use strict';

    services.factory('chartProvider', [
        function() {
        	var exports = null,
                ec = echarts;

        	function _initChart(sensor, data, chartSelector) {
                $(chartSelector).removeClass('display-none');

                var myChart = ec.init($(chartSelector)[0]);

                var max = _.max(data.yData, function(dataValue){ return dataValue; }) ;
                var min = _.min(data.yData, function(dataValue){ return dataValue; }) ;
                var range = ( max - min ) * 0.1;
                max += range;
                min -+ range;

                var unitName = sensor.properties.unitName ? sensor.properties.unitName: '';
                var symbol = sensor.properties.symbol ? '(' + sensor.properties.symbol + ')': '';
                myChart.setOption({
                     legend: {
                        data: [sensor.title]
                    },
                    tooltip : {
                        trigger: 'axis',
                        formatter: function(params,ticket,callback) {
                            return data.xData[ticket.substr(5)] + '<br/>' + params[0][2] ;
                        }
                    },
                    xAxis : [
                        {
                            type : 'category',
                            axisLine : {    // 轴线
                                show: true,
                                lineStyle: {
                                    color: '#e3e3e3',
                                    type: 'solid',
                                    width: 1
                                }
                            },
                            boundaryGap:false,
                            splitArea : {
                                show: false
                            },
                            splitLine : {
                                show:false
                            },
                            data : _getDateWithoutYear(data.xData)
                        }
                    ],
                    yAxis : [
                        {
                            axisLine : {    // 轴线
                                show: true,
                                lineStyle: {
                                    color: '#e3e3e3',
                                    type: 'solid',
                                    width: 1
                                }
                            },
                            min:min,
                            max:max,
                            type : 'value',
                            axisLabel:{
                                formatter:'{value}'+unitName+symbol
                            },
                            splitArea : {show : false}
                        }
                    ],
                    grid:{
                        x:80,
                        y:30,
                        width:670,
                        height:210
                    },
                    series : [
                        {
                            name:sensor.title,
                            type:'line',
                            data:data.yData
                        }
                    ]
                });

                return myChart;
        	}

        	function _rePaintChart(myChart ,data) {
        		myChart.setSeries(data);
        	}

            function _resetChart(chartSelector,myChart) {
                $(chartSelector).addClass('display-none');
                if (myChart != (undefined || null)) {
                    myChart.setSeries([], true);
                    myChart.clear();
                }
                
            }

            function _getDateWithoutYear (xData) {
                var newXData = [];
                _.each(xData, function(k,v) {
                    //remove year
                    newXData.push(k.substr(5));
                });  
                return newXData;       
            }
        	
			exports = {
                initChart: _initChart,
                rePaintChart: _rePaintChart,
                resetChart: _resetChart
        	};

        	return exports;
        }
    ]);
});
