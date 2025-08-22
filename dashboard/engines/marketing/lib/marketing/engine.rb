module Marketing
  class Engine < ::Rails::Engine
    isolate_namespace Marketing

    config.autoload_paths << config.root.join('lib').to_s

    initializer "marketing.include_helpers" do
      ActiveSupport.on_load(:action_controller) do
        require_dependency File.join(Marketing::Engine.root, 'app', 'helpers', 'external_notifications_helper')
        include ExternalNotificationsHelper
      end
    end
  end
end
