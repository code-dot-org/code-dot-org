import * as Observability from '@code-dot-org/core/plugins/observability';

import {makeEnum} from './utils';

const PageAction = makeEnum(
  'DropletTransitionError',
  'SanitizedLevelHtml',
  'UserJavaScriptError',
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

/**
 * Legacy facade for the New Relic browser agent. Mirrors NR's split between
 * `record_custom_event` (information attached to the page session, addPageAction
 * here) and `noticeError` (the exception stream, logError here):
 *
 *   - addPageAction -> Observability.logger.info, regardless of name. Page
 *     actions in NR were structured events, not exceptions.
 *   - logError      -> Observability.recordError, the exception stream.
 *
 * Existing callers keep working unchanged; new code should call into
 * `@code-dot-org/core/plugins/observability` directly.
 */
module.exports = {
  PageAction: PageAction,

  /**
   * @param {string} actionName - Must be one of the keys from PageAction.
   * @param {object} value - Object literal of context attributes for the event.
   * @param {number} [sampleRate] - Optional sample rate. Default is 1.0.
   */
  addPageAction: function (actionName, value, sampleRate) {
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

    Observability.logger.info(actionName, value);
  },

  logError(e) {
    if (!e) {
      return;
    }
    Observability.recordError(e);
  },
};
