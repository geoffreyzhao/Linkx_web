define(['../controllers'], function(controllers) {
    'use strict';

    controllers.controller('alertCtrl', [
        '$scope',
        'ob',
        '$timeout',
        function($scope, ob, $timeout) {

            /***********************************************************************
             * publish and subscribe
             **********************************************************************/
            ob.subscribe('event.alert.pull', _pullMessage);
            ob.subscribe('event.alert.clear', _clearMessage);

            var config = _config,
                alert = config.alert,
                types = alert.types;

            $scope.messageQueue = [];

            $scope.stopTimeout = function(index) {
                $scope.messageQueue.splice(index, 1);
            };

            function _pullMessage(data) {
                // data -> {type: '', title: '', message: ''}
                if (!types[data.type]) {
                    // TODO just for dev
                    console.log('can not show alert because of having no', data.type, 'type');
                }
                $(".message_queue").css("display", "block");
                var messageObj = {};
                messageObj.clazz = types[data.type].clazz;
                messageObj.messageIcon = _showAlertIcon(data.type);
                messageObj.showCloseIcon = _showCloseIcon(data.timeout, data.type);
                messageObj.message = data.message || types[data.type].message;

                $scope.messageQueue.push(messageObj);

                if ( !! data.timeout) {
                    var loc = _getRemoveAlertLoc;
                    $timeout(function() {
                        $scope.messageQueue.splice(loc, 1);
                    }, data.timeout);
                }

                if ("success" == data.type) {
                    var loc = _getRemoveAlertLoc();
                    $timeout(function() {
                        $scope.messageQueue.splice(loc, 1);
                    }, alert.timeout);
                }
            }

            function _getRemoveAlertLoc() {
                _.each($scope.messageQueue, function(v){
                    if (v.clazz == "alert-success") {
                        return _.indexOf($scope.messageQueue, v);
                    } else if (v.clazz == "alert-info" && !v.showCloseIcon) {
                        return _.indexOf($scope.messageQueue, v);
                    }
                });
            }

            function _clearMessage() {
                $(".message_queue").css("display", "none");
                $scope.messageQueue = [];
            }

            function _showAlertIcon(type) {

                if ("success" == type) {
                    return "success_message_icon";
                } else if ("info" == type) {
                    return "info_message_icon";
                } else {
                    return "danger_message_icon";
                }
            }

            function _showCloseIcon(timeout, type) {
                if ("success" == type) {
                    return false;
                } else if ("info" == type && !!timeout) {
                    return false;
                } else {
                    return true;
                }
            }

        }
    ]);
});