var linkx = linkx || {};
linkx.config = {};
var config = linkx.config;

config.version = '1.0';
config.developmentMode = 'online';
linkx.api = null;
config.properties = null;
config.apiConfig = {
    online: {
        loginService: 'v2.0/user/login',
        registerService: 'v2.0/user/register',
        logoutService: 'v2.0/user/logout',
        getDeviceListService: 'v2.0/device/list',
        addDeviceService: 'v2.0/device',
        removeDeviceService: 'v2.0/device',
        updateDeviceService: 'v2.0/device',
        getActinoListService: 'v2.0/action/list',
        addTrigger: 'v2.0/action/trigger',
        listTrigger: 'v2.0/action/trigger/list'
    },
    offline: {
        loginService: 'mock/userLogin.json',
        registerService: 'mock/userRegister.json',
        logoutService: 'mock/userLogout.json',
        getDeviceListService: 'mock/getDeviceList.json',
        addDeviceService: 'mock/addDevice.json',
        removeDeviceService: 'mock/removeDevice.json',
        updateDeviceService: 'mock/updateDevice.json',
        getActinoListService: 'mock/getActionList.json'
    }
};
config.getAPI = function() {
    linkx.api = config.apiConfig[(config.developmentMode === 'online') ? 'online' : 'offline'];
};
config.setOnlineMode = function() {
    config.developmentMode = 'online';
    config.getAPI();
};
config.setOfflineMode = function() {
    config.developmentMode = 'offline';
    config.getAPI();
};
config.getProperties = function() {
    $.ajax({
        url:"properties/linkx.json", 
        type: "GET",
        dataType: "json",
        success: function(data){
            config.properties = data;
          }
        });
};

config.getAPI();

config.getProperties();

console.log(config.properties);
