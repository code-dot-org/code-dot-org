module Marketing
  class Engine < ::Rails::Engine
    isolate_namespace Marketing

    config.autoload_paths << config.root.join('lib').to_s

    config.to_prepare do
      # Register the Contentful source for notifications in the Dashboard app
      ::Notifications.register(Marketing::DashboardNotifications::ContentfulNotificationSource.new)
    end
  end
end
