require('dotenv').config()
const AmbientWeatherApi = require('../lib/index')

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

api.on('subscribed', data => {
  console.log('Subscribed to ' + data.devices.length + ' device(s): ')
  console.log(data.devices.map(getName).join(', '))
})
api.on('data', data => {
  console.log(data.date + ' - ' + getName(data.device) + ' current outdoor temperature is: ' + data.tempf + '°F')
})
api.subscribe(apiKey)
