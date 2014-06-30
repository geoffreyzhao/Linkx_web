*MyDevice* category api description
===================================

* author: `Jarred.Ge`
* last modify: 2013-12-26



1. addMyDevice
-----------
* description
用户新增设备，即：保存设备添加时，用户的输入数据。


* 老版url
`/device` _POST_


* post data
```
{
    "title": "device10",
    "description": "device1 api",
    "tags": "tag1", // 这里可能需要使用数组来保存
    "type": "OWN_DEVICE",
    "position": "Shanghai",
    "latitude": 0.444,
    "longitude": 0.555,
    "status": "SHUTDOWN",
    "isExposed": 1,
    "placeType": "OUTSIDE"
}
```
**ps**: 目前前端界面上还没有`isExposed`和`placeType`字段，待添加


* return data
```
{
    "code":200,
    "message":"Request has been processed successfully",
    "data":{
        "id":11,
        "title":"device10",
        "description":"device1api",
        "tags":"tag1",
        "type":"OWN_DEVICE",
        "position":"Shanghai",
        "latitude":0.444,
        "longitude":0.555,
        "status":"SHUTDOWN",
        "isExposed":1,
        "placeType":"OUTSIDE",
        "imgPath":[],
        "imgId":[]
    }
}
```
**ps**： 返回的数据中，`imgPath`和`imgId`字段有待讨论。其实创建成功后，返回数据如下即可（仅供参考）
```
{
    "code":200,
    "message":"Request has been processed successfully",
    "data":{
        "id":11
    }
}
```

* conclusion
集成此api



2. editMyDevice(@deviceId)
------------
* description
用户编辑我的设备


* 老版url
`/device/<device_id>` _PUT_


* put data
```
{
    "title": "device10",
    "description": "device1 api",
    "tags": "tag1",
    "type": "OWN_DEVICE",
    "position": "Shanghai",
    "latitude": 0.444,
    "longitude": 0.555,
    "status": "SHUTDOWN",
    "isExposed": 1,
    "placeType": "OUTSIDE"
  }
```
**ps**: 这里可以考虑只作增量修改，即：`put data`只收集change patch（仅供参考）


* return data
```
{
    "code":200,
    "message":"Request has been processed successfully",
    "data":{
        "id":11,
        "title":"device11",
        "description":"device1 api",
        "tags":"tag11",
        "type":"OWN_DEVICE",
        "position":"Shanghai",
        "latitude":0.444,
        "longitude":0.555,
        "status":"SHUTDOWN",
        "isExposed":1,
        "placeType":"OUTSIDE",
        "imgPath":null,
        "imgId":null
    }
  }
```
**ps**: 修改成功后，可以只返回一下数据即可（仅供参考）
```
{
    "code":200,
    "message":"Request has been processed successfully",
    "data":{
        "id":11 // 使用`进攻式编程`，即修改成功返回其id，不成功返回null
    }
}
```


* conclusion
集成此api



3. getMyDevice(@deviceId)
----------------------
* description
根据`deviceId`获取某一设备的详情


* 老版url
`/device/<device_id>` _GET_


* parameters
    1. `deviceId` _REQUIRED_


* return data
```
{
    "code": 200,
    "message": "Request has been processed successfully",
    "url": null,
    "data": {
        "id": 23,
        "title": "device123",
        "description": "device1 api",
        "tags": "tag1",
        "type": "OWN_DEVICE",
        "position": "Shanghai",
        "latitude": 0.444,
        "longitude": 0.555,
        "status": "SHUTDOWN",
        "isExposed": 1,
        "placeType": "OUTSIDE",
        "imgPath": null,
        "imgId": null
    }
}
```


* conclusion
集成此api



5. delMyDevice(@deviceId)
-----------------------
* description


* 老版url
`/device/<device_id>` _DELETE_


* return data
```
{
    "code":200,
    "message": "Request has been processed successfully",
    "data": null
}
```
**ps**: 这里可以采取和`editMyDevice(@deviceId)`类似的返回值格式（仅供参考）


* conclusion
集成此api



6. getMyDeviceList
--------------------
* description
获取用户名下MyDevice类别下的所有设备


* 老版url
`/device/list` _GET_


