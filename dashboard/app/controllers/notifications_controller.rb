class NotificationsController < ApplicationController
  before_action :authenticate_user!

  # Returns a list of contentful notifications for the user that have not expired or been dismissed
  def index
    # TODO: Contentful needs to support full list of locales. For now, we only use the default, 'en-US'.
    # We should use request.locale when that happens.
    # contentful docs: https://www.contentful.com/developers/docs/tutorials/general/setting-locales/
    locale =  I18n.default_locale
    results = Notifications.get_all(current_user.id, locale)

    render json: results.as_json.map {|notification| notification.deep_transform_keys {|key| key.to_s.camelize(:lower)}}, status: :ok
  end

  def mark_as_read
    external_notification_ids = (params[:external_notification_ids] || []).compact_blank

    # TODO: Contentful needs to support full list of locales. For now, we only use the default, 'en-US'.
    # We should use request.locale when that happens.
    # contentful docs: https://www.contentful.com/developers/docs/tutorials/general/setting-locales/
    locale = I18n.default_locale

    if external_notification_ids.empty?
      render json: {status: 'error', message: 'No notification IDs provided'}, status: :bad_request
      return
    end

    valid_external_ids = filter_to_existing_ids(external_notification_ids, locale)
    found_external_notifications = current_user.external_notifications.where(external_id: valid_external_ids)

    found_external_notifications.where(read_at: nil).update_all(read_at: Time.current)
    found_ids = found_external_notifications.pluck(:external_id)
    notifications_to_create = valid_external_ids - found_ids
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

  private def filter_to_existing_ids(external_notification_ids, locale)
    valid_external_ids = Notifications.get_all(current_user.id, locale).map(&:external_id)
    external_notification_ids.select {|id| valid_external_ids.include?(id)}
  end
end
