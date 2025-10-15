# frozen_string_literal: true

module DancePartyImageGenerator
  module Settings
    DEFAULT_ANIMALS    = %w[frog moose wolf panda tiger].freeze
    DEFAULT_ATTIRES    = %w[headphones sunglasses crown headscarf baseball-cap beanie headband].freeze
    DEFAULT_ADJECTIVES = %w[basic emo sporty streetwear fancy preppy].freeze
    DEFAULT_REPEATS    = 3

    module_function def config
      # locals.yml is not auto-parsed by Rails by default; load it like this:
      @config ||= begin
        path = Rails.root.join("config", "locals.yml")
        all  = path.exist? ? YAML.load_file(path) : {}
        env  = Rails.env
        (all[env] || {})["dance_party_image_generator"] || {}
      end
    end

    module_function def list(key, fallback)
      arr = Array(config[key.to_s]).map(&:to_s).map(&:strip).compact_blank
      arr.presence || fallback
    end

    module_function def animals      = list(:animals,    DEFAULT_ANIMALS)
    module_function def attire       = list(:attire,     DEFAULT_ATTIRES)
    module_function def adjectives   = list(:adjectives, DEFAULT_ADJECTIVES)
    module_function def repeats      = Integer(config["repeats_per_combo"] || DEFAULT_REPEATS)
    module_function def namespace    = config["namespace"].to_s.presence
    module_function def bucket       = (config["bucket"].presence || ENV.fetch("S3_BUCKET", nil))
  end
end
