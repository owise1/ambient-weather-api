import request from 'request-promise'
import { equals, filter, not, map, pipe, toPairs, join } from 'ramda'

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
    this.requestQueue = []
  }

  _apiRequest (url) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        request({
          url,
          json: true
        })
        .then((res, body) => {
          this.requestQueue = filter(pipe(equals(url), not), this.requestQueue)
          resolve(res)
        })
        .catch((err) => {
          // handle rate limiting
          if (err.statusCode === 429) {
            this.requestQueue.push(url)
            this._apiRequest(url).then(resolve)

          } else {
            reject(err)
          }
        })
      }, this.requestQueue.length * 1100)
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
