'use strict';

/* global Applab */

var Firebase = require("firebase");
var FirebaseUtils = require('./firebaseUtils');

/**
 * Namespace for utility functions related to rate limits in Firebase.
 */
var FirebaseRateLimits = module.exports;

/**
 * Map representing the rate limit over each time interval.
 *
 * @type {Object.<string, number>} Map from rate limit interval in seconds
 *     to the maximum number of operations allowed during that interval.
 */
var RATE_LIMITS = {
  15: 30,
  60: 60
};

/**
 * @type {Array.<string>} Array of rate limit intervals in seconds.
 */
var RATE_LIMIT_INTERVALS = Object.keys(RATE_LIMITS);

/**
 * How many rate limit tokens to request at a time.
 * @type {number}
 */
const TOKEN_BATCH_SIZE = 10;

/**
 * A list of available rate limit tokens for each interval.
 */
var rateLimitTokenMap = {
  15: [],
  60: []
};

/**
 * The pending request for more rate limit tokens for each interval, if one exists.
 */
var tokenFetchPromiseMap = {
  15: null,
  60: null
};

/**
 * Increments each rate limit counter, calling the callback with a map from
 * rate limit intervals to the corresponding token to use.
 */
FirebaseRateLimits.getTokenMapPromise = function () {
  return Promise.all([
    getTokenPromise(15),
    getTokenPromise(60)
  ]).then(function (results) {
    return {
      15: results[0],
      60: results[1]
    };
  });
};

/**
 *
 * @param {number} interval
 */
function getTokenPromise(interval) {
  var tokens = rateLimitTokenMap[interval];
  if (tokens.length > 0) {
    return tokens.shift();
  }
  return getTokenFetchPromise(interval).then(function () {
    if (tokens.length > 0) {
      return tokens.shift();
    } else {
      // More than TOKEN_BATCH_SIZE requests were waiting for the token fetch
      // to complete, so there weren't enough tokens to go around.
      throw new Error('No tokens available after interval ' + interval + ' token fetch.');
    }
  });
}

/**
 *
 * @param interval
 * @returns {*}
 */
function getTokenFetchPromise(interval) {
  if (!tokenFetchPromiseMap[interval]) {
    // Atomically increment the rate limit counter to obtain a rate limit token.
    tokenFetchPromiseMap[interval] = incrementLastTokenPromise(interval).catch(function (error) {
      // The increment failed because last_token reached its maximum. Try to reset the count.
      return resetRateLimitPromise(interval).then(function () {
        // The rate limit was reset. Try one more time to increment it.
        return incrementLastTokenPromise(interval).catch(function (error) {
          throw new Error('Rate limit exceeded immediately after it was reset: ' + error);
        });
      });
    }).then(function (newToken) {
      tokenFetchPromiseMap[interval] = null;
      for (var i = Number(newToken) - TOKEN_BATCH_SIZE + 1; i <= newToken; i++) {
        rateLimitTokenMap[interval].push(i);
      }
    }, function (error) {
      // The rate limit was exceeded and the reset failed. Do not reuse this promise.
      tokenFetchPromiseMap[interval] = null;
      return Promise.reject(error);
    });
  }
  return tokenFetchPromiseMap[interval];
}

var lastReset = {};

/**
 *
 * @param {number} interval
 * @param lastResetTimeMs
 * @param onSuccess
 * @param onError
 */
