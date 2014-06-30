LinkX Observer Model Events
===========================

## Overview
* Author: Jarred Ge
* Create Time: 2013-12-5
* Last Modified: 2013-12-6


#### `event.alert.pull`

*Actions*

* pull message to `Alert` to show

*Parameters*

    {
        type: 'success',
        title: '',
        message: 'You read this message successfully.'
    }

* `type`
    1. **required**
    2. *optional value:* **`success`** **`warning`** **`info`** **`danger`**
* `title`
    1. *optional*
    2. *suggest to use default by `type`*
* `message`
    1. **required**
    2. the message you want to pull to the `Alert`


#### `event.navi.update`

*Actions*

* update the navigator after `Login` or `Logout`

*Parameters*

    {
        signin: true
        userName: 'joker'
    }

* `signin `
    1. **required**
* `userName`
    1. **required**
    2. update when user sign up


#### `event.locale.update`

*Actions*

* update the language when change the locales

*Parameters*

    {
        locale: 'zh-CN'
    }

* `online `
    1. **required**
    2. according to the multi-language select


#### `event.loading.start`

*Actions*

* start ajax-loading layer

*Parameters*

* none


#### event.loading.stop

*Actions*

* stop ajax-loading layer

*Parameters*

* none