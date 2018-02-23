import request from 'request-promise'
import { propEq, find, equals, filter, not, map, pipe, toPairs, join } from 'ramda'
import io from 'socket.io-client'
const EventEmitter = require('events')

const API_URL = 'https://api.ambientweather.net/'
const AW_API_URL = API_URL + 'v1/devices/'

module.exports = class AmbientWeatherApi extends EventEmitter {
  constructor (opts) {
    const { apiKey, applicationKey } = opts
    if (!apiKey) {
      throw new Error('You need an apiKey')
    }
    if (!applicationKey) {
      throw new Error('You need an applicationKey')
    }
    super()
    this.apiKey = apiKey
    this.applicationKey = applicationKey
    this.requestQueue = []
    this.subscribedDevices = []
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

  connect () {
    if (this.socket) {
      return
    }
    this.socket = io(API_URL + '?api=1&applicationKey=' + this.applicationKey, {
      transports: ['websocket']
    })
    ;['error', 'connect'].forEach((key) => {
      this.socket.on(key, (data) => {
        this.emit(key, data)
      })
    })
    this.socket.on('subscribed', (data) => {
      this.subscribedDevices = data.devices || []
      this.emit('subscribed', data)
    })
    this.socket.on('data', (data) => {
      // find the device this data is for using the macAddress
      data.device = find(propEq('macAddress', data.macAddress), this.subscribedDevices)
      this.emit('data', data)
    })
  }
  disconnect () {
    this.socket.disconnect()
    delete this.socket
  }
  subscribe (apiKeyOrApiKeys) {
    const apiKeys = Array.isArray(apiKeyOrApiKeys) ? apiKeyOrApiKeys : [apiKeyOrApiKeys]
    this.socket.emit('subscribe', { apiKeys })
  }
  unsubscribe (apiKeyOrApiKeys) {
    const apiKeys = Array.isArray(apiKeyOrApiKeys) ? apiKeyOrApiKeys : [apiKeyOrApiKeys]
    this.socket.emit('unsubscribe', { apiKeys })
  }
}
