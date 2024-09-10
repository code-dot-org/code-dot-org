/** @file Non-p5 GameLab commands */
import {commands as audioCommands} from '@cdo/apps/lib/util/audioApi';
import {commands as timeoutCommands} from '@cdo/apps/lib/util/timeoutApi';
import {rateLimit} from '@cdo/apps/storage/rateLimit';
import {singleton as studioApp} from '@cdo/apps/StudioApp';

import {
  getAsyncOutputWarning,
  outputError,
} from '../../lib/util/javascriptMode';

/*
  The 'commands' file assembles a set of calls that student code can make
  onto a single exported object.  Much of this code is reused, and gets applied
  to the exported object via helpers.

  This object does not necessarily represent an exhaustive list of commands
  available; some are provided 'natively' by the interpreter, some are loaded
  as part of a standard config (see dropletUtils.js) and, in Gamelab's case,
  some are dynamically grabbed from the p5/p5.play libraries.
*/
let gamelabCommands = module.exports;

gamelabCommands.getUserId = function () {
  if (!studioApp().labUserId) {
    throw new Error('User ID failed to load.');
  }
  return studioApp().labUserId;
};

gamelabCommands.getKeyValue = function (opts) {
  var onSuccess = gamelabCommands.handleReadValue.bind(this, opts);
  var onError = opts.onError || getAsyncOutputWarning();
  try {
    rateLimit();
    studioApp().storage.getKeyValue(opts.key, onSuccess, onError);
  } catch (e) {
    outputError(e.message);
  }
};

gamelabCommands.handleReadValue = function (opts, value) {
  if (opts.onSuccess) {
    opts.onSuccess.call(null, value);
  }
};

gamelabCommands.setKeyValue = function (opts) {
  var onSuccess = gamelabCommands.handleSetKeyValue.bind(this, opts);
  var onError = opts.onError || getAsyncOutputWarning();
  try {
    rateLimit();
    studioApp().storage.setKeyValue(opts.key, opts.value, onSuccess, onError);
  } catch (e) {
    outputError(e.message);
  }
};

gamelabCommands.handleSetKeyValue = function (opts) {
  if (opts.onSuccess) {
    opts.onSuccess.call(null);
  }
};

// Include playSound, stopSound, etc.
Object.assign(gamelabCommands, audioCommands);
Object.assign(gamelabCommands, timeoutCommands);
