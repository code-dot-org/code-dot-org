# Configuration information about scripts. This is currently just a thin wrapper
# around the cached script information in the cdo-varnish cookbook, factored out
# so that the other Dashboard code doesn't need to know where the configuration
# comes from.

require_relative '../../cookbooks/cdo-varnish/libraries/http_cache'

class ScriptConfig
  # Returns true if the script levels for `script_name` can be publicly cached
  # by proxies.
  def self.allow_public_caching_for_script(script_name)
    HttpCache.allow_public_caching_for_script(script_name)
  end
end