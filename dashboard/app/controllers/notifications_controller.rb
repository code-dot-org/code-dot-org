class NotificationsController < ApplicationController
  before_action :authenticate_user!

  # Index does not use pagination, returns all active notifications for the current user
  # Consider adding pagination if the number of notifications grows large
  def index
    render json: Notifications.get_all(current_user.id) # Returns notifications from all registered sources
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
