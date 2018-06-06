# Configuration information about scripts. This is currently just a thin wrapper
# around the cached script information in the cdo-varnish cookbook, factored out
# so that the other Dashboard code doesn't need to know where the configuration
# comes from.

require_relative '../../cookbooks/cdo-varnish/libraries/http_cache'

UNCACHED_HOC_SCRIPTS = %w(playlab artist infinity iceage).freeze

class ScriptConfig
  # Returns true if the script levels for `script_name` can be publicly cached
  # by proxies.
  def self.allows_public_caching_for_script(script_name)
    HttpCache.allows_public_caching_for_script(script_name)
  end

  def self.hoc_scripts
    HttpCache.cached_scripts + UNCACHED_HOC_SCRIPTS
  end

  def self.csf_scripts
    %w(
      20-hour
      course1
      course2
      course3
      course4
      coursea-2017
      courseb-2017
      coursec-2017
      coursed-2017
      coursee-2017
      coursef-2017
      express-2017
      pre-express-2017
    )
  end
end
