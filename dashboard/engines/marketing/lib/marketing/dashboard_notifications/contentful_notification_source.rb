module Marketing
  module DashboardNotifications
    class ContentfulNotificationSource < ::Notifications::Source
      NOTIFICATION_CONTENTFUL_CONTENT_TYPE = 'dashboard-notification'

      CONTENTFUL_SOURCE_NAME = 'contentful'
      CACHE_EXPIRATION = 1.hour

      def initialize(contentful_client = Marketing::ContentfulClient.instance)
        @contentful_client = contentful_client
      end

      def get(user_id:, locale:)
        contentful_entries = cached_contentful_entries(locale.to_s)

        contentful_ids = contentful_entries.pluck(:external_id)

        rails_external_notifications = ExternalNotification.where(external_id: contentful_ids, user_id: user_id)

        contentful_entries.filter_map do |notification|
          rails_notification = rails_external_notifications.find {|n| n.external_id == notification[:external_id]}

          next nil if rails_notification&.is_dismissed

          next nil if notification[:expires_at] && Time.parse(notification[:expires_at]) < Time.current

          read_at = rails_notification&.read_at&.iso8601 || nil

          notification.merge(read_at: read_at, source: CONTENTFUL_SOURCE_NAME)
        end
      end

      private def cached_contentful_entries(locale)
        CDO.shared_cache.fetch("contentful-#{NOTIFICATION_CONTENTFUL_CONTENT_TYPE}:#{locale}", expires_in: CACHE_EXPIRATION) do
          contentful_entries = @contentful_client.entries(locale, NOTIFICATION_CONTENTFUL_CONTENT_TYPE)
          contentful_entries.filter_map do |notification|
            Services::ContentfulNotificationFormatter.call(notification)
          end
        end
      end
    end
  end
end
