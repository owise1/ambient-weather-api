import request from 'request-promise'
import { map, pipe, toPairs, join } from 'ramda'

const AW_API_URL = 'https://api.ambientweather.net/v1/devices/'

module.exports = class AmbientWeatherApi {
  constructor (opts) {
    const { apiKey, applicationKey } = opts
    if (!apiKey) {
      throw new Error('You need an apiKey')
    }
    if (!applicationKey) {
      throw new Error('You need an applicationKey')
    }
    this.apiKey = apiKey
    this.applicationKey = applicationKey
  }

  _apiRequest (url) {
    return request({
      url,
      json: true
    })
  }

  _getUrl (macAddress = '') {
    return AW_API_URL + macAddress + '?apiKey=' + this.apiKey + '&applicationKey=' + this.applicationKey
  }

  userDevices () {
    return this._apiRequest(this._getUrl())
  }

  deviceData (macAddress, opts) {
    if (!macAddress) {
      throw new Error('You need a macAddress for deviceData')
    }
    let url = this._getUrl(macAddress)
    if (opts) {
      url += '&' + pipe(
        toPairs,
        map(join('=')),
        join('&')
      )(opts)
    }
    return this._apiRequest(url)
  }
}
