require('dotenv').config()
const AmbientWeatherApi = require('../lib/index')
const R = require('ramda')

// helper function
function getName (device) {
  return device.info.name
}

const apiKey = process.env.AMBIENT_WEATHER_API_KEY || 'Put your AW apiKey here'
const api = new AmbientWeatherApi({
  apiKey,
  applicationKey: process.env.AMBIENT_WEATHER_APPLICATION_KEY || 'Put your AW applicationKey here'
})
api.connect()
api.on('connect', () => console.log('Connected to Ambient Weather Realtime API!'))

var allDevices
api.on('subscribed', data => {
  console.log('Subscribed to ' + data.devices.length + ' device(s): ')
  allDevices = data.devices // store these for later
  console.log(allDevices.map(getName).join(', '))
})
api.on('data', data => {
  const device = R.find(R.propEq('macAddress', data.macAddress), allDevices) // find the device this data is for using the macAddress
  console.log(data.date + ' - ' + getName(device) + ' current outdoor temperature is: ' + data.tempf + '°F')
})
api.subscribe(apiKey)
