define(['require'], function(require) {
    'use strict';

    var config = {};

    config.api = {
        onlineConfig: {
            path: 'http://192.168.225.238',
            port: ':8080',
            project: '/linkx_refactor',
            version: '/v2.0'
        },
        contextPath: function() {
            // `/linkx/index.html` => `/linkx`
            var offline_contextPath = '/' + window.location.pathname.split('/')[1],
                online_contextPath =
                    this.onlineConfig.path +
                    this.onlineConfig.port +
                    this.onlineConfig.project +
                    this.onlineConfig.version;

           return this.online ? online_contextPath : offline_contextPath;
        },

        getServiceURL : function(serviceKey, paramKey) {
            var apiURLs = config.api.apiURL[config.api.online ? "online" : "offline"],
                contextPath = config.api.contextPath(),
                serviceURL = apiURLs[serviceKey];

            if (serviceURL) {
                var reg = /\{([^\}]+)\}/g,
                    result;

                serviceURL = serviceURL.replace(reg, function(str, key) {
                    result = str;
                    if (key in paramKey) {
                        result = paramKey[key];
                    }
                    return result;
                });
            }
            return serviceURL ? contextPath + serviceURL : '';
        },

        online : true,
        apiURL : {
            online : {
                // TODO
                'user_login': '/user/login',
                'user_register': '/user/register',
                'user_logout': '/user/logout',
                'get_password': '',

                'mylinkx_getFollowsDevice': '/user/getFollowDevice/{deviceId}',
                'mylinkx_getFollowsData': '',
                'mylinkx_getFollowsDeviceList': '/user/getFollowDevice',
                'mylinkx_getFollowsDataList': '/user/getFollowDataList',
                'mylinkx_getFollowsDataDetail': '/user/followDataPoints/{followDataId}',
                'mylinkx_getFollowsDataValues': '/user/followDataPoints/{followDataId}/vals',


                'mylinkx_addMyDevice': '/device',
                'mylinkx_editMyDevice': '/device/{deviceId}',
                'mylinkx_getMyDevice': '/device/{deviceId}',
                'mylinkx_delMyDevice': '/device/{deviceId}',
                'mylinkx_getMyDeviceList': '/device/list',

                'mylinkx_addSensor': '/device/{deviceId}/sensor',
                'mylinkx_editSensor': '/device/{deviceId}/sensor/{sensorId}',
                'mylinkx_getSensor': '/device/{deviceId}/sensor/{sensorId}',
                'mylinkx_delSensor': '/device/{deviceId}/sensor/{sensorId}',
                'mylinkx_getSensorList': '/device/{deviceId}/sensor/list',
                'mylinkx_getLatestDatapoint':'/device/{deviceId}/sensor/{sensorId}/datapoint',
                'mylinkx_getDatapoints': '/device/{deviceId}/sensor/{sensorId}/datapoint/list',
                'mylinkx_getSensorTags': '/common/sensor/tags',
                'mylinkx_searchDevice': '/device/search',
                'mylinkx_searchFollowDataPoints': '/user/followDataPoints',
                'mylinkx_followDevice': '/user/followDevice',
                'mylinkx_followData': '/user/followData',
                'mylinkx_unfollowData': '/user/unfollowData',
                'mylinkx_unfollowDevice': '/user/unfollowDevice',

                'mylinkx_upload_img_4_device': '/image/device',
                'mylinkx_bindImgToDevice': '/device/{deviceId}/img',
                'mylinkx_getBindedImgOfDevice': '/device/{deviceId}/img',
                'mylinkx_unBindImgToDevice': '/device/{deviceId}/img/{imgId}',

                'mylinkx_cutImg': '/image/cut',

                'mylinkx_getMyRuleList': '/rule/list',
                'mylinkx_delRule': '/rule/{ruleId}',
                'mylinkx_addRule': '/rule',
                'mylinkx_editRule': '/rule/{ruleId}',
                'mylinkx_getRule': '/rule/{ruleId}',

                'mylinkx_getDeviceStatus': '/device/{deviceId}/status',

                'mylinkx_getSnsPermission': '/sns/permission',
                'mylinkx_bindSocial': '/sns/connect/{provider}',

                'mylinkx_getControlPanel': '/device/{deviceId}/control/panel',
                'mylinkx_sendDCCommand':'/device/{deviceId}/control/request',
                'mylinkx_getDCCommandStatus':'/device/{deviceId}/control/{commandKey}'
            },
            offline : {
                // TODO
                'user_login': '/data/user/user_login.json',
                'user_register': '/data/user/user_register.json',
                'user_logout': '/data/user/user_logout.json',
                'get_password': '',

                //'mylinkx_getUserType': '/data/mylinkx/mylinkx_getUserType.json',
                //'mylinkx_getMyDevice': '/data/mylinkx/mylinkx_getMyDevice.json',
                'mylinkx_getFollowsDeviceList': '/data/mylinkx/mylinkx_getFollowsDeviceList.json',
                'mylinkx_getFollowsDataList': '/data/mylinkx/mylinkx_getFollowsDataList.json',

                'mylinkx_addMyDevice': '/data/mylinkx/device/addMyDevice.json',
                'mylinkx_editMyDevice': '/data/mylinkx/device/editMyDevice.json',
                'mylinkx_getMyDevice': '/data/mylinkx/device/getMyDevice.json',
                'mylinkx_delMyDevice': '/data/mylinkx/device/delMyDevice.json',
                'mylinkx_getMyDeviceList': '/data/mylinkx/device/getMyDeviceList.json',

                'mylinkx_addSensor': '/data/mylinkx/sensor/addSensor.json',
                'mylinkx_editSensor': '/data/mylinkx/sensor/editSensor.json',
                'mylinkx_getSensor': '/data/mylinkx/sensor/getSensor.json',
                'mylinkx_delSensor': '/data/mylinkx/sensor/delSensor.json',
                'mylinkx_getSensorList': '/data/mylinkx/sensor/getSensorList.json',
                'mylinkx_getSensorTags': '/data/mylinkx/sensor/getSensorTags.json',
                'mylinkx_searchDevice': '/data/mylinkx/mylinkx_user_discovery_device.json',
                'mylinkx_searchFollowDataPoints': '/data/mylinkx/mylinkx_user_discovery_data.json',
                'mylinkx_followDevice': '/data/mylinkx/mylinkx_add_follow_device.json',
                'mylinkx_followData': '/data/mylinkx/mylinkx_add_follow_data.json',
                'mylinkx_getLatestDatapoint':'/data/mylinkx/datapoint/mylinkx_get_latest_datapoint.json',
                'mylinkx_getDatapoints': '/data/mylinkx/datapoint/mylinkx_get_datapoints.json'
            }
        }
    };

    config.consts = {
        storeKey: {
            USER_INFO: 'user_info',
            MYDEVICE_LIST: 'mydevice_list',
            FOLLOWSDEVICE_LIST: 'followsdevice_list',
            FOLLOWSDATA_LIST: 'followsdata_list'
        },
        messageKey: {

        },
        deviceStatusTag: {
            NONE: "NONE",
            FOLLOWED: "FOLLOWED",
            OWN: "OWN"
        },
        deviceDefaultCover: "images/mylinkx/default_item.png",
        addCover4Device: "images/mylinkx/icon_add.png",
        loadingImage: 'images/ajax-loader.gif',
        myDeviceLogo: 'images/mylinkx/mydevicelogo.jpg',
        categoryActive: 'images/mylinkx/category_active.jpg',
        categoryItemActive: 'images/mylinkx/category_item_active.jpg',
        followDeviceLogo: 'images/mylinkx/followedDevice_logo.jpg',
        followDataLogo: 'images/mylinkx/followData_logo.jpg'

    };

    config.locale = {
        defaults : {
            locale : 'zh-CN',
            path : 'i18n',
            prefix: 'locale'
        },
        locales : ['zh-CN', 'en-US']
    };

    config.partials = {
        'navigator': 'partials/navigator.html',
        'footer': 'partials/footer.html',
        'alert': 'partials/alert.html',
        'homepage': 'partials/homepage.html',


        // exp
        'exp_discovery': 'partials/exp/exp_discovery.html',

        // user
        'user_dashboard': 'partials/userActive/dashboard.html',
        'user_mylinkx': 'partials/userActive/mylinkx.html',
        'user_discovery': 'partials/userActive/discovery.html',
        'user_account': 'partials/userActive/user_account.html',

        'user_login': 'partials/user/user_login.html',
        'user_register': 'partials/user/user_register.html',
        'get_password': 'partials/user/get_password.html',

        //my linkx
        'mylinkx_own': 'partials/userActive/mylinkx/mylinkx_own.html',
        'mylinkx_own_detail': 'partials/userActive/mylinkx/mylinkx_own_detail.html',
        'mylinkx_follows_device': 'partials/userActive/mylinkx/mylinkx_follows_device.html',
        'mylinkx_follows_data': 'partials/userActive/mylinkx/mylinkx_follows_data.html',
        'mylinkx_data_detail': 'partials/userActive/mylinkx/mylinkx_data_detail.html',
        'mylinkx_device_add': 'partials/userActive/mylinkx/mylinkx_device_add.html',
        'mylinkx_sensor_add': 'partials/userActive/mylinkx/mylinkx_sensor_add.html',
        'mylinkx_sensor_detail': 'partials/userActive/mylinkx/mylinkx_sensor_detail.html',

        'direc_tags': 'partials/directemplate/tags.html',
        'direc_dp_number': 'partials/directemplate/dp_number.html',

        'device_image_carousel': 'partials/directemplate/device_image_carousel.html',
        'light_box': 'partials/directemplate/lightbox.html',

        // rule, action, trigger
        'mylinkx_rule_list': 'partials/userActive/mylinkx/mylinkx_rule_list.html',
        'mylinkx_rule_add': 'partials/userActive/mylinkx/mylinkx_rule_add.html',

        //control panel detail
        'mylinkx_controlpanel_detail': 'partials/userActive/mylinkx/mylinkx_controlpanel_detail.html'
    };

    var partials = config.partials;
    config.routers = {
        '/': {
            partial: partials.user_mylinkx,
            ctrl: 'user_mylinkxCtrl'
        },
        '/exp_discovery': {
            partial: partials.exp_discovery,
            ctrl: 'exp_discoveryCtrl'
        },
        '/user_login': {
            partial: partials.user_login,
            ctrl: 'user_loginCtrl'
        },
        '/user_register': {
            partial: partials.user_register,
            ctrl: 'user_registerCtrl'
        },
        '/get_password': {
            partial: partials.get_password,
            ctrl: 'get_passwordCtrl'
        },

        '/user_account': {
            partial: partials.user_account,
            ctrl: 'user_accountCtrl'
        },

        '/user_dashboard': {
            partial: partials.user_dashboard,
            ctrl: 'user_dashboardCtrl'
        },
        '/user_mylinkx': {
            partial: partials.user_mylinkx,
            ctrl: 'user_mylinkxCtrl'
        },
        '/user_mylinkx/:category': {
            partial: partials.user_mylinkx,
            ctrl: 'user_mylinkxCtrl'
        },
        '/user_mylinkx/:category/:detailId': {
            partial: partials.user_mylinkx,
            ctrl: 'user_mylinkxCtrl'
        },
        '/user_discovery': {
            partial: partials.user_discovery,
            ctrl: 'user_discoveryCtrl'
        }

    };

    config.alert = {
        types: {
            'success': {
                clazz: 'alert-success',
                title: 'Well done',
                message: ''
            },
            'info': {
                clazz: 'alert-info',
                title: 'Heads up',
                message: ''
            },
            'warning': {
                clazz: 'alert-warning',
                title: 'Warning',
                message: ''
            },
            'danger': {
                clazz: 'alert-danger',
                title: 'Oh snap',
                message: ''
            }
        },
        timeout: 5000
    };

    window._config = config;

    return config;
});