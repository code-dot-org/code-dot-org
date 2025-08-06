class NotificationsController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource only: [:index, :create, :update, :destroy]

  def index
    rails_notifications = current_user.notifications.active.order(created_at: :desc).all

    # TODO(lfm): call contentful and add contentful notifications to the list

    render json: rails_notifications.as_json.map {|notification| notification.deep_transform_keys {|key| key.to_s.camelize(:lower)}}
  end

  def mark_as_read
    notification = current_user.notifications.find_by(id: params[:id])
    if notification
      notification.mark_as_read
      render json: {status: 'success', message: 'Notification marked as read'}, status: :ok
    else
      render json: {status: 'error', message: 'Notification not found'}, status: :not_found
    end
  end

  def dismiss
    notification = current_user.notifications.find_by(id: params[:id])
    if notification
      notification.dismiss
      render json: {status: 'success', message: 'Notification dismissed'}, status: :ok
    else
      render json: {status: 'error', message: 'Notification not found'}, status: :not_found
    end
  end
end
