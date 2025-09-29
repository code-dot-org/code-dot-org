module Marketing
  module DashboardNotifications
    class ContentfulNotificationSource < ::Notifications::Source
      NOTIFICATION_CONTENTFUL_CONTENT_TYPE = 'dashboard-notification'

      CONTENTFUL_SOURCE_NAME = 'contentful'
      CACHE_EXPIRATION = 1.hour

      attr_reader :entry_interface

      def initialize(entry_interface = CdoContentful::Marketing::Entry::DashboardNotification)
        @entry_interface = entry_interface
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
        CDO.shared_cache.fetch("contentful-#{NOTIFICATION_CONTENTFUL_CONTENT_TYPE}:#{locale}:v2", expires_in: CACHE_EXPIRATION) do
          formatted_entries = []

          entry_interface.find_each(locale:) do |entry|
            formatted_entry = Services::ContentfulNotificationFormatter.call(entry)
            formatted_entries << formatted_entry if formatted_entry
          end

          formatted_entries
        end
      end
    end
  end
end
