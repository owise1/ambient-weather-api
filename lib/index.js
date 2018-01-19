'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _ramda = require('ramda');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AW_API_URL = 'https://ambient-weather-api.herokuapp.com/v1/devices/';

module.exports = function () {
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
    this.apiKey = apiKey;
    this.applicationKey = applicationKey;
  }

  _createClass(AmbientWeatherApi, [{
    key: '_apiRequest',
    value: function _apiRequest(url) {
      return (0, _requestPromise2.default)({
        url: url,
        json: true
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
  }]);

  return AmbientWeatherApi;
}();