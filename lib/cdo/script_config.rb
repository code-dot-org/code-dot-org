# Configuration information about scripts. This is currently just a thin wrapper
# around the cached script information in the cdo-varnish cookbook, factored out
# so that the other Dashboard code doesn't need to know where the configuration
# comes from.

require_relative 'http_cache'

UNCACHED_HOC_UNITS = %w(playlab artist infinity iceage).freeze

class ScriptConfig
  def self.hoc_scripts
    HttpCache.cached_scripts + UNCACHED_HOC_UNITS
  end

  def self.csf_scripts
    Unit.unit_names_by_curriculum_umbrella('CSF')
  end
end
