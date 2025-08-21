class NotificationsController < ApplicationController
  before_action :authenticate_user!

  # Returns a list of contentful notifications for the user that have not expired or been dismissed
  def index
    locale = params[:locale] || I18n.default_locale

    results = Notifications.get_all(current_user.id, locale)

    render json: results.as_json.map {|notification| notification.deep_transform_keys {|key| key.to_s.camelize(:lower)}}, status: :ok
  end

  def mark_as_read
    external_notification_ids = (params[:external_notification_ids] || []).compact_blank

    if external_notification_ids.empty?
      render json: {status: 'error', message: 'No notification IDs provided'}, status: :bad_request
      return
    end

    found_external_notifications = current_user.external_notifications.where(external_id: external_notification_ids)

    found_external_notifications.where(read_at: nil).update_all(read_at: Time.current)
    found_ids = found_external_notifications.pluck(:external_id)
    notifications_to_create = external_notification_ids - found_ids
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
end
