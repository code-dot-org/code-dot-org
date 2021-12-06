import getScriptData, {hasScriptData} from './util/getScriptData';

/**
 * Loads the DCDO configurations which are forwarded to the frontend. See `dcdo.rb:frontend_config`.
 * Frontend code can access the DCDO values using `window.dcdo['CONFIG_NAME']`
 */
if (hasScriptData('script[data-dcdo]')) {
  window.dcdo = getScriptData('dcdo');
}
// Default to an empty configuration.
window.dcdo = window.dcdo || {};
