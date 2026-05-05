import * as Observability from '@code-dot-org/core/plugins/observability';

import {makeEnum} from './utils';

const PageAction = makeEnum(
  'DropletTransitionError',
  'SanitizedLevelHtml',
  'UserJavascriptError',
  'RunButtonClick',
  'StartWebRequest',
  'StaticResourceFetchError',
  'PegasusSectionsRedirect',
  'DancePartyOnInit',
  'BrambleError',
  'BrambleFilesystemResetSuccess',
  'BrambleFilesystemResetFailed',
  'JotFormFrameLoaded',
  'JotFormLoadFailed',
  'BlockLoadFailed',
  'MapboxMarkerLoadError',
  'LoadScriptProgressStarted',
  'LoadScriptProgressFinished',
  'SectionProgressRenderedWithData',
  'JavabuilderWebSocketConnectionError',
  'NoValidAmplitudeEventNameError'
);

const MAX_FIELD_LENGTH = 4095;

// Names ending in "Error" or "Failed" are routed to Sentry's exception stream;
// everything else lands on Sentry's structured log stream as info-level events.
const isErrorAction = name => /(Error|Failed)$/.test(name);

const truncateLongStrings = value => {
  const attributes = {};
  for (const prop in value) {
    let v = value[prop];
    if (typeof v === 'string' && v.length > MAX_FIELD_LENGTH) {
      v = v.substring(0, MAX_FIELD_LENGTH);
    }
    attributes[prop] = v;
  }
  return attributes;
};

/**
 * Legacy facade for the New Relic browser agent. Routes page actions and
 * errors through the in-repo observability plugin (Sentry today). Existing
 * callers should keep working unchanged; new code should call into
 * `@code-dot-org/core/plugins/observability` directly.
 */
module.exports = {
  PageAction: PageAction,

  /**
   * @param {string} actionName - Must be one of the keys from PageAction.
   * @param {object} value - Object literal of context attributes for the event.
   * @param {number} [sampleRate] - Optional sample rate. Default is 1.0.
   */
  addPageAction(actionName, value, sampleRate) {
    if (sampleRate === undefined) {
      sampleRate = 1.0;
    }

    if (!PageAction[actionName]) {
      console.log('Unknown actionName: ' + actionName);
      return;
    }

    if (typeof value !== 'object') {
      console.log('Expected value to be an object');
      return;
    }

    if (Math.random() > sampleRate) {
      return;
    }

    const attributes = truncateLongStrings(value);

    if (isErrorAction(actionName)) {
      Observability.recordError(new Error(actionName), attributes);
    } else {
      Observability.logger.info(actionName, attributes);
    }
  },

  logError(error) {
    if (!error) {
      return;
    }
    Observability.recordError(error);
  },
};