* return data
```
{
    "code": 200,
    "message": null,
    "data":[{
        "id":3,
        "title":"device33",
        "description":"33333",
        "tags":"333333",
        "type":"OWN_DEVICE",
        "position":"Lope, 加蓬",
        "latitude":0.10342821579800057,
        "longitude":12.348823242187564,
        "status":"ONWORKING",
        "isExposed":0,
        "placeType":"INSIDE",
        "imgPath":null,
        "imgId":null
    }, {
        "id":4,
        "title":"joker11",
        "description":"joker11",
        "tags":"joker11",
        "type":"OWN_DEVICE",
        "position":"中国上海市浦东新区张江路493号 ",
        "latitude":31.20692875060323,
        "longitude":121.61453247070312,
        "status":"ONWORKING",
        "isExposed":1,
        "placeType":"INSIDE",
        "imgPath":null,
        "imgId":null
    }]
}
```


* conclusion
集成此api



7. 设备图片相关的api
---------------------
* urls
    1. 保存设备封面图片 `/device/<device_id>/img` _POST_
    2. 获取设备封面图片 `/device/<device_id>/img` _GET_
    3. 删除设备封面图片 `/<device_id>/img/<deviceImgId>` _DELETE_


* conclusion
暂时不考虑此类api



8. addSensor
-------------
* description
在某一设备下新建传感器

* 老版url
`/device/<device_id>/sensor` _POST_

* post data
现有的`post data`数据格式如下：
```
{
    "type": "NUMBER",
    "title": "num",
    "description": "sensor1 api",
    "tags": "tag1",
    "properties":{
        "symbol":"C",
    }
}
```
或者
```
{
    "type": <"GPS"|"GEN"|"WEIBO"|"SWITCH"|"IMAGE">,
    "title": "num",
    "description": "sensor1 api",
    "tags": "tag1"
}
```
**ps**: 前者是针对数值型传感器，后者是针对泛型传感器。这里可以将所有类型的传感器的`post data`都糅合在一起，根据用户在界面上实际添加的传感器类型进行传值，后端api进行柯里化处理即可（仅供参考）。


* return data
```
{
    "code": 200,
    "message": null,
    "data": {
        "id": 15
    }
}
```

* conlusion
集成此api



9. editSensor
--------------
* description
根据传感器ID编辑已经接入的传感器.


* 老版url
`/device/<device_id>/sensor/<sensor_id>` _PUT_


* put data
与`addSensor`的`post data`类似


* return data
```
{
    "code": 200,
    "message": null,
    "data": {
        "id": 15
    }
}
```


* conclusion
集成此api



10. getSensor
-------------
* description
根据`deviceId`和`sensorId`查看对应传感器的详情


* 老版url
`/device/<device_id>/sensor/<sensor_id>` _GET_


* parameters
    1. deviceId _REQUIRED_
    2. sensorId _REQUIRED_

* return data
```
 {
    "code": 200,
    "message": null,
    "url": null,
    "data": {
        "id": 13,
        "title": "xxx定位器",
        "description": "xxxx",
        "tags": "xxxx",
        "type": <"number"|"GPS"|"GEN"|"WEIBO"|"SWITCH"|"IMAGE">,
        "properties":{
                "<name>":"<value>",
        }
    }
}
```


* conclusion
集成此api


11. delSensor
--------------
* description
根据`deviceId`和`sensorId`删除对应传感器


* 老版url
`/device/<device_id>/sensor/<sensor_id>` _DELETE_


* return data
```
 {
    "code": 200,
    "message": null,
    "data": null
}
```
**ps**：这里可以采取和`editMyDevice(@deviceId)`类似的返回值格式（仅供参考）



12. getSensorList(@deviceId)
-----------------
* description
根据给定的`deviceId`罗列该设备下所有的传感器


* 老版url
`/device/<device_id>/sensor/list` _GET_

* parameters
    1. deviceId _REQUIRED_


* return data
```
{
    "code": 200,
    "message": null,
    "url": null,
    "data": [{
            "id": 4,
            "title": "image",
            "description": "image",
            "tags": "image",
            "type": "IMAGE"
        }, {
            "id": 3,
            "title": "switch",
            "description": "switch",
            "tags": "switch",
            "type": "SWITCH"
        }, {
            "id": 2,
            "title": "gps1",
            "description": "gps",
            "tags": "gps",
            "type": "GPS",
        }, {
            "id": 1,
            "title": "sensor1",
            "description": "this is a sensor for sensor1.",
            "tags": "sensor+wo",
            "type": "NUMBER",
            "properties":{
                "symbol":"C",
            }
        }]
}
```

* conclusion
集成此api


13. datapoint apis
-------------------
（to be continued）
