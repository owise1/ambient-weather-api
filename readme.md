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

## Methods

* `userDevices()` - list the user's devices
    * `@return` - Promise containing array of device objects
* `deviceData(macAddress, options)` - fetch data for a specific device
    * `macAddress` - (required)
    * `options` - limit, endDate see [docs](https://ambientweather.docs.apiary.io/)
    * `@return` - Promise containing array of data objects


