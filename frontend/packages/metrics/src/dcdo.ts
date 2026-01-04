'use client';

/**
 * A possible DCDO value to expect to find attached to a key.
 */
export type DCDOConfigurationValue = string | boolean;

/**
 * DCDO flags that are shared between the backend and frontend.
 */
export interface DCDOConfigurations {
  [key: string]: DCDOConfigurationValue;
};

class DCDO {
  private configs: DCDOConfigurations = {};

  /**
   * @param configs - An optional default mapping of DCDO keys to values.
   */
  constructor(configs?: DCDOConfigurations) {
    if (configs) {
      this.configs = configs;
    } else {
      const script = (typeof document !== 'undefined' ? document.querySelector('script[data-dcdo]') : undefined) as (HTMLScriptElement | undefined);
      if (script) {
        this.configs = JSON.parse(script.getAttribute('data-dcdo') || '{}');
      }
    }
  }

  /**
   * Retrieves the DCDO config value for the given key. Please note that this data could be stale
   * due to the caching behavior of the page. Analyze the HTTP headers of the pages you are
   * interested in to understand what kind of caching they use and if that will be a concern.
   * @param key - The key for the DCDO config to lookup.
   * @param defaultValue - The value to return if the given key is not defined in DCDO.
   * @return boolean - The value for the given key. Uses the defaultValue if no key found.
   */
  get(key: string, defaultValue: DCDOConfigurationValue): DCDOConfigurationValue {
    if (key in this.configs) {
      return this.configs[key];
    }

    return defaultValue;
  }

  /**
   * Sets the DCDO configs. Tests only! This has no affect on the backend.
   * @param key - The key for the DCDO config to set.
   * @param value - The value to store for the given key.
   */
  set(key: string, value: DCDOConfigurationValue) {
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

export default new DCDO();
