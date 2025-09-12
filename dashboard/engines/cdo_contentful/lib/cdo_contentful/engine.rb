# frozen_string_literal: true

module CdoContentful
  class Engine < ::Rails::Engine
    isolate_namespace CdoContentful

    config.autoload_paths << config.root.join('lib').to_s
    config.eager_load_paths << config.root.join('lib').to_s
  end
end
