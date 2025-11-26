class TeacherNotificationsChannel < ApplicationCable::Channel
  def channel_name_builder(user_id)
    "teacher-notifications-#{user_id}"
  end

  def subscribed
    stream_from channel_name_builder(current_user.id)
  end

  def send_notification(notification)
    ActionCable.server.broadcast(channel_name_builder(current_user.id), data)
  end
end
