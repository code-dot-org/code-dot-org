# Configuration information about scripts. This is currently just a thin wrapper
# around the cached script information in the cdo-varnish cookbook, factored out
# so that the other Dashboard code doesn't need to know where the configuration
# comes from.

require_relative 'http_cache'

HOC_UNITS = %w(
  aquatic
  artist
  basketball
  dance-2019
  dance-ai-2023
  flappy
  frozen
  hello-world-animals-2021
  hello-world-emoji-2021
  hello-world-food-2021
  hello-world-retro-2021
  hello-world-soccer-2022
  hello-world-space-2022
  hero
  hourofcode
  iceage
  infinity
  mc
  minecraft
  music-jam-2024
  oceans
  outbreak
  playlab
  poem-art-2021
  sports
  starwars
  starwarsblocks
).freeze

class ScriptConfig
  def self.hoc_scripts
    HOC_UNITS
  end

  def self.csf_scripts
    Unit.unit_names_by_curriculum_umbrella('CSF')
  end
end
