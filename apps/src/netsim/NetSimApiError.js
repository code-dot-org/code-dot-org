/**
 * @overview Extended error type returned for failed interactions with NetSim
 * server API (net_sim_api.rb) that extracts and exposes additional error info.
 */
'use strict';

require('../utils'); // provide Function.prototype.inherits

/**
 * Special error type for failed server requests, which tries to extract
 * additional error information from the server's response.
 * @param {jqXHR} request
 * @constructor
 * @extends Error
 */
var NetSimApiError = module.exports = function (request) {
  /** @type {string} */
  this.name = 'NetSimApiError';

  /** @type {string} */
  this.message = 'Request failed';

  /** @type {string} */
  this.stack = (new Error()).stack;

  /**
   * Additional error information returned by the server, which can drive
   * specific responses by the client.
   * @type {string|Array}
   */
  this.details = undefined;

  // Attempt to extract additional information from the request object
  if (request) {
    this.message = 'status: ' + request.status + '; error: ' + request.statusText;
    try {
      var response = JSON.parse(request.responseText);
      if (response.details) {
        this.details = response.details;
        this.message += '; details: ' + JSON.stringify(this.details);
      }
    } catch (e) {
      this.details = null;
    }
  }
};
NetSimApiError.inherits(Error);

/**
 * Ways that a row insert operation can fail via NetSimApi.
 * @enum {string}
 */
NetSimApiError.ValidationError = {
  MALFORMED: 'malformed',
  CONFLICT: 'conflict',
  LIMIT_REACHED: 'limit_reached'
};
