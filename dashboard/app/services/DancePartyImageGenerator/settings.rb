# frozen_string_literal: true

require "yaml"

module DancePartyImageGenerator
  module Settings
    DEFAULT_ANIMALS    = %w[frog moose wolf panda tiger].freeze
    DEFAULT_ATTIRES    = %w[headphones sunglasses crown headscarf baseball-cap beanie headband].freeze
    DEFAULT_ADJECTIVES = %w[basic emo sporty streetwear fancy preppy].freeze
    DEFAULT_REPEATS    = 3

    module_function def raw
      path = Rails.root.join("config", "dance_party_image_generator.yml")
      return {} unless path.exist?
      all = YAML.safe_load_file(path, aliases: true) || {}
      all[Rails.env] || all["default"] || {}
    end

    module_function def list(key, fallback)
      arr = Array(raw[key.to_s]).map(&:to_s).map(&:strip).compact_blank
      arr.presence || fallback
    end

    module_function def animals    = list(:animals,    DEFAULT_ANIMALS)
    module_function def attire     = list(:attire,     DEFAULT_ATTIRES)
    module_function def adjectives = list(:adjectives, DEFAULT_ADJECTIVES)
    module_function def repeats    = Integer(raw["repeats_per_combo"] || DEFAULT_REPEATS)
    module_function def namespace  = raw["namespace"].to_s.presence
    module_function def bucket     = raw["bucket"].presence || ENV.fetch("S3_BUCKET", nil)
  end
end
