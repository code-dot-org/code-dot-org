module Marketing
  class Engine < ::Rails::Engine
    isolate_namespace Marketing

    config.autoload_paths << config.root.join('lib').to_s
    config.eager_load_paths << config.root.join('lib').to_s

    config.to_prepare do
      # Register the Contentful source for notifications in the Dashboard app
      contentful_client = if (Rails.application.config.respond_to?(:stub_contentful_notifications) && Rails.application.config.stub_contentful_notifications) || [:development, :test].include?(rack_env)
                            Marketing::DashboardNotificationEntriesMock
                          else
                            CdoContentful::Marketing::Entry::DashboardNotification
                          end
      ::Notifications.register(Marketing::DashboardNotifications::ContentfulNotificationSource.new(contentful_client))
    end
  end
end
