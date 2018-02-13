# Ambient Weather API

A simple wrapper for the *forthcoming* AmbientWeather.net API

* [API Docs](https://ambientweather.docs.apiary.io/)
* check out the [examples](examples/)

## Installation 
```
npm install ambient-weather-api
```

## Getting Started

```
const api = new AmbientWeatherApi({
  apiKey: 'Put your AW apiKey here',
  applicationKey: 'Put your AW applicationKey here'
})
```

## REST Methods

* `userDevices()` - list the user's devices
    * `@return` - Promise containing array of device objects
* `deviceData(macAddress, options)` - fetch data for a specific device
    * `macAddress` - (required)
    * `options` - limit, endDate see [docs](https://ambientweather.docs.apiary.io/)
    * `@return` - Promise containing array of data objects
    
## Realtime Methods

* `connect` - connect to the realtime API
* `disconnect` - disconnect from the realtime API
* `subscribe` - `apiKeys` - (required) can be a `string` of a single `apiKey` or an `array` of multiple `apiKey`s. Will listen for data on all the devices for all of the user's `apiKeys`s. See `Event: subscribed` & `Event: data`
* `unsubscribe` - `apiKeys` - (required) can be a `string` of a single `apiKey` or an `array` of multiple `apiKey`s. Will stop listening for data on all of the user's `apiKey`s devices. See `Event: subscribed`
* `Event: subscribed` - emitted when successfully subscribed to one or more `apiKeys` using the `subscribe` method.  This event is also emitted after sucessfully unsubscribing. It will list all the currently subscribed devices
    * `data.devices` - array of device objects currently subscribed to
* `Event: data` - emitted on new data for a subscribed device
    * `data` - the weather data point
    * `data.device` - the device that data point is for


