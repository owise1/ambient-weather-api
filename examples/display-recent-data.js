require('dotenv').config()
const AmbientWeatherApi = require('../lib/index')

const api = new AmbientWeatherApi({
  apiKey: process.env.AMBIENT_WEATHER_API_KEY || 'Put your AW apiKey here',
  applicationKey: process.env.AMBIENT_WEATHER_APPLICATION_KEY || 'Put your AW applicationKey here'
})

// list the user's devices
api.userDevices()
.then((devices) => {

  devices.forEach((device) => {
    // fetch the most recent data
    api.deviceData(device.macAddress, {
      limit: 5
    })
    .then((deviceData) => {
      console.log('The 5 most recent temperature reports for ' + device.info.name + ' - ' + device.info.location + ':')
      deviceData.forEach((data) => {
        console.log(data.date + ' - ' + data.tempf + '°F')
      })
      console.log('---')
    })
  })
})
