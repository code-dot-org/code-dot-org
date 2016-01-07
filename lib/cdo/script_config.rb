# Configuration information about scripts. This is currently just a thin wrapper
# around the cached script information in the cdo-varnish cookbook, factored out
# so that the other Dashboard code doesn't need to know where the configuration
# comes from.

require_relative '../../cookbooks/cdo-varnish/libraries/http_cache'

class ScriptConfig
  # Returns true if the script levels for `script_name` can be publicly cached
  # by proxies.
  def self.allows_public_caching_for_script(script_name)
    HttpCache.allows_public_caching_for_script(script_name)
  end

  # Returns an array of the name of the publicly cached scripts.
  def self.publicly_cached_scripts
    HttpCache.publicly_cached_scripts
  end
end
