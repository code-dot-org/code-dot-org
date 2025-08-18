require 'contentful'
require 'honeybadger/ruby'

module ExternalNotificationsHelper
  NOTIFICATION_CONTENTFUL_CONTENT_TYPE = 'dashboard-notification'

  def self.get_contentful_notifications_for_user(current_user, locale)
    contentful_entries = Marketing::ContentfulClient.entries(locale.to_s, NOTIFICATION_CONTENTFUL_CONTENT_TYPE)
    contentful_result = contentful_entries.filter_map do |notification|
      format_contentful_notification(notification)
    end

    contentful_ids = contentful_result.pluck(:external_id)

    rails_external_notifications = ExternalNotification.where(external_id: contentful_ids, user: current_user)

    results = contentful_result.filter_map do |notification|
      rails_notification = rails_external_notifications.find {|n| n.external_id == notification[:external_id]}

      next nil if rails_notification&.is_dismissed

      read_at = rails_notification&.read_at&.iso8601 || nil
      notification.merge(
        read_at: read_at
      )
    end

    results
  end

  def self.format_contentful_notification(notification)
    fields = notification.fields || {}
    formatted_notification = {
      external_id: notification.id,
      title: fields[:title] || nil,
      description: fields[:description] || nil,
      icon_name: fields[:icon_name] || nil,
      href_links: fields[:href_links] || [],
      ai_prompts: fields[:ai_prompts] || [],
      priority: fields[:priority] || 0,
      expires_at: fields[:expires_at],
    }

    if formatted_notification[:external_id].blank? || formatted_notification[:title].blank? || formatted_notification[:description].blank? || formatted_notification[:icon_name].blank?
      Honeybadger.notify(
        'Unable to format Contentful notification',
        context: {
          contentful_id: notification.id,
          has_id: formatted_notification[:external_id].present?,
          has_title: formatted_notification[:title].present?,
          has_description: formatted_notification[:description].present?,
          has_icon_name: formatted_notification[:icon_name].present?
        }
      )
      return nil
    end

    # Ensure data types are correct
    formatted_notification[:priority] = formatted_notification[:priority].to_i
    formatted_notification[:expires_at] = formatted_notification[:expires_at].is_a?(Time) ? formatted_notification[:expires_at].iso8601 : nil
    formatted_notification[:href_links] = formatted_notification[:href_links].filter_map do |link|
      !!link['url'] && !!link['text'] ? {url: link['url'], text: link['text']} : nil
    end
    formatted_notification[:ai_prompts] = formatted_notification[:ai_prompts].filter_map do |prompt|
      !!prompt['text'] && !!prompt['prompt'] ? {text: prompt['text'], prompt: prompt['prompt']} : nil
    end

    formatted_notification
  rescue StandardError
    Honeybadger.notify(
      'Error trying to format Contentful notification',
        context: {
          contentful_id: notification.id,
        }
      )
    nil
  end

  private_class_method :format_contentful_notification
end
