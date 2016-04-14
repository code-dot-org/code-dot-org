/**
 * @overview Controller for creating growl-style Bootstrap alerts
 */
/* global setTimeout */
'use strict';

var markup = require('./NetSimAlert.html.ejs');
var ArgumentUtils = require('./ArgumentUtils');
var NetSimLogger = require('./NetSimLogger');

var logger = NetSimLogger.getSingleton();

var NetSimAlert = module.exports = {};

/**
 * Returns the alert container, or creates and inserts one if it does
 * not exist. Also attaches a close handler so the container will
 * remove itself when it empties
 * @private
 * @return {jQuery}
 */
NetSimAlert.getOrCreateAlertContainer_ = function () {
  var alertContainer = $('.netsim-alert-container');

  if (alertContainer.length === 0) {
    alertContainer = $('<div>').addClass("netsim-alert-container");
    $('#netsim').append(alertContainer);

    alertContainer.on('closed', function () {
      if ($(this).children().length === 1) {
        $(this).remove();
      }
    });
  }

  return alertContainer;
};

/**
 * Simple check to see if Bootstrap's Alert function is attached to the
 * global jQuery object.
 * @return {boolean} whether or not bootstrap's `alert` function is
 *                   loaded and available
 */
NetSimAlert.isBootstrapAlertLoaded_ = function () {
  return (typeof $().alert === 'function');
};

/**
 * Primary alert creation method. Expects a body of content for the
 * alert and a flavor for the alert type. Can optionally include a title
 * and a timeout time.
 *
 * @param {body} string
 * @param {flavor} string
 * @param {Object} options
 * @param {string} options.title
 * @param {number} options.timeout Timeout in ms. defaults to 5000.
 * @return {jQuery} the created alert element
 */
NetSimAlert.create_ = function (body, flavor, options) {

  if (!NetSimAlert.isBootstrapAlertLoaded_()) {
    logger.warn("Bootstrap Alert not loaded; NetSimAlert refusing to create alert");
    return;
  }

  ArgumentUtils.validateRequired(body, 'body', ArgumentUtils.isString);
  ArgumentUtils.validateRequired(flavor, 'flavor', ArgumentUtils.isString);
  options = ArgumentUtils.extendOptionsObject(options);

  var $container = NetSimAlert.getOrCreateAlertContainer_();

  var bootstrapAlert = $(markup({
    flavor: flavor,
    body: body,
    title: options.get('title', ArgumentUtils.isString)
  }));

  $container.append(bootstrapAlert);
  bootstrapAlert.alert();

  setTimeout(function () {
    bootstrapAlert.alert('close');
  }, options.get('timeout', ArgumentUtils.isPositiveNoninfiniteNumber, 5000));

  return bootstrapAlert;
};

/** Wrapper method to call create with an "alert-warn" flavor */
NetSimAlert.warn = function (body, options) {
  return NetSimAlert.create_(body, "alert-warn", options);
};

/** Wrapper method to call create with an "alert-info" flavor */
NetSimAlert.info = function (body, options) {
  return NetSimAlert.create_(body, "alert-info", options);
};

/** Wrapper method to call create with an "alert-error" flavor */
NetSimAlert.error = function (body, options) {
  return NetSimAlert.create_(body, "alert-error", options);
};

/** Wrapper method to call create with an "alert-success" flavor */
NetSimAlert.success = function (body, options) {
  return NetSimAlert.create_(body, "alert-success", options);
};
