services.factory('dataPoolServ', function() {
    var storage = {
        i18n: null,
        bsAlert: null
    };
    return {
        i18n: {
            set: function(i18n) {
                storage.i18n = i18n;
            },
            get: function() {
                return storage.i18n;
            }
        },
        message: {
            set: function(msg) {
                storage.message = msg;
            },
            get: function() {
                return storage.message;
            }
        },
        bsAlert: {
            add: function(callback) {
                storage.bsAlert = callback;
            },
            set: function(data) {
                data !== undefined && storage.bsAlert && storage.bsAlert(data);
            }
        },
        alertShow: {
            set: function(display) {
                storage.alertShow = display;
            },
            get: function() {
                return storage.alertShow;
            }
        },
        showDeviceIndex:{
            add: function(callback) {
                storage.showDeviceIndex = callback;
            },
            set: function(data) {
                data !== undefined && storage.showDeviceIndex && storage.showDeviceIndex(data);
            }
        },
        showSensors: {
            add: function(callback) {
                storage.showSensors = callback;
            },
            set: function(data) {
                data !== undefined && storage.showSensors && storage.showSensors(data);
            }
        },
        showAccountMenu: {
            add: function(callback) {
                storage.showAccountMenu = callback;
            },
            set: function(data) {
                data !== undefined && storage.showAccountMenu && storage.showAccountMenu(data);
            }
        },
        haveDevice: {
            add: function(callback) {
                storage.haveDevice = callback;
            },
            set: function(data) {
                data !== undefined && storage.haveDevice && storage.haveDevice(data);
            }
        }
    };
});
