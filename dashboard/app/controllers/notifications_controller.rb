class NotificationsController < ApplicationController
  before_action :authenticate_user!

  # TODO: Our contentful setup only supports `en-US` for now.
  # We should use request.locale if we switch to more locale support.
  # Decision thread: https://codedotorg.slack.com/archives/C08AMQ869QX/p1758749785732599
  # contentful docs: https://www.contentful.com/developers/docs/tutorials/general/setting-locales/
  LOCALE = I18n.default_locale

  # Returns a list of contentful notifications for the user that have not expired or been dismissed
  def index
    results = Notifications.get_all(current_user.id, LOCALE)

    render json: results.as_json.map {|notification| notification.deep_transform_keys {|key| key.to_s.camelize(:lower)}}, status: :ok
  end

  def mark_as_read
    external_notification_ids = (params[:external_notification_ids] || []).compact_blank
    teacher_notification_ids = (params[:teacher_notification_ids] || []).compact_blank

    if external_notification_ids.empty? && teacher_notification_ids.empty?
      render json: {status: 'error', message: 'No notification IDs provided'}, status: :bad_request
      return
    end

    total_marked = 0

    # Handle external notifications (existing logic)
    if external_notification_ids.any?
      valid_external_ids = filter_to_existing_ids(external_notification_ids, LOCALE)
      found_external_notifications = current_user.external_notifications.where(external_id: valid_external_ids)

      found_external_notifications.where(read_at: nil).update_all(read_at: Time.current)
      found_ids = found_external_notifications.pluck(:external_id)
      notifications_to_create = valid_external_ids - found_ids
      notifications_to_create.each do |external_id|
        ExternalNotification.create!(user_id: current_user.id, external_id: external_id, read_at: Time.current)
      end

      total_marked += found_ids.count + notifications_to_create.count
    end

    # Handle teacher notifications (new logic)
    if teacher_notification_ids.any?
      teacher_notifications = current_user.teacher_notifications.where(id: teacher_notification_ids, read_at: nil)
      marked_teacher_count = teacher_notifications.update_all(read_at: Time.current)
      total_marked += marked_teacher_count
    end

    response_data = {
      status: 'success',
      message: "#{total_marked} notification(s) marked as read",
      marked_count: total_marked,
    }

    render json: response_data, status: :ok
  end

  private def filter_to_existing_ids(external_notification_ids, locale)
    valid_external_ids = Notifications.get_all(current_user.id, locale).map(&:external_id)
    external_notification_ids.select {|id| valid_external_ids.include?(id)}
  end
end
