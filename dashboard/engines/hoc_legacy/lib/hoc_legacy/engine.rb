# frozen_string_literal: true

module HocLegacy
  class Engine < ::Rails::Engine
    isolate_namespace HocLegacy

    config.autoload_paths << config.root.join('lib').to_s
  end
end