function resetRateLimitPromise(interval) {
  var lastResetTimePromise = getLastResetTimePromise(interval);
  var currentTimePromise = getCurrentTimePromise();
  return Promise.all([lastResetTimePromise, currentTimePromise]).then(function (results) {
    var lastResetTimeMs = results[0];
    var currentTimeMs = results[1];
    var nextResetTimeMs = lastResetTimeMs + interval * 1000;

    if (currentTimeMs < nextResetTimeMs) {
      // It is too soon to reset this rate limit.
      var timeRemaining = Math.ceil((nextResetTimeMs - currentTimeMs) / 1000);
      return Promise.reject('rate limit exceeded. please wait ' + timeRemaining + ' seconds before retrying.');
    }

    if (lastResetTimeMs === lastReset.time) {
      // Another request from this client has already been made to reset this timestamp.
      // Return the promise from that other request.
      return lastReset.promise;
    }

    // Enough time has passed for this rate limit to be reset.
    var channelRef = FirebaseUtils.getDatabase(Applab.channelId);
    var limitCounterData = {
      last_reset_time: Firebase.ServerValue.TIMESTAMP,
      last_token: 0
    };
    var channelData = {};
    channelData['counters/limits/' + interval] = limitCounterData;
    channelData['storage/limits/' +  interval + '/used_tokens'] = null;
    lastReset.time = lastResetTimeMs;
    lastReset.promise = channelRef.update(channelData).catch(function (error) {
      // Our reset request failed. Check to see if another client's reset attempt succeeded.
      var limitRef = channelRef.child('counters').child('limits').child(interval);
      return limitRef.once('value').then(function (limitSnapshot) {
        var newResetTimeMs = limitSnapshot.child('last_reset_time').val() || 0;
        if (newResetTimeMs <= lastResetTimeMs) {
          return Promise.reject('Failed to reset rate limit.  ' + error);
        } else {
          // Our reset request failed, but the timestamp was updated, so we assume
          // that another client's reset attempt succeeded.
        }
      });
    });

    return lastReset.promise;
  });
}

function getCurrentTimePromise() {
  var serverTimeRef = FirebaseUtils.getDatabase(Applab.channelId).child('server_time').child(Applab.firebaseUserId);
  return serverTimeRef.set(Firebase.ServerValue.TIMESTAMP).then(function () {
    serverTimeRef.onDisconnect().remove();
    return serverTimeRef.once('value').then(function (currentTimeSnapshot) {
      return currentTimeSnapshot.val();
    });
  });
}

function getLastResetTimePromise(interval) {
  var lastResetTimeRef = FirebaseUtils.getDatabase(Applab.channelId).child('counters').child('limits')
    .child(interval).child('last_reset_time');
  return lastResetTimeRef.once('value').then(function (lastResetTimeSnapshot) {
    return lastResetTimeSnapshot.val() || 0;
  });
}

/**
 *
 * @param interval
 */
function incrementLastTokenPromise(interval) {
  var lastTokenRef = FirebaseUtils.getDatabase(Applab.channelId).child('counters').child('limits').child(interval).child('last_token');
  var increment = incrementLastTokenData.bind(this, interval);
  return lastTokenRef.transaction(increment).then(function (transactionResult) {
    if (!transactionResult.committed) {
      return Promise.reject('aborting increment transaction, max token value reached.');
    } else {
      return transactionResult.snapshot.val();
    }
  });
}

/**
 * Update function for a Firebase transaction to increment a rate limit counter.
 * @param {number} interval The rate limit interval.
 * @param {number} lastTokenData The token issued for this rate limit
 *     interval since the last reset.
 * @returns {*} new value for lastTokenData, or undefined if the transaction should be aborted.
 */
function incrementLastTokenData(interval, lastTokenData) {
  lastTokenData = lastTokenData || 0;
  if (lastTokenData < RATE_LIMITS[interval]) {
    return lastTokenData + TOKEN_BATCH_SIZE;
  } else {
    // last_token cannot be incremented. Abort the transaction.
    return;
  }
}

/**
 * Populate the rate limit metadata in channelStorageData needed to make the
 * request succeed, using the rate limit info in limitsData.
 * @param channelStorageData
 * @param tokenMap
 */
FirebaseRateLimits.addTokens = function (channelStorageData, tokenMap) {
  RATE_LIMIT_INTERVALS.forEach(function (interval) {
    var token = tokenMap[interval];
    channelStorageData['limits/' + interval + '/used_tokens/' + token] = true;
    channelStorageData['limits/' + interval + '/target_token'] = token;
  });
};
