require 'contentful'

class NotificationsController < ApplicationController
  before_action :authenticate_user!

  NOTIFICATION_CONTENTFUL_CONTENT_TYPE = 'dashboard-notification'

  # Index does not use pagination, returns all active notifications for the current user
  # Consider adding pagination if the number of notifications grows large
  def index
    locale = params[:locale] || I18n.default_locale

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

    render json: results.as_json.map {|notification| notification.deep_transform_keys {|key| key.to_s.camelize(:lower)}}, status: :ok
  end

  def mark_as_read
    external_notifications = params[:external_notifications] || []

    if  external_notifications.empty?
      render json: {status: 'error', message: 'No notification IDs provided'}, status: :bad_request
      return
    end

    found_external_notifications = current_user.external_notifications.where(external_id: external_notifications)

    found_external_notifications.where(read_at: nil).update_all(read_at: Time.current)
    found_ids = found_external_notifications.pluck(:external_id)
    notifications_to_create = external_notifications - found_ids
    notifications_to_create.each do |external_id|
      ExternalNotification.create!(user_id: current_user.id, external_id: external_id, read_at: Time.current)
    end

    response_data = {
      status: 'success',
      message: "#{found_ids.count + notifications_to_create.count} notification(s) marked as read",
      marked_count: found_ids.count + notifications_to_create.count,
    }

    render json: response_data, status: :ok
  end

  private def format_contentful_notification(notification)
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
end
