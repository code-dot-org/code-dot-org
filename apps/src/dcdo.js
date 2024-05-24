import getScriptData, {hasScriptData} from './util/getScriptData';

/**
 * Stores DCDO key:value pairs defined in `dcdo.rb:frontend_config`.
 */
export class DCDO {
  /**
   * @param configs {object} A mapping of DCDO keys to values
   */
  constructor(configs = {}) {
    this.configs = configs;
  }

  /**
   * Retrieves the DCDO config value for the given key. Please note that this data could be stale
   * due to the caching behavior of the page. Analyze the HTTP headers of the pages you are
   * interested in to understand what kind of caching they use and if that will be a concern.
   * @param {string} key The key for the DCDO config to lookup.
   * @param {object | boolean} defaultValue The value to return if the given key is not defined in DCDO.
   * @return {object | boolean} The value for the given key. Uses the defaultValue if no key found.
   */
  get(key, defaultValue = undefined) {
    if (key && key in this.configs) {
      return this.configs[key];
    }
    return defaultValue;
  }

  /**
   * Sets the DCDO configs. Tests only! This has no affect on the backend.
   * @param {string} key The key for the DCDO config to set.
   * @param {object | boolean} value The value to store for the given key.
   */
  set(key, value) {
    if (key) {
      this.configs[key] = value;
    }
  }

  /**
   * Deletes the DCDO configs. Tests only! This has no affect on the backend.
   */
  reset() {
    this.configs = {};
  }
}

/**
 * Loads the DCDO configurations which are forwarded to the frontend. See `dcdo.rb:frontend_config`.
 * The DCDO class expects a <script> tag to have a `data-dcdo` attribute with JSON stringified DCDO
 * configuration map.
 */
let configs = {};
if (hasScriptData('script[data-dcdo]')) {
  configs = getScriptData('dcdo');
}
export default new DCDO(configs);
