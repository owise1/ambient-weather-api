require('dotenv').config()
const AmbientWeatherApi = require('../lib/index')

const api = new AmbientWeatherApi({
  apiKey: process.env.AMBIENT_WEATHER_API_KEY || 'Put your AW apiKey here',
  applicationKey: process.env.AMBIENT_WEATHER_APPLICATION_KEY || 'Put your AW applicationKey here'
})
api.connect()
