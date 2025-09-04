module Services
  class ContentfulNotificationFormatter < Services::Base
    attr_reader :contentful_notification

    def initialize(contentful_notification)
      @contentful_notification = contentful_notification
    end

    def call
      fields = contentful_notification.fields || {}

      published_at = Time.parse(contentful_notification.first_published_at)

      formatted_notification = {
        external_id: contentful_notification.id,
        title: fields[:title] || nil,
        description: fields[:description] || nil,
        icon_name: fields[:icon_name] || nil,
        icon_color: fields[:icon_color] || nil,
        href_links: fields[:href_links] || [],
        ai_prompts: fields[:ai_prompts] || [],
        priority: fields[:priority] || 0,
        published_at: published_at,
        expires_at: Time.parse(fields[:expires_at]),
      }

      if formatted_notification[:external_id].blank? || formatted_notification[:title].blank? || formatted_notification[:description].blank? || formatted_notification[:icon_name].blank?
        Honeybadger.notify(
          'Unable to format Contentful notification. Check contentful to make sure the notification has all required fields input correctly.',
          context: {
            contentful_id: contentful_notification.id,
            title: formatted_notification[:title],
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
      formatted_notification[:published_at] = formatted_notification[:published_at].is_a?(Time) ? formatted_notification[:published_at].iso8601 : nil
      formatted_notification[:expires_at] = formatted_notification[:expires_at].is_a?(Time) ? formatted_notification[:expires_at].iso8601 : nil
      formatted_notification[:href_links] = formatted_notification[:href_links].filter_map do |link|
        link['url'].present? && link['text'].present? ? {url: link['url'], text: link['text']} : nil
      end
      formatted_notification[:ai_prompts] = formatted_notification[:ai_prompts].filter_map do |prompt|
        prompt['text'].present? && prompt['prompt'].present? ? {text: prompt['text'], prompt: prompt['prompt']} : nil
      end

      formatted_notification
    rescue StandardError => exception
      Honeybadger.notify(
        'Error trying to format Contentful notification',
        context: {
          contentful_id: contentful_notification.id,
          error: exception.message,
        }
      )
      nil
    end
  end
end
