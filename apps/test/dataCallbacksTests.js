var sinon = require('sinon');
var testUtils = require('./util/testUtils');
var assert = testUtils.assert;
testUtils.setupLocales('applab');
testUtils.setExternalGlobals();

// used in design mode
window.Applab = {
  appWidth: 320,
  appHeight: 480
};

var Applab = require('@cdo/apps/applab/applab');
var applabCommands = require('@cdo/apps/applab/commands');
var errorHandler = require('@cdo/apps/errorHandler');

describe('createRecord callbacks', function () {
  var xhr;
  var lastRequest;

  // Intercept all XHR requests, storing the last one
  before(function () {
    xhr = sinon.useFakeXMLHttpRequest();
    xhr.onCreate = function (req) {
      lastRequest = req;
    };
  });

  after(function () {
    lastRequest = null;
    xhr.restore();
  });

  it('calls onSuccess for 200', function () {
    var hitSuccess = false;
    var hitError = false;

    var myRecord = {name: 'Alice'};
    applabCommands.createRecord({
      table: 'mytable',
      record: myRecord,
      onSuccess: function () {
        hitSuccess = true;
      },
      onError: function () {
        hitError = true;
      }
    });

    lastRequest.respond(200, {"Content-Type": "application/json"},
      JSON.stringify(myRecord));
    assert(hitSuccess);
    assert(!hitError);
  });

  it('calls onError for 403', function () {
    var hitSuccess = false;
    var hitError = false;

    var myRecord = {name: 'Alice'};
    applabCommands.createRecord({
      table: 'mytable',
      record: myRecord,
      onSuccess: function () {
        hitSuccess = true;
      },
      onError: function () {
        hitError = true;
      }
    });

    lastRequest.respond(403, {}, 'A table may have at most 1000 rows');
    assert(!hitSuccess);
    assert(hitError);
  });

  it('logs an error on 403 if no onError provided', function () {
    var myRecord = {name: 'Alice'};
    applabCommands.createRecord({
      table: 'mytable',
      record: myRecord,
      onSuccess: function () {
      }
    });

    var applabLogger = sinon.spy(Applab.log);
    errorHandler.setLogMethod(applabLogger);

    lastRequest.respond(403, {}, 'A table may have at most 1000 rows');

    assert(applabLogger.calledOnce, 'Applab.log was called');
  });
});
