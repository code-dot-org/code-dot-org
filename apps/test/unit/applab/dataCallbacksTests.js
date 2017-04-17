import {assert} from '../../util/configuredChai';
import {replaceOnWindow, restoreOnWindow} from '../../util/testUtils';
import sinon from 'sinon';
import {injectErrorHandler} from '@cdo/apps/lib/util/javascriptMode';
import JavaScriptModeErrorHandler from '@cdo/apps/JavaScriptModeErrorHandler';
var testUtils = require('../../util/testUtils');

var applabCommands = require('@cdo/apps/applab/commands');
var AppStorage = require('@cdo/apps/applab/appStorage');


describe('createRecord callbacks', function () {
  var xhr;
  var lastRequest;

  testUtils.setExternalGlobals();

  // Intercept all XHR requests, storing the last one
  before(function () {
    xhr = sinon.useFakeXMLHttpRequest();
    xhr.onCreate = function (req) {
      lastRequest = req;
    };
    replaceOnWindow('Applab', {
      // used in design mode
      appWidth: 320,
      appHeight: 480,
      storage: AppStorage,

      // used in error reporting when no onError provided
      JSInterpreter: {
        getNearestUserCodeLine: () => 0
      },
    });
  });

  after(function () {
    lastRequest = null;
    xhr.restore();
    restoreOnWindow('Applab');
  });

  it('calls onSuccess for 200', function () {
    var hitSuccess = false;
    var hitError = false;

    var myRecord = { name: 'Alice' };
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

    lastRequest.respond(200, { "Content-Type": "application/json" },
      JSON.stringify(myRecord));
    assert(hitSuccess);
    assert(!hitError);
  });

  it('calls onError for 403', function () {
    var hitSuccess = false;
    var hitError = false;

    var myRecord = { name: 'Alice' };
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
    var myRecord = { name: 'Alice' };

    var applabLogger = sinon.spy();
    injectErrorHandler(new JavaScriptModeErrorHandler(
      () => window.Applab.JSInterpreter,
      {log: applabLogger}
    ));

    applabCommands.createRecord({
      table: 'mytable',
      record: myRecord,
      onSuccess: function () {
      }
    });

    lastRequest.respond(403, {}, 'A table may have at most 1000 rows');

    assert(applabLogger.calledOnce, 'Applab.log was called');
  });
});
