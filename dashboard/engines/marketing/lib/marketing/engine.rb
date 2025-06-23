module Marketing
  class Engine < ::Rails::Engine
    isolate_namespace Marketing

    config.autoload_paths << config.root.join('lib').to_s
  end
end
