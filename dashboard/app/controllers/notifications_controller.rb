class NotificationsController < ApplicationController
  before_action :authenticate_user!

  # Index does not use pagination, returns all active notifications for the current user
  # Consider adding pagination if the number of notifications grows large
  def index
    rails_notifications = current_user.external_notifications.not_dismissed.order(created_at: :desc).all

    # TODO(lfm): call contentful and add contentful notifications to the list

    render json: rails_notifications.as_json.map {|notification| notification.deep_transform_keys {|key| key.to_s.camelize(:lower)}}
  end

  def mark_as_read
    notification_ids = params[:notification_ids] || []

    if notification_ids.empty?
      render json: {status: 'error', message: 'No notification IDs provided'}, status: :bad_request
      return
    end

    external_notifications = current_user.external_notifications.where(id: notification_ids)

    external_notifications.where(read_at: nil).update_all(read_at: Time.current)

    response_data = {
      status: 'success',
      message: "#{external_notifications.count} notification(s) marked as read",
      marked_count: external_notifications.count,
    }

    render json: response_data, status: :ok
  end
end
