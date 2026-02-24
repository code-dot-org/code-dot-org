# frozen_string_literal: true

module HocLegacy
  class Engine < ::Rails::Engine
    config.autoload_paths << config.root.join('lib').to_s
    config.eager_load_paths << config.root.join('lib').to_s
  end
end
