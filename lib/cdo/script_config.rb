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

  # Returns the names of the scripts whose levels can be publicly cached.
  def self.cached_scripts
    HttpCache.cached_scripts
  end

  # Returns the names of the scripts affected by the 'Scale Mode' feature setting.
  def self.scale_mode_scripts
    cached_scripts + %w(
      20-hour
      course1
      course2
      course3
      course4
      coursea
      courseb
      coursec
      coursed
      coursee
      coursef
      express
      pre-express
      playlab
      artist
      infinity
      iceage
    )
  end
end
