import { singleton as studioApp } from '@cdo/apps/StudioApp';
import api from '../api';

/**
 * Execute the code for all of the event handlers that match an event name
 * @param {string} name Name of the handler we want to call
 * @param {boolean} allowQueueExtension When true, we allow additional cmds to
 *  be appended to the queue
 * @param {Array} extraArgs Additional arguments passed into the virtual JS
 *  machine for consumption by the student's event-handling code.
 */
export function callHandler(name, allowQueueExtension, extraArgs = []) {
  Studio.eventHandlers.forEach(function (handler) {
    if (studioApp().isUsingBlockly()) {
      // Note: we skip executing the code if we have not completed executing
      // the cmdQueue on this handler (checking for non-zero length)
      if (handler.name === name &&
        (allowQueueExtension || (0 === handler.cmdQueue.length))) {
        Studio.currentCmdQueue = handler.cmdQueue;
        try {
          if (Studio.legacyRuntime) {
            handler.func(api, Studio.Globals, ...extraArgs);
          } else {
            handler.func(...extraArgs);
          }
        } catch (e) {
          // Do nothing
          console.error(e);
        }
        Studio.currentCmdQueue = null;
      }
    } else {
      // TODO (cpirich): support events with parameters
      if (handler.name === name) {
        handler.func.apply(null, extraArgs);
      }
    }
  });
}
