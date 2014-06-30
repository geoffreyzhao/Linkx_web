define(['../services'], function(services) {
    'use strict';

    services.factory('ob', [function() {
        var exports,
            channels = {};

        exports = {
            subscribe : function(topic, callback) {
                if (!_.isArray(channels[topic])) {
                    channels[topic] = [];
                }

                var handlers = channels[topic];
                handlers.push(callback);
            },
            unsubscribe : function(topic, callback) {
                if (_.isArray(channels[topic])) {
                    var handlers = channels[topic];
                    if(!callback) {
                        channels[topic] = [];
                        return;
                    }
                    var index = _.indexOf(handlers, callback);
                    if (index >= 0) {
                        handlers.splice(index, 1);
                    }
                }
            },
            publish : function(topic, data) {
                var self = this;

                var handlers = channels[topic] || [];
                _.each(handlers, function(handler) {
                    try {
                        handler.apply(self, [data]);
                    } catch (ex) {
                        console.log(ex);
                    }
                });
            }
        };

        return exports;
    }]);
});
