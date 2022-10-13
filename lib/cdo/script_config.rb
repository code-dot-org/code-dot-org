# Configuration information about scripts. This is currently just a thin wrapper
# around the cached script information in the cdo-varnish cookbook, factored out
# so that the other Dashboard code doesn't need to know where the configuration
# comes from.

require_relative '../../cookbooks/cdo-varnish/libraries/http_cache'
require_relative 'script_constants'

UNCACHED_HOC_UNITS = %w(playlab artist infinity iceage).freeze

class ScriptConfig
  # Returns true if the script level path is excluded from caching, even if it
  # is in a publicly cacheable script.
  def self.uncached_script_level_path?(script_level_path)
    HttpCache.uncached_script_level_path?(script_level_path)
  end

  # Returns true if the script levels for `script_name` can be publicly cached
  # by proxies.
  def self.allows_public_caching_for_script(script_name)
    HttpCache.allows_public_caching_for_script(script_name)
  end

  def self.hoc_scripts
    HttpCache.cached_scripts + UNCACHED_HOC_UNITS
  end

  def self.csf_scripts
    Script.unit_names_by_curriculum_umbrella('CSF')
  end
end
