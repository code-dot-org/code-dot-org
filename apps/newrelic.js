var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');

var licenseKey;
try {
  var locals = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '..', 'locals.yml')));
  licenseKey = locals.new_relic_license_key;
} catch (e) {
  // meh...
}

/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: ['Dev'],
  /**
   * Your New Relic license key.
   */
  license_key: licenseKey,
  /**
   * Disable New Relic agent startup when the license key is not available.
   * Otherwise, the New Relic agent does a bunch of stuff behind the scenes
   * as soon as you require it, and can fail when no license key is provided.
   */
  agent_enabled: !!licenseKey,
  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: 'info'
  }
};
