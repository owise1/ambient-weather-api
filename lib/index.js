'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _ramda = require('ramda');

var _socket = require('socket.io-client');

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('events');

var API_URL = 'https://api.ambientweather.net/';
var AW_API_URL = API_URL + 'v1/devices/';

module.exports = function (_EventEmitter) {
  _inherits(AmbientWeatherApi, _EventEmitter);

  function AmbientWeatherApi(opts) {
    _classCallCheck(this, AmbientWeatherApi);

    var apiKey = opts.apiKey,
        applicationKey = opts.applicationKey;

    if (!apiKey) {
      throw new Error('You need an apiKey');
    }
    if (!applicationKey) {
      throw new Error('You need an applicationKey');
    }

    var _this = _possibleConstructorReturn(this, (AmbientWeatherApi.__proto__ || Object.getPrototypeOf(AmbientWeatherApi)).call(this));

    _this.apiKey = apiKey;
    _this.applicationKey = applicationKey;
    _this.requestQueue = [];
    _this.subscribedDevices = [];
    return _this;
  }

  _createClass(AmbientWeatherApi, [{
    key: '_apiRequest',
    value: function _apiRequest(url) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          (0, _requestPromise2.default)({
            url: url,
            json: true
          }).then(function (res, body) {
            _this2.requestQueue = (0, _ramda.filter)((0, _ramda.pipe)((0, _ramda.equals)(url), _ramda.not), _this2.requestQueue);
            resolve(res);
          }).catch(function (err) {
            // handle rate limiting
            if (err.statusCode === 429) {
              _this2.requestQueue.push(url);
              _this2._apiRequest(url).then(resolve);
            } else {
              reject(err);
            }
          });
        }, _this2.requestQueue.length * 1100);
      });
    }
  }, {
    key: '_getUrl',
    value: function _getUrl() {
      var macAddress = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      return AW_API_URL + macAddress + '?apiKey=' + this.apiKey + '&applicationKey=' + this.applicationKey;
    }
  }, {
    key: 'userDevices',
    value: function userDevices() {
      return this._apiRequest(this._getUrl());
    }
  }, {
    key: 'deviceData',
    value: function deviceData(macAddress, opts) {
      if (!macAddress) {
        throw new Error('You need a macAddress for deviceData');
      }
      var url = this._getUrl(macAddress);
      if (opts) {
        url += '&' + (0, _ramda.pipe)(_ramda.toPairs, (0, _ramda.map)((0, _ramda.join)('=')), (0, _ramda.join)('&'))(opts);
      }
      return this._apiRequest(url);
    }
  }, {
    key: 'connect',
    value: function connect() {
      var _this3 = this;

      if (this.socket) {
        return;
      }
      this.socket = (0, _socket2.default)(API_URL + '?api=1&applicationKey=' + this.applicationKey, {
        transports: ['websocket']
      });['error', 'connect'].forEach(function (key) {
        _this3.socket.on(key, function (data) {
          _this3.emit(key, data);
        });
      });
      this.socket.on('subscribed', function (data) {
        _this3.subscribedDevices = data.devices || [];
        _this3.emit('subscribed', data);
      });
      this.socket.on('data', function (data) {
        // find the device this data is for using the macAddress
        data.device = (0, _ramda.find)((0, _ramda.propEq)('macAddress', data.macAddress), _this3.subscribedDevices);
        _this3.emit('data', data);
      });
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      this.socket.disconnect();
      delete this.socket;
    }
  }, {
    key: 'subscribe',
    value: function subscribe(apiKeyOrApiKeys) {
      var apiKeys = Array.isArray(apiKeyOrApiKeys) ? apiKeyOrApiKeys : [apiKeyOrApiKeys];
      this.socket.emit('subscribe', { apiKeys: apiKeys });
    }
  }, {
    key: 'unsubscribe',
    value: function unsubscribe(apiKeyOrApiKeys) {
      var apiKeys = Array.isArray(apiKeyOrApiKeys) ? apiKeyOrApiKeys : [apiKeyOrApiKeys];
      this.socket.emit('unsubscribe', { apiKeys: apiKeys });
    }
  }]);

  return AmbientWeatherApi;
}(EventEmitter);